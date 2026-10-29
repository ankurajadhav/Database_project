import React, { useState, useEffect } from 'react';
import { 
  Play, 
  FileCode, 
  CheckCircle, 
  Info
} from 'lucide-react';
import { SqlQueryResult } from '../types/index.ts';

interface QueryItem {
  id: string;
  category: string;
  title: string;
  query: string;
}

export const SqlStudioView: React.FC = () => {
  const [catalog, setCatalog] = useState<QueryItem[]>([]);
  const [selectedQueryId, setSelectedQueryId] = useState<string>('CQ-01');
  const [executedQueryId, setExecutedQueryId] = useState<string>('CQ-01');
  const [customSql, setCustomSql] = useState<string>('');
  
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/sql/catalog')
      .then(res => res.json())
      .then(data => {
        setCatalog(data);
        if (data.length > 0) {
          const defaultItem = data.find((q: QueryItem) => q.id === 'CQ-01') || data[0];
          setSelectedQueryId(defaultItem.id);
          setCustomSql(defaultItem.query);
        }
      })
      .catch(console.error);
  }, []);

  const handleSelectQuery = (id: string) => {
    setSelectedQueryId(id);
    setQueryError(null);
    const item = catalog.find(q => q.id === id);
    if (item) {
      setCustomSql(item.query);
    }
  };

  const handleExecute = async () => {
    setIsRunning(true);
    setQueryError(null);
    try {
      const res = await fetch('/api/sql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryId: selectedQueryId,
          customSql
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to execute SQL query');
      }
      setQueryResult(data);
      const selectedItem = catalog.find(q => q.id === selectedQueryId);
      const isUnmodifiedSelected = selectedItem && selectedItem.query.trim() === customSql.trim();
      setExecutedQueryId(isUnmodifiedSelected ? selectedQueryId : 'CUSTOM_SQL');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setQueryError(message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Oracle SQL & PL/SQL Laboratory Studio</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified execution engine · Covers all Basic, Aggregate, Joins, Subqueries, Analytic & Complex Queries
        </p>
      </div>

      <div className="space-y-4">
        
        {/* Query Selector Bar */}
        <div className="bg-white border border-slate-200 rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Select Syllabus Query:</span>
            <select
              value={selectedQueryId}
              onChange={(e) => handleSelectQuery(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 font-medium focus:outline-none"
            >
              {catalog.map(q => (
                <option key={q.id} value={q.id}>
                  [{q.category}] {q.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExecute}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded shadow-sm transition-colors whitespace-nowrap self-end sm:self-auto"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Executing SQL...' : 'Run Oracle SQL'}</span>
          </button>
        </div>

        {/* SQL Editor / Statement Area */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4 text-xs font-mono text-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <FileCode className="w-3.5 h-3.5" />
              Query {selectedQueryId} Statement
            </span>
            <span>Oracle SQL*Plus Dialect</span>
          </div>
          <textarea
            rows={4}
            value={customSql}
            onChange={(e) => setCustomSql(e.target.value)}
            className="w-full bg-transparent text-emerald-300 focus:outline-none font-mono text-xs leading-relaxed resize-y"
          />
        </div>

        {queryError && (
          <div className="bg-rose-50 border border-rose-200 rounded p-3 text-xs font-mono text-rose-800">
            {queryError}
          </div>
        )}

        {/* Results Output Section */}
        {queryResult && (
          <div className="bg-white border border-slate-200 rounded p-4 space-y-3 shadow-xs">
            
            {/* Output Metadata Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-900">
                  {queryResult.rowCount} Rows Fetched in {queryResult.executionTimeMs} ms
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Statement ID: {executedQueryId}
              </div>
            </div>

            {/* Explanation Note */}
            {queryResult.explanation && (
              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-700 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>{queryResult.explanation}</span>
              </div>
            )}

            {/* Tabular Output */}
            {queryResult.rows.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-slate-500">
                no rows selected
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-700">
                    <tr>
                      {queryResult.columns.map((col, idx) => (
                        <th key={idx} className="py-2 px-3 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {queryResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                        {queryResult.columns.map((col, cIdx) => (
                          <td key={cIdx} className="py-2 px-3 text-slate-800 whitespace-nowrap tabular-nums">
                            {row[col] !== undefined && row[col] !== null ? String(row[col]) : 'NULL'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
