import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning existing database records...');
  await prisma.benchmarkScore.deleteMany();
  await prisma.modelProvider.deleteMany();
  await prisma.model.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.lab.deleteMany();

  console.log('🏢 Seeding 7 Labs...');
  const labsData = [
    {
      name: 'OpenAI',
      slug: 'openai',
      description: 'AI research and deployment company behind the GPT and o-series frontier models.',
      website: 'https://openai.com',
      headquarters: 'San Francisco, CA, USA',
    },
    {
      name: 'Anthropic',
      slug: 'anthropic',
      description: 'AI safety and research company building reliable, interpretable Claude models.',
      website: 'https://anthropic.com',
      headquarters: 'San Francisco, CA, USA',
    },
    {
      name: 'Google DeepMind',
      slug: 'google',
      description: 'Google’s AI research division developing natively multimodal Gemini and Gemma models.',
      website: 'https://deepmind.google',
      headquarters: 'London, UK / Mountain View, CA',
    },
    {
      name: 'Meta AI',
      slug: 'meta',
      description: 'Leading open-weight frontier AI lab behind the Llama model family.',
      website: 'https://ai.meta.com',
      headquarters: 'Menlo Park, CA, USA',
    },
    {
      name: 'Mistral AI',
      slug: 'mistral',
      description: 'European frontier AI lab specializing in high-efficiency open and commercial models.',
      website: 'https://mistral.ai',
      headquarters: 'Paris, France',
    },
    {
      name: 'DeepSeek',
      slug: 'deepseek',
      description: 'Research lab pioneering cost-efficient Mixture-of-Experts and reasoning models.',
      website: 'https://deepseek.com',
      headquarters: 'Hangzhou, China',
    },
    {
      name: 'xAI',
      slug: 'xai',
      description: 'AI lab building Grok models with real-time knowledge and strong reasoning capabilities.',
      website: 'https://x.ai',
      headquarters: 'Palo Alto, CA, USA',
    },
  ];

  const labs: Record<string, string> = {};
  for (const lab of labsData) {
    const created = await prisma.lab.create({ data: lab });
    labs[lab.slug] = created.id;
  }

  console.log('☁️ Seeding 6 Providers...');
  const providersData = [
    {
      name: 'OpenAI Direct',
      slug: 'openai-direct',
      website: 'https://platform.openai.com',
      description: 'Official first-party API for OpenAI models with batch and realtime endpoints.',
    },
    {
      name: 'Anthropic Direct',
      slug: 'anthropic-direct',
      website: 'https://console.anthropic.com',
      description: 'Official first-party API for Claude models with prompt caching and extended thinking.',
    },
    {
      name: 'AWS Bedrock',
      slug: 'aws-bedrock',
      website: 'https://aws.amazon.com/bedrock',
      description: 'Enterprise managed serverless API hosting multi-lab foundation models on AWS.',
    },
    {
      name: 'Together AI',
      slug: 'together-ai',
      website: 'https://together.ai',
      description: 'High-performance cloud inference platform for leading open-weight models.',
    },
    {
      name: 'Groq',
      slug: 'groq',
      website: 'https://groq.com',
      description: 'Ultra-low-latency LPU inference engine delivering industry-leading token throughput.',
    },
    {
      name: 'Fireworks AI',
      slug: 'fireworks-ai',
      website: 'https://fireworks.ai',
      description: 'Fast, production-grade inference API optimized for open models and function calling.',
    },
  ];

  const providers: Record<string, string> = {};
  for (const p of providersData) {
    const created = await prisma.provider.create({ data: p });
    providers[p.slug] = created.id;
  }

  console.log('🤖 Seeding 27 Models with Providers & Benchmarks...');
  const modelsSeed = [
    // --- OPENAI (5 models) ---
    {
      name: 'GPT-4o',
      slug: 'gpt-4o',
      labSlug: 'openai',
      description: 'Flagship omni-modal model balancing intelligence, speed, and vision capabilities.',
      contextWindow: 128000,
      maxOutputTokens: 16384,
      modelType: 'Multimodal',
      capabilities: ['Function Calling', 'Structured Outputs', 'Vision', 'Streaming'],
      modalities: ['Text', 'Image', 'Audio'],
      releaseDate: new Date('2024-05-13'),
      providers: [
        { slug: 'openai-direct', inPrice: 2.5, outPrice: 10.0, latency: 420, tps: 95 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 88.7, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 90.2, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 76.6, max: 100 },
        { name: 'GPQA Diamond', category: 'Reasoning', score: 53.6, max: 100 },
      ],
    },
    {
      name: 'GPT-4o mini',
      slug: 'gpt-4o-mini',
      labSlug: 'openai',
      description: 'Cost-efficient small multimodal model outperforming GPT-3.5 Turbo across tasks.',
      contextWindow: 128000,
      maxOutputTokens: 16384,
      modelType: 'Multimodal',
      capabilities: ['Function Calling', 'Structured Outputs', 'Vision', 'JSON Mode'],
      modalities: ['Text', 'Image'],
      releaseDate: new Date('2024-07-18'),
      providers: [
        { slug: 'openai-direct', inPrice: 0.15, outPrice: 0.6, latency: 260, tps: 145 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 82.0, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 87.2, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 70.2, max: 100 },
      ],
    },
    {
      name: 'o1',
      slug: 'openai-o1',
      labSlug: 'openai',
      description: 'Deep reasoning model trained with reinforcement learning to think before answering.',
      contextWindow: 200000,
      maxOutputTokens: 100000,
      modelType: 'Reasoning',
      capabilities: ['Extended Thinking', 'Structured Outputs', 'Vision', 'Code Execution'],
      modalities: ['Text', 'Image'],
      releaseDate: new Date('2024-12-17'),
      providers: [
        { slug: 'openai-direct', inPrice: 15.0, outPrice: 60.0, latency: 2400, tps: 55 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 91.8, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 92.4, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 96.4, max: 100 },
        { name: 'GPQA Diamond', category: 'Reasoning', score: 78.0, max: 100 },
      ],
    },
    {
      name: 'o3-mini',
      slug: 'openai-o3-mini',
      labSlug: 'openai',
      description: 'Fast, STEM-focused reasoning model with adjustable reasoning effort levels.',
      contextWindow: 200000,
      maxOutputTokens: 100000,
      modelType: 'Reasoning',
      capabilities: ['Extended Thinking', 'Function Calling', 'Structured Outputs'],
      modalities: ['Text'],
      releaseDate: new Date('2025-01-31'),
      providers: [
        { slug: 'openai-direct', inPrice: 1.1, outPrice: 4.4, latency: 950, tps: 120 },
      ],
      benchmarks: [
        { name: 'HumanEval', category: 'Coding', score: 92.0, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 97.9, max: 100 },
        { name: 'GPQA Diamond', category: 'Reasoning', score: 79.7, max: 100 },
      ],
    },
    {
      name: 'GPT-4.1',
      slug: 'gpt-4-1',
      labSlug: 'openai',
      description: 'Long-context flagship optimized for coding, instruction following, and agentic workflows.',
      contextWindow: 1000000,
      maxOutputTokens: 32768,
      modelType: 'Multimodal',
      capabilities: ['Long Context', 'Function Calling', 'Structured Outputs', 'Vision'],
      modalities: ['Text', 'Image'],
      releaseDate: new Date('2025-04-14'),
      providers: [
        { slug: 'openai-direct', inPrice: 2.0, outPrice: 8.0, latency: 390, tps: 105 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 90.2, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 92.8, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 84.5, max: 100 },
      ],
    },

    // --- ANTHROPIC (4 models) ---
    {
      name: 'Claude 3.7 Sonnet',
      slug: 'claude-3-7-sonnet',
      labSlug: 'anthropic',
      description: 'Hybrid reasoning model offering instant responses or visible step-by-step thinking.',
      contextWindow: 200000,
      maxOutputTokens: 64000,
      modelType: 'Reasoning',
      capabilities: ['Extended Thinking', 'Tool Use', 'Computer Use', 'Vision', 'Prompt Caching'],
      modalities: ['Text', 'Image'],
      releaseDate: new Date('2025-02-24'),
      providers: [
        { slug: 'anthropic-direct', inPrice: 3.0, outPrice: 15.0, latency: 480, tps: 82 },
        { slug: 'aws-bedrock', inPrice: 3.0, outPrice: 15.0, latency: 530, tps: 76 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 89.5, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 93.7, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 82.2, max: 100 },
        { name: 'GPQA Diamond', category: 'Reasoning', score: 78.2, max: 100 },
      ],
    },
    {
      name: 'Claude 3.5 Sonnet',
      slug: 'claude-3-5-sonnet',
      labSlug: 'anthropic',
      description: 'Industry-favorite coding and agentic workhorse with strong vision and nuance.',
      contextWindow: 200000,
      maxOutputTokens: 8192,
      modelType: 'Multimodal',
      capabilities: ['Tool Use', 'Computer Use', 'Vision', 'Prompt Caching'],
      modalities: ['Text', 'Image'],
      releaseDate: new Date('2024-10-22'),
      providers: [
        { slug: 'anthropic-direct', inPrice: 3.0, outPrice: 15.0, latency: 440, tps: 85 },
        { slug: 'aws-bedrock', inPrice: 3.0, outPrice: 15.0, latency: 490, tps: 80 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 88.7, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 92.0, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 78.3, max: 100 },
        { name: 'GPQA Diamond', category: 'Reasoning', score: 65.0, max: 100 },
      ],
    },
    {
      name: 'Claude 3.5 Haiku',
      slug: 'claude-3-5-haiku',
      labSlug: 'anthropic',
      description: 'Sub-second fast model matching previous-generation flagship intelligence at low cost.',
      contextWindow: 200000,
      maxOutputTokens: 8192,
      modelType: 'Chat',
      capabilities: ['Tool Use', 'Prompt Caching', 'JSON Mode'],
      modalities: ['Text', 'Image'],
      releaseDate: new Date('2024-11-04'),
      providers: [
        { slug: 'anthropic-direct', inPrice: 0.8, outPrice: 4.0, latency: 250, tps: 135 },
        { slug: 'aws-bedrock', inPrice: 0.8, outPrice: 4.0, latency: 290, tps: 125 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 85.2, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 88.1, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 69.4, max: 100 },
      ],
    },
    {
      name: 'Claude 3 Opus',
      slug: 'claude-3-opus',
      labSlug: 'anthropic',
      description: 'Deep creative writing and complex analysis model from the Claude 3 family.',
      contextWindow: 200000,
      maxOutputTokens: 4096,
      modelType: 'Multimodal',
      capabilities: ['Tool Use', 'Vision', 'Long Context'],
      modalities: ['Text', 'Image'],
      releaseDate: new Date('2024-03-04'),
      providers: [
        { slug: 'anthropic-direct', inPrice: 15.0, outPrice: 75.0, latency: 720, tps: 45 },
        { slug: 'aws-bedrock', inPrice: 15.0, outPrice: 75.0, latency: 780, tps: 42 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 86.8, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 84.9, max: 100 },
        { name: 'GPQA Diamond', category: 'Reasoning', score: 50.4, max: 100 },
      ],
    },

    // --- GOOGLE DEEPMIND (4 models) ---
    {
      name: 'Gemini 2.5 Pro',
      slug: 'gemini-2-5-pro',
      labSlug: 'google',
      description: 'Google’s flagship thinking model with massive 1M context and top coding/reasoning scores.',
      contextWindow: 1000000,
      maxOutputTokens: 65536,
      modelType: 'Reasoning',
      capabilities: ['Extended Thinking', 'Long Context', 'Vision', 'Audio Understanding', 'Tool Use'],
      modalities: ['Text', 'Image', 'Audio', 'Video'],
      releaseDate: new Date('2025-03-25'),
      providers: [
        { slug: 'together-ai', inPrice: 1.25, outPrice: 10.0, latency: 510, tps: 110 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 90.8, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 93.5, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 95.2, max: 100 },
        { name: 'GPQA Diamond', category: 'Reasoning', score: 84.0, max: 100 },
      ],
    },
    {
      name: 'Gemini 2.0 Flash',
      slug: 'gemini-2-0-flash',
      labSlug: 'google',
      description: 'High-throughput multimodal workhorse built for low-latency agentic applications.',
      contextWindow: 1000000,
      maxOutputTokens: 8192,
      modelType: 'Multimodal',
      capabilities: ['Long Context', 'Function Calling', 'Vision', 'Structured Outputs'],
      modalities: ['Text', 'Image', 'Audio', 'Video'],
      releaseDate: new Date('2025-02-05'),
      providers: [
        { slug: 'together-ai', inPrice: 0.1, outPrice: 0.4, latency: 210, tps: 185 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 85.4, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 89.0, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 89.7, max: 100 },
      ],
    },
    {
      name: 'Gemma 3 27B',
      slug: 'gemma-3-27b',
      labSlug: 'google',
      description: 'Open-weight multimodal model delivering single-GPU deployable frontier performance.',
      contextWindow: 128000,
      maxOutputTokens: 8192,
      modelType: 'Multimodal',
      capabilities: ['Open Weights', 'Vision', 'Function Calling', 'Multilingual'],
      modalities: ['Text', 'Image'],
      releaseDate: new Date('2025-03-12'),
      providers: [
        { slug: 'together-ai', inPrice: 0.27, outPrice: 0.27, latency: 240, tps: 130 },
        { slug: 'fireworks-ai', inPrice: 0.3, outPrice: 0.3, latency: 220, tps: 140 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 78.6, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 81.5, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 81.0, max: 100 },
      ],
    },
    {
      name: 'Gemma 2 9B',
      slug: 'gemma-2-9b',
      labSlug: 'google',
      description: 'Compact open-weight model punching well above its parameter class.',
      contextWindow: 8192,
      maxOutputTokens: 4096,
      modelType: 'Chat',
      capabilities: ['Open Weights', 'JSON Mode'],
      modalities: ['Text'],
      releaseDate: new Date('2024-06-27'),
      providers: [
        { slug: 'groq', inPrice: 0.2, outPrice: 0.2, latency: 95, tps: 480 },
        { slug: 'together-ai', inPrice: 0.2, outPrice: 0.2, latency: 170, tps: 190 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 71.3, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 68.9, max: 100 },
      ],
    },

    // --- META AI (4 models) ---
    {
      name: 'Llama 3.3 70B',
      slug: 'llama-3-3-70b',
      labSlug: 'meta',
      description: 'Text-only open-weight powerhouse matching 405B-class performance at a fraction of compute.',
      contextWindow: 128000,
      maxOutputTokens: 8192,
      modelType: 'Chat',
      capabilities: ['Open Weights', 'Function Calling', 'JSON Mode', 'Multilingual'],
      modalities: ['Text'],
      releaseDate: new Date('2024-12-06'),
      providers: [
        { slug: 'groq', inPrice: 0.59, outPrice: 0.79, latency: 140, tps: 310 },
        { slug: 'together-ai', inPrice: 0.88, outPrice: 0.88, latency: 260, tps: 115 },
        { slug: 'fireworks-ai', inPrice: 0.9, outPrice: 0.9, latency: 245, tps: 125 },
        { slug: 'aws-bedrock', inPrice: 0.72, outPrice: 0.72, latency: 320, tps: 95 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 86.0, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 88.4, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 77.0, max: 100 },
        { name: 'GPQA Diamond', category: 'Reasoning', score: 50.5, max: 100 },
      ],
    },
    {
      name: 'Llama 3.1 405B',
      slug: 'llama-3-1-405b',
      labSlug: 'meta',
      description: 'Meta’s largest dense open-weight model suited for synthetic data generation and distillation.',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      modelType: 'Chat',
      capabilities: ['Open Weights', 'Function Calling', 'Long Context'],
      modalities: ['Text'],
      releaseDate: new Date('2024-07-23'),
      providers: [
        { slug: 'together-ai', inPrice: 3.5, outPrice: 3.5, latency: 480, tps: 62 },
        { slug: 'fireworks-ai', inPrice: 3.0, outPrice: 3.0, latency: 450, tps: 68 },
        { slug: 'aws-bedrock', inPrice: 2.4, outPrice: 2.4, latency: 520, tps: 58 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 88.6, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 89.0, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 73.8, max: 100 },
      ],
    },
    {
      name: 'Llama 3.1 8B',
      slug: 'llama-3-1-8b',
      labSlug: 'meta',
      description: 'Ultra-fast, lightweight open model ideal for classification, routing, and edge workloads.',
      contextWindow: 128000,
      maxOutputTokens: 4096,
      modelType: 'Chat',
      capabilities: ['Open Weights', 'Function Calling', 'JSON Mode'],
      modalities: ['Text'],
      releaseDate: new Date('2024-07-23'),
      providers: [
        { slug: 'groq', inPrice: 0.05, outPrice: 0.08, latency: 85, tps: 750 },
        { slug: 'together-ai', inPrice: 0.18, outPrice: 0.18, latency: 140, tps: 240 },
        { slug: 'fireworks-ai', inPrice: 0.2, outPrice: 0.2, latency: 130, tps: 260 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 73.0, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 72.6, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 51.9, max: 100 },
      ],
    },
    {
      name: 'Llama 4 Maverick',
      slug: 'llama-4-maverick',
      labSlug: 'meta',
      description: 'Natively multimodal Mixture-of-Experts model with 17B active parameters and 128 experts.',
      contextWindow: 1000000,
      maxOutputTokens: 16384,
      modelType: 'Multimodal',
      capabilities: ['Open Weights', 'Vision', 'Long Context', 'Function Calling'],
      modalities: ['Text', 'Image'],
      releaseDate: new Date('2025-04-05'),
      providers: [
        { slug: 'together-ai', inPrice: 0.27, outPrice: 0.85, latency: 230, tps: 145 },
        { slug: 'fireworks-ai', inPrice: 0.22, outPrice: 0.88, latency: 215, tps: 155 },
        { slug: 'groq', inPrice: 0.2, outPrice: 0.6, latency: 120, tps: 390 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 85.5, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 89.6, max: 100 },
        { name: 'GPQA Diamond', category: 'Reasoning', score: 69.8, max: 100 },
      ],
    },

    // --- MISTRAL AI (4 models) ---
    {
      name: 'Mistral Large 2',
      slug: 'mistral-large-2',
      labSlug: 'mistral',
      description: '123B parameter flagship model excelling in multilingual reasoning and code generation.',
      contextWindow: 128000,
      maxOutputTokens: 8192,
      modelType: 'Chat',
      capabilities: ['Function Calling', 'JSON Mode', 'Multilingual'],
      modalities: ['Text'],
      releaseDate: new Date('2024-07-24'),
      providers: [
        { slug: 'aws-bedrock', inPrice: 2.0, outPrice: 6.0, latency: 360, tps: 88 },
        { slug: 'together-ai', inPrice: 2.0, outPrice: 6.0, latency: 340, tps: 94 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 84.0, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 92.0, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 76.9, max: 100 },
      ],
    },
    {
      name: 'Mixtral 8x22B',
      slug: 'mixtral-8x22b',
      labSlug: 'mistral',
      description: 'Sparse Mixture-of-Experts open model activating 39B parameters per token.',
      contextWindow: 65536,
      maxOutputTokens: 8192,
      modelType: 'Chat',
      capabilities: ['Open Weights', 'Function Calling', 'Multilingual'],
      modalities: ['Text'],
      releaseDate: new Date('2024-04-17'),
      providers: [
        { slug: 'together-ai', inPrice: 1.2, outPrice: 1.2, latency: 290, tps: 105 },
        { slug: 'fireworks-ai', inPrice: 1.2, outPrice: 1.2, latency: 275, tps: 112 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 77.8, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 75.0, max: 100 },
      ],
    },
    {
      name: 'Codestral 25.01',
      slug: 'codestral-25-01',
      labSlug: 'mistral',
      description: 'Specialized low-latency code generation model supporting 80+ programming languages.',
      contextWindow: 256000,
      maxOutputTokens: 16384,
      modelType: 'Chat',
      capabilities: ['Fill-in-the-Middle', 'Long Context', 'Function Calling'],
      modalities: ['Text'],
      releaseDate: new Date('2025-01-13'),
      providers: [
        { slug: 'together-ai', inPrice: 0.3, outPrice: 0.9, latency: 185, tps: 175 },
        { slug: 'fireworks-ai', inPrice: 0.3, outPrice: 0.9, latency: 175, tps: 185 },
      ],
      benchmarks: [
        { name: 'HumanEval', category: 'Coding', score: 91.5, max: 100 },
      ],
    },
    {
      name: 'Pixtral Large',
      slug: 'pixtral-large',
      labSlug: 'mistral',
      description: '124B open-weight multimodal model built for complex document, chart, and UI understanding.',
      contextWindow: 128000,
      maxOutputTokens: 8192,
      modelType: 'Multimodal',
      capabilities: ['Open Weights', 'Vision', 'Function Calling'],
      modalities: ['Text', 'Image'],
      releaseDate: new Date('2024-11-18'),
      providers: [
        { slug: 'aws-bedrock', inPrice: 2.0, outPrice: 6.0, latency: 410, tps: 80 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 84.2, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 78.1, max: 100 },
      ],
    },

    // --- DEEPSEEK (3 models) ---
    {
      name: 'DeepSeek-R1',
      slug: 'deepseek-r1',
      labSlug: 'deepseek',
      description: 'Open-weight frontier reasoning model rivaling OpenAI o1 with transparent chain-of-thought.',
      contextWindow: 128000,
      maxOutputTokens: 32768,
      modelType: 'Reasoning',
      capabilities: ['Open Weights', 'Extended Thinking', 'JSON Mode'],
      modalities: ['Text'],
      releaseDate: new Date('2025-01-20'),
      providers: [
        { slug: 'together-ai', inPrice: 3.0, outPrice: 7.0, latency: 920, tps: 65 },
        { slug: 'fireworks-ai', inPrice: 3.0, outPrice: 8.0, latency: 880, tps: 70 },
        { slug: 'aws-bedrock', inPrice: 1.35, outPrice: 5.4, latency: 990, tps: 60 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 90.8, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 93.0, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 97.3, max: 100 },
        { name: 'GPQA Diamond', category: 'Reasoning', score: 71.5, max: 100 },
      ],
    },
    {
      name: 'DeepSeek-V3',
      slug: 'deepseek-v3',
      labSlug: 'deepseek',
      description: '671B MoE open-weight general model with 37B active parameters and exceptional price-performance.',
      contextWindow: 128000,
      maxOutputTokens: 16384,
      modelType: 'Chat',
      capabilities: ['Open Weights', 'Function Calling', 'JSON Mode'],
      modalities: ['Text'],
      releaseDate: new Date('2024-12-26'),
      providers: [
        { slug: 'together-ai', inPrice: 1.25, outPrice: 1.25, latency: 380, tps: 88 },
        { slug: 'fireworks-ai', inPrice: 0.9, outPrice: 0.9, latency: 350, tps: 95 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 88.5, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 90.2, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 90.2, max: 100 },
        { name: 'GPQA Diamond', category: 'Reasoning', score: 59.1, max: 100 },
      ],
    },
    {
      name: 'DeepSeek-R1-Distill-Llama-70B',
      slug: 'deepseek-r1-distill-llama-70b',
      labSlug: 'deepseek',
      description: 'Llama 3.3 70B fine-tuned on DeepSeek-R1 reasoning traces for high-speed math and coding.',
      contextWindow: 128000,
      maxOutputTokens: 16384,
      modelType: 'Reasoning',
      capabilities: ['Open Weights', 'Extended Thinking'],
      modalities: ['Text'],
      releaseDate: new Date('2025-01-20'),
      providers: [
        { slug: 'groq', inPrice: 0.75, outPrice: 0.99, latency: 180, tps: 275 },
        { slug: 'together-ai', inPrice: 0.88, outPrice: 0.88, latency: 290, tps: 110 },
      ],
      benchmarks: [
        { name: 'MATH-500', category: 'Math', score: 94.5, max: 100 },
        { name: 'GPQA Diamond', category: 'Reasoning', score: 65.2, max: 100 },
      ],
    },

    // --- xAI (3 models) ---
    {
      name: 'Grok 3',
      slug: 'grok-3',
      labSlug: 'xai',
      description: 'xAI’s flagship frontier model trained on Colossus supercluster for deep reasoning and coding.',
      contextWindow: 131072,
      maxOutputTokens: 16384,
      modelType: 'Reasoning',
      capabilities: ['Extended Thinking', 'Function Calling', 'Structured Outputs'],
      modalities: ['Text'],
      releaseDate: new Date('2025-02-17'),
      providers: [
        { slug: 'together-ai', inPrice: 3.0, outPrice: 15.0, latency: 460, tps: 85 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 92.7, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 91.8, max: 100 },
        { name: 'MATH-500', category: 'Math', score: 93.3, max: 100 },
        { name: 'GPQA Diamond', category: 'Reasoning', score: 84.6, max: 100 },
      ],
    },
    {
      name: 'Grok 3 Mini',
      slug: 'grok-3-mini',
      labSlug: 'xai',
      description: 'Lightweight STEM and logic reasoning model optimized for fast quantitative tasks.',
      contextWindow: 131072,
      maxOutputTokens: 16384,
      modelType: 'Reasoning',
      capabilities: ['Extended Thinking', 'Function Calling', 'JSON Mode'],
      modalities: ['Text'],
      releaseDate: new Date('2025-02-17'),
      providers: [
        { slug: 'together-ai', inPrice: 0.3, outPrice: 0.5, latency: 230, tps: 150 },
      ],
      benchmarks: [
        { name: 'MATH-500', category: 'Math', score: 95.8, max: 100 },
        { name: 'GPQA Diamond', category: 'Reasoning', score: 80.4, max: 100 },
      ],
    },
    {
      name: 'Grok 2 Vision',
      slug: 'grok-2-vision',
      labSlug: 'xai',
      description: 'Multimodal model capable of analyzing documents, diagrams, and real-world photographs.',
      contextWindow: 32768,
      maxOutputTokens: 8192,
      modelType: 'Multimodal',
      capabilities: ['Vision', 'Function Calling', 'JSON Mode'],
      modalities: ['Text', 'Image'],
      releaseDate: new Date('2024-12-12'),
      providers: [
        { slug: 'together-ai', inPrice: 2.0, outPrice: 10.0, latency: 390, tps: 90 },
      ],
      benchmarks: [
        { name: 'MMLU', category: 'Knowledge', score: 87.5, max: 100 },
        { name: 'HumanEval', category: 'Coding', score: 88.4, max: 100 },
      ],
    },
  ];

  for (const m of modelsSeed) {
    await prisma.model.create({
      data: {
        name: m.name,
        slug: m.slug,
        labId: labs[m.labSlug],
        description: m.description,
        contextWindow: m.contextWindow,
        maxOutputTokens: m.maxOutputTokens,
        modelType: m.modelType,
        capabilities: m.capabilities,
        modalities: m.modalities,
        releaseDate: m.releaseDate,
        modelProviders: {
          create: m.providers.map((p) => ({
            providerId: providers[p.slug],
            inputPricePer1M: p.inPrice,
            outputPricePer1M: p.outPrice,
            latencyMs: p.latency,
            throughputTps: p.tps,
          })),
        },
        benchmarks: {
          create: m.benchmarks.map((b) => ({
            benchmarkName: b.name,
            category: b.category,
            score: b.score,
            maxScore: b.max,
          })),
        },
      },
    });
  }

  console.log('✅ Seed complete: 7 Labs, 6 Providers, 27 Models!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });