// src/pond/services.ts
import { Service, PendingJob, AnalysisResult, ErrorInfo } from './types';

const randomDelay = (min = 900, max = 1800) =>
  new Promise((r) => setTimeout(r, Math.floor(Math.random() * (max - min)) + min));

const MOCK_TIPS: Record<string, string[]> = {
  healthy: [
    'Great work! There are healthy bubbles in your pond.',
    'Spray water to pop surface bubbles to release oxygen.',
  ],
  excess_fertilizer: ['Fertilizer likely too high. Lower dosage and retest pH/TDS.'],
  contamination: ['Possible contamination. Drain and refill partially; test source water.'],
  low_oxygen: ['Low oxygen suspected. Increase aeration and avoid overfeeding.'],
  uncertain: ['Result unclear. Retake a clearer, closer photo in good light.'],
};

export const mockService: Service = {
  async upload(_imageUri: string): Promise<PendingJob> {
    await randomDelay();
    return { jobId: String(Date.now()), receivedAt: new Date().toISOString() };
  },

  async poll(_jobId: string) {
    await randomDelay();
    // 10% failure sim
    if (Math.random() < 0.1) {
      return { status: 'failed', error: { code: 'SERVER_UNAVAILABLE', message: 'Temporary server issue' } };
    }
    // Pick a label
    const labels = ['healthy', 'excess_fertilizer', 'contamination', 'low_oxygen', 'uncertain'] as const;
    const label = labels[Math.floor(Math.random() * labels.length)];
    return {
      status: 'done',
      result: {
        label,
        confidence: Number((0.7 + Math.random() * 0.3).toFixed(2)),
        tips: MOCK_TIPS[label],
        educationLinks: [{ title: 'Pond health basics', slug: 'pond-basics' }],
        modelVersion: 'v0.1-mock',
        processedAt: new Date().toISOString(),
      },
    };
  },
};
