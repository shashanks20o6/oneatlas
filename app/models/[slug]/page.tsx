'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Model } from '@/types';
import CostEstimator from '@/components/CostEstimator';

function formatContext(tokens: number) {
  if (tokens >= 1_000_000)
    return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M`;
  return `${Math.round(tokens / 1000)}K`;
}

function ModelDetailContent()  {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/models/${slug}`)
      .then(async (r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((json) => {
        if (json?.data) setModel(json.data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-500">Loading model...</div>;
  }

  if (notFound || !model) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-600">Model not found.</p>
        <Link href="/models" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
          Back to all models
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/models"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> All models
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <Link
          href={`/labs?highlight=${model.lab.slug}`}
          className="text-xs font-semibold uppercase tracking-wider text-indigo-600 hover:underline"
        >
          {model.lab.name}
        </Link>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{model.name}</h1>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-700">
            {model.modelType}
          </span>
        </div>
        {model.description && (
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{model.description}</p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-4">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="text-[10px] uppercase text-slate-400">Context window</div>
            <div className="mt-0.5 font-semibold text-slate-900">
              {formatContext(model.contextWindow)}
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="text-[10px] uppercase text-slate-400">Max output</div>
            <div className="mt-0.5 font-semibold text-slate-900">
              {formatContext(model.maxOutputTokens)}
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="text-[10px] uppercase text-slate-400">Released</div>
            <div className="mt-0.5 font-semibold text-slate-900">
              {new Date(model.releaseDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="text-[10px] uppercase text-slate-400">Providers</div>
            <div className="mt-0.5 font-semibold text-slate-900">
              {model.modelProviders.length}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {model.capabilities.map((c) => (
            <span key={c} className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
              {c}
            </span>
          ))}
          {model.modalities.map((m) => (
            <span key={m} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Providers & pricing */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Providers &amp; pricing</h2>
        {model.modelProviders.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No provider data available.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                  <th className="py-2 pr-4 font-medium">Provider</th>
                  <th className="py-2 pr-4 font-medium">Input / 1M</th>
                  <th className="py-2 pr-4 font-medium">Output / 1M</th>
                  <th className="py-2 pr-4 font-medium">Latency</th>
                  <th className="py-2 font-medium">Throughput</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {model.modelProviders.map((mp) => (
                  <tr key={mp.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-sans font-medium text-slate-900">
                      {mp.provider.name}
                    </td>
                    <td className="py-2 pr-4">${mp.inputPricePer1M.toFixed(2)}</td>
                    <td className="py-2 pr-4">${mp.outputPricePer1M.toFixed(2)}</td>
                    <td className="py-2 pr-4">{mp.latencyMs} ms</td>
                    <td className="py-2">{mp.throughputTps} tok/s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
       <CostEstimator providers={model.modelProviders} />
      {/* Benchmarks */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Benchmarks</h2>
        {model.benchmarks.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No benchmark data available.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {model.benchmarks.map((b) => {
              const pct = Math.min(100, (b.score / b.maxScore) * 100);
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-900">
                      {b.benchmarkName}{' '}
                      <span className="text-slate-400">({b.category})</span>
                    </span>
                    <span className="font-mono text-slate-700">
                      {b.score} / {b.maxScore}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default function ModelDetailPage() {
  return (
    <Suspense
      fallback={<div className="py-20 text-center text-sm text-slate-500">Loading model...</div>}
    >
      <ModelDetailContent />
    </Suspense>
  );
}