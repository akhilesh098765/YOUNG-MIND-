import React, { useState } from 'react';
import { BarChart2, Upload, Sparkles, CheckCircle2, AlertTriangle, RefreshCw, FileText } from 'lucide-react';

export const DatasetAssistantView: React.FC = () => {
  const sampleCsv = `packet_id,sensor_temperature,flow_rate,pressure_psi,packet_latency_ms,vulnerability_label
1,42.5,120.4,35.2,4.8,0
2,43.1,119.8,36.1,5.2,0
3,48.9,135.2,42.8,18.4,1
4,42.8,121.0,35.5,4.9,0
5,49.5,138.0,44.2,22.1,1
6,43.0,NaN,35.8,5.1,0
7,50.2,141.5,45.0,24.5,1
8,42.7,120.1,35.4,5.0,0`;

  const [csvText, setCsvText] = useState(sampleCsv);
  const [fileName, setFileName] = useState('industrial_sensor_telemetry.csv');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);

  const handleAnalyze = async () => {
    if (!csvText.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/datasets/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText, fileName }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    handleAnalyze();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold mb-2">
            <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Empirical Dataset Diagnostics &amp; Preprocessing</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dataset Assistant &amp; Preprocessing Advisor
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Profile research datasets, detect missing cell ratios and outliers, and receive tailored machine learning algorithmic recommendations.
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isLoading || !csvText.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Profile Dataset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CSV Ingestion */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Dataset Input (CSV)</span>
              <span className="text-[11px] font-mono text-indigo-600">{fileName}</span>
            </div>
            <label className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-xs font-semibold text-slate-700 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV</span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFileName(file.name);
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) {
                        setCsvText(ev.target.result as string);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
          </div>

          <textarea
            rows={16}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full flex-1 p-3 text-xs leading-relaxed text-slate-800 font-mono bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none resize-none"
            placeholder="Paste comma-separated data here..."
          />
        </div>

        {/* Diagnostic Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          {analysis ? (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] text-slate-400">Total Observations</div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">{analysis.rowsCount} rows</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] text-slate-400">Feature Dimensions</div>
                  <div className="text-xl font-bold text-indigo-600 mt-0.5">{analysis.columnsCount} features</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] text-slate-400">Missing Cells</div>
                  <div className="text-xl font-bold text-amber-600 mt-0.5">{analysis.missingCellsTotal}</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] text-slate-400">Duplicates</div>
                  <div className="text-xl font-bold text-slate-700 mt-0.5">{analysis.duplicatesCount} est.</div>
                </div>
              </div>

              {/* Columns Details */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 font-bold text-xs text-slate-900 bg-slate-50/60">
                  Feature Schema &amp; Data Types
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-600">
                        <th className="p-3">Feature Name</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Missing Pct</th>
                        <th className="p-3">Unique</th>
                        <th className="p-3">Sample Values</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analysis.columns?.map((c: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold font-mono text-slate-900">{c.name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.dataType === 'numeric' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                            }`}>
                              {c.dataType}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{c.missingPct}%</td>
                          <td className="p-3 text-slate-600">{c.uniqueValues}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-400 truncate max-w-[150px]">
                            {c.sampleValues.join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
                  <div className="font-bold text-slate-900">Preprocessing Recommendations</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {analysis.preprocessingRecommendations?.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
                  <div className="font-bold text-slate-900">Recommended ML Algorithms</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {analysis.recommendedAlgorithms?.map((alg: string, idx: number) => (
                      <li key={idx} className="font-medium text-indigo-950">{alg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
