'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Filter,
  Layers,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';
import { Lab, Model, Provider } from '@/types';

const CAPABILITIES = [
  'Tool Calling',
  'Structured JSON',
  'Reasoning',
  'Vision',
  'Code Generation',
];

const MODEL_TYPES = ['Chat', 'Reasoning', 'Multimodal', 'Coding'];

function formatContext(tokens: number) {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M`;
  return `${Math.round(tokens / 1000)}K`;
}

function ModelsDiscoveryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const [debouncedQ, setDebouncedQ] = useState(searchParams.get('q') ?? '');
  const [selectedLab, setSelectedLab] = useState(searchParams.get('lab') ?? '');
  const [selectedProvider, setSelectedProvider] = useState(searchParams.get('provider') ?? '');
  const [selectedCapability, setSelectedCapability] = useState(searchParams.get('capability') ?? '');
  const [selectedType, setSelectedType] = useState(searchParams.get('modelType') ?? '');
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'newest');

  const [models, setModels] = useState<Model[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);

  // Sync incoming URL changes (e.g., from Navbar search or directory links)
  useEffect(() => {
    setSearchInput(searchParams.get('q') ?? '');
    setDebouncedQ(searchParams.get('q') ?? '');
    setSelectedLab(searchParams.get('lab') ?? '');
    setSelectedProvider(searchParams.get('provider') ?? '');
    setSelectedCapability(searchParams.get('capability') ?? '');
    setSelectedType(searchParams.get('modelType') ?? '');
    setSort(searchParams.get('sort') ?? 'newest');
  }, [searchParams]);

  // 300ms debounce for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch filter options (Labs & Providers) from API
  useEffect(() => {
    Promise.all([
      fetch('/api/labs').then((r) => r.json()),
      fetch('/api/providers').then((r) => r.json()),
    ])
      .then(([labsRes, providersRes]) => {
        setLabs(labsRes.data ?? []);
        setProviders(providersRes.data ?? []);
      })
      .catch(console.error);
  }, []);

  // Fetch filtered models whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    if (selectedLab) params.set('lab', selectedLab);
    if (selectedProvider) params.set('provider', selectedProvider);
    if (selectedCapability) params.set('capability', selectedCapability);
    if (selectedType) params.set('modelType', selectedType);
    if (sort) params.set('sort', sort);
    params.set('limit', '50');

    const queryString = params.toString();
    router.replace(`/models${queryString ? `?${queryString}` : ''}`, { scroll: false });

    setLoading(true);
    fetch(`/api/models?${queryString}`)
      .then((res) => res.json())
      .then((json) => {
        setModels(json.data ?? []);
        setTotal(json.pagination?.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [
    debouncedQ,
    selectedLab,
    selectedProvider,
    selectedCapability,
    selectedType,
    sort,
    router,
  ]);

  const toggleCompare = (slug: string) => {
    setCompareSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 4) return prev;
      return [...prev, slug];
    });
  };

  const resetFilters = () => {
    setSearchInput('');
    setDebouncedQ('');
    setSelectedLab('');
    setSelectedProvider('');
    setSelectedCapability('');
    setSelectedType('');
    setSort('newest');
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            AI Model Catalog
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Compare token pricing, context lengths, latency, and benchmarks across inference providers.
          </p>
        </div>
        <div className="font-mono text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-900">{total}</span> models
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Filter Sidebar */}
        <aside className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-xs lg:col-span-1 lg:self-start">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Filter className="h-3.5 w-3.5" /> Filters
            </span>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          {/* Creator Lab */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Creator Lab
            </label>
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none"
            >
              <option value="">All Labs</option>
              {labs.map((lab) => (
                <option key={lab.id} value={lab.slug}>
                  {lab.name}
                </option>
              ))}
            </select>
          </div>

          {/* Inference Provider */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Inference Provider
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:bg-white focus:outline-none"
            >
              <option value="">All Providers</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.slug}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model Type */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Model Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MODEL_TYPES.map((type) => {
                const active = selectedType.toLowerCase() === type.toLowerCase();
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(active ? '' : type)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Capability
            </label>
            <div className="space-y-1.5">
              {CAPABILITIES.map((cap) => {
                const active = selectedCapability === cap;
                return (
                  <label
                    key={cap}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => setSelectedCapability(active ? '' : cap)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span>{cap}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="space-y-4 lg:col-span-3">
          {/* Search + Sort Bar */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search models by name or description..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-xs focus:border-slate-400 focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="context_desc">Context Window: Largest</option>
            </select>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white p-5"
                />
              ))}
            </div>
          ) : models.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-sm font-medium text-slate-900">
                No models matched your current filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {models.map((model) => {
                const isSelected = compareSlugs.includes(model.slug);
                return (
                  <div
                    key={model.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/labs?highlight=${model.lab.slug}`}
                            className="text-xs font-semibold uppercase tracking-wider text-indigo-600 hover:underline"
                          >
                            {model.lab.name}
                          </Link>
                          <Link href={`/models/${model.slug}`}>
                            <h2 className="mt-0.5 text-lg font-bold text-slate-900 hover:text-indigo-600">
                              {model.name}
                            </h2>
                          </Link>
                        </div>

                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-700">
                          {model.modelType}
                        </span>
                      </div>

                      {model.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
                          {model.description}
                        </p>
                      )}

                      {/* Telemetry Metrics Strip */}
                      <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5 font-mono text-xs">
                        <div>
                          <div className="text-[10px] uppercase text-slate-400">
                            Input / 1M
                          </div>
                          <div className="mt-0.5 font-semibold text-slate-900">
                            {model.lowestInputPrice != null
                              ? `$${model.lowestInputPrice.toFixed(2)}`
                              : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-slate-400">
                            Output / 1M
                          </div>
                          <div className="mt-0.5 font-semibold text-slate-900">
                            {model.lowestOutputPrice != null
                              ? `$${model.lowestOutputPrice.toFixed(2)}`
                              : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-slate-400">
                            Context
                          </div>
                          <div className="mt-0.5 font-semibold text-slate-900">
                            {formatContext(model.contextWindow)}
                          </div>
                        </div>
                      </div>

                      {/* Capabilities Badges */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {model.capabilities.slice(0, 3).map((cap) => (
                          <span
                            key={cap}
                            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600"
                          >
                            <Sparkles className="h-2.5 w-2.5 text-slate-400" />
                            {cap}
                          </span>
                        ))}
                        {model.providerCount != null && model.providerCount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-medium text-emerald-700">
                            <Layers className="h-2.5 w-2.5" />
                            {model.providerCount} {model.providerCount === 1 ? 'provider' : 'providers'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <button
                        onClick={() => toggleCompare(model.slug)}
                        disabled={!isSelected && compareSlugs.length >= 4}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Selected
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" /> Compare
                          </>
                        )}
                      </button>

                      <Link
                        href={`/models/${model.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-indigo-600"
                      >
                        Specs & Providers <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Compare Bar */}
      {compareSlugs.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-white shadow-lg">
          <span className="text-xs font-medium">
            <span className="font-mono font-bold text-indigo-400">
              {compareSlugs.length}/4
            </span>{' '}
            models selected
          </span>
          <button
            onClick={() => setCompareSlugs([])}
            className="text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
          <Link
            href={`/compare?slugs=${compareSlugs.join(',')}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400"
          >
            Compare Now <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ModelsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading catalog...</div>}>
      <ModelsDiscoveryContent />
    </Suspense>
  );
}