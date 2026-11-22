'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Plus, Trophy, X } from 'lucide-react';
import { Model } from '@/types';

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allModels, setAllModels] = useState<Model[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [comparedModels, setComparedModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all models for the slot selector dropdowns
  useEffect(() => {
    fetch('/api/models?limit=100')
      .then((r) => r.json())
      .then((json) => {
        const list: Model[] = json.data ?? [];
        setAllModels(list);

        const urlSlugs = (searchParams.get('slugs') ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 4);

        if (urlSlugs.length > 0) {
          setSelectedSlugs(urlSlugs);
        } else if (list.length >= 2) {
          setSelectedSlugs([list[0].slug, list[1].slug]);
        }
      })
      .catch(console.error);
  }, [searchParams]);

  // Fetch detailed comparison payload whenever selectedSlugs changes
  useEffect(() => {
    if (selectedSlugs.length === 0) {
      setComparedModels([]);
      setLoading(false);
      return;
    }

    const query = selectedSlugs.join(',');
    router.replace(`/compare?slugs=${query}`, { scroll: false });

    setLoading(true);
    fetch(`/api/compare?slugs=${query}`)
      .then((r) => r.json())
      .then((json) => setComparedModels(json.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedSlugs, router]);

  const addModelSlug = (slug: string) => {
    if (!slug || selectedSlugs.includes(slug) || selectedSlugs.length >= 4) return;
    setSelectedSlugs([...selectedSlugs, slug]);
  };

  const removeModelSlug = (slug: string) => {
    setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
  };

  // Compute row winners
  const minInputPrice = Math.min(
    ...comparedModels.map((m) => m.modelProviders[0]?.inputPricePer1M ?? Infinity)
  );
  const minOutputPrice = Math.min(
    ...comparedModels.map((m) => m.modelProviders[0]?.outputPricePer1M ?? Infinity)
  );
  const maxContext = Math.max(...comparedModels.map((m) => m.contextWindow));

  const allBenchmarkNames = Array.from(
    new Set(comparedModels.flatMap((m) => m.benchmarks.map((b) => b.benchmarkName)))
  );

  const allCapabilities = Array.from(
    new Set(comparedModels.flatMap((m) => m.capabilities))
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Side-by-Side Model Comparison
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Compare up to 4 models across pricing, context length, capabilities, and benchmarks.
          </p>
        </div>

        {selectedSlugs.length < 4 && (
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-slate-400" />
            <select
              value=""
              onChange={(e) => addModelSlug(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-slate-400 focus:outline-none"
            >
              <option value="">+ Add model to compare ({selectedSlugs.length}/4)</option>
              {allModels
                .filter((m) => !selectedSlugs.includes(m.slug))
                .map((m) => (
                  <option key={m.id} value={m.slug}>
                    {m.lab.name} — {m.name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white" />
      ) : comparedModels.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-600">
            Select up to 4 models using the dropdown above to start comparing.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="w-48 px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Metric
                </th>
                {comparedModels.map((model) => (
                  <th key={model.id} className="px-4 py-4 align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                          {model.lab.name}
                        </div>
                        <Link
                          href={`/models/${model.slug}`}
                          className="text-base font-bold text-slate-900 hover:underline"
                        >
                          {model.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => removeModelSlug(model.slug)}
                        title="Remove model"
                        className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {/* Lowest Input Price */}
              <tr>
                <td className="px-4 py-3 text-xs font-semibold text-slate-600">
                  Lowest Input / 1M
                </td>
                {comparedModels.map((m) => {
                  const price = m.modelProviders[0]?.inputPricePer1M;
                  const isWinner = price != null && price === minInputPrice && comparedModels.length > 1;
                  return (
                    <td key={m.id} className="px-4 py-3 font-mono text-sm">
                      <span
                        className={
                          isWinner
                            ? 'inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700'
                            : 'font-semibold text-slate-900'
                        }
                      >
                        {price != null ? `$${price.toFixed(2)}` : '—'}
                        {isWinner && <Trophy className="h-3 w-3" />}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Lowest Output Price */}
              <tr>
                <td className="px-4 py-3 text-xs font-semibold text-slate-600">
                  Lowest Output / 1M
                </td>
                {comparedModels.map((m) => {
                  const price = m.modelProviders[0]?.outputPricePer1M;
                  const isWinner = price != null && price === minOutputPrice && comparedModels.length > 1;
                  return (
                    <td key={m.id} className="px-4 py-3 font-mono text-sm">
                      <span
                        className={
                          isWinner
                            ? 'inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700'
                            : 'font-semibold text-slate-900'
                        }
                      >
                        {price != null ? `$${price.toFixed(2)}` : '—'}
                        {isWinner && <Trophy className="h-3 w-3" />}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Context Window */}
              <tr>
                <td className="px-4 py-3 text-xs font-semibold text-slate-600">
                  Context Window
                </td>
                {comparedModels.map((m) => {
                  const isWinner = m.contextWindow === maxContext && comparedModels.length > 1;
                  return (
                    <td key={m.id} className="px-4 py-3 font-mono text-sm">
                      <span
                        className={
                          isWinner
                            ? 'inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700'
                            : 'text-slate-900'
                        }
                      >
                        {m.contextWindow.toLocaleString()}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Max Output */}
              <tr>
                <td className="px-4 py-3 text-xs font-semibold text-slate-600">
                  Max Output Tokens
                </td>
                {comparedModels.map((m) => (
                  <td key={m.id} className="px-4 py-3 font-mono text-sm text-slate-700">
                    {m.maxOutputTokens.toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Benchmark Rows */}
              {allBenchmarkNames.length > 0 && (
                <tr className="bg-slate-50">
                  <td
                    colSpan={comparedModels.length + 1}
                    className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                  >
                    Benchmarks
                  </td>
                </tr>
              )}
              {allBenchmarkNames.map((benchName) => {
                const maxScoreForRow = Math.max(
                  ...comparedModels.map(
                    (m) =>
                      m.benchmarks.find((b) => b.benchmarkName === benchName)?.score ?? -1
                  )
                );

                return (
                  <tr key={benchName}>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                      {benchName}
                    </td>
                    {comparedModels.map((m) => {
                      const entry = m.benchmarks.find((b) => b.benchmarkName === benchName);
                      const isWinner =
                        entry && entry.score === maxScoreForRow && comparedModels.length > 1;
                      return (
                        <td key={m.id} className="px-4 py-3 font-mono text-sm">
                          {entry ? (
                            <span
                              className={
                                isWinner
                                  ? 'inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700'
                                  : 'text-slate-800'
                              }
                            >
                              {entry.score} / {entry.maxScore}
                              {isWinner && <Trophy className="h-3 w-3" />}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Capabilities Matrix */}
              {allCapabilities.length > 0 && (
                <tr className="bg-slate-50">
                  <td
                    colSpan={comparedModels.length + 1}
                    className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                  >
                    Capabilities
                  </td>
                </tr>
              )}
              {allCapabilities.map((cap) => (
                <tr key={cap}>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                    {cap}
                  </td>
                  {comparedModels.map((m) => {
                    const supported = m.capabilities.includes(cap);
                    return (
                      <td key={m.id} className="px-4 py-3">
                        {supported ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading comparison...</div>}>
      <CompareContent />
    </Suspense>
  );
}