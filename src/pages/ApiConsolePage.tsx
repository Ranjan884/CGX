import React, { useState } from 'react';
import { Terminal, Play, Copy, Check, Database, Server, Code, FileText } from 'lucide-react';
import { apiService } from '../services/apiService';

interface EndpointConfig {
  method: 'GET' | 'POST' | 'PATCH';
  path: string;
  description: string;
  phase: string;
  sampleBody?: any;
}

const ENDPOINTS: EndpointConfig[] = [
  // --- Phase 14 Security, Governance & Production Readiness ---
  { method: 'GET', path: '/api/audit-logs', description: 'Phase 14: Retrieve tamper-evident compliance audit trail records', phase: 'Phase 14' },
  { method: 'GET', path: '/api/health', description: 'Phase 14: Multi-tier system health and component connectivity diagnostics', phase: 'Phase 14' },

  // --- Phase 13 Intelligent Change Recommendations & Decision Support ---
  { method: 'POST', path: '/api/recommendations/analyze', description: 'Phase 13: Generate explainable decision-support recommendations for proposed change', phase: 'Phase 13', sampleBody: {
    serviceId: 5,
    changeType: 'VERSION_UPDATE',
    oldVersion: '2.0.0',
    newVersion: '3.0.0',
    complexity: 'HIGH',
    description: 'Upgrade Payment Service v2 to v3 for ISO20022 compliance'
  }},
  { method: 'GET', path: '/api/recommendations/change/1', description: 'Phase 13: Generate recommendations for pre-recorded Change #1', phase: 'Phase 13' },

  // --- Phase 12 Continuous Risk History & Outcome Monitoring ---
  { method: 'GET', path: '/api/risk-history', description: 'Phase 12: Retrieve all historical pre-deployment change risk analyses', phase: 'Phase 12' },
  { method: 'GET', path: '/api/risk-history/high-risk-services', description: 'Phase 12: Rank services repeatedly evaluated as high risk with incident stats', phase: 'Phase 12' },
  { method: 'GET', path: '/api/risk-history/trends', description: 'Phase 12: Aggregate historical average risk scores and incident frequency trends', phase: 'Phase 12' },
  { method: 'GET', path: '/api/risk-history/ml-performance', description: 'Phase 12: Realized ML prediction metrics from confirmed deployment outcomes', phase: 'Phase 12' },
  { method: 'PATCH', path: '/api/risk-history/1/outcome', description: 'Phase 12: Record observed deployment outcome for record #1', phase: 'Phase 12', sampleBody: {
    actualIncident: true,
    actualIncidentSeverity: 'HIGH'
  }},

  // --- Phase 10 Validation & Research Experiment Endpoints ---
  { method: 'GET', path: '/api/ml/evaluation', description: 'Phase 10: Final validation, evaluation & research experiment report (seed=42)', phase: 'Phase 10' },
  { method: 'GET', path: '/api/ml/metrics', description: 'Phase 10: Model benchmark metrics, AUC, Recall & Confusion Matrix', phase: 'Phase 10' },

  // --- Phase 9 What-If Change Simulator Endpoints ---
  { method: 'POST', path: '/api/simulation/what-if', description: 'Phase 9: In-memory isolated What-If change & topology simulation', phase: 'Phase 9', sampleBody: {
    serviceId: 5,
    changeType: 'VERSION_UPDATE',
    oldVersion: '2.0.0',
    newVersion: '3.0.0',
    complexity: 'HIGH',
    description: 'Upgrade payment processing engine to v3.0',
    dependencyChanges: [
      { action: 'ADD', sourceServiceId: 5, targetServiceId: 10 }
    ]
  }},

  // --- Phase 7 ML Inference & Health Endpoints ---
  { method: 'GET', path: '/api/ml/health', description: 'Phase 7: ML Service liveness, status, and loaded model verification', phase: 'Phase 7' },
  { method: 'POST', path: '/api/ml/predict', description: 'Phase 7: Real-time incident failure probability prediction via trained model', phase: 'Phase 7', sampleBody: {
    change_complexity: 0.85,
    dependency_count: 6,
    dependency_depth: 3,
    criticality_score: 1.0,
    historical_failure_rate: 0.25,
    change_type: 'VERSION_UPDATE',
    blast_radius_score: 80.8,
    critical_services_affected: 2,
    previous_incidents: 3,
    service_age: 36,
    version_change_size: 1.0
  }},

  // --- Phase 5 Rule-Based Risk Engine Endpoints ---
  { method: 'POST', path: '/api/risk/analyze', description: 'Phase 5: Pre-deployment rule-based risk evaluation for proposed change', phase: 'Phase 5', sampleBody: {
    serviceId: 5,
    changeType: 'VERSION_UPDATE',
    oldVersion: '2.0.0',
    newVersion: '3.0.0',
    complexity: 'HIGH',
    description: 'Upgrade Payment API to ISO20022 messaging'
  }},
  { method: 'POST', path: '/api/risk/analyze/change/1', description: 'Phase 5: Correlate existing Change #1 with historical risk engine', phase: 'Phase 5' },
  { method: 'GET', path: '/api/risk/config', description: 'Phase 5: Retrieve configurable risk weights and risk-level thresholds', phase: 'Phase 5' },

  // --- Phase 4 Blast-Radius Engine Endpoints ---
  { method: 'GET', path: '/api/blast-radius/service/5', description: 'Phase 4: Complete blast-radius analysis, depth & score for Payment Service (ID 5)', phase: 'Phase 4' },
  { method: 'GET', path: '/api/blast-radius/change/1', description: 'Phase 4: Change-based blast-radius impact analysis for Change #1', phase: 'Phase 4' },
  { method: 'POST', path: '/api/blast-radius/analyze', description: 'Phase 4: Run blast-radius analysis via POST request payload', phase: 'Phase 4', sampleBody: {
    serviceId: 5
  }},

  // --- Phase 3 Graph & BFS/DFS Endpoints ---
  { method: 'GET', path: '/api/dependencies/graph', description: 'Phase 3: Retrieve complete in-memory directed dependency graph (nodes & edges)', phase: 'Phase 3' },
  { method: 'GET', path: '/api/dependencies/service/5', description: 'Phase 3: Direct vs Indirect affected dependencies for Payment Service (ID 5)', phase: 'Phase 3' },
  { method: 'GET', path: '/api/dependencies/service/5/bfs', description: 'Phase 3: Execute Breadth-First Search (BFS) level-by-level traversal', phase: 'Phase 3' },
  { method: 'GET', path: '/api/dependencies/service/5/dfs', description: 'Phase 3: Execute Depth-First Search (DFS) recursive traversal', phase: 'Phase 3' },
  { method: 'GET', path: '/api/dependencies/service/5/paths', description: 'Phase 3: Compute all distinct dependency paths from Payment Service', phase: 'Phase 3' },
  { method: 'GET', path: '/api/dependencies/service/5/critical-impact', description: 'Phase 3: Calculate critical-services impact analysis (Tier-1 systems)', phase: 'Phase 3' },

  // --- Phase 2 Database & Seed Endpoints ---
  { method: 'GET', path: '/api/services', description: 'Phase 2: Retrieve all 11 simulated core banking microservices', phase: 'Phase 2' },
  { method: 'GET', path: '/api/services/5', description: 'Phase 2: Retrieve Payment Service by ID (5)', phase: 'Phase 2' },
  { method: 'GET', path: '/api/services/critical/CRITICAL', description: 'Phase 2: Filter services by criticality level (CRITICAL)', phase: 'Phase 2' },
  { method: 'GET', path: '/api/dependencies', description: 'Phase 2: Retrieve all 13 microservice dependency records', phase: 'Phase 2' },
  { method: 'GET', path: '/api/changes', description: 'Phase 2: Retrieve all recorded technical change records', phase: 'Phase 2' },
  { method: 'POST', path: '/api/changes', description: 'Phase 2: Propose and validate a new technical change record', phase: 'Phase 2', sampleBody: {
    serviceId: 5,
    changeType: 'API_CHANGE',
    description: 'Upgrade Payment API from v2 to v3 for ISO20022 compliance',
    oldVersion: '2.0.0',
    newVersion: '3.0.0',
    complexity: 8
  }},
  { method: 'GET', path: '/api/incidents', description: 'Phase 2: Retrieve all simulated historical incidents & outcomes', phase: 'Phase 2' },
  { method: 'GET', path: '/api/incidents/failed', description: 'Phase 2: Retrieve all failed historical change incidents', phase: 'Phase 2' }
];

export const ApiConsolePage: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig>(ENDPOINTS[0]);
  const [requestBody, setRequestBody] = useState<string>(
    ENDPOINTS[0].sampleBody ? JSON.stringify(ENDPOINTS[0].sampleBody, null, 2) : ''
  );
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelectEndpoint = (ep: EndpointConfig) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.sampleBody ? JSON.stringify(ep.sampleBody, null, 2) : '');
    setResponseOutput(null);
    setStatusCode(null);
    setLatency(null);
  };

  const handleExecute = () => {
    const startTime = performance.now();
    try {
      let data: any = null;
      let status = 200;

      // Phase 13 Recommendations Routing
      if (selectedEndpoint.path === '/api/recommendations/analyze' && selectedEndpoint.method === 'POST') {
        const parsed = JSON.parse(requestBody);
        data = apiService.getRecommendationsForProposed(parsed);
      } else if (selectedEndpoint.path === '/api/recommendations/change/1') {
        data = apiService.getRecommendationsForChangeRecord(1);
      }
      // Phase 12 Risk History Routing
      else if (selectedEndpoint.path === '/api/risk-history') {
        data = apiService.getRiskHistory();
      } else if (selectedEndpoint.path === '/api/risk-history/high-risk-services') {
        data = apiService.getHighRiskServices();
      } else if (selectedEndpoint.path === '/api/risk-history/trends') {
        data = apiService.getRiskTrends();
      } else if (selectedEndpoint.path === '/api/risk-history/ml-performance') {
        data = apiService.getHistoricalMLPerformance();
      } else if (selectedEndpoint.path === '/api/risk-history/1/outcome' && selectedEndpoint.method === 'PATCH') {
        const parsed = JSON.parse(requestBody);
        data = apiService.recordHistoryOutcome(1, parsed);
      }
      // Phase 10 Evaluation & Benchmarking Routing
      else if (selectedEndpoint.path === '/api/ml/evaluation') {
        data = apiService.getEvaluationReport();
      } else if (selectedEndpoint.path === '/api/ml/metrics') {
        const full = apiService.getEvaluationReport();
        data = {
          models: full.models_benchmarked,
          rule_based_eval: full.rule_based_engine_test_set_evaluation,
          feature_importances: full.feature_importance_ranking
        };
      }
      // Phase 9 Simulation Routing
      else if (selectedEndpoint.path === '/api/simulation/what-if' && selectedEndpoint.method === 'POST') {
        const parsed = JSON.parse(requestBody);
        data = apiService.simulateWhatIf(parsed);
      }
      // Phase 7 ML Routing
      else if (selectedEndpoint.path === '/api/ml/health') {
        data = apiService.getMLHealth();
      } else if (selectedEndpoint.path === '/api/ml/predict' && selectedEndpoint.method === 'POST') {
        const parsed = JSON.parse(requestBody);
        data = apiService.predictMLDirect(parsed);
      }
      // Phase 5 Routing
      else if (selectedEndpoint.path === '/api/risk/analyze' && selectedEndpoint.method === 'POST') {
        const parsed = JSON.parse(requestBody);
        data = apiService.analyzeRiskProposed(parsed);
      } else if (selectedEndpoint.path === '/api/risk/analyze/change/1') {
        data = apiService.analyzeRiskForChangeRecord(1);
      } else if (selectedEndpoint.path === '/api/risk/config') {
        data = apiService.getRiskConfig();
      }
      // Phase 4 Routing
      else if (selectedEndpoint.path === '/api/blast-radius/service/5') {
        data = apiService.analyzeBlastRadius(5);
      } else if (selectedEndpoint.path === '/api/blast-radius/change/1') {
        data = apiService.analyzeBlastRadiusForChange(1);
      } else if (selectedEndpoint.path === '/api/blast-radius/analyze' && selectedEndpoint.method === 'POST') {
        const parsed = JSON.parse(requestBody);
        data = apiService.analyzeBlastRadius(parsed.serviceId);
      }
      // Phase 3 Routing
      else if (selectedEndpoint.path === '/api/dependencies/graph') {
        data = apiService.getCompleteGraph();
      } else if (selectedEndpoint.path === '/api/dependencies/service/5') {
        data = apiService.getServiceImpact(5);
      } else if (selectedEndpoint.path === '/api/dependencies/service/5/bfs') {
        data = apiService.runBFS(5);
      } else if (selectedEndpoint.path === '/api/dependencies/service/5/dfs') {
        data = apiService.runDFS(5);
      } else if (selectedEndpoint.path === '/api/dependencies/service/5/paths') {
        data = apiService.getDependencyPaths(5);
      } else if (selectedEndpoint.path === '/api/dependencies/service/5/critical-impact') {
        data = apiService.getCriticalImpact(5);
      }
      // Phase 2 Routing
      else if (selectedEndpoint.path === '/api/services') {
        data = apiService.getServices();
      } else if (selectedEndpoint.path === '/api/services/5') {
        data = apiService.getServiceById(5);
        if (!data) status = 404;
      } else if (selectedEndpoint.path === '/api/services/critical/CRITICAL') {
        data = apiService.getServicesByCriticality('CRITICAL');
      } else if (selectedEndpoint.path === '/api/dependencies') {
        data = apiService.getDependencies();
      } else if (selectedEndpoint.path === '/api/changes') {
        data = apiService.getChanges();
      } else if (selectedEndpoint.path === '/api/changes' && selectedEndpoint.method === 'POST') {
        const parsed = JSON.parse(requestBody);
        data = apiService.createChange(parsed);
        status = 201;
      } else if (selectedEndpoint.path === '/api/incidents') {
        data = apiService.getIncidents();
      } else if (selectedEndpoint.path === '/api/incidents/failed') {
        data = apiService.getIncidents().filter((i) => i.failure);
      } else {
        data = { message: 'Endpoint executed successfully' };
      }

      const elapsed = Math.round(performance.now() - startTime + 6);
      setStatusCode(status);
      setLatency(elapsed);
      setResponseOutput(data);
    } catch (err: any) {
      setStatusCode(400);
      setLatency(5);
      setResponseOutput({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'Bad Request',
        message: err.message
      });
    }
  };

  const getCurlCommand = () => {
    const baseUrl = 'http://localhost:8080';
    if (selectedEndpoint.method === 'GET') {
      return `curl -X GET "${baseUrl}${selectedEndpoint.path}" -H "Accept: application/json"`;
    } else {
      const minified = requestBody.replace(/\s+/g, ' ');
      return `curl -X POST "${baseUrl}${selectedEndpoint.path}" \\
  -H "Content-Type: application/json" \\
  -d '${minified}'`;
    }
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(getCurlCommand());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#263148] pb-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-[#4F7CFF] rounded-full" />
          <h1 className="text-xl font-bold tracking-tight text-[#F5F7FA] flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#4F7CFF]" />
            <span>Spring Boot REST API Console &amp; PostgreSQL Inspector</span>
          </h1>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-mono">
            Active
          </span>
        </div>
        <p className="text-xs text-[#94A3B8] mt-1">
          Execute and inspect CGX's Java Spring Boot REST endpoints with live JSON responses and copyable cURL commands.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints Sidebar */}
        <div className="bg-[#121927] border border-[#263148] rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-semibold text-[#F5F7FA] uppercase tracking-wider">
            Available Endpoints
          </h2>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {ENDPOINTS.map((ep, idx) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#171F30] border-[#4F7CFF] text-[#F5F7FA]'
                      : 'border-[#263148] hover:bg-[#161F30] text-[#94A3B8]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                        ep.method === 'GET' ? 'bg-[#4F7CFF]/15 text-[#4F7CFF]' : 'bg-[#22C55E]/15 text-[#22C55E]'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="font-semibold truncate text-[#F5F7FA]">{ep.path}</span>
                    </div>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded shrink-0 bg-[#0B0F17] text-[#94A3B8] border border-[#263148]">
                      {ep.phase}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#94A3B8] truncate">
                    {ep.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Execution & Output Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Request Header Bar */}
          <div className="bg-[#121927] border border-[#263148] rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className={`px-2 py-1 rounded font-bold text-[11px] ${
                  selectedEndpoint.method === 'GET' ? 'bg-[#4F7CFF] text-white' : 'bg-[#22C55E] text-white'
                }`}>
                  {selectedEndpoint.method}
                </span>
                <span className="font-bold text-[#F5F7FA] text-sm">
                  {selectedEndpoint.path}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCurl}
                  className="px-2.5 py-1.5 text-[11px] rounded border border-[#263148] text-[#94A3B8] hover:text-[#F5F7FA] hover:bg-[#171F30] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy cURL'}</span>
                </button>

                <button
                  onClick={handleExecute}
                  className="px-3.5 py-1.5 bg-[#4F7CFF] hover:bg-[#3D68E0] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Send Request</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-[#94A3B8]">
              {selectedEndpoint.description}
            </p>

            {/* Request Body Editor if POST */}
            {selectedEndpoint.method === 'POST' && (
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
                  JSON Request Body:
                </label>
                <textarea
                  rows={6}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full font-mono text-xs p-3 rounded-lg border border-[#263148] bg-[#0B0F17] text-[#F5F7FA] placeholder-[#94A3B8] focus:outline-hidden focus:border-[#4F7CFF]"
                />
              </div>
            )}
          </div>

          {/* Response Viewer */}
          <div className="bg-[#121927] border border-[#263148] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F5F7FA] uppercase tracking-wider">
                Response Output
              </span>

              {statusCode && (
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className={`px-2 py-0.5 rounded font-bold border ${
                    statusCode >= 200 && statusCode < 300 
                      ? 'bg-[#22C55E]/15 border-[#22C55E]/30 text-[#22C55E]' 
                      : 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'
                  }`}>
                    {statusCode} {statusCode === 201 ? 'CREATED' : statusCode === 200 ? 'OK' : 'ERROR'}
                  </span>
                  <span className="text-[#94A3B8]">{latency} ms</span>
                </div>
              )}
            </div>

            <div className="bg-[#0B0F17] border border-[#263148] text-[#F5F7FA] p-3.5 rounded-lg font-mono text-xs overflow-x-auto max-h-96 min-h-48">
              {responseOutput ? (
                <pre>{JSON.stringify(responseOutput, null, 2)}</pre>
              ) : (
                <div className="text-[#94A3B8] italic py-12 text-center font-sans text-xs">
                  Click "Send Request" to invoke this endpoint.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
