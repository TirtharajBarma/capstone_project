import os
import time
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
        self.model = self._load_model(model_path)

        # Default to ImageNet normalization which is common for transfer-learned models
        input_size = int(os.getenv("MODEL_INPUT_SIZE", "224"))
        # Prediction controls (can be tuned via env)
        self.temperature = float(os.getenv("MODEL_TEMPERATURE", "1.0"))
        self.reject_threshold = float(os.getenv("MODEL_REJECT_THRESHOLD", "0.45"))
        self.margin_threshold = float(os.getenv("MODEL_MARGIN_THRESHOLD", "0.05"))
        # 1: off, 2: +hflip, 3+: include more simple variants up to 4
        self.tta = int(os.getenv("MODEL_TTA", "1"))
        self.transform = transforms.Compose([
            transforms.Resize(int(input_size * 1.14)),  # approximate 256 for 224 input
            transforms.CenterCrop(input_size),
            transforms.ToTensor(),  # converts to float32 in [0,1]
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

        # Simple TTA ops applied on PIL image before base transform (kept minimal for accuracy & speed)
        # Only identity and horizontal flip, as vertical flips/rotations can harm predictions for this domain
        # Use robust resampling enum across Pillow versions
        try:
            _ = Image.Resampling.BILINEAR  # Pillow>=9
        except AttributeError:  # Pillow<9 compatibility
            class _Resample:
                BILINEAR = Image.BILINEAR
            Image.Resampling = _Resample  # type: ignore

        self._tta_fns = [
            lambda im: im,
            lambda im: ImageOps.mirror(im),  # horizontal flip
        ]

        # Log effective configuration once at startup for transparency
        try:
            print(
                f"[ModelService] Config: input_size={input_size}, temp={self.temperature}, "
                f"reject={self.reject_threshold}, margin={self.margin_threshold}, tta={self.tta}, "
                f"classes={len(self.classes)} on device={self.device}"
            )
        except Exception:
            pass

    def _load_classes(self, classes_path: str) -> List[str]:
        import json

        if not os.path.exists(classes_path):
            raise FileNotFoundError(f"Classes file not found: {classes_path}")
        with open(classes_path, "r") as f:
            classes = json.load(f)
        if not isinstance(classes, list) or not all(isinstance(c, str) for c in classes):
            raise ValueError("classes.json must be a JSON array of class names (strings)")
        return classes

    def _load_model(self, model_path: str):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")

        # Try TorchScript first (best for deployment)
        try:
            model = torch.jit.load(model_path, map_location=self.device)
            model.eval()
            return model
        except Exception as e_ts:
            # Fallback to torch.load (requires pickled architecture)
            try:
                loaded = torch.load(model_path, map_location=self.device)

                # Case 1: a full nn.Module was saved via torch.save(model)
                if isinstance(loaded, torch.nn.Module):
                    loaded.eval()
                    print("[ModelService] Loaded pickled nn.Module. Consider exporting TorchScript for deployment.")
                    return loaded

                # Case 2: common checkpoint dict formats
                if isinstance(loaded, dict):
                    # If checkpoint carries class mapping, prefer it to avoid order mismatches
                    try:
                        if isinstance(loaded.get("classes"), list) and all(isinstance(c, str) for c in loaded["classes"]):
                            self.classes = loaded["classes"]
                            print(f"[ModelService] Using classes from checkpoint (n={len(self.classes)}).")
                        elif isinstance(loaded.get("idx_to_class"), dict):
                            idx_to_class = loaded["idx_to_class"]
                            max_idx = max(int(i) for i in idx_to_class.keys())
                            new_classes = [None] * (max_idx + 1)
                            for k, v in idx_to_class.items():
                                new_classes[int(k)] = v
                            if all(isinstance(c, str) for c in new_classes if c is not None):
                                self.classes = new_classes
                                print(f"[ModelService] Derived classes from idx_to_class (n={len(self.classes)}).")
                        elif isinstance(loaded.get("class_to_idx"), dict):
                            c2i = loaded["class_to_idx"]
                            new_classes = [None] * (max(c2i.values()) + 1)
                            for name, idx in c2i.items():
                                new_classes[int(idx)] = name
                            if all(isinstance(c, str) for c in new_classes if c is not None):
                                self.classes = new_classes
                                print(f"[ModelService] Derived classes from class_to_idx (n={len(self.classes)}).")
                    except Exception:
                        pass
                    # If there is an nn.Module inside
                    if isinstance(loaded.get("model"), torch.nn.Module):
                        m = loaded["model"]
                        m.eval()
                        print("[ModelService] Loaded model from checkpoint['model']. Consider exporting TorchScript.")
                        return m

                    # Try to find a state dict
                    state_dict = None
                    for key in ("state_dict", "model_state_dict", "weights", "params"):
                        if isinstance(loaded.get(key), dict):
                            state_dict = loaded[key]
                            break
                    # Some trainings save the state dict at top-level already
                    if state_dict is None and all(isinstance(v, torch.Tensor) for v in loaded.values()):
                        state_dict = loaded

                    if state_dict is not None:
                        # Remove potential 'module.' prefixes from DataParallel
                        def _strip_prefix(sd: Dict[str, torch.Tensor], prefix: str = "module."):
                            return { (k[len(prefix):] if k.startswith(prefix) else k): v for k, v in sd.items() }

                        state_dict = _strip_prefix(state_dict)

                        arch = os.getenv("MODEL_ARCH", "resnet18").lower()
                        num_classes = len(self.classes)
                        model = self._build_model_from_arch(arch, num_classes)
                        # load with strict=False to collect details, optionally enforce strictness via env
                        missing, unexpected = model.load_state_dict(state_dict, strict=False)
                        model.eval()
                        print(
                            f"[ModelService] Reconstructed '{arch}' from state_dict (strict=False). Missing: {len(missing)}, Unexpected: {len(unexpected)}"
                        )
                        # Optionally enforce strictness
                        strict_env = os.getenv("MODEL_STRICT", "true").lower()
                        enforce_strict = strict_env in ("1", "true", "yes", "on")
                        if enforce_strict and (len(missing) > 0 or len(unexpected) > 0):
                            raise RuntimeError(
                                "State dict mismatch with requested MODEL_ARCH. "
                                f"Missing keys: {len(missing)}, Unexpected keys: {len(unexpected)}. "
                                "Set the correct MODEL_ARCH (e.g., resnet50) or export TorchScript to avoid architecture coupling. "
                                "To bypass for experimentation, set MODEL_STRICT=false."
                            )
                        return model

                # If we got here, we couldn't form a callable model
                raise RuntimeError(
                    "Checkpoint loaded but did not contain a usable model. "
                    "Provide TorchScript (.pt/.pth via torch.jit.save) or set MODEL_ARCH to match the checkpoint state_dict."
                )
            except Exception as e_native:
                raise RuntimeError(
                    "Failed to load model. Please export a TorchScript (.pt) model or provide matching architecture code.\n"
                    f"TorchScript error: {e_ts}\nNative load error: {e_native}"
                )

    def _build_model_from_arch(self, arch: str, num_classes: int) -> torch.nn.Module:
        """Construct a torchvision model with the requested head size.
        Supported: resnet18/34/50, densenet121, mobilenet_v3_large, efficientnet_b0,
        enhanced_efficientnet_b3, enhanced_resnet50 (to match Colab's EnhancedCattleClassifier)
        """
        arch = arch.lower()
        # Enhanced architectures used in Colab training script
        if arch in ("enhanced_efficientnet_b3", "efficientnet_b3_enhanced"):
            try:
                backbone = tvm.efficientnet_b3(weights=None)
                feature_dim = backbone.classifier[1].in_features
                backbone.classifier = nn.Identity()
            except Exception:
                # In case the running torchvision lacks b3
                backbone = tvm.efficientnet_b0(weights=None)
                # best-effort feature dim
                feature_dim = backbone.classifier[1].in_features if isinstance(backbone.classifier, nn.Sequential) else 1280
                backbone.classifier = nn.Identity()
            classifier = nn.Sequential(
                nn.Linear(feature_dim, 1024),
                nn.BatchNorm1d(1024), nn.ReLU(inplace=True), nn.Dropout(0.5),
                nn.Linear(1024, 512), nn.BatchNorm1d(512), nn.ReLU(inplace=True), nn.Dropout(0.4),
                nn.Linear(512, 256), nn.BatchNorm1d(256), nn.ReLU(inplace=True), nn.Dropout(0.3),
                nn.Linear(256, num_classes)
            )
            class Enhanced(nn.Module):
                def __init__(self, b, c):
                    super().__init__()
                    self.backbone = b
                    self.classifier = c
                def forward(self, x):
                    feats = self.backbone(x)
                    if feats.ndim > 2:
                        feats = torch.flatten(feats, 1)
                    return self.classifier(feats)
            return Enhanced(backbone, classifier)
        if arch in ("enhanced_resnet50", "resnet50_enhanced"):
            backbone = tvm.resnet50(weights=None)
            feature_dim = backbone.fc.in_features
            backbone.fc = nn.Identity()
            classifier = nn.Sequential(
                nn.Linear(feature_dim, 1024),
                nn.BatchNorm1d(1024), nn.ReLU(inplace=True), nn.Dropout(0.5),
                nn.Linear(1024, 512), nn.BatchNorm1d(512), nn.ReLU(inplace=True), nn.Dropout(0.4),
                nn.Linear(512, 256), nn.BatchNorm1d(256), nn.ReLU(inplace=True), nn.Dropout(0.3),
                nn.Linear(256, num_classes)
            )
            class Enhanced(nn.Module):
                def __init__(self, b, c):
                    super().__init__()
                    self.backbone = b
                    self.classifier = c
                def forward(self, x):
                    feats = self.backbone(x)
                    if feats.ndim > 2:
                        feats = torch.flatten(feats, 1)
                    return self.classifier(feats)
            return Enhanced(backbone, classifier)
        if arch in ("resnet18", "resnet-18"):
            model = tvm.resnet18(weights=None)
            in_f = model.fc.in_features
            model.fc = nn.Linear(in_f, num_classes)
            return model
        if arch in ("resnet34", "resnet-34"):
            model = tvm.resnet34(weights=None)
            in_f = model.fc.in_features
            model.fc = nn.Linear(in_f, num_classes)
            return model
        if arch in ("resnet50", "resnet-50"):
            model = tvm.resnet50(weights=None)
            in_f = model.fc.in_features
            model.fc = nn.Linear(in_f, num_classes)
            return model
        if arch in ("densenet121", "densenet-121"):
            model = tvm.densenet121(weights=None)
            in_f = model.classifier.in_features
            model.classifier = nn.Linear(in_f, num_classes)
            return model
        if arch in ("mobilenet_v3_large", "mobilenet-v3-large", "mobilenetv3"):
            model = tvm.mobilenet_v3_large(weights=None)
            in_f = model.classifier[-1].in_features
            model.classifier[-1] = nn.Linear(in_f, num_classes)
            return model
        if arch in ("efficientnet_b0", "efficientnet-b0", "efficientnet"):
            model = tvm.efficientnet_b0(weights=None)
            # classifier is Sequential: [Dropout, Linear]
            if isinstance(model.classifier, nn.Sequential) and isinstance(model.classifier[-1], nn.Linear):
                in_f = model.classifier[-1].in_features
                model.classifier[-1] = nn.Linear(in_f, num_classes)
            return model
        # Default fallback
        print(f"[ModelService] Unknown MODEL_ARCH '{arch}'. Falling back to resnet18.")
        model = tvm.resnet18(weights=None)
        in_f = model.fc.in_features
        model.fc = nn.Linear(in_f, num_classes)
        return model

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

        top_predictions = []
        for i in range(topk):
            label_idx = int(idxs[i].item())
            conf = float(confs[i].item())
            label = self.classes[label_idx] if 0 <= label_idx < len(self.classes) else str(label_idx)
            top_predictions.append({"breed": label, "confidence": conf})

        top_breed = top_predictions[0]["breed"]
        top_conf = top_predictions[0]["confidence"]
        # Reject unknowns based on confidence and margin to second best
        second = top_predictions[1]["confidence"] if len(top_predictions) > 1 else 0.0
        margin = float(top_conf - second)
        # If both thresholds are disabled (<= 0), never reject
        if self.reject_threshold <= 0 and self.margin_threshold <= 0:
            return top_breed, float(top_conf), top_predictions, float(elapsed_ms)
        if top_conf < self.reject_threshold or margin < self.margin_threshold:
            return "unknown", float(top_conf), top_predictions, float(elapsed_ms)
        return top_breed, top_conf, top_predictions, elapsed_ms
