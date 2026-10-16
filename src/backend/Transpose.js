import { oldKeys, newKeys } from "./Keys.js";
import { isWord, protectedWordLength } from "./Words.js";

const marker = '\u203B';

export function transpose(text, method, accidental) {
	if (text === '') return '';

	let diff;
	switch (method) {
		case 'uptone':
			diff = 2;
			break;
		case 'upsemi':
			diff = 1;
			break;
		case 'downsemi':
			diff = 11;
			break;
		case 'downtone':
			diff = 10;
			break;
		case 'switch':
			diff = 0; // re-spell only
			break;
		default:
			return null;
	}

	return transposeBy(text, diff, accidental);
}

// Transpose every chord by `semitones` (any integer; 0 re-spells the chords
// with the chosen accidental). Text outside chord markers is untouched.
export function transposeBy(text, semitones, accidental) {
	const diff = ((semitones % 12) + 12) % 12;

	// transpose the contents of each ※chord※ pair, copying everything else as-is
	let result = '';
	let index = 0;
	while (index < text.length) {
		const open = text.indexOf(marker, index);
		const close = open === -1 ? -1 : text.indexOf(marker, open + 1);
		if (close === -1) {
			result += text.slice(index);
			break;
		}

		result += text.slice(index, open + 1);
		result += transposeChord(text.slice(open + 1, close), diff, accidental);
		result += marker;
		index = close + 1;
	}

	return result;
}

function transposeChord(chord, diff, accidental) {
	let result = '';
	for (let i = 0; i < chord.length; i++) {
		const protectedLength = protectedWordLength(chord, i);
		if (protectedLength > 0) {
			result += chord.substr(i, protectedLength);
			i += protectedLength - 1;
			continue;
		}

		let keyIndex = getKeyIndex(chord[i]);
		if (keyIndex === -1 || isWord(chord, i)) {
			result += chord[i];
			continue;
		}

		const next = normaliseAccidental(chord[i + 1]);
		if (next === 'b' || next === '#') {
			keyIndex = getKeyIndex(chord[i] + next);
			i++;
		}
		result += newKeys[(keyIndex + diff) % 12][accidental];
	}
	return result;
}

// Helper Functions
function normaliseAccidental(char) {
	if (char === '\u266D') return 'b'; // ♭
	if (char === '\u266F') return '#'; // ♯
	return char;
}

function getKeyIndex(char) {
	for (let i = 0; i < 12; i++) {
		if (char === oldKeys[i][0] || char === oldKeys[i][1]) {
			return i;
		}
	}
	return -1;
}
