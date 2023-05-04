class Scale {
  name: string;
  intervals: number[];
  notes: { [key: number]: { note: string; frequency: number } };
  constructor(name: string, intervals: number[]) {
    this.name = name;
    this.intervals = intervals;
    this.notes = {
      0: { note: "C", frequency: 261.63 },
      1: { note: "C#", frequency: 277.18 },
      2: { note: "D", frequency: 293.66 },
      3: { note: "D#", frequency: 311.13 },
      4: { note: "E", frequency: 329.63 },
      5: { note: "F", frequency: 349.23 },
      6: { note: "F#", frequency: 369.99 },
      7: { note: "G", frequency: 392.0 },
      8: { note: "G#", frequency: 415.3 },
      9: { note: "A", frequency: 440.0 },
      10: { note: "A#", frequency: 466.16 },
      11: { note: "B", frequency: 493.88 },
    };
  }
}

function getScaleNotes(tonicNote: number, scale: Scale, useSharps = false) {
  const notes = [];
  for (let i = 0; i < scale.intervals.length; i++) {
    const interval = scale.intervals[i];
    notes.push((tonicNote + interval) % 12);
  }
  const noteNames = useSharps
    ? ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    : ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

  const mainNotes = notes.map((note) => ({
    note: noteNames[note],
    frequency: scale.notes[note].frequency,
  }));

  const allNoteNames = noteNames.slice(0, 12); // Get first 12 notes
  const allNotes = allNoteNames.map((noteName) => ({
    note: noteName,
    //@ts-ignore
    frequency: scale.notes[tonics[noteName]].frequency,
  }));
  const complementaryNotes = allNotes.filter((note) => {
    return !mainNotes.some((n) => {
      return n.note === note.note;
    });
  });
  return {
    mainNotes,
    complementaryNotes,
  };
}

const scales = {
  ionian: new Scale("Ionian", [0, 2, 4, 5, 7, 9, 11]),
  dorian: new Scale("Dorian", [0, 2, 3, 5, 7, 9, 10]),
  phrygian: new Scale("Phrygian", [0, 1, 3, 5, 7, 8, 10]),
  lydian: new Scale("Lydian", [0, 2, 4, 6, 7, 9, 11]),
  mixolydian: new Scale("Mixolydian", [0, 2, 4, 5, 7, 9, 10]),
  aeolian: new Scale("Aeolian", [0, 2, 3, 5, 7, 8, 10]),
  locrian: new Scale("Locrian", [0, 1, 3, 5, 6, 8, 10]),
};

const tonics = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

const tonicNotes = [
  "C",
  "C#/Db",
  "D",
  "D#/Eb",
  "E",
  "F",
  "F#/Gb",
  "G",
  "G#/Ab",
  "A",
  "A#/Bb",
  "B",
];

const tonicNoteLookup = {
  "C#": "Db",
  Db: "C#",
  "D#": "Eb",
  Eb: "D#",
  "F#": "Gb",
  Gb: "F#",
  "G#": "Ab",
  Ab: "G#",
  "A#": "Bb",
  Bb: "A#",
};
