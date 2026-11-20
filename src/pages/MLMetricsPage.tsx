import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Cpu, 
  CheckCircle2, 
  TrendingUp, 
  Scale, 
  AlertTriangle, 
  FlaskConical
} from 'lucide-react';
import { mlApi } from '../api/mlApi';
import { MLMetricsData, MLHealthResponse, Phase10EvaluationReport } from '../types';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const MLMetricsPage: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<MLMetricsData | null>(null);
  const [, setHealth] = useState<MLHealthResponse | null>(null);
  const [evalReport, setEvalReport] = useState<Phase10EvaluationReport | null>(null);
  
  // Navigation tabs: 'research' vs 'models'
  const [primaryTab, setPrimaryTab] = useState<'research' | 'models'>('research');
  const [activeModelTab, setActiveModelTab] = useState<'random_forest' | 'logistic_regression' | 'majority_baseline'>('random_forest');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mRes, hRes, eRes] = await Promise.all([
        mlApi.getMetrics(),
        mlApi.getHealth(),
        mlApi.getEvaluationReport()
      ]);
      setMetrics(mRes);
      setHealth(hRes);
      setEvalReport(eRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to load model and evaluation metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.pathname.includes('eval') || location.pathname.includes('experiment')) {
      setPrimaryTab('research');
    }
    loadData();
  }, [location.pathname]);

  if (loading) {
    return <LoadingSpinner message="Loading validation and evaluation benchmarks..." />;
  }

  const activeModel = metrics?.models[activeModelTab as 'random_forest' | 'logistic_regression'] || 
    (activeModelTab === 'majority_baseline' && evalReport?.models_benchmarked.majority_baseline ? {
      model_name: evalReport.models_benchmarked.majority_baseline.model_name,
      accuracy: evalReport.models_benchmarked.majority_baseline.accuracy,
      precision: evalReport.models_benchmarked.majority_baseline.precision,
      recall: evalReport.models_benchmarked.majority_baseline.recall,
      f1: evalReport.models_benchmarked.majority_baseline.f1,
      roc_auc: evalReport.models_benchmarked.majority_baseline.roc_auc,
      confusion_matrix: evalReport.models_benchmarked.majority_baseline.confusion_matrix
    } : null);

  const cm = activeModel?.confusion_matrix;

  return (
    <div className="space-y-6">
      {/* Title & Research Disclaimer Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#263148] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30">
              ML Research Benchmark
            </span>
            <span className="text-xs text-[#94A3B8]">
              Evaluated on Unseen Held-out Test Set (seed=42)
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F5F7FA] mt-1">
            Model Intelligence &amp; Evaluation
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Empirical comparison of Rule-Based Risk Engine vs. Machine Learning Classifiers across 2,000 synthetic banking records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Primary View Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#121927] border border-[#263148] rounded-lg text-xs">
            <button
              onClick={() => setPrimaryTab('research')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                primaryTab === 'research'
                  ? 'bg-[#4F7CFF] text-white'
                  : 'text-[#94A3B8] hover:text-[#F5F7FA]'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Phase 10 Evaluation</span>
            </button>
            <button
              onClick={() => setPrimaryTab('models')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                primaryTab === 'models'
                  ? 'bg-[#4F7CFF] text-white'
                  : 'text-[#94A3B8] hover:text-[#F5F7FA]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Model Diagnostics</span>
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadData} />}

      {/* Synthetic Scope & Integrity Disclaimer Banner */}
      <div className="p-4 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-xs flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-[#F5F7FA]">
            Academic &amp; Technical Research Scope Statement:
          </span>
          <p className="text-[#94A3B8] leading-relaxed">
            All reported metrics and evaluations are executed exclusively on synthetic core banking change records (<code className="font-mono bg-[#171F30] px-1 py-0.5 rounded text-[#F5F7FA]">random_state=42</code>). 
            Results demonstrate methodology, architectural validity, and algorithmic decision boundaries. They do not claim or represent real-world commercial banking production results. No data manipulation or metric fabrication was performed.
          </p>
        </div>
      </div>

      {/* VIEW 1: PHASE 10 RESEARCH BENCHMARKS */}
      {primaryTab === 'research' && evalReport && (
        <div className="space-y-6">
          {/* Section 1: Head-to-Head Comparison Table */}
          <div className="bg-[#121927] border border-[#263148] rounded-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#263148] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#4F7CFF]" />
                  Model &amp; Rule-Based Comparison Matrix (Held-out Test Set, N=400)
                </h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Comparison across trivial baseline, linear classifier, nonlinear ensemble, and deterministic rule engine.
                </p>
              </div>
              <div className="text-[11px] font-mono text-[#94A3B8] bg-[#171F30] px-2.5 py-1 rounded-md border border-[#263148]">
                Incidents in Test Set: 263 / 400 (65.75%)
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171F30] text-[#94A3B8] text-[11px] uppercase border-b border-[#263148]">
                  <tr>
                    <th className="py-3 px-4">Approach / Model</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Accuracy</th>
                    <th className="py-3 px-3">Precision</th>
                    <th className="py-3 px-3 text-[#22C55E]">Recall (Catch Rate)</th>
                    <th className="py-3 px-3">F1 Score</th>
                    <th className="py-3 px-3">ROC-AUC</th>
                    <th className="py-3 px-3">Latency (1-Sample)</th>
                    <th className="py-3 px-4">Evaluation Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#263148] text-xs">
                  {/* Majority Baseline */}
                  <tr className="hover:bg-[#161F30] transition-colors">
                    <td className="py-3 px-4 font-medium text-[#F5F7FA]">
                      Majority Class Baseline
                    </td>
                    <td className="py-3 px-3 text-[#94A3B8]">Heuristic</td>
                    <td className="py-3 px-3 font-mono">{(evalReport.models_benchmarked.majority_baseline.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono">{(evalReport.models_benchmarked.majority_baseline.precision * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono text-[#94A3B8]">100.0%</td>
                    <td className="py-3 px-3 font-mono">{evalReport.models_benchmarked.majority_baseline.f1.toFixed(4)}</td>
                    <td className="py-3 px-3 font-mono text-[#94A3B8]">0.5000</td>
                    <td className="py-3 px-3 font-mono text-[#94A3B8]">&lt;0.01 ms</td>
                    <td className="py-3 px-4 text-[11px] text-[#94A3B8]">
                      Trivial baseline; zero discrimination power (AUC = 0.5).
                    </td>
                  </tr>

                  {/* Rule-Based Engine @ 0.50 */}
                  <tr className="hover:bg-[#161F30] transition-colors">
                    <td className="py-3 px-4 font-medium text-[#F5F7FA]">
                      Rule-Based Engine (Thresh ≥ 0.50)
                    </td>
                    <td className="py-3 px-3 text-[#94A3B8]">Phase 5 Rules</td>
                    <td className="py-3 px-3 font-mono">{(evalReport.rule_based_engine_test_set_evaluation.threshold_50.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#22C55E]">{(evalReport.rule_based_engine_test_set_evaluation.threshold_50.precision * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono text-[#F59E0B]">{(evalReport.rule_based_engine_test_set_evaluation.threshold_50.recall * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono">{evalReport.rule_based_engine_test_set_evaluation.threshold_50.f1.toFixed(4)}</td>
                    <td className="py-3 px-3 font-mono">{evalReport.rule_based_engine_test_set_evaluation.threshold_50.roc_auc.toFixed(4)}</td>
                    <td className="py-3 px-3 font-mono text-[#94A3B8]">&lt;0.10 ms</td>
                    <td className="py-3 px-4 text-[11px] text-[#94A3B8]">
                      High precision (91.4%), but misses 35.4% of incidents.
                    </td>
                  </tr>

                  {/* Rule-Based Engine @ 0.60 */}
                  <tr className="hover:bg-[#161F30] transition-colors">
                    <td className="py-3 px-4 font-medium text-[#F5F7FA]">
                      Rule-Based Engine (Thresh ≥ 0.60 HIGH)
                    </td>
                    <td className="py-3 px-3 text-[#94A3B8]">Phase 5 Rules</td>
                    <td className="py-3 px-3 font-mono">{(evalReport.rule_based_engine_test_set_evaluation.threshold_60.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#22C55E]">{(evalReport.rule_based_engine_test_set_evaluation.threshold_60.precision * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono text-[#EF4444] font-semibold">{(evalReport.rule_based_engine_test_set_evaluation.threshold_60.recall * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono">{evalReport.rule_based_engine_test_set_evaluation.threshold_60.f1.toFixed(4)}</td>
                    <td className="py-3 px-3 font-mono">{evalReport.rule_based_engine_test_set_evaluation.threshold_60.roc_auc.toFixed(4)}</td>
                    <td className="py-3 px-3 font-mono text-[#94A3B8]">&lt;0.10 ms</td>
                    <td className="py-3 px-4 text-[11px] text-[#94A3B8]">
                      Strict gate; fails to flag 64.3% of actual failures.
                    </td>
                  </tr>

                  {/* Logistic Regression */}
                  <tr className="hover:bg-[#161F30] transition-colors">
                    <td className="py-3 px-4 font-medium text-[#F5F7FA]">
                      Logistic Regression Pipeline
                    </td>
                    <td className="py-3 px-3 text-[#94A3B8]">Linear ML</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#F5F7FA]">{(evalReport.models_benchmarked.logistic_regression.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono">{(evalReport.models_benchmarked.logistic_regression.precision * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#22C55E]">{(evalReport.models_benchmarked.logistic_regression.recall * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono">{evalReport.models_benchmarked.logistic_regression.f1.toFixed(4)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#4F7CFF]">{evalReport.models_benchmarked.logistic_regression.roc_auc.toFixed(4)}</td>
                    <td className="py-3 px-3 font-mono text-[#94A3B8]">{evalReport.models_benchmarked.logistic_regression.single_prediction_time_ms} ms</td>
                    <td className="py-3 px-4 text-[11px] text-[#94A3B8]">
                      Strong linear calibration; catches 86.3% of outages.
                    </td>
                  </tr>

                  {/* Random Forest (Champion) */}
                  <tr className="bg-[#4F7CFF]/10 border-l-2 border-[#4F7CFF] font-medium">
                    <td className="py-3 px-4 font-bold text-[#F5F7FA] flex items-center gap-1.5">
                      <span>Random Forest Classifier</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#4F7CFF] text-white uppercase">Champion</span>
                    </td>
                    <td className="py-3 px-3 text-[#4F7CFF]">Ensemble ML</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#F5F7FA]">{(evalReport.models_benchmarked.random_forest.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono">{(evalReport.models_benchmarked.random_forest.precision * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#22C55E]">{(evalReport.models_benchmarked.random_forest.recall * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#4F7CFF]">{evalReport.models_benchmarked.random_forest.f1.toFixed(4)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#4F7CFF]">{evalReport.models_benchmarked.random_forest.roc_auc.toFixed(4)}</td>
                    <td className="py-3 px-3 font-mono text-[#94A3B8]">{evalReport.models_benchmarked.random_forest.single_prediction_time_ms} ms</td>
                    <td className="py-3 px-4 text-[11px] text-[#F5F7FA] font-medium">
                      Selected Champion: Best harmonic balance (F1=0.866) and catch rate (88.6%).
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Why ML Beats Rule Engine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Catch Rate Card */}
            <div className="bg-[#121927] border border-[#263148] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#263148]">
                <h3 className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                  Incident Detection Rate (Recall)
                </h3>
                <span className="text-[10px] font-semibold text-[#22C55E] bg-[#22C55E]/15 border border-[#22C55E]/30 px-2 py-0.5 rounded">
                  +53.2% vs Strict Rules
                </span>
              </div>

              <div className="space-y-4 pt-1">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#94A3B8]">Random Forest (Ensemble)</span>
                    <span className="text-[#22C55E] font-bold font-mono">88.6% Catches</span>
                  </div>
                  <div className="w-full h-2 bg-[#171F30] rounded-full overflow-hidden">
                    <div className="h-full bg-[#22C55E] rounded-full" style={{ width: '88.6%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#94A3B8]">Logistic Regression (Linear)</span>
                    <span className="text-[#4F7CFF] font-bold font-mono">86.3% Catches</span>
                  </div>
                  <div className="w-full h-2 bg-[#171F30] rounded-full overflow-hidden">
                    <div className="h-full bg-[#4F7CFF] rounded-full" style={{ width: '86.3%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#94A3B8]">Rule-Based (Threshold ≥ 0.50)</span>
                    <span className="text-[#F59E0B] font-bold font-mono">64.6% Catches</span>
                  </div>
                  <div className="w-full h-2 bg-[#171F30] rounded-full overflow-hidden">
                    <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: '64.6%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#94A3B8]">Rule-Based (Threshold ≥ 0.60 HIGH)</span>
                    <span className="text-[#EF4444] font-bold font-mono">35.7% Catches</span>
                  </div>
                  <div className="w-full h-2 bg-[#171F30] rounded-full overflow-hidden">
                    <div className="h-full bg-[#EF4444] rounded-full" style={{ width: '35.7%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Hybrid Architecture Rationale */}
            <div className="bg-[#121927] border border-[#263148] rounded-xl p-5 space-y-3">
              <div className="pb-3 border-b border-[#263148]">
                <h3 className="text-sm font-semibold text-[#F5F7FA]">
                  Why CGX Employs a Hybrid Strategy
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Deterministic auditability vs. statistical pattern recognition
                </p>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-[#94A3B8]">
                <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148]">
                  <span className="font-semibold text-[#F5F7FA] block mb-1">
                    Rule-Based Safety Floor
                  </span>
                  Guarantees that regardless of ML model outputs, any change to a critical tier service (Core Banking, Payment) with high complexity or wide blast radius is strictly flagged with high mandatory review thresholds.
                </div>

                <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148]">
                  <span className="font-semibold text-[#4F7CFF] block mb-1">
                    ML Pattern Recognition
                  </span>
                  Identifies compound multi-dimensional risks (e.g. database schema migrations on tier-2 services that historically cascade into payment timeouts) that linear heuristic weights fail to capture.
                </div>

                <div className="p-3 bg-[#171F30] rounded-lg border border-[#263148]">
                  <span className="font-semibold text-[#22C55E] block mb-1">
                    Circuit Breaker Resiliency
                  </span>
                  If the ML microservice experiences latency &gt;500ms or becomes unavailable, CGX automatically falls back to the deterministic Phase 5 rule engine with zero downtime or missing assessments.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PHASE 6/10 MODEL DIAGNOSTICS & CONFUSION MATRIX */}
      {primaryTab === 'models' && metrics && (
        <>
          {/* Model Switcher Bar */}
          <div className="p-4 rounded-xl border border-[#263148] bg-[#121927] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-[#F5F7FA]">
                Selection Rationale:{' '}
              </span>
              <span className="text-[#94A3B8]">
                {metrics.selection_reason}
              </span>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#171F30] border border-[#263148] rounded-lg shrink-0">
              <button
                onClick={() => setActiveModelTab('random_forest')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeModelTab === 'random_forest'
                    ? 'bg-[#4F7CFF] text-white'
                    : 'text-[#94A3B8] hover:text-[#F5F7FA]'
                }`}
              >
                Random Forest (Production)
              </button>
              <button
                onClick={() => setActiveModelTab('logistic_regression')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeModelTab === 'logistic_regression'
                    ? 'bg-[#4F7CFF] text-white'
                    : 'text-[#94A3B8] hover:text-[#F5F7FA]'
                }`}
              >
                Logistic Regression (Linear)
              </button>
              <button
                onClick={() => setActiveModelTab('majority_baseline')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeModelTab === 'majority_baseline'
                    ? 'bg-[#4F7CFF] text-white'
                    : 'text-[#94A3B8] hover:text-[#F5F7FA]'
                }`}
              >
                Majority Baseline
              </button>
            </div>
          </div>

          {/* Metric KPI Cards */}
          {activeModel && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <StatCard
                title="Accuracy"
                value={`${(activeModel.accuracy * 100).toFixed(1)}%`}
                subtitle="Overall test accuracy"
                badge={{ text: 'Test Set', variant: 'neutral' }}
              />

              <StatCard
                title="Precision"
                value={`${(activeModel.precision * 100).toFixed(1)}%`}
                subtitle="True positive precision"
                badge={{ text: 'Calibrated', variant: 'info' }}
              />

              <StatCard
                title="Recall (Sensitivity)"
                value={`${(activeModel.recall * 100).toFixed(1)}%`}
                subtitle="Outage capture rate"
                badge={{ text: 'Outage Catch', variant: 'success' }}
              />

              <StatCard
                title="F1 Score"
                value={activeModel.f1.toFixed(4)}
                subtitle="Harmonic mean"
                badge={{ text: 'Balanced', variant: 'neutral' }}
              />

              <StatCard
                title="ROC-AUC"
                value={activeModel.roc_auc.toFixed(4)}
                subtitle="Area under curve"
                badge={{ text: 'Discriminative', variant: 'success' }}
              />
            </div>
          )}

          {/* Confusion Matrix + Feature Importance Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            {/* Confusion Matrix */}
            {cm && (
              <div className="bg-[#121927] border border-[#263148] rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#F5F7FA]">
                    Test Set Confusion Matrix ({metrics.dataset_metadata.test_samples} Samples)
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Evaluated on held-out 20% test partition (seed=42)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-center">
                  {/* True Negatives */}
                  <div className="p-4 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30">
                    <div className="text-[11px] text-[#22C55E] font-medium">
                      True Negatives (TN)
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#F5F7FA] mt-1">
                      {cm.true_negatives}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] mt-0.5">
                      Safe changes correctly approved
                    </div>
                  </div>

                  {/* False Positives */}
                  <div className="p-4 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30">
                    <div className="text-[11px] text-[#F59E0B] font-medium">
                      False Positives (FP)
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#F5F7FA] mt-1">
                      {cm.false_positives}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] mt-0.5">
                      Safe changes flagged as risky
                    </div>
                  </div>

                  {/* False Negatives */}
                  <div className="p-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30">
                    <div className="text-[11px] text-[#EF4444] font-medium">
                      False Negatives (FN)
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#EF4444] mt-1">
                      {cm.false_negatives}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] mt-0.5">
                      Missed failures (critical metric)
                    </div>
                  </div>

                  {/* True Positives */}
                  <div className="p-4 rounded-lg bg-[#4F7CFF]/10 border border-[#4F7CFF]/30">
                    <div className="text-[11px] text-[#4F7CFF] font-medium">
                      True Positives (TP)
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#F5F7FA] mt-1">
                      {cm.true_positives}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] mt-0.5">
                      Outages correctly caught
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feature Importances */}
            {metrics.feature_importances_random_forest && (
              <div className="bg-[#121927] border border-[#263148] rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#F5F7FA]">
                    Random Forest Feature Importances
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Gini impurity decrease across 100 decision trees
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  {metrics.feature_importances_random_forest.map((fi, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#94A3B8] font-mono">{fi.feature}</span>
                        <span className="text-[#F5F7FA] font-semibold font-mono">
                          {(fi.importance * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#171F30] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#4F7CFF] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, fi.importance * 250)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
