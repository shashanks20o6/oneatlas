'use client';

import { useState } from 'react';

interface ProviderOffer {
  id: string;
  inputPricePer1M: number;
  outputPricePer1M: number;
  provider: {
    name: string;
  };
}

function Slider({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-indigo-600">
          {value.toLocaleString()} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-indigo-600"
      />
    </div>
  );
}

export default function CostEstimator({
  providers,
}: {
  providers: ProviderOffer[];
}) {
  const [dailyRequests, setDailyRequests] = useState(1000);
  const [avgInputTokens, setAvgInputTokens] = useState(1500);
  const [avgOutputTokens, setAvgOutputTokens] = useState(500);

  if (!providers || providers.length === 0) return null;

  const monthlyRequests = dailyRequests * 30;
  const totalInputMillions = (monthlyRequests * avgInputTokens) / 1_000_000;
  const totalOutputMillions = (monthlyRequests * avgOutputTokens) / 1_000_000;

  const estimates = providers
    .map((offer) => ({
      id: offer.id,
      name: offer.provider.name,
      cost:
        totalInputMillions * offer.inputPricePer1M +
        totalOutputMillions * offer.outputPricePer1M,
    }))
    .sort((a, b) => a.cost - b.cost);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">
          Monthly workload cost estimator
        </h2>
        <p className="text-sm text-slate-500">
          Adjust expected daily traffic and token sizes to estimate 30-day
          spend across providers.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Slider
          label="Daily requests"
          value={dailyRequests}
          unit="/ day"
          min={100}
          max={50000}
          step={100}
          onChange={setDailyRequests}
        />
        <Slider
          label="Avg prompt tokens"
          value={avgInputTokens}
          unit="tok"
          min={100}
          max={32000}
          step={100}
          onChange={setAvgInputTokens}
        />
        <Slider
          label="Avg output tokens"
          value={avgOutputTokens}
          unit="tok"
          min={50}
          max={8000}
          step={50}
          onChange={setAvgOutputTokens}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {estimates.map((e, i) => (
          <div
            key={e.id}
            className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
              i === 0
                ? 'border-indigo-200 bg-indigo-50'
                : 'border-slate-100 bg-slate-50'
            }`}
          >
            <div>
              <p className="text-sm font-medium text-slate-800">{e.name}</p>
              <p className="text-xs text-slate-500">
                {i === 0 ? 'Cheapest · ' : ''}
                {(monthlyRequests / 1000).toFixed(0)}k reqs / mo
              </p>
            </div>
            <p className="font-mono text-lg font-bold text-slate-900">
              ${e.cost.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              <span className="text-xs font-normal text-slate-500">/mo</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}