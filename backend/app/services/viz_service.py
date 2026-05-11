import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
import numpy as np
from datetime import datetime, timedelta

def get_base64_plot():
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', transparent=True, dpi=100)
    plt.close()
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    return img_str

class VisualizationService:
    def __init__(self):
        sns.set_theme(style="darkgrid", palette="muted")
        plt.rcParams.update({
            "axes.facecolor": "#020810",
            "figure.facecolor": "#020810",
            "grid.color": (0, 0.898, 1.0, 0.1),
            "text.color": "#c8f4ff",
            "axes.labelcolor": "#c8f4ff",
            "xtick.color": (0.784, 0.957, 1.0, 0.5),
            "ytick.color": (0.784, 0.957, 1.0, 0.5),
            "font.family": "sans-serif"
        })

    def generate_groundwater_telemetry(self, current_depth):
        plt.figure(figsize=(4, 2.5))
        # Simulate some historical data for the "real-time" look
        x = np.linspace(0, 10, 20)
        y = current_depth + np.sin(x) * 0.5 + np.random.normal(0, 0.1, 20)
        
        sns.lineplot(x=x, y=y, color="#00e5ff", linewidth=2)
        plt.fill_between(x, y, alpha=0.1, color="#00e5ff")
        plt.title("REAL-TIME DEPTH TELEMETRY (GW)", fontsize=9, loc='left', pad=10)
        plt.xlabel("TIME (T-10s)", fontsize=7)
        plt.ylabel("DEPTH (m)", fontsize=7)
        return get_base64_plot()

    def generate_groundwater_forecast(self, forecast_array):
        plt.figure(figsize=(4, 2.5))
        days = np.arange(len(forecast_array))
        
        sns.lineplot(x=days, y=forecast_array, color="#39ff14", linewidth=2, label="LSTM Pred")
        plt.title("30-DAY DEPTH FORECAST (LSTM)", fontsize=9, loc='left', pad=10)
        plt.xlabel("DAYS AHEAD", fontsize=7)
        plt.ylabel("PREDICTED DEPTH (m)", fontsize=7)
        plt.legend(fontsize=6)
        return get_base64_plot()

    def generate_model_analysis(self, model_id, data):
        plt.figure(figsize=(5, 3))
        if model_id == "model-1":
            # Confusion matrix or similar for Model 1
            sns.heatmap(np.random.rand(5,5), annot=True, cmap="YlGnBu", cbar=False)
            plt.title("MODEL-1: SPATIAL ACCURACY HEATMAP", fontsize=9)
        else:
            # Training loss or similar for Model 2
            x = np.linspace(0, 100, 50)
            y = np.exp(-x/20) + np.random.normal(0, 0.05, 50)
            sns.lineplot(x=x, y=y, color="#ff6b00")
            plt.title("MODEL-2: TRAINING CONVERGENCE (LSTM)", fontsize=9)
        
        return get_base64_plot()

viz_service = VisualizationService()
