import { Alias, NoteLinkDefinition, Resource, ResourceLink, Section, Tag } from './note';
import { Phase, Phases } from './phase';
import { URI } from './uri';

export class TrainNote extends Resource {
  nextReminder: Date;
  currentPhase: Phase;
  phases: Phases;

  constructor(phases: Phases) {
    super();
    this.phases = phases;
  }

  Increase() {
    this.currentPhase = this.phases.Next(this.currentPhase);
  }

  Decrease() {
    this.currentPhase = this.phases.Return(this.currentPhase);
  }
}