package com.changeguard.dto;

import java.util.List;

public class GraphResponseDto {
    private List<GraphNodeDto> nodes;
    private List<GraphEdgeDto> edges;
    private int totalNodes;
    private int totalEdges;

    public GraphResponseDto() {
    }

    public GraphResponseDto(List<GraphNodeDto> nodes, List<GraphEdgeDto> edges) {
        this.nodes = nodes;
        this.edges = edges;
        this.totalNodes = nodes != null ? nodes.size() : 0;
        this.totalEdges = edges != null ? edges.size() : 0;
    }

    public List<GraphNodeDto> getNodes() {
        return nodes;
    }

    public void setNodes(List<GraphNodeDto> nodes) {
        this.nodes = nodes;
        this.totalNodes = nodes != null ? nodes.size() : 0;
    }

    public List<GraphEdgeDto> getEdges() {
        return edges;
    }

    public void setEdges(List<GraphEdgeDto> edges) {
        this.edges = edges;
        this.totalEdges = edges != null ? edges.size() : 0;
    }

    public int getTotalNodes() {
        return totalNodes;
    }

    public void setTotalNodes(int totalNodes) {
        this.totalNodes = totalNodes;
    }

    public int getTotalEdges() {
        return totalEdges;
    }

    public void setTotalEdges(int totalEdges) {
        this.totalEdges = totalEdges;
    }
}
