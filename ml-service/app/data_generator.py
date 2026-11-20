"""
ChangeGuard Synthetic Data Generator
Generates realistic simulated historical IT change records for core banking services.
Applies probabilistic risk tendency modeling with non-deterministic noise.
"""

import os
import csv
import math
import random
from typing import Dict, Any, List, Tuple
from app.config import (
    DATA_FILE,
    RANDOM_SEED,
    NUM_SAMPLES,
    CHANGE_TYPES,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    TARGET_COLUMN
)

def generate_synthetic_data(num_samples: int = NUM_SAMPLES, seed: int = RANDOM_SEED) -> List[Dict[str, Any]]:
    """
    Generates synthetic IT change records with realistic non-deterministic correlations.
    """
    random.seed(seed)
    records: List[Dict[str, Any]] = []

    criticality_levels = [0.25, 0.50, 0.75, 1.00]
    criticality_weights = [0.25, 0.35, 0.25, 0.15]

    change_type_risks = {
        "CONFIG_CHANGE": 0.35,
        "VERSION_UPDATE": 0.45,
        "LIBRARY_UPDATE": 0.45,
        "API_CHANGE": 0.60,
        "SECURITY_CHANGE": 0.55,
        "DEPENDENCY_CHANGE": 0.65,
        "INFRASTRUCTURE_CHANGE": 0.75,
        "DATABASE_CHANGE": 0.85
    }

    for i in range(1, num_samples + 1):
        # 1. Primary Feature Generation
        change_type = random.choice(CHANGE_TYPES)
        crit_score = random.choices(criticality_levels, weights=criticality_weights)[0]

        # Complexity: 0.1 to 1.0
        complexity = round(random.betavariate(2, 2) * 0.8 + 0.1, 2)
        complexity = min(1.0, max(0.1, complexity))

        # Dependency Count: correlated with criticality
        base_dep = int(random.expovariate(0.3))
        if crit_score >= 0.75:
            base_dep += random.randint(2, 6)
        dependency_count = min(15, max(0, base_dep))

        # Dependency Depth: loosely bounded by dependency count
        if dependency_count == 0:
            dependency_depth = 0
            critical_services_affected = 0
        else:
            max_possible_depth = min(8, max(1, int(math.log2(dependency_count + 1) * 2.2)))
            dependency_depth = random.randint(1, max_possible_depth)
            
            # Critical services affected: subset of dependencies
            crit_prob = 0.25 if crit_score < 0.5 else 0.50
            critical_services_affected = min(dependency_count, random.binomialvariate(dependency_count, crit_prob) if hasattr(random, 'binomialvariate') else sum(1 for _ in range(dependency_count) if random.random() < crit_prob))
            critical_services_affected = min(5, critical_services_affected)

        # Service Age: 1 to 120 months
        service_age = random.randint(1, 120)

        # Previous Incidents: older services with higher criticality tend to have logged more
        prev_incident_rate = (service_age / 24.0) * (crit_score + 0.2)
        previous_incidents = min(10, max(0, int(random.gauss(prev_incident_rate, 1.2))))

        # Historical Failure Rate: 0.0 to 1.0 (mean around 0.18)
        if previous_incidents == 0 and random.random() < 0.35:
            historical_failure_rate = 0.0
        else:
            hist_rate = random.betavariate(1.5, 5.0)
            historical_failure_rate = round(min(0.85, max(0.0, hist_rate)), 3)

        # Version Change Size:
        # Patch: ~0.01, Minor: ~0.10, Major: ~1.00 to 2.00
        change_class = random.choices(["PATCH", "MINOR", "MAJOR"], weights=[0.45, 0.40, 0.15])[0]
        if change_class == "PATCH":
            version_change_size = round(random.uniform(0.01, 0.05), 3)
        elif change_class == "MINOR":
            version_change_size = round(random.uniform(0.10, 0.40), 2)
        else:
            version_change_size = round(random.uniform(1.00, 2.00), 2)

        # Blast Radius Score (Phase 4 calculation simulation)
        # Based on dependency count, depth, and critical services
        if dependency_count == 0:
            blast_radius_score = 0.0
        else:
            raw_blast = (
                (dependency_count / 15.0) * 40.0 +
                min(35.0, critical_services_affected * 17.5) +
                min(15.0, dependency_depth * 4.0) +
                random.uniform(0.0, 10.0)
            )
            blast_radius_score = round(min(100.0, max(5.0, raw_blast)), 1)

        # 2. Latent Risk Tendency & Failure Probability Calculation
        type_weight = change_type_risks.get(change_type, 0.50)
        
        # Log-odds of incident occurrence
        log_odds = (
            -3.40                                         # Baseline bias (~20% default event rate)
            + (complexity * 1.85)                         # Change complexity factor
            + (type_weight * 1.40)                        # Change classification factor
            + (crit_score * 1.30)                         # Target service criticality
            + ((blast_radius_score / 100.0) * 1.65)       # Blast radius impact
            + (historical_failure_rate * 1.25)            # Historical failure rate
            + (min(1.0, dependency_depth / 5.0) * 0.75)   # Depth cascading risk
            + (min(1.0, critical_services_affected / 3.0) * 0.85) # Downstream critical impact
            + (min(1.0, previous_incidents / 5.0) * 0.40) # Past instability
            + (min(1.0, version_change_size / 1.0) * 0.50)# Version magnitude
            - (min(1.0, service_age / 60.0) * 0.35)       # Maturity discount (established services)
            + random.gauss(0, 0.55)                       # Realistic operational noise / variance
        )

        failure_prob = 1.0 / (1.0 + math.exp(-log_odds))
        
        # Bernoulli trial to determine binary failure target
        failure = 1 if random.random() < failure_prob else 0

        record = {
            "change_id": i,
            "change_complexity": complexity,
            "dependency_count": dependency_count,
            "dependency_depth": dependency_depth,
            "criticality_score": crit_score,
            "historical_failure_rate": historical_failure_rate,
            "change_type": change_type,
            "blast_radius_score": blast_radius_score,
            "critical_services_affected": critical_services_affected,
            "previous_incidents": previous_incidents,
            "service_age": service_age,
            "version_change_size": version_change_size,
            "failure": failure
        }
        records.append(record)

    return records

def save_and_validate_dataset(records: List[Dict[str, Any]], filepath: str = str(DATA_FILE)) -> Dict[str, Any]:
    """
    Saves generated records to CSV and performs statistical validation.
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    fieldnames = [
        "change_id",
        "change_complexity",
        "dependency_count",
        "dependency_depth",
        "criticality_score",
        "historical_failure_rate",
        "change_type",
        "blast_radius_score",
        "critical_services_affected",
        "previous_incidents",
        "service_age",
        "version_change_size",
        "failure"
    ]

    with open(filepath, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    # Validation stats
    total_records = len(records)
    failures = sum(r["failure"] for r in records)
    non_failures = total_records - failures
    failure_rate = (failures / total_records) * 100 if total_records > 0 else 0

    # Check missing and duplicates
    missing_count = 0
    ids = set()
    duplicate_count = 0
    for r in records:
        if r["change_id"] in ids:
            duplicate_count += 1
        ids.add(r["change_id"])
        for k in fieldnames:
            if r[k] is None:
                missing_count += 1

    summary = {
        "filepath": filepath,
        "total_records": total_records,
        "failures": failures,
        "non_failures": non_failures,
        "failure_rate_percent": round(failure_rate, 2),
        "missing_values": missing_count,
        "duplicate_rows": duplicate_count
    }

    print("=" * 60)
    print("ChangeGuard Synthetic Dataset Validation Summary")
    print("=" * 60)
    print(f"File Path:            {summary['filepath']}")
    print(f"Total Records:        {summary['total_records']}")
    print(f"Failures (incidents): {summary['failures']}")
    print(f"Non-Failures:         {summary['non_failures']}")
    print(f"Failure Rate:         {summary['failure_rate_percent']}%")
    print(f"Missing Values:       {summary['missing_values']}")
    print(f"Duplicate IDs:        {summary['duplicate_rows']}")
    print("=" * 60)

    return summary

if __name__ == "__main__":
    data = generate_synthetic_data()
    save_and_validate_dataset(data)
