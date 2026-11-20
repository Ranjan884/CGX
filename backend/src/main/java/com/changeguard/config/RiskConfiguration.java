package com.changeguard.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/**
 * Phase 5 Configuration: Rule-Based Risk Engine Weights & Thresholds.
 * 
 * Configurable assumptions loaded from application.properties.
 * Note: These weights and thresholds are project-specific assumptions,
 * not official banking-industry regulatory standards.
 */
@Configuration
@ConfigurationProperties(prefix = "changeguard.risk")
public class RiskConfiguration {

    private static final Logger log = LoggerFactory.getLogger(RiskConfiguration.class);

    private Weights weights = new Weights();
    private Thresholds thresholds = new Thresholds();
    private Defaults defaults = new Defaults();

    public static class Weights {
        private double complexity = 0.15;
        private double dependency = 0.10;
        private double depth = 0.10;
        private double criticality = 0.15;
        private double incident = 0.15;
        private double changeType = 0.10;
        private double criticalService = 0.10;
        private double blastRadius = 0.15;

        public double getComplexity() {
            return complexity;
        }

        public void setComplexity(double complexity) {
            this.complexity = complexity;
        }

        public double getDependency() {
            return dependency;
        }

        public void setDependency(double dependency) {
            this.dependency = dependency;
        }

        public double getDepth() {
            return depth;
        }

        public void setDepth(double depth) {
            this.depth = depth;
        }

        public double getCriticality() {
            return criticality;
        }

        public void setCriticality(double criticality) {
            this.criticality = criticality;
        }

        public double getIncident() {
            return incident;
        }

        public void setIncident(double incident) {
            this.incident = incident;
        }

        public double getChangeType() {
            return changeType;
        }

        public void setChangeType(double changeType) {
            this.changeType = changeType;
        }

        public double getCriticalService() {
            return criticalService;
        }

        public void setCriticalService(double criticalService) {
            this.criticalService = criticalService;
        }

        public double getBlastRadius() {
            return blastRadius;
        }

        public void setBlastRadius(double blastRadius) {
            this.blastRadius = blastRadius;
        }

        public double getTotalWeight() {
            return complexity + dependency + depth + criticality + incident + changeType + criticalService + blastRadius;
        }

        public boolean isValid() {
            double sum = getTotalWeight();
            return Math.abs(sum - 1.0) <= 0.01;
        }
    }

    public static class Thresholds {
        private double low = 0.30;
        private double medium = 0.60;
        private double high = 0.80;

        public double getLow() {
            return low;
        }

        public void setLow(double low) {
            this.low = low;
        }

        public double getMedium() {
            return medium;
        }

        public void setMedium(double medium) {
            this.medium = medium;
        }

        public double getHigh() {
            return high;
        }

        public void setHigh(double high) {
            this.high = high;
        }
    }

    public static class Defaults {
        private int maxRelevantDependencies = 10;
        private int maxDepth = 5;
        private double historicalFailureRate = 0.20;

        public int getMaxRelevantDependencies() {
            return maxRelevantDependencies;
        }

        public void setMaxRelevantDependencies(int maxRelevantDependencies) {
            this.maxRelevantDependencies = maxRelevantDependencies;
        }

        public int getMaxDepth() {
            return maxDepth;
        }

        public void setMaxDepth(int maxDepth) {
            this.maxDepth = maxDepth;
        }

        public double getHistoricalFailureRate() {
            return historicalFailureRate;
        }

        public void setHistoricalFailureRate(double historicalFailureRate) {
            this.historicalFailureRate = historicalFailureRate;
        }
    }

    @PostConstruct
    public void validateWeights() {
        if (!weights.isValid()) {
            log.warn("Risk Engine weights sum to {} instead of 1.00. Normalization may be skewed.", weights.getTotalWeight());
        } else {
            log.info("Risk Engine initialized successfully with valid weight distribution (sum={})", weights.getTotalWeight());
        }
    }

    public Weights getWeights() {
        return weights;
    }

    public void setWeights(Weights weights) {
        this.weights = weights;
    }

    public Thresholds getThresholds() {
        return thresholds;
    }

    public void setThresholds(Thresholds thresholds) {
        this.thresholds = thresholds;
    }

    public Defaults getDefaults() {
        return defaults;
    }

    public void setDefaults(Defaults defaults) {
        this.defaults = defaults;
    }
}
