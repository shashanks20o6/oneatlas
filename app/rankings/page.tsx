'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award } from 'lucide-react';
import { BenchmarkScore } from '@/types';

const CATEGORIES = ['All', 'Coding', 'Reasoning', 'Knowledge', 'Math'];

export default function RankingsPage() {
  const [category, setCategory] = useState('All');
  const [selectedBenchmark, setSelectedBenchmark] = useState('');
  const [scores, setScores] = useState<BenchmarkScore[]>([]);
  const [availableFilters, setAvailableFilters] = useState<
    { benchmarkName: string; category: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (selectedBenchmark) params.set('benchmark', selectedBenchmark);

    setLoading(true);
    fetch(`/api/rankings?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        setScores(json.data ?? []);
        setAvailableFilters(json.filters ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, selectedBenchmark]);

  const benchmarksForCategory = availableFilters.filter(
    (f) => category === 'All' || f.category.toLowerCase() === category.toLowerCase()
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
          <Award className="h-6 w-6 text-indigo-600" /> Benchmark Rankings Leaderboard
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Models ranked by verified evaluation scores across coding, reasoning, math, and general knowledge.
        </p>
      </div>

      {/* Category Tabs & Specific Benchmark Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setSelectedBenchmark('');
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                category === cat
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          value={selectedBenchmark}
          onChange={(e) => setSelectedBenchmark(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-400 focus:outline-none"
        >
          <option value="">All Benchmarks in {category}</option>
          {benchmarksForCategory.map((b) => (
            <option key={`${b.category}-${b.benchmarkName}`} value={b.benchmarkName}>
              {b.benchmarkName} ({b.category})
            </option>
          ))}
        </select>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="w-16 px-4 py-3">Rank</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Benchmark</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3 text-right">Lowest Input / 1M</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500">
                  Loading rankings...
                </td>
              </tr>
            ) : scores.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500">
                  No benchmark scores found for this filter.
                </td>
              </tr>
            ) : (
              scores.map((item, idx) => {
                const lowestPrice = item.model?.modelProviders?.[0]?.inputPricePer1M;
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-500">
                      #{idx + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      {item.model && (
                        <div>
                          <Link
                            href={`/models/${item.model.slug}`}
                            className="font-bold text-slate-900 hover:text-indigo-600"
                          >
                            {item.model.name}
                          </Link>
                          <div className="text-[11px] font-medium text-slate-500">
                            {item.model.lab?.name}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {item.benchmarkName}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-sm font-bold text-indigo-600">
                      {item.score} <span className="text-xs font-normal text-slate-400">/ {item.maxScore}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold text-slate-900">
                      {lowestPrice != null ? `$${lowestPrice.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}