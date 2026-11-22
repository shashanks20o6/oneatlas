'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, ExternalLink, MapPin } from 'lucide-react';
import { Lab } from '@/types';

export default function LabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/labs')
      .then((r) => r.json())
      .then((json) => setLabs(json.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
          <Building2 className="h-6 w-6 text-indigo-600" /> AI Research Labs Directory
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Foundation model creators and research organizations indexed on OneAtlas.
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
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{lab.name}</h2>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-indigo-700">
                    {lab._count?.models ?? 0} models
                  </span>
                </div>

                {lab.headquarters && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5" /> {lab.headquarters}
                  </div>
                )}

                {lab.description && (
                  <p className="mt-3 text-xs leading-relaxed text-slate-600">
                    {lab.description}
                  </p>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                {lab.website ? (
                  <a
                    href={lab.website}
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
                  href={`/models?lab=${lab.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View Models <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}