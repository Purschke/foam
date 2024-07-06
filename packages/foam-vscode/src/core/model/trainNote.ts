import { Resource } from './note';

export interface TrainNote extends Resource {
  nextReminder: Date;
  currentPhase: Phase;
}

export interface Phase {
  phase: number;
  days: number;
}
