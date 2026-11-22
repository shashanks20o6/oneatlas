'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Server } from 'lucide-react';
import { Provider } from '@/types';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/providers')
      .then((r) => r.json())
      .then((json) => setProviders(json.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
          <Server className="h-6 w-6 text-indigo-600" /> Inference Providers Directory
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Cloud platforms and GPU inference endpoints hosting foundation models via API.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{provider.name}</h2>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-emerald-700">
                    {provider._count?.modelProviders ?? 0} hosted
                  </span>
                </div>

                {provider.description && (
                  <p className="mt-3 text-xs leading-relaxed text-slate-600">
                    {provider.description}
                  </p>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                {provider.website ? (
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
                  >
                    Website <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span />
                )}

                <Link
                  href={`/models?provider=${provider.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Filter Hosted Models <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}