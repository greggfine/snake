// Define the Scale class
class Scale {
  constructor(name, intervals) {
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

// Define your scales
const ionianScale = new Scale("Major", [0, 2, 4, 5, 7, 9, 11]);
const dorianScale = new Scale("Dorian", [0, 2, 3, 5, 7, 9, 10]);

// Define a function to get the notes in a scale
function getScaleNotes(rootNote, scale) {
  const notes = [];
  for (let i = 0; i < scale.intervals.length; i++) {
    const interval = scale.intervals[i];
    notes.push((rootNote + interval) % 12);
  }
  return notes.map((note) => ({
    note: scale.notes[note].note,
    frequency: scale.notes[note].frequency,
  }));
}

const cMajorNotes = getScaleNotes(0, ionianScale); // [0, 2, 4, 5, 7, 9, 11]
const cDorianNotes = getScaleNotes(0, dorianScale); // [0, 2, 4, 5, 7, 9, 11]

const notCMajorNotes = [
  { note: "C#", frequency: 277.18 },
  { note: "Db", frequency: 277.18 },
  { note: "D#", frequency: 311.13 },
  { note: "Eb", frequency: 311.13 },
  { note: "F#", frequency: 369.99 },
  { note: "Gb", frequency: 369.99 },
  { note: "G#", frequency: 415.3 },
  { note: "Ab", frequency: 415.3 },
  { note: "A#", frequency: 466.16 },
  { note: "Bb", frequency: 466.16 },
];

const notCDorianNotes = [
  { note: "C#", frequency: 277.18 },
  { note: "Db", frequency: 277.18 },
  { note: "E", frequency: 329.63 },
  { note: "F#", frequency: 369.99 },
  { note: "Gb", frequency: 369.99 },
  { note: "G#", frequency: 415.3 },
  { note: "Ab", frequency: 415.3 },
];
