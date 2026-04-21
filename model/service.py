import os
import json
import pickle
import io
import numpy as np
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import warnings

warnings.filterwarnings("ignore")

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "cow_breed_model")
CLASSES_PATH = os.path.join(MODEL_DIR, "classes.json")

BUFFALO_BREEDS = [
    "Banni",
    "Bhadawari",
    "Jaffrabadi",
    "Mehsana",
    "Murrah",
    "Nagpuri",
    "Nili_Ravi",
    "Surti",
]


class HybridCattleClassifier(nn.Module):
    def __init__(self, num_classes=41):
        super().__init__()

        self.effnet = models.efficientnet_b3(weights=None)
        eff_dim = self.effnet.classifier[1].in_features
        self.effnet.classifier = nn.Identity()

        self.resnet = models.resnet50(weights=None)
        res_dim = self.resnet.fc.in_features
        self.resnet.fc = nn.Identity()

        self.eff_proj = nn.Linear(eff_dim, 512)
        self.res_proj = nn.Linear(res_dim, 512)

        self.fusion = nn.Linear(1024, 512)

        self.attention = nn.Sequential(
            nn.Linear(512, 512 // 16),
            nn.ReLU(),
            nn.Linear(512 // 16, 512),
            nn.Sigmoid(),
        )

        self.classifier = nn.Sequential(
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.6),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        f1 = self.effnet(x)
        f2 = self.resnet(x)

        f1 = self.eff_proj(f1)
        f2 = self.res_proj(f2)

        alpha = torch.sigmoid(self.fusion(torch.cat([f1, f2], dim=1)))
        fused = alpha * f1 + (1 - alpha) * f2

        attn_weights = self.attention(torch.relu(fused))
        fused = fused * attn_weights

        return self.classifier(fused)


class ModelService:
    def __init__(self, model_dir=MODEL_PATH):
        self.model_dir = model_dir
        self.classes = self._load_classes()
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self._load_model()
        self.transform = self._get_transforms()

    def _load_classes(self):
        with open(CLASSES_PATH, "r") as f:
            return json.load(f)

    def _load_model(self):
        def persistent_load_fn(saved_id):
            storage_type = saved_id[1]
            storage_key = saved_id[2]
            storage_data_path = f"{self.model_dir}/data/{storage_key}"

            if not os.path.exists(storage_data_path):
                return None

            try:
                with open(storage_data_path, "rb") as f:
                    data = np.frombuffer(f.read(), dtype=np.float32)
                storage = torch.from_numpy(data).storage()
                return storage
            except:
                return None

        class CustomUnpickler(pickle.Unpickler):
            def persistent_load(self, saved_id):
                return persistent_load_fn(saved_id)

        print("Loading model state...")
        with open(f"{self.model_dir}/data.pkl", "rb") as f:
            unpickler = CustomUnpickler(io.BytesIO(f.read()))
            state_dict = unpickler.load()

        print("Creating model...")
        model = HybridCattleClassifier(num_classes=41)

        print("Loading weights...")
        model.load_state_dict(state_dict, strict=False)

        model = model.to(self.device)
        model.eval()
        print(f"Model loaded on: {self.device}")
        return model

    def _get_transforms(self):
        return transforms.Compose(
            [
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
                ),
            ]
        )

    def predict(self, image_path):
        img = Image.open(image_path).convert("RGB")
        img_tensor = self.transform(img).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(img_tensor)
            probabilities = torch.softmax(outputs, dim=1)

            probs = probabilities[0].cpu().numpy()
            top_indices = np.argsort(probs)[-5:][::-1]
            top_probs = probs[top_indices]

        breed_name = self.classes[str(top_indices[0])]
        species = "buffalo" if breed_name in BUFFALO_BREEDS else "cow"

        top_predictions = []
        for idx, prob in zip(top_indices, top_probs):
            top_predictions.append(
                {"breed": self.classes[str(idx)], "confidence": float(prob)}
            )

        return {
            "breed": breed_name,
            "confidence": float(top_probs[0]),
            "species": species,
            "top_predictions": top_predictions,
        }

    def predict_bytes(self, image_bytes):
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_tensor = self.transform(img).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(img_tensor)
            probabilities = torch.softmax(outputs, dim=1)

            probs = probabilities[0].cpu().numpy()
            top_indices = np.argsort(probs)[-5:][::-1]
            top_probs = probs[top_indices]

        breed_name = self.classes[str(top_indices[0])]
        species = "buffalo" if breed_name in BUFFALO_BREEDS else "cow"

        top_predictions = []
        for idx, prob in zip(top_indices, top_probs):
            top_predictions.append(
                {"breed": self.classes[str(idx)], "confidence": float(prob)}
            )

        return {
            "breed": breed_name,
            "confidence": float(top_probs[0]),
            "species": species,
            "top_predictions": top_predictions,
        }
