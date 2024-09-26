import { BehaviorSubject } from 'rxjs';

export const sample_sign = new BehaviorSubject<{
  message: string;
  signature: string;
} | null>(null);
