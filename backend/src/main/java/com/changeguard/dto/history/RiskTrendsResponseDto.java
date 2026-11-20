package com.changeguard.dto.history;

import java.util.List;

/**
 * Phase 12 DTO: Historical Risk Trends Series
 */
public class RiskTrendsResponseDto {

    public static class TrendPoint {
        private String date;
        private Double averageRiskScore;
        private Long totalAnalyses;
        private Long highRiskChanges;
        private Long incidentsCount;

        public TrendPoint() {
        }

        public TrendPoint(String date, Double averageRiskScore, Long totalAnalyses, Long highRiskChanges, Long incidentsCount) {
            this.date = date;
            this.averageRiskScore = averageRiskScore;
            this.totalAnalyses = totalAnalyses;
            this.highRiskChanges = highRiskChanges;
            this.incidentsCount = incidentsCount;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public Double getAverageRiskScore() {
            return averageRiskScore;
        }

        public void setAverageRiskScore(Double averageRiskScore) {
            this.averageRiskScore = averageRiskScore;
        }

        public Long getTotalAnalyses() {
            return totalAnalyses;
        }

        public void setTotalAnalyses(Long totalAnalyses) {
            this.totalAnalyses = totalAnalyses;
        }

        public Long getHighRiskChanges() {
            return highRiskChanges;
        }

        public void setHighRiskChanges(Long highRiskChanges) {
            this.highRiskChanges = highRiskChanges;
        }

        public Long getIncidentsCount() {
            return incidentsCount;
        }

        public void setIncidentsCount(Long incidentsCount) {
            this.incidentsCount = incidentsCount;
        }
    }

    private List<TrendPoint> points;
    private Long totalHistoricalRecords;

    public RiskTrendsResponseDto() {
    }

    public RiskTrendsResponseDto(List<TrendPoint> points, Long totalHistoricalRecords) {
        this.points = points;
        this.totalHistoricalRecords = totalHistoricalRecords;
    }

    public List<TrendPoint> getPoints() {
        return points;
    }

    public void setPoints(List<TrendPoint> points) {
        this.points = points;
    }

    public Long getTotalHistoricalRecords() {
        return totalHistoricalRecords;
    }

    public void setTotalHistoricalRecords(Long totalHistoricalRecords) {
        this.totalHistoricalRecords = totalHistoricalRecords;
    }
}
