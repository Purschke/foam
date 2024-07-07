import {Phase, Phases, TrainNote } from "./trainNote";

describe('TrainNote Phase Increase', () => {
  let note = new TrainNote();
  note.NextPhase();
});

describe('TrainNote Phase Decrease', () => {
  let note = new TrainNote();
  note.ReturnPhase();
});

describe('Phase Next', () => {
  var phase = new Phase('Phase 1', 1);
  var nextPhase = phase.Next();
  expect(nextPhase).toBe('Phase 2');
  nextPhase = phase.Next();
  expect(nextPhase).toBe('Phase 3');
  nextPhase = phase.Next();
  expect(nextPhase).toBe('Phase 4');
  nextPhase = phase.Next();
  expect(nextPhase).toBe('Phase 5');
  nextPhase = phase.Next();
  expect(nextPhase).toBe('Phase 6');
});

descripe('Cache', () => {
  var phases1 = new Phases("Cache_1");
  var phases2 = new Phases('Cache_1');
  var phases3 = new Phases('Cache_2');
  expect(phases1.phases).toEqual(phases2);
  expect(phases2.phases).not.toBe(phases3);
});