// src/pond/types.ts
export type PondLabel =
  | 'healthy'
  | 'excess_fertilizer'
  | 'contamination'
  | 'low_oxygen'
  | 'uncertain';

export type AnalysisStatus = 'idle' | 'validating' | 'uploading' | 'processing' | 'done' | 'error';

export interface EducationLink { title: string; slug: string; }

export interface AnalysisResult {
  id: string;                
  label: PondLabel | string; 
  confidence: number;  
  tips: string[];
  educationLinks: EducationLink[];
  modelVersion: string;
  processedAt: string;    
  imageUri: string;      
}

export interface PendingJob {
  jobId: string;
  receivedAt: string;
}

export interface ErrorInfo { code: string; message: string; }

export interface Service {
  upload(imageUri: string): Promise<PendingJob>;
  poll(jobId: string): Promise<
    | { status: 'processing' }
    | { status: 'done'; result: Omit<AnalysisResult, 'id' | 'imageUri'> }
    | { status: 'failed'; error: ErrorInfo }
  >;
}
