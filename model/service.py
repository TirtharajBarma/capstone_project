import os
import time
import json
from typing import List, Tuple, Dict

import torch
import torch.nn.functional as F
from PIL import Image, ImageOps
from torchvision import transforms
from torchvision import models as tvm
import torch.nn as nn


class ModelService:
    def __init__(self, model_path: str, classes_path: str, device: str | None = None):
        self.model_path = model_path
        self.classes_path = classes_path
        self.device = torch.device(device) if device else torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.classes = self._load_classes(classes_path)
        self.cattle_categories = self._load_cattle_categories()
        self.model = self._load_model(model_path)

        # EfficientNet V2-S requires 384x384 input by default, but we'll use 224 for compatibility
        input_size = int(os.getenv("MODEL_INPUT_SIZE", "224"))
        self.temperature = float(os.getenv("MODEL_TEMPERATURE", "1.0"))
        self.reject_threshold = float(os.getenv("MODEL_REJECT_THRESHOLD", "0.45"))
        self.margin_threshold = float(os.getenv("MODEL_MARGIN_THRESHOLD", "0.05"))
        self.tta = int(os.getenv("MODEL_TTA", "1"))
        # Transform for EfficientNet V2-S
        self.transform = transforms.Compose([
            transforms.Resize(int(input_size * 1.14)),
            transforms.CenterCrop(input_size),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

        # TTA functions
        try:
            _ = Image.Resampling.BILINEAR
        except AttributeError:
            class _Resample:
                BILINEAR = Image.BILINEAR
            Image.Resampling = _Resample

        self._tta_fns = [
            lambda im: im,
            lambda im: ImageOps.mirror(im),
        ]

        print(
            f"[ModelService] EfficientNet V2-S loaded: input_size={input_size}, temp={self.temperature}, "
            f"reject={self.reject_threshold}, margin={self.margin_threshold}, tta={self.tta}, "
            f"classes={len(self.classes)} on device={self.device}"
        )

    def _load_classes(self, classes_path: str) -> List[str]:
        if not os.path.exists(classes_path):
            raise FileNotFoundError(f"Classes file not found: {classes_path}")
        with open(classes_path, "r") as f:
            classes = json.load(f)
        if not isinstance(classes, list) or not all(isinstance(c, str) for c in classes):
            raise ValueError("classes.json must be a JSON array of class names (strings)")
        return classes

    def _load_cattle_categories(self) -> Dict[str, List[str]]:
        """Load cattle categories for cow/buffalo classification"""
        categories_path = os.path.join(os.path.dirname(__file__), "cattle_categories.json")
        if not os.path.exists(categories_path):
            # Fallback classification based on known breeds
            buffalo_breeds = ["Jaffrabadi", "Mehsana", "Murrah", "Nili_Ravi", "Surti"]
            cow_breeds = [breed for breed in self.classes if breed not in buffalo_breeds]
            return {"cow": cow_breeds, "buffalo": buffalo_breeds}
        
        with open(categories_path, "r") as f:
            return json.load(f)

    def _load_model(self, model_path: str):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")

        try:
            # Try loading as TorchScript first
            model = torch.jit.load(model_path, map_location=self.device)
            model.eval()
            return model
        except Exception:
            # Load state dict and create EfficientNet V2-S model
            try:
                state_dict = torch.load(model_path, map_location=self.device)
                model = self._build_efficientnet_v2_s(len(self.classes))
                
                # Load state dict
                missing, unexpected = model.load_state_dict(state_dict, strict=False)
                if missing or unexpected:
                    print(f"[ModelService] State dict loaded with missing: {len(missing)}, unexpected: {len(unexpected)}")
                
                model.eval()
                return model
            except Exception as e:
                raise RuntimeError(f"Failed to load model: {e}")

    def _build_efficientnet_v2_s(self, num_classes: int) -> torch.nn.Module:
        """Build EfficientNet V2-S model with custom classifier"""
        try:
            # Try to use EfficientNet V2-S if available
            backbone = tvm.efficientnet_v2_s(weights=None)
            feature_dim = backbone.classifier[1].in_features
            backbone.classifier = nn.Identity()
        except AttributeError:
            # Fallback to regular EfficientNet B0 if V2 not available
            print("[ModelService] EfficientNet V2-S not available, using EfficientNet B0")
            backbone = tvm.efficientnet_b0(weights=None)
            if isinstance(backbone.classifier, nn.Sequential):
                feature_dim = backbone.classifier[-1].in_features
                backbone.classifier = nn.Identity()
            else:
                feature_dim = 1280  # Default for EfficientNet

        # Custom classifier to match the saved model structure
        classifier = nn.Sequential(
            nn.Dropout(0.2),
            nn.Linear(feature_dim, num_classes)
        )

        class EfficientNetModel(nn.Module):
            def __init__(self, backbone, classifier):
                super().__init__()
                self.backbone = backbone
                self.classifier = classifier

            def forward(self, x):
                features = self.backbone(x)
                if features.ndim > 2:
                    features = torch.flatten(features, 1)
                return self.classifier(features)

        return EfficientNetModel(backbone, classifier)

    def _classify_species(self, breed: str) -> str:
        """Classify breed into cow, buffalo, or unknown"""
        if breed == "unknown":
            return "unknown"
        
        if breed in self.cattle_categories["cow"]:
            return "cow"
        elif breed in self.cattle_categories["buffalo"]:
            return "buffalo"
        else:
            return "unknown"

    def predict(self, image: Image.Image) -> Tuple[str, float, List[Dict[str, float]], float]:
        if image.mode != "RGB":
            image = image.convert("RGB")

        t0 = time.perf_counter()
        with torch.no_grad():
            variants = max(1, min(self.tta, len(self._tta_fns)))
            prob_accum = None
            
            for i in range(variants):
                pil = self._tta_fns[i](image)
                tensor = self.transform(pil).unsqueeze(0).to(self.device)
                logits = self.model(tensor)
                
                if self.temperature and self.temperature > 0:
                    logits = logits / self.temperature
                    
                probs_step = F.softmax(logits, dim=1)
                prob_accum = probs_step if prob_accum is None else prob_accum + probs_step
            
            probs = (prob_accum / float(variants)).squeeze(0).detach().cpu()
            topk = min(5, probs.shape[0])
            confs, idxs = torch.topk(probs, k=topk)

        elapsed_ms = (time.perf_counter() - t0) * 1000.0

        # Build predictions
        top_predictions = []
        for i in range(topk):
            label_idx = int(idxs[i].item())
            conf = float(confs[i].item())
            label = self.classes[label_idx] if 0 <= label_idx < len(self.classes) else str(label_idx)
            top_predictions.append({"breed": label, "confidence": conf})

        top_breed = top_predictions[0]["breed"]
        top_conf = top_predictions[0]["confidence"]
        
        # Check if top prediction is cow or buffalo
        species = self._classify_species(top_breed)
        
        # Apply confidence thresholds first
        second = top_predictions[1]["confidence"] if len(top_predictions) > 1 else 0.0
        margin = float(top_conf - second)
        
        # If confidence is too low, return unknown
        if (self.reject_threshold > 0 and top_conf < self.reject_threshold) or \
           (self.margin_threshold > 0 and margin < self.margin_threshold):
            return "unknown", float(top_conf), top_predictions, float(elapsed_ms)
        
        # If not cow or buffalo (i.e., some other animal), return unknown
        if species == "unknown":
            return "unknown", float(top_conf), top_predictions, float(elapsed_ms)
        
        # Return the actual breed name, not the species
        return top_breed, top_conf, top_predictions, elapsed_ms
