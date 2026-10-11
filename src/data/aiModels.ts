import { AiModelConfig, AiModelId } from '../types';

export const AI_MODELS: Record<AiModelId, AiModelConfig> = {
  gemini: {
    id: 'gemini',
    name: 'Gemini Research AI',
    provider: 'Google DeepMind',
    version: 'Gemini 3.8 Flash Academic',
    badge: 'Gemini 3.8 Flash',
    avatarColor: 'bg-indigo-600 text-white',
    accentColor: '#4f46e5',
    tagline: 'Deep Scholarly Reasoning, Publication-Grade Synthesis & Math Rigor',
    strengths: [
      'Automatic whole-paper generation with full mathematical derivations',
      'Precise LaTeX equations and formal theoretical proofs',
      'Empirical benchmarking matrices and comparative tables',
      'Verified citations formatted in APA, IEEE, MLA, Chicago, and Harvard',
      'High-speed scholarly synthesis and methodology auditing',
    ],
    signatureFeature: 'Full Academic Synthesis & Peer-Reviewed Structure',
  },
};

export const AI_MODEL_LIST: AiModelConfig[] = Object.values(AI_MODELS);

