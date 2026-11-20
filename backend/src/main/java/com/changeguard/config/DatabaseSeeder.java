package com.changeguard.config;

import com.changeguard.model.AuditLog;
import com.changeguard.model.Change;
import com.changeguard.model.Dependency;
import com.changeguard.model.Incident;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.ChangeType;
import com.changeguard.model.enums.Criticality;
import com.changeguard.model.enums.ServiceStatus;
import com.changeguard.model.enums.Severity;
import com.changeguard.repository.AuditLogRepository;
import com.changeguard.repository.ChangeRepository;
import com.changeguard.repository.DependencyRepository;
import com.changeguard.repository.IncidentRepository;
import com.changeguard.repository.ServiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final ServiceRepository serviceRepository;
    private final DependencyRepository dependencyRepository;
    private final ChangeRepository changeRepository;
    private final IncidentRepository incidentRepository;
    private final AuditLogRepository auditLogRepository;

    public DatabaseSeeder(ServiceRepository serviceRepository,
                          DependencyRepository dependencyRepository,
                          ChangeRepository changeRepository,
                          IncidentRepository incidentRepository,
                          AuditLogRepository auditLogRepository) {
        this.serviceRepository = serviceRepository;
        this.dependencyRepository = dependencyRepository;
        this.changeRepository = changeRepository;
        this.incidentRepository = incidentRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (serviceRepository.count() > 0) {
            log.info("Database is already seeded with {} services. Skipping duplicate seeding.", serviceRepository.count());
            return;
        }

        log.info("Seeding initial ChangeGuard simulated banking database...");

        // 1. Seed Services (11 Microservices)
        ServiceEntity customerApp = new ServiceEntity("Customer App", "FRONTEND", Criticality.HIGH, "3.4.1", ServiceStatus.ACTIVE);
        ServiceEntity apiGateway = new ServiceEntity("API Gateway", "GATEWAY", Criticality.CRITICAL, "2.8.0", ServiceStatus.ACTIVE);
        ServiceEntity authService = new ServiceEntity("Authentication Service", "SECURITY", Criticality.CRITICAL, "1.9.4", ServiceStatus.ACTIVE);
        ServiceEntity accountService = new ServiceEntity("Account Service", "CORE", Criticality.HIGH, "2.1.0", ServiceStatus.ACTIVE);
        ServiceEntity paymentService = new ServiceEntity("Payment Service", "PAYMENT", Criticality.CRITICAL, "2.0.0", ServiceStatus.ACTIVE);
        ServiceEntity fraudService = new ServiceEntity("Fraud Detection Service", "SECURITY_ML", Criticality.HIGH, "1.5.2", ServiceStatus.ACTIVE);
        ServiceEntity coreBanking = new ServiceEntity("Core Banking Service", "CORE", Criticality.CRITICAL, "4.2.0", ServiceStatus.ACTIVE);
        ServiceEntity transactionDb = new ServiceEntity("Transaction Database", "DATABASE", Criticality.CRITICAL, "15.4", ServiceStatus.ACTIVE);
        ServiceEntity notificationService = new ServiceEntity("Notification Service", "MESSAGING", Criticality.MEDIUM, "2.3.1", ServiceStatus.ACTIVE);
        ServiceEntity reconciliationService = new ServiceEntity("Reconciliation Service", "BATCH", Criticality.HIGH, "1.8.0", ServiceStatus.ACTIVE);
        ServiceEntity reportingService = new ServiceEntity("Reporting Service", "ANALYTICS", Criticality.LOW, "3.0.2", ServiceStatus.ACTIVE);

        List<ServiceEntity> services = Arrays.asList(
                customerApp, apiGateway, authService, accountService, paymentService,
                fraudService, coreBanking, transactionDb, notificationService,
                reconciliationService, reportingService
        );
        serviceRepository.saveAll(services);
        log.info("Seeded {} services.", services.size());

        // 2. Seed Dependencies (13 Topology Edges)
        List<Dependency> dependencies = Arrays.asList(
                new Dependency(customerApp, apiGateway, "REST_API", Criticality.CRITICAL),
                new Dependency(apiGateway, authService, "gRPC", Criticality.CRITICAL),
                new Dependency(apiGateway, accountService, "REST_API", Criticality.HIGH),
                new Dependency(apiGateway, paymentService, "REST_API", Criticality.CRITICAL),
                new Dependency(accountService, coreBanking, "gRPC", Criticality.CRITICAL),
                new Dependency(paymentService, fraudService, "REST_API", Criticality.HIGH),
                new Dependency(paymentService, coreBanking, "gRPC", Criticality.CRITICAL),
                new Dependency(fraudService, coreBanking, "gRPC", Criticality.CRITICAL),
                new Dependency(coreBanking, transactionDb, "JDBC_POOL", Criticality.CRITICAL),
                new Dependency(paymentService, notificationService, "KAFKA_TOPIC", Criticality.MEDIUM),
                new Dependency(coreBanking, reconciliationService, "EVENT_STREAM", Criticality.HIGH),
                new Dependency(reconciliationService, reportingService, "BATCH_FILE", Criticality.LOW),
                new Dependency(reportingService, transactionDb, "JDBC_READONLY", Criticality.LOW)
        );
        dependencyRepository.saveAll(dependencies);
        log.info("Seeded {} microservice dependencies.", dependencies.size());

        // 3. Seed Changes (10 Realistic Technical Changes)
        Change chg1 = new Change(paymentService, ChangeType.API_CHANGE, "Upgrade Payment API from v2 to v3 for ISO20022 compliance", "2.0.0", "3.0.0", 8);
        Change chg2 = new Change(coreBanking, ChangeType.DATABASE_CHANGE, "Add partition table to ledger entries for fiscal year close", "4.2.0", "4.3.0", 9);
        Change chg3 = new Change(notificationService, ChangeType.CONFIG_CHANGE, "Increase SMS broker retry timeout from 3s to 8s", "2.3.1", "2.3.2", 2);
        Change chg4 = new Change(authService, ChangeType.LIBRARY_UPDATE, "Upgrade Spring Security to resolve CVE-2024 token vulnerability", "1.9.4", "1.9.5", 5);
        Change chg5 = new Change(fraudService, ChangeType.ML_MODEL_CHANGE, "Deploy XGBoost v3 fraud classifier with new card-not-present features", "1.5.2", "1.6.0", 7);
        Change chg6 = new Change(apiGateway, ChangeType.INFRASTRUCTURE_CHANGE, "Migrate API Gateway ingress to Kubernetes Gateway API v1", "2.8.0", "2.9.0", 8);
        Change chg7 = new Change(accountService, ChangeType.API_CHANGE, "Introduce real-time balance streaming endpoint over WebSockets", "2.1.0", "2.2.0", 6);
        Change chg8 = new Change(reconciliationService, ChangeType.DATABASE_CHANGE, "Optimize reconciliation settlement index for end-of-day batch", "1.8.0", "1.8.1", 4);
        Change chg9 = new Change(reportingService, ChangeType.LIBRARY_UPDATE, "Upgrade Apache POI report exporter library", "3.0.2", "3.0.3", 2);
        Change chg10 = new Change(transactionDb, ChangeType.INFRASTRUCTURE_CHANGE, "PostgreSQL minor upgrade from 15.4 to 15.6 with WAL replica tuning", "15.4", "15.6", 8);

        List<Change> changes = Arrays.asList(chg1, chg2, chg3, chg4, chg5, chg6, chg7, chg8, chg9, chg10);
        changeRepository.saveAll(changes);
        log.info("Seeded {} technical change records.", changes.size());

        // 4. Seed Simulated Incidents (10 Historical Outcomes)
        List<Incident> incidents = Arrays.asList(
                new Incident(chg1, Severity.HIGH, true, "Fraud Detection Service, Core Banking Service, Notification Service", "API contract breaking change in transaction amount serialization"),
                new Incident(chg2, Severity.CRITICAL, true, "Core Banking Service, Transaction Database, Reconciliation Service, Reporting Service", "Table lock contention during online index creation stalled transaction pool"),
                new Incident(chg3, Severity.LOW, false, "None (Graceful retry observed)", "No incident. Notification delivery succeeded with reduced timeout alerts"),
                new Incident(chg4, Severity.MEDIUM, true, "Authentication Service, API Gateway", "Token cache TTL mismatch caused sporadic 401 Unauthorized spikes on customer login"),
                new Incident(chg5, Severity.HIGH, true, "Fraud Detection Service, Payment Service", "ML inference latency spike (>1200ms) caused payment gateway timeout cascading"),
                new Incident(chg6, Severity.HIGH, true, "API Gateway, Customer App, Payment Service", "Ingress route rewrite rule misconfiguration dropped authorization bearer headers"),
                new Incident(chg7, Severity.LOW, false, "None (Isolated feature rollout)", "Successful canary deployment with zero customer impact"),
                new Incident(chg8, Severity.LOW, false, "None", "Batch job duration decreased by 34%, all reconciliation checks passed"),
                new Incident(chg9, Severity.LOW, false, "None", "Export library patched without breaking reporting schema"),
                new Incident(chg10, Severity.CRITICAL, true, "Core Banking Service, Transaction Database, Payment Service, Account Service", "Connection pooler reset during WAL replay induced read-only mode failover")
        );
        incidentRepository.saveAll(incidents);
        log.info("Seeded {} simulated incidents.", incidents.size());

        // 5. Seed Audit Logs (Governance and Compliance Trail)
        if (auditLogRepository.count() == 0) {
            List<AuditLog> auditLogs = Arrays.asList(
                    new AuditLog("ADMIN", "SYSTEM_INIT", "SYSTEM", 0L, "SUCCESS", "ChangeGuard platform initialized with 11 core banking services and topology graph"),
                    new AuditLog("ENGINEER", "RISK_ANALYSIS", "SERVICE", 5L, "SUCCESS", "Evaluated VERSION_UPDATE change on service ID 5 -> Risk HIGH (78%)"),
                    new AuditLog("ENGINEER", "RECOMMENDATION_ANALYSIS", "SERVICE", 5L, "SUCCESS", "Generated 5 advisory recommendations for Payment Service v3 rollout"),
                    new AuditLog("ADMIN", "OUTCOME_RECORDED", "RISK_HISTORY", 1L, "SUCCESS", "Recorded actual incident outcome: incident=true, severity=HIGH"),
                    new AuditLog("ENGINEER", "WHATIF_SIMULATION", "SERVICE", 5L, "SUCCESS", "Simulated topological change: added dependency Payment Service -> Reconciliation Service"),
                    new AuditLog("VIEWER", "VIEW_RISK_REPORT", "CHANGE", 2L, "SUCCESS", "Read-only access: viewed risk breakdown for Core Banking database partition change"),
                    new AuditLog("ENGINEER", "RISK_ANALYSIS", "SERVICE", 7L, "SUCCESS", "Evaluated DATABASE_CHANGE on Core Banking Service -> Risk CRITICAL (84%)")
            );
            auditLogRepository.saveAll(auditLogs);
            log.info("Seeded {} compliance audit log entries.", auditLogs.size());
        }

        log.info("ChangeGuard database initialization complete.");
    }
}
