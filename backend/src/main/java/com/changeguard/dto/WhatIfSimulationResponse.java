package com.changeguard.dto;

public class WhatIfSimulationResponse {

    private WhatIfSimulationRequest request;
    private SimulationStateDto currentState;
    private SimulationStateDto simulatedState;
    private WhatIfComparisonDto comparison;
    private long simulatedAtTimestamp;

    public WhatIfSimulationResponse() {
        this.simulatedAtTimestamp = System.currentTimeMillis();
    }

    public WhatIfSimulationResponse(WhatIfSimulationRequest request,
                                  SimulationStateDto currentState,
                                  SimulationStateDto simulatedState,
                                  WhatIfComparisonDto comparison) {
        this.request = request;
        this.currentState = currentState;
        this.simulatedState = simulatedState;
        this.comparison = comparison;
        this.simulatedAtTimestamp = System.currentTimeMillis();
    }

    public WhatIfSimulationRequest getRequest() {
        return request;
    }

    public void setRequest(WhatIfSimulationRequest request) {
        this.request = request;
    }

    public SimulationStateDto getCurrentState() {
        return currentState;
    }

    public void setCurrentState(SimulationStateDto currentState) {
        this.currentState = currentState;
    }

    public SimulationStateDto getSimulatedState() {
        return simulatedState;
    }

    public void setSimulatedState(SimulationStateDto simulatedState) {
        this.simulatedState = simulatedState;
    }

    public WhatIfComparisonDto getComparison() {
        return comparison;
    }

    public void setComparison(WhatIfComparisonDto comparison) {
        this.comparison = comparison;
    }

    public long getSimulatedAtTimestamp() {
        return simulatedAtTimestamp;
    }

    public void setSimulatedAtTimestamp(long simulatedAtTimestamp) {
        this.simulatedAtTimestamp = simulatedAtTimestamp;
    }
}
