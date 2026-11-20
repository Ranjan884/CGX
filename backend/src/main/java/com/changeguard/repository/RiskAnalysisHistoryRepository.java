package com.changeguard.repository;

import com.changeguard.model.RiskAnalysisHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskAnalysisHistoryRepository extends JpaRepository<RiskAnalysisHistory, Long> {

    List<RiskAnalysisHistory> findByServiceIdOrderByAnalysisTimestampDesc(Long serviceId);

    List<RiskAnalysisHistory> findAllByOrderByAnalysisTimestampDesc();

    List<RiskAnalysisHistory> findByRiskLevelOrderByAnalysisTimestampDesc(String riskLevel);

    @Query("SELECT r FROM RiskAnalysisHistory r WHERE r.actualIncident IS NOT NULL ORDER BY r.analysisTimestamp DESC")
    List<RiskAnalysisHistory> findWithRecordedOutcome();

    @Query("SELECT r FROM RiskAnalysisHistory r WHERE r.actualIncident IS NOT NULL AND r.mlPrediction IS NOT NULL")
    List<RiskAnalysisHistory> findLabeledMLOutcomes();

    @Query("SELECT r.service.id, r.service.name, r.service.criticality, " +
           "COUNT(r), " +
           "SUM(CASE WHEN r.riskLevel IN ('HIGH', 'CRITICAL') THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN r.actualIncident = true THEN 1 ELSE 0 END), " +
           "AVG(r.riskScore) " +
           "FROM RiskAnalysisHistory r GROUP BY r.service.id, r.service.name, r.service.criticality " +
           "ORDER BY SUM(CASE WHEN r.riskLevel IN ('HIGH', 'CRITICAL') THEN 1 ELSE 0 END) DESC, AVG(r.riskScore) DESC")
    List<Object[]> findHighRiskServiceAggregates();
}
