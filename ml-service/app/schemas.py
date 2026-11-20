"""
ChangeGuard ML Service Pydantic Schemas
Defines request and response validation models with strict boundary constraints.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from app.config import CHANGE_TYPES

class ChangePredictionRequest(BaseModel):
    change_complexity: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Technical complexity of the change normalized between 0.0 and 1.0",
        examples=[0.75]
    )
    dependency_count: int = Field(
        ...,
        ge=0,
        description="Number of downstream dependent microservices affected",
        examples=[6]
    )
    dependency_depth: int = Field(
        ...,
        ge=0,
        description="Maximum cascading dependency depth",
        examples=[3]
    )
    criticality_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Criticality tier score (LOW=0.25, MED=0.50, HIGH=0.75, CRITICAL=1.00)",
        examples=[1.0]
    )
    historical_failure_rate: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Observed failure rate of historical changes on this service (0.0 to 1.0)",
        examples=[0.20]
    )
    change_type: str = Field(
        ...,
        description="Classification of technical modification",
        examples=["VERSION_UPDATE"]
    )
    blast_radius_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Normalized Phase 4 blast-radius rating (0.0 to 100.0)",
        examples=[80.8]
    )
    critical_services_affected: int = Field(
        ...,
        ge=0,
        description="Count of Tier-1 CRITICAL services exposed in the blast perimeter",
        examples=[2]
    )
    previous_incidents: int = Field(
        ...,
        ge=0,
        description="Historical incident count previously attributed to this service",
        examples=[3]
    )
    service_age: int = Field(
        ...,
        ge=1,
        description="Service operational age in months (at least 1)",
        examples=[36]
    )
    version_change_size: float = Field(
        ...,
        ge=0.0,
        description="Numerical delta magnitude of version update (e.g. 1.0 for major, 0.1 for minor)",
        examples=[1.0]
    )

    @field_validator("change_type")
    @classmethod
    def validate_change_type(cls, v: str) -> str:
        cleaned = v.strip().upper()
        # Accept valid known change types
        valid_types = {t.upper() for t in CHANGE_TYPES} | {"LIBRARY_UPDATE", "ML_MODEL_CHANGE"}
        if cleaned not in valid_types:
            raise ValueError(f"Invalid change_type '{v}'. Allowed types: {sorted(list(valid_types))}")
        return cleaned

class PredictionResponse(BaseModel):
    failureProbability: float = Field(..., ge=0.0, le=1.0, description="Estimated incident failure likelihood")
    prediction: int = Field(..., description="Binary classification (0 = no incident expected, 1 = incident likely)")
    riskLevel: str = Field(..., description="Qualitative category: LOW, MEDIUM, HIGH, CRITICAL")
    model: str = Field(default="RandomForest", description="Machine learning algorithm name")
    modelVersion: str = Field(default="1.0", description="Serialized model artifact version")

class HealthResponse(BaseModel):
    status: str = Field(default="UP", description="Service liveness status")
    service: str = Field(default="ChangeGuard ML Service", description="Service identity")
    modelLoaded: bool = Field(..., description="Whether the serialized ML pipeline is ready in memory")
    modelType: Optional[str] = Field(default=None, description="Active model classifier architecture")
    version: str = Field(default="1.0.0", description="API version")
