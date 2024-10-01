import { describeCommand } from "../../utils/commands";
import { Phase, Phases } from "./phase";
import { TrainNote } from "./train-note";

let phases = new Phases([new Phase('Phase 1', 1), new Phase('Phase 2',2), new Phase('Phase 3', 4), new Phase('Phase 4', 8)]);
let note = new TrainNote(phases);

describe("Increase Phase", () => {
  it("basic increase", () => {
    note.currentPhase = note.phases.First();
    note.Increase();
    expect(note.currentPhase).toBe(phases.phases[1]);
  }),
  it("increase after highest Phase", () => {
    note.currentPhase = note.phases.Last();
    note.Increase();
    expect(note.currentPhase).toBe(phases.phases[phases.phases.length-1]);
  }),
  it("increase throw all", () => {
    note.currentPhase = note.phases.First();
    for(let i = 0; i < note.phases.phases.length; i++){
      note.Increase();
      if(i + 1 >= note.phases.phases.length){
        expect(note.currentPhase).toBe(phases.phases[i]);
      }else{
        expect(note.currentPhase).toBe(phases.phases[i + 1]);
      }
    }
  })
});

describe("Decrease Phase", () => {
  it("basic decrement", () => {
      note.currentPhase = note.phases.phases[3];
      note.Decrease();
      expect(note.currentPhase).toBe(note.phases.phases[2]);
  })
  it("decrease first Phase", () => {
    note.currentPhase = note.phases.First();
    note.Decrease();
    expect(note.currentPhase).toBe(note.phases.First());
  })
  it("decrease throw all", () => {
    note.currentPhase = note.phases.Last();
    for(let i = phases.phases.length; i <= 0; i--){
      note.Increase();
      if(i - 1 <= 0){
        expect(note.currentPhase).toBe(phases.phases[i]);
      }else{
        expect(note.currentPhase).toBe(phases.phases[i - 1]);
      }
    }
  })
})