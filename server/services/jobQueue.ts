import { randomUUID } from 'crypto';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  type: string;
  status: JobStatus;
  data: any;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory queue for development. In production, this would be backed by Redis + BullMQ.
const jobs = new Map<string, Job>();

export class JobQueue {
  static createJob(type: string, data: any): Job {
    const id = randomUUID();
    const job: Job = {
      id,
      type,
      status: 'pending',
      data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    jobs.set(id, job);
    return job;
  }

  static getJob(id: string): Job | undefined {
    return jobs.get(id);
  }

  static updateJob(id: string, updates: Partial<Job>) {
    const job = jobs.get(id);
    if (job) {
      Object.assign(job, updates, { updatedAt: new Date() });
      jobs.set(id, job);
    }
  }
}
