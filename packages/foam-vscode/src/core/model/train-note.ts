import { Resource } from './note';
import { Phase } from './phase';

export interface TrainNote extends Resource {
  nextReminder: Date;
  currentPhase: Phase;
}