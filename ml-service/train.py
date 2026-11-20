"""
ChangeGuard ML Training Entry Point
Allows running `python train.py` directly from the `ml-service/` root directory.
"""

import sys
import os
from pathlib import Path

# Add ml-service directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.train import run_training_pipeline

if __name__ == "__main__":
    run_training_pipeline()
