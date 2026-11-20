-- ===================================================
-- ChangeGuard: Predictive IT Change Risk Platform
-- PostgreSQL Database Schema
-- ===================================================

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS changes CASCADE;
DROP TABLE IF EXISTS dependencies CASCADE;
DROP TABLE IF EXISTS services CASCADE;

-- 1. SERVICES TABLE
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    criticality VARCHAR(20) NOT NULL CHECK (criticality IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    version VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. DEPENDENCIES TABLE
CREATE TABLE dependencies (
    id SERIAL PRIMARY KEY,
    source_service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    target_service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) NOT NULL DEFAULT 'REST_API',
    criticality VARCHAR(20) NOT NULL CHECK (criticality IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_diff_services CHECK (source_service_id <> target_service_id),
    CONSTRAINT uq_source_target UNIQUE (source_service_id, target_service_id)
);

-- 3. CHANGES TABLE
CREATE TABLE changes (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN (
        'API_CHANGE', 'DATABASE_CHANGE', 'CONFIG_CHANGE', 
        'LIBRARY_UPDATE', 'INFRASTRUCTURE_CHANGE', 'ML_MODEL_CHANGE'
    )),
    description TEXT NOT NULL,
    old_version VARCHAR(20) NOT NULL,
    new_version VARCHAR(20) NOT NULL,
    complexity INTEGER NOT NULL CHECK (complexity BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. INCIDENTS TABLE (SIMULATED HISTORICAL INCIDENTS)
CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    change_id INTEGER NOT NULL REFERENCES changes(id) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    failure BOOLEAN NOT NULL DEFAULT true,
    affected_services TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. RISK ANALYSIS HISTORY TABLE (PHASE 12 CONTINUOUS MONITORING)
CREATE TABLE risk_analysis_history (
    id SERIAL PRIMARY KEY,
    change_id INTEGER REFERENCES changes(id) ON DELETE SET NULL,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    risk_score DOUBLE PRECISION NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    blast_radius_score DOUBLE PRECISION NOT NULL,
    affected_services_count INTEGER NOT NULL,
    critical_services_affected INTEGER NOT NULL,
    dependency_depth INTEGER NOT NULL,
    ml_failure_probability DOUBLE PRECISION,
    ml_prediction INTEGER,
    ml_model_version VARCHAR(30),
    analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actual_incident BOOLEAN,
    actual_incident_severity VARCHAR(20) CHECK (actual_incident_severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    outcome_updated_at TIMESTAMP WITH TIME ZONE
);

-- 6. AUDIT LOGS TABLE (PHASE 14 SECURITY & GOVERNANCE COMPLIANCE)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_role VARCHAR(30) NOT NULL DEFAULT 'ENGINEER',
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    metadata TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_services_criticality ON services(criticality);
CREATE INDEX idx_deps_source ON dependencies(source_service_id);
CREATE INDEX idx_deps_target ON dependencies(target_service_id);
CREATE INDEX idx_changes_service ON changes(service_id);
CREATE INDEX idx_incidents_change ON incidents(change_id);
CREATE INDEX idx_history_service ON risk_analysis_history(service_id);
CREATE INDEX idx_history_change ON risk_analysis_history(change_id);
CREATE INDEX idx_history_timestamp ON risk_analysis_history(analysis_timestamp);
CREATE INDEX idx_history_risk_level ON risk_analysis_history(risk_level);
CREATE INDEX idx_history_actual_incident ON risk_analysis_history(actual_incident);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user_role ON audit_logs(user_role);

