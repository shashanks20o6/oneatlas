export interface Lab {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  website?: string | null;
  headquarters?: string | null;
  _count?: { models: number };
  models?: Partial<Model>[];
}

export interface Provider {
  id: string;
  name: string;
  slug: string;
  website?: string | null;
  description?: string | null;
  _count?: { modelProviders: number };
  modelProviders?: ModelProvider[];
}

export interface ModelProvider {
  id: string;
  inputPricePer1M: number;
  outputPricePer1M: number;
  latencyMs: number;
  throughputTps: number;
  modelId: string;
  providerId: string;
  provider: Provider;
  model?: Model;
}

export interface BenchmarkScore {
  id: string;
  benchmarkName: string;
  category: string;
  score: number;
  maxScore: number;
  modelId: string;
  model?: Model;
}

export interface Model {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  contextWindow: number;
  maxOutputTokens: number;
  modelType: string;
  capabilities: string[];
  modalities: string[];
  releaseDate: string;
  labId: string;
  lab: Lab;
  modelProviders: ModelProvider[];
  benchmarks: BenchmarkScore[];
  lowestInputPrice?: number | null;
  lowestOutputPrice?: number | null;
  providerCount?: number;
}