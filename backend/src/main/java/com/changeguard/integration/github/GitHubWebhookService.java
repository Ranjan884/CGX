package com.changeguard.integration.github;

import com.changeguard.dto.ChangeRequestDto;
import com.changeguard.dto.RiskPredictionResponseDto;
import com.changeguard.model.Change;
import com.changeguard.model.enums.ChangeType;
import com.changeguard.repository.ServiceRepository;
import com.changeguard.service.AuditLogService;
import com.changeguard.service.ChangeService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class GitHubWebhookService {

    private final ObjectMapper objectMapper;
    private final ChangeService changeService;
    private final ServiceRepository serviceRepository;
    private final AuditLogService auditLogService;
    private final HttpClient httpClient;

    @Value("${changeguard.github.webhook-secret:}")
    private String webhookSecret;

    @Value("${changeguard.github.token:}")
    private String githubToken;

    @Value("${changeguard.github.repository-service-map:}")
    private String repositoryServiceMap;

    public GitHubWebhookService(ObjectMapper objectMapper,
                                ChangeService changeService,
                                ServiceRepository serviceRepository,
                                AuditLogService auditLogService) {
        this.objectMapper = objectMapper;
        this.changeService = changeService;
        this.serviceRepository = serviceRepository;
        this.auditLogService = auditLogService;
        this.httpClient = HttpClient.newHttpClient();
    }

    public Map<String, Object> process(String signature, String event, String deliveryId, String payload) {
        verifySignature(signature, payload);

        if (!"pull_request".equalsIgnoreCase(event)) {
            return Map.of("status", "ignored", "reason", "Only pull_request events are processed", "event", event == null ? "unknown" : event);
        }

        try {
            JsonNode root = objectMapper.readTree(payload);
            String action = text(root, "/action", "");
            if (!List.of("opened", "synchronize", "reopened", "ready_for_review").contains(action)) {
                return Map.of("status", "ignored", "reason", "Pull request action is not assessed", "action", action);
            }

            JsonNode repository = root.path("repository");
            JsonNode pullRequest = root.path("pull_request");
            if (repository.isMissingNode() || pullRequest.isMissingNode()) {
                throw new IllegalArgumentException("Webhook payload is missing repository or pull_request data");
            }

            String fullName = text(repository, "/full_name", "");
            Long serviceId = resolveServiceId(fullName);
            String title = text(pullRequest, "/title", "Untitled pull request");
            String htmlUrl = text(pullRequest, "/html_url", "");
            int number = pullRequest.path("number").asInt(0);
            String baseSha = shortSha(text(pullRequest, "/base/sha", "base"));
            String headSha = shortSha(text(pullRequest, "/head/sha", "head"));
            if (baseSha.equals(headSha)) {
                throw new IllegalArgumentException("Pull request base and head commits are identical; no change can be assessed");
            }

            String body = text(pullRequest, "/body", "");
            ChangeType changeType = determineChangeType(pullRequest, title + " " + body);
            int complexity = calculateComplexity(pullRequest);
            String description = "GitHub PR #" + number + ": " + title + " | Repository: " + fullName + " | " + htmlUrl;

            ChangeRequestDto request = new ChangeRequestDto(
                    serviceId,
                    changeType,
                    description,
                    baseSha,
                    headSha,
                    complexity
            );

            Change savedChange = changeService.createChange(request);
            RiskPredictionResponseDto risk = changeService.predictRiskForChange(request);
            boolean commentPosted = postPullRequestComment(fullName, number, risk, savedChange.getId(), htmlUrl);

            auditLogService.recordAudit(
                    "GITHUB_ACTION",
                    "GITHUB_PULL_REQUEST_ASSESSED",
                    "CHANGE",
                    savedChange.getId(),
                    "SUCCESS",
                    "Repository=" + fullName + ", PR=#" + number + ", delivery=" + (deliveryId == null ? "unknown" : deliveryId)
            );

            Map<String, Object> response = new HashMap<>();
            response.put("status", "assessed");
            response.put("deliveryId", deliveryId == null ? "unknown" : deliveryId);
            response.put("repository", fullName);
            response.put("pullRequestNumber", number);
            response.put("pullRequestUrl", htmlUrl);
            response.put("changeGuardChangeId", savedChange.getId());
            response.put("serviceName", risk.getServiceName());
            response.put("riskProbability", risk.getRiskProbability());
            response.put("riskPercentage", Math.round(risk.getRiskProbability() * 100));
            response.put("riskLevel", risk.getRiskLevel());
            response.put("recommendedRollout", risk.getRecommendedRollout());
            response.put("riskFactors", risk.getRiskFactors() == null ? List.of() : risk.getRiskFactors());
            response.put("explanation", risk.getExplanation());
            response.put("githubCommentPosted", commentPosted);
            return response;
        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Unable to process GitHub webhook payload: " + ex.getMessage(), ex);
        }
    }

    private void verifySignature(String signature, String payload) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new IllegalStateException("GitHub webhook secret is not configured. Set CHANGEGUARD_GITHUB_WEBHOOK_SECRET.");
        }
        if (signature == null || !signature.startsWith("sha256=")) {
            throw new SecurityException("Missing or invalid X-Hub-Signature-256 header");
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expected = "sha256=" + toHex(digest);
            if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8))) {
                throw new SecurityException("GitHub webhook signature verification failed");
            }
        } catch (SecurityException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to verify GitHub webhook signature", ex);
        }
    }

    private Long resolveServiceId(String repositoryFullName) {
        Map<String, Long> mappings = parseRepositoryMappings();
        Long id = mappings.get(repositoryFullName.toLowerCase(Locale.ROOT));
        if (id == null) {
            throw new IllegalArgumentException("No ChangeGuard service mapping found for GitHub repository '" + repositoryFullName + "'. Configure CHANGEGUARD_GITHUB_REPOSITORY_SERVICE_MAP.");
        }
        if (!serviceRepository.existsById(id)) {
            throw new IllegalArgumentException("Mapped ChangeGuard service ID " + id + " does not exist");
        }
        return id;
    }

    private Map<String, Long> parseRepositoryMappings() {
        Map<String, Long> mappings = new HashMap<>();
        if (repositoryServiceMap == null || repositoryServiceMap.isBlank()) return mappings;
        for (String entry : repositoryServiceMap.split(",")) {
            String[] parts = entry.trim().split(":", 2);
            if (parts.length == 2) {
                try {
                    mappings.put(parts[0].trim().toLowerCase(Locale.ROOT), Long.parseLong(parts[1].trim()));
                } catch (NumberFormatException ex) {
                    throw new IllegalStateException("Invalid repository-to-service mapping: " + entry);
                }
            }
        }
        return mappings;
    }

    private ChangeType determineChangeType(JsonNode pullRequest, String text) {
        for (JsonNode label : pullRequest.path("labels")) {
            String name = label.path("name").asText("");
            if (name.toLowerCase(Locale.ROOT).startsWith("change-type:")) {
                String value = name.substring("change-type:".length()).trim().toUpperCase(Locale.ROOT);
                try { return ChangeType.valueOf(value); }
                catch (IllegalArgumentException ex) { throw new IllegalArgumentException("Unsupported ChangeGuard change-type label: " + name); }
            }
        }
        String value = text.toLowerCase(Locale.ROOT);
        if (containsAny(value, "database", "schema", "migration", "sql")) return ChangeType.DATABASE_CHANGE;
        if (containsAny(value, "security", "auth", "permission", "token")) return ChangeType.SECURITY_CHANGE;
        if (containsAny(value, "api", "endpoint", "contract")) return ChangeType.API_CHANGE;
        if (containsAny(value, "infrastructure", "terraform", "kubernetes", "docker", "network")) return ChangeType.INFRASTRUCTURE_CHANGE;
        if (containsAny(value, "dependency", "library", "package", "upgrade")) return ChangeType.DEPENDENCY_CHANGE;
        if (containsAny(value, "config", "configuration", "environment")) return ChangeType.CONFIG_CHANGE;
        return ChangeType.VERSION_UPDATE;
    }

    private int calculateComplexity(JsonNode pullRequest) {
        int files = Math.max(0, pullRequest.path("changed_files").asInt(1));
        int additions = Math.max(0, pullRequest.path("additions").asInt(0));
        int deletions = Math.max(0, pullRequest.path("deletions").asInt(0));
        int changedLines = additions + deletions;
        int score = 1 + Math.min(4, files / 3) + Math.min(5, changedLines / 200);
        return Math.max(1, Math.min(10, score));
    }

    private boolean postPullRequestComment(String repository, int number, RiskPredictionResponseDto risk, Long changeId, String pullRequestUrl) {
        if (githubToken == null || githubToken.isBlank()) return false;
        try {
            StringBuilder comment = new StringBuilder();
            comment.append("## 🛡️ ChangeGuard Risk Assessment\n\n")
                    .append("| Field | Result |\n|---|---|\n")
                    .append("| Service | ").append(risk.getServiceName()).append(" |\n")
                    .append("| Risk score | **").append(Math.round(risk.getRiskProbability() * 100)).append("/100** |\n")
                    .append("| Risk level | **").append(risk.getRiskLevel()).append("** |\n")
                    .append("| Recommended rollout | ").append(risk.getRecommendedRollout()).append(" |\n")
                    .append("| ChangeGuard record | #").append(changeId).append(" |\n\n")
                    .append("### Main risk factors\n");
            List<String> factors = Optional.ofNullable(risk.getRiskFactors()).orElse(new ArrayList<>());
            if (factors.isEmpty()) comment.append("- No specific risk factors returned.\n");
            else for (String factor : factors) comment.append("- ").append(factor).append("\n");
            comment.append("\n### Explanation\n").append(risk.getExplanation()).append("\n\n")
                    .append("> Decision-support result only. This assessment does not approve, block, or deploy production changes.\n\n")
                    .append("[Open related Pull Request](").append(pullRequestUrl).append(")");

            String json = objectMapper.writeValueAsString(Map.of("body", comment.toString()));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.github.com/repos/" + repository + "/issues/" + number + "/comments"))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + githubToken)
                    .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                    .header("X-GitHub-Api-Version", "2022-11-28")
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("GitHub comment API returned HTTP " + response.statusCode() + ": " + response.body());
            }
            return true;
        } catch (Exception ex) {
            throw new IllegalStateException("Risk assessment was created, but posting the GitHub PR comment failed: " + ex.getMessage(), ex);
        }
    }

    private static boolean containsAny(String value, String... terms) {
        for (String term : terms) if (value.contains(term)) return true;
        return false;
    }

    private static String text(JsonNode node, String pointer, String fallback) {
        JsonNode value = node.at(pointer);
        return value.isMissingNode() || value.isNull() ? fallback : value.asText(fallback);
    }

    private static String shortSha(String sha) {
        if (sha == null || sha.isBlank()) return "unknown";
        return sha.substring(0, Math.min(7, sha.length()));
    }

    private static String toHex(byte[] bytes) {
        StringBuilder result = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) result.append(String.format("%02x", value));
        return result.toString();
    }
}
