#!/usr/bin/env python3
"""
AquaIntelli Enterprise v3 — Meta-Learning Quickstart
Trains a MAML-LSTM model on basin groundwater data.

Usage:
    pip install torch learn2learn numpy pandas scikit-learn
    python ml/maml_quickstart.py --basins ganga godavari krishna --epochs 100
"""
import argparse
import logging
import numpy as np
from datetime import datetime
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("maml_quickstart")


# ── Synthetic basin data generator (replace with real CGWB/GRACE data) ──
def generate_basin_data(basin_id: str, n_samples: int = 200, seq_len: int = 30):
    """Generate synthetic groundwater depth time series for a basin."""
    np.random.seed(hash(basin_id) % 2**31)
    base_depth = np.random.uniform(30, 90)
    trend = np.random.uniform(-0.08, 0.02)
    seasonal_amp = np.random.uniform(2, 8)

    depths = []
    for i in range(n_samples + seq_len):
        seasonal = seasonal_amp * np.sin(2 * np.pi * i / 365)
        noise = np.random.normal(0, 0.5)
        depth = base_depth + trend * i + seasonal + noise
        depths.append(max(5.0, depth))

    depths = np.array(depths, dtype=np.float32)

    # Features: [depth_lag, rainfall, soil_moisture, grace_ewh, day_of_year]
    X, y = [], []
    for i in range(n_samples):
        window = depths[i:i + seq_len]
        rainfall = np.random.uniform(0, 15, seq_len)
        moisture = np.random.uniform(0.2, 0.5, seq_len)
        grace = np.random.uniform(-3, 0, seq_len)
        day_of_yr = np.sin(2 * np.pi * np.arange(seq_len) / 365)
        features = np.stack([window, rainfall, moisture, grace, day_of_yr], axis=1)
        X.append(features)
        y.append([depths[i + seq_len]])

    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)


def train_maml(basins, epochs=100, meta_lr=0.001, inner_lr=0.4, inner_steps=5,
               save_path="ml/models"):
    """Train MAML meta-learning model across multiple basins."""
    try:
        import torch
        import torch.nn as nn
        import torch.optim as optim
    except ImportError:
        logger.error("PyTorch not installed. Run: pip install torch")
        return

    try:
        import learn2learn as l2l
        HAS_L2L = True
    except ImportError:
        logger.warning("learn2learn not installed — using manual MAML. pip install learn2learn")
        HAS_L2L = False

    logger.info(f"Training MAML on {len(basins)} basins for {epochs} epochs")
    logger.info(f"Config: meta_lr={meta_lr}, inner_lr={inner_lr}, inner_steps={inner_steps}")

    # ── Model Definition ──────────────────────────────────────────────────
    class MetaLSTM(nn.Module):
        def __init__(self, input_dim=5, hidden=128, layers=2):
            super().__init__()
            self.lstm = nn.LSTM(input_dim, hidden, layers, batch_first=True, dropout=0.2)
            self.attn = nn.MultiheadAttention(hidden, num_heads=4, batch_first=True)
            self.fc = nn.Sequential(
                nn.Linear(hidden, hidden // 2),
                nn.ReLU(),
                nn.Dropout(0.2),
                nn.Linear(hidden // 2, 1)
            )

        def forward(self, x):
            out, _ = self.lstm(x)
            attn_out, _ = self.attn(out, out, out)
            return self.fc(attn_out[:, -1, :])

    model = MetaLSTM()
    criterion = nn.MSELoss()

    # ── Load basin data ───────────────────────────────────────────────────
    basin_datasets = {}
    for basin in basins:
        X, y = generate_basin_data(basin)
        split = int(len(X) * 0.8)
        basin_datasets[basin] = {
            "support_X": torch.FloatTensor(X[:split]),
            "support_y": torch.FloatTensor(y[:split]),
            "query_X": torch.FloatTensor(X[split:]),
            "query_y": torch.FloatTensor(y[split:]),
        }
        logger.info(f"  Basin '{basin}': {split} support, {len(X)-split} query samples")

    # ── MAML Training Loop ────────────────────────────────────────────────
    if HAS_L2L:
        maml = l2l.algorithms.MAML(model, lr=meta_lr, first_order=False)
        meta_opt = optim.Adam(maml.parameters(), lr=meta_lr)
    else:
        meta_opt = optim.Adam(model.parameters(), lr=meta_lr)

    best_meta_loss = float('inf')
    history = []

    for epoch in range(epochs):
        meta_opt.zero_grad()
        meta_loss_total = 0.0
        task_losses = []

        for basin, data in basin_datasets.items():
            if HAS_L2L:
                learner = maml.clone()
                # Inner loop: adapt to basin
                for _ in range(inner_steps):
                    idx = np.random.choice(len(data["support_X"]), 32)
                    sx = data["support_X"][idx]
                    sy = data["support_y"][idx]
                    loss = criterion(learner(sx), sy)
                    learner.adapt(loss)
                # Outer loop: evaluate on query set
                idx = np.random.choice(len(data["query_X"]), 32)
                qx, qy = data["query_X"][idx], data["query_y"][idx]
                q_loss = criterion(learner(qx), qy)
            else:
                # Manual MAML (without learn2learn)
                fast_weights = {n: p.clone() for n, p in model.named_parameters()}
                idx = np.random.choice(len(data["support_X"]), 32)
                sx, sy = data["support_X"][idx], data["support_y"][idx]
                pred = model(sx)
                loss = criterion(pred, sy)
                grads = torch.autograd.grad(loss, model.parameters(), create_graph=True)
                fast_weights = {
                    n: p - inner_lr * g
                    for (n, p), g in zip(model.named_parameters(), grads)
                }
                idx = np.random.choice(len(data["query_X"]), 32)
                qx, qy = data["query_X"][idx], data["query_y"][idx]
                q_loss = criterion(model(qx), qy)

            meta_loss_total += q_loss
            task_losses.append(q_loss.item())

        meta_loss = meta_loss_total / len(basins)
        meta_loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        meta_opt.step()

        if epoch % 10 == 0 or epoch == epochs - 1:
            rmse = float(np.sqrt(np.mean([l**2 for l in task_losses])))
            logger.info(f"Epoch {epoch:4d}/{epochs} | Meta-Loss: {meta_loss.item():.4f} | "
                        f"RMSE: {rmse:.4f}m | Best: {best_meta_loss:.4f}")
            history.append({"epoch": epoch, "meta_loss": meta_loss.item(), "rmse": rmse})

        if meta_loss.item() < best_meta_loss:
            best_meta_loss = meta_loss.item()
            Path(save_path).mkdir(parents=True, exist_ok=True)
            torch.save(model.state_dict(), f"{save_path}/meta_lstm_best.pt")

    # ── Save final model ──────────────────────────────────────────────────
    Path(save_path).mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), f"{save_path}/meta_lstm_final.pt")

    # Save training history
    import json
    with open(f"{save_path}/training_history.json", "w") as f:
        json.dump({"basins": basins, "epochs": epochs, "history": history,
                   "best_meta_loss": best_meta_loss,
                   "trained_at": datetime.utcnow().isoformat()}, f, indent=2)

    logger.info(f"\n✅ MAML training complete!")
    logger.info(f"   Best meta-loss: {best_meta_loss:.4f}")
    logger.info(f"   Model saved: {save_path}/meta_lstm_best.pt")
    logger.info(f"   To adapt to a new basin, use adapt_to_basin() with 30-50 samples")

    return model


def adapt_to_basin(model_path: str, basin_id: str, support_X, support_y,
                   adaptation_steps: int = 10, lr: float = 0.01):
    """Few-shot adaptation of trained MAML model to a new basin."""
    import torch
    import torch.nn as nn
    import torch.optim as optim

    class MetaLSTM(nn.Module):
        def __init__(self, input_dim=5, hidden=128, layers=2):
            super().__init__()
            self.lstm = nn.LSTM(input_dim, hidden, layers, batch_first=True, dropout=0.2)
            self.attn = nn.MultiheadAttention(hidden, num_heads=4, batch_first=True)
            self.fc = nn.Sequential(nn.Linear(hidden, hidden // 2), nn.ReLU(),
                                    nn.Dropout(0.2), nn.Linear(hidden // 2, 1))
        def forward(self, x):
            out, _ = self.lstm(x)
            attn_out, _ = self.attn(out, out, out)
            return self.fc(attn_out[:, -1, :])

    model = MetaLSTM()
    model.load_state_dict(torch.load(model_path, map_location='cpu'))

    opt = optim.SGD(model.parameters(), lr=lr)
    criterion = nn.MSELoss()
    sx = torch.FloatTensor(support_X)
    sy = torch.FloatTensor(support_y)

    model.train()
    for step in range(adaptation_steps):
        pred = model(sx)
        loss = criterion(pred, sy)
        opt.zero_grad()
        loss.backward()
        opt.step()
        if step % 5 == 0:
            logger.info(f"  Adaptation step {step}: loss={loss.item():.4f}")

    logger.info(f"✅ Adapted to basin '{basin_id}' in {adaptation_steps} steps")
    return model


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AquaIntelli MAML Quickstart")
    parser.add_argument("--basins", nargs="+",
                        default=["ganga", "godavari", "krishna", "cauvery", "indus"],
                        help="Basin IDs to train on")
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--meta-lr", type=float, default=0.001)
    parser.add_argument("--inner-lr", type=float, default=0.4)
    parser.add_argument("--inner-steps", type=int, default=5)
    parser.add_argument("--save-path", default="ml/models")
    parser.add_argument("--adapt", action="store_true",
                        help="Demo adaptation to a new basin after training")
    args = parser.parse_args()

    trained_model = train_maml(
        basins=args.basins,
        epochs=args.epochs,
        meta_lr=args.meta_lr,
        inner_lr=args.inner_lr,
        inner_steps=args.inner_steps,
        save_path=args.save_path,
    )

    if args.adapt and trained_model:
        logger.info("\n--- Few-Shot Adaptation Demo ---")
        X_new, y_new = generate_basin_data("hyderabad-ap", n_samples=50)
        adapted = adapt_to_basin(
            model_path=f"{args.save_path}/meta_lstm_best.pt",
            basin_id="hyderabad-ap",
            support_X=X_new[:30],
            support_y=y_new[:30],
        )
        logger.info("Adapted model ready for inference on Hyderabad basin")
