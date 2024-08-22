import { Resource } from './note';
import { Phase, Phases } from './phase';

export class TrainNote extends Resource {
  nextReminder: Date;
  currentPhase: Phase;
  phases: Phases;

  constructor() {
    super();
  }
}