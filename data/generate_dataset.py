"""
ChangeGuard - Synthetic Dataset Generator for Banking IT Changes
Generates 1,200 realistic simulated change records for machine learning training.
Reproducible using random seed 42.

Features:
- change_id: unique identifier
- service_name: simulated banking service
- change_type: API_CHANGE, DATABASE_CHANGE, CONFIG_CHANGE, LIBRARY_UPDATE, INFRASTRUCTURE_CHANGE, ML_MODEL_CHANGE
- service_criticality: LOW, MEDIUM, HIGH, CRITICAL
- complexity: 1 to 10
- dependency_count: downstream dependencies of the service
- dependent_count: upstream services calling this service
- critical_services_affected: number of CRITICAL services reached in blast radius
- historical_failures: previous failed changes for this service
- change_frequency: changes deployed in the last 90 days
- blast_radius: ratio of affected services to total services (0.0 to 1.0)
- failure: target label (1 = incident/failure, 0 = success)
"""

import csv
import random
import math
import os
import sys

def generate_changes_dataset(filename="data/changes.csv", num_records=1200, seed=42):
    random.seed(seed)
    
    os.makedirs(os.path.dirname(os.path.abspath(filename)), exist_ok=True)
    
    change_types = [
        "API_CHANGE", 
        "DATABASE_CHANGE", 
        "CONFIG_CHANGE", 
        "LIBRARY_UPDATE", 
        "INFRASTRUCTURE_CHANGE", 
        "ML_MODEL_CHANGE"
    ]
    
    criticality_levels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    criticality_weights = {"LOW": 0.1, "MEDIUM": 0.3, "HIGH": 0.6, "CRITICAL": 0.9}
    change_type_risk = {
        "DATABASE_CHANGE": 0.38,
        "API_CHANGE": 0.28,
        "INFRASTRUCTURE_CHANGE": 0.25,
        "ML_MODEL_CHANGE": 0.22,
        "LIBRARY_UPDATE": 0.14,
        "CONFIG_CHANGE": 0.10
    }
    
    headers = [
        "change_id",
        "service_name",
        "change_type",
        "service_criticality",
        "complexity",
        "dependency_count",
        "dependent_count",
        "critical_services_affected",
        "historical_failures",
        "change_frequency",
        "blast_radius",
        "failure"
    ]
    
    services = [
        ("Customer App", "HIGH", 1, 0),
        ("API Gateway", "CRITICAL", 3, 1),
        ("Authentication Service", "CRITICAL", 0, 1),
        ("Account Service", "HIGH", 1, 1),
        ("Payment Service", "CRITICAL", 3, 1),
        ("Fraud Detection Service", "HIGH", 1, 1),
        ("Core Banking Service", "CRITICAL", 2, 3),
        ("Transaction Database", "CRITICAL", 0, 2),
        ("Notification Service", "MEDIUM", 0, 1),
        ("Reconciliation Service", "HIGH", 1, 1),
        ("Reporting Service", "LOW", 1, 1),
    ]

    records = []
    
    for i in range(1, num_records + 1):
        svc_name, default_crit, base_deps, base_dependents = random.choice(services)
        
        crit = default_crit if random.random() > 0.08 else random.choice(criticality_levels)
        c_type = random.choice(change_types)
        
        if c_type in ["DATABASE_CHANGE", "API_CHANGE", "INFRASTRUCTURE_CHANGE"]:
            complexity = min(10, max(2, int(random.gauss(6.8, 1.9))))
        else:
            complexity = min(10, max(1, int(random.gauss(4.2, 1.8))))
            
        dep_count = max(0, int(random.gauss(base_deps * 1.4 + 1, 1.1)))
        dependent_count = max(0, int(random.gauss(base_dependents * 1.4 + 1, 1.1)))
        
        affected_total = min(11, dep_count + random.randint(0, 3))
        blast_radius = round(min(1.0, max(0.09, affected_total / 11.0)), 2)
        
        crit_affected = min(4, max(0, int(blast_radius * 3.5 + random.uniform(-0.4, 0.9))))
        
        historical_failures = max(0, int(random.expovariate(0.55)))
        change_frequency = random.randint(1, 35)
        
        # Risk score calculation for Ground Truth failure probability with realistic banking failure rate (~24%)
        log_odds = (
            -5.3
            + (change_type_risk[c_type] * 2.3)
            + (criticality_weights[crit] * 1.8)
            + (complexity * 0.28)
            + (blast_radius * 2.2)
            + (crit_affected * 0.45)
            + (historical_failures * 0.35)
            - (math.log(change_frequency + 1) * 0.16)
            + random.gauss(0, 0.35)
        )
        
        prob = 1.0 / (1.0 + math.exp(-log_odds))
        failure = 1 if prob >= 0.50 else 0
        
        records.append([
            f"CHG-{1000 + i}",
            svc_name,
            c_type,
            crit,
            complexity,
            dep_count,
            dependent_count,
            crit_affected,
            historical_failures,
            change_frequency,
            blast_radius,
            failure
        ])
        
    with open(filename, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(records)
        
    failures = sum(r[-1] for r in records)
    print(f"Generated {len(records)} records in {filename}. Failures: {failures} ({failures/len(records)*100:.1f}%)")
    return records

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "data/changes.csv"
    generate_changes_dataset(out_file)
