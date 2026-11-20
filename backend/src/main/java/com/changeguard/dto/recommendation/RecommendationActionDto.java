package com.changeguard.dto.recommendation;

import com.changeguard.model.enums.RecommendationType;
import java.util.List;

/**
 * Phase 13 DTO: Individual Explainable Decision-Support Action
 */
public class RecommendationActionDto {

    private RecommendationType type;
    private String title;
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL
    private String reason;
    private String suggestedAction;
    private List<String> supportingFactors;
    private List<String> affectedServices;

    public RecommendationActionDto() {
    }

    public RecommendationActionDto(RecommendationType type, String title, String priority,
                                   String reason, String suggestedAction,
                                   List<String> supportingFactors, List<String> affectedServices) {
        this.type = type;
        this.title = title;
        this.priority = priority;
        this.reason = reason;
        this.suggestedAction = suggestedAction;
        this.supportingFactors = supportingFactors;
        this.affectedServices = affectedServices;
    }

    public RecommendationType getType() {
        return type;
    }

    public void setType(RecommendationType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getSuggestedAction() {
        return suggestedAction;
    }

    public void setSuggestedAction(String suggestedAction) {
        this.suggestedAction = suggestedAction;
    }

    public List<String> getSupportingFactors() {
        return supportingFactors;
    }

    public void setSupportingFactors(List<String> supportingFactors) {
        this.supportingFactors = supportingFactors;
    }

    public List<String> getAffectedServices() {
        return affectedServices;
    }

    public void setAffectedServices(List<String> affectedServices) {
        this.affectedServices = affectedServices;
    }
}
