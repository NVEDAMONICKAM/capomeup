import findChords from '../FindChords';
import { transpose } from '../Transpose';

// Chord markers are U+203B; tests use '|' for readability.
const M = '※';
const show = (s) => s.split(M).join('|');
const mark = (s) => s.split('|').join(M);

const FLATS = 0;
const SHARPS = 1;

describe('findChords: pure method', () => {
	test.each([
		['', ''],
		['G D Em C', '|G| |D| |Em| |C|'],
		['Am7 Dsus4 Cmaj7 F#m7b5 Bbdim Eaug Cadd9', '|Am7| |Dsus4| |Cmaj7| |F#m7b5| |Bbdim| |Eaug| |Cadd9|'],
		['G/B C/E D/F#', '|G/B| |C/E| |D/F#|'],
		['Here comes the sun\nG  D  Em', 'Here comes the sun\n|G|  |D|  |Em|'],
		['G\n', '|G|\n'],
		['G ', '|G| '],
		['text G', 'text |G|'],
		// isWord: a key letter followed by H/h/R/r is not a chord
		['Chorus:\nC G', 'Chorus:\n|C| |G|'],
		['Bridge', 'Bridge'],
		['From', 'From'],
		// lowercase chords are intentionally ignored
		['gm am', 'gm am'],
		['hello world', 'hello world'],
		// known limitation: single-letter lyric words still look like chords
		['Am I wrong', '|Am| I wrong'],
	])('%j -> %j', async (input, expected) => {
		expect(show(await findChords(input, 'pure', '[', ']'))).toBe(expected);
	});
});

describe('findChords: indent (inline) method', () => {
	test.each([
		['[C]Hello [G/B]world', '[|C|]Hello [|G/B|]world'],
		['no brackets here', 'no brackets here'],
		['[] [Am', '[] [|Am|'],
		['[Ebm7]', '[|Ebm7|]'],
	])('%j -> %j', async (input, expected) => {
		expect(show(await findChords(input, 'indent', '[', ']'))).toBe(expected);
	});

	test('custom bracket characters', async () => {
		expect(show(await findChords('(C) la (G)', 'indent', '(', ')'))).toBe('(|C|) la (|G|)');
	});
});

describe('transpose', () => {
	test.each([
		['|C|', 'upsemi', SHARPS, '|C#|'],
		['|C|', 'upsemi', FLATS, '|Db|'],
		['|C|', 'uptone', SHARPS, '|D|'],
		['|C|', 'downsemi', SHARPS, '|B|'],
		['|C|', 'downtone', FLATS, '|Bb|'],
		['|B|', 'upsemi', SHARPS, '|C|'], // octave wrap up
		['|A|', 'uptone', SHARPS, '|B|'],
		['|Bb|', 'uptone', FLATS, '|C|'],
		['|Db|', 'downtone', SHARPS, '|B|'], // octave wrap down
		['|Am7| |F#m7b5|', 'upsemi', SHARPS, '|A#m7| |Gm7b5|'],
		['|G/B| |D/F#|', 'upsemi', SHARPS, '|G#/C| |D#/G|'], // slash basses
		['|Bbdim| |Eaug|', 'upsemi', FLATS, '|Bdim| |Faug|'],
		['|Abm|', 'upsemi', SHARPS, '|Am|'],
		// unusual spellings are read correctly
		['|E#| |Fb| |Cb| |B#|', 'upsemi', SHARPS, '|F#| |F| |C| |C#|'],
		// text outside markers is untouched
		['Hello |C| world', 'uptone', SHARPS, 'Hello |D| world'],
		['|Chord|', 'upsemi', SHARPS, '|Chord|'],
	])('%j %s (accidental %i) -> %j', (input, method, acc, expected) => {
		expect(show(transpose(mark(input), method, acc))).toBe(expected);
	});

	test('switch re-spells with the chosen accidental', () => {
		const text = mark('|C| |Db| |D| |D#| |E| |F| |F#| |G| |Ab| |A| |A#| |B|');
		expect(show(transpose(text, 'switch', FLATS))).toBe('|C| |Db| |D| |Eb| |E| |F| |Gb| |G| |Ab| |A| |Bb| |B|');
		expect(show(transpose(text, 'switch', SHARPS))).toBe('|C| |C#| |D| |D#| |E| |F| |F#| |G| |G#| |A| |A#| |B|');
	});

	test('12 semitones up returns to the original', () => {
		let text = mark('|C| |Dm7| |Em/G| |F#dim|');
		for (let i = 0; i < 12; i++) text = transpose(text, 'upsemi', SHARPS);
		expect(show(text)).toBe('|C| |Dm7| |Em/G| |F#dim|');
	});

	test('up then down returns to the original', () => {
		const original = mark('|G| |D| |Em| |C/E| |Bb|');
		const back = transpose(transpose(original, 'uptone', FLATS), 'downtone', FLATS);
		expect(show(back)).toBe('|G| |D| |Em| |C/E| |Bb|');
	});

	// Previously these looped forever and froze the tab.
	test.each(['hello world', 'gm am', 'Bridge:', '\n', ' '])('text with no chords is returned unchanged: %j', (input) => {
		expect(transpose(input, 'upsemi', SHARPS)).toBe(input);
		expect(transpose(input, 'switch', FLATS)).toBe(input);
	});

	test('unterminated marker leaves the tail untouched', () => {
		expect(show(transpose(mark('|C| |D'), 'upsemi', SHARPS))).toBe('|C#| |D');
	});

	test('empty string', () => {
		expect(transpose('', 'upsemi', SHARPS)).toBe('');
	});

	test('unicode sharp and flat symbols are understood', () => {
		expect(show(transpose(mark('|C♯| |D♭|'), 'upsemi', SHARPS))).toBe('|D| |D|');
		expect(show(transpose(mark('|B♭m|'), 'upsemi', FLATS))).toBe('|Bm|');
	});

	test('end to end: detect then transpose', async () => {
		const found = await findChords('G    D\nHere comes the sun', 'pure', '[', ']');
		expect(show(transpose(found, 'uptone', SHARPS))).toBe('|A|    |E|\nHere comes the sun');
	});
});

describe('protected words', () => {
	test.each([
		['Ending', 'Ending'],
		['ENDING', 'ENDING'],
		['ending', 'ending'],
		['Ending:', 'Ending:'],
		['[Ending]', '[Ending]'],
		['Ending 1', 'Ending 1'],
		['Ending: E  A  B7', 'Ending: |E|  |A|  |B7|'],
		['Endings', 'Endings'],
		['Coda', 'Coda'],
		['Capo 3', 'Capo 3'],
		['End', 'End'],
		['Fade out', 'Fade out'],
		['Ad lib', 'Ad lib'],
		['Ad-lib', 'Ad-lib'],
		['Bass', 'Bass'],
		['All my loving', 'All my loving'],
		['N.C.', 'N.C.'],
		['G  N.C.  D', '|G|  N.C.  |D|'],
		// only whole words are protected
		['Em Endless', '|Em| |Endless|'],
		['Cend', '|Cend|'],
		// existing H/R rule unchanged
		['Chorus', 'Chorus'],
		['Bridge', 'Bridge'],
	])('pure: %j -> %j', async (input, expected) => {
		expect(show(await findChords(input, 'pure', '[', ']'))).toBe(expected);
	});

	test.each([
		['Ending: E  A  B7', 'Ending: F  A#  C7'],
		['ENDING  G', 'ENDING  G#'],
		['Coda  C/E', 'Coda  C#/F'],
		['G  N.C.  D', 'G#  N.C.  D#'],
	])('pure, transposed +1: %j -> %j', async (input, expected) => {
		const found = await findChords(input, 'pure', '[', ']');
		expect(transpose(found, 'upsemi', SHARPS).split(M).join('')).toBe(expected);
	});

	test.each([
		['[Ending] [E]', '[Ending] [F]'],
		['[ENDING 1] [Am]', '[ENDING 1] [A#m]'],
		['[Coda] [G/B]', '[Coda] [G#/C]'],
		['[N.C.]', '[N.C.]'],
	])('inline brackets, transposed +1: %j -> %j', async (input, expected) => {
		const found = await findChords(input, 'indent', '[', ']');
		expect(transpose(found, 'upsemi', SHARPS).split(M).join('')).toBe(expected);
	});
});
