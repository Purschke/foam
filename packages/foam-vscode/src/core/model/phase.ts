export class Phase {
  name: string;
  days: number;

  constructor(name: string, days: number) {
    this.name = name;
    this.days = days;
  }
}

export class Phases {
  phases = Array<Phase>;

  public First(): Phase {
    return this.phases[0];
  }

  public Next(phase: Phase): Phase | undefined {
    for (let i = 0; i < this.phases.length; i++) {
      if (this.phases[i] == phase) {
        return Phases[i++];
      }
    }
  }

  public Return(phase: Phase): Phase | undefined {
    for (let i = 0; i < this.phases.length; i++) {
      if (this.phases[i] == phase) {
        return Phases[i--];
      }
    }
  }
}
