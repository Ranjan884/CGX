"""
ChangeGuard Preprocessing Module
Builds leakage-free scikit-learn preprocessing pipelines using ColumnTransformer.
One-Hot encodes categorical features and scales numerical features.
"""

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
import pandas as pd
from typing import Tuple, List
from app.config import NUMERICAL_FEATURES, CATEGORICAL_FEATURES, TARGET_COLUMN

def create_preprocessor() -> ColumnTransformer:
    """
    Creates a scikit-learn ColumnTransformer.
    - OneHotEncoder for categorical attributes (handle_unknown='ignore')
    - StandardScaler for continuous numerical attributes
    """
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                StandardScaler(),
                NUMERICAL_FEATURES
            ),
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                CATEGORICAL_FEATURES
            )
        ],
        remainder="drop"
    )
    return preprocessor

def get_feature_names_after_preprocessing(fitted_preprocessor: ColumnTransformer) -> List[str]:
    """
    Extracts output feature names after ColumnTransformer fitting.
    """
    feature_names = []
    
    # 1. Numerical names
    feature_names.extend(NUMERICAL_FEATURES)
    
    # 2. Categorical one-hot names
    cat_encoder = fitted_preprocessor.named_transformers_["cat"]
    if hasattr(cat_encoder, "get_feature_names_out"):
        cat_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES))
        feature_names.extend(cat_names)
    else:
        feature_names.extend([f"change_type_{c}" for c in cat_encoder.categories_[0]])
        
    return feature_names
