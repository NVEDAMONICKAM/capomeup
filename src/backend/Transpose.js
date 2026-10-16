import { oldKeys, newKeys } from "./Keys.js";

const marker = '※';

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
			text = transpose(text, 'upsemi', accidental);
			diff = 11;
			break;
		default:
			return null;
	}

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
	if (char === '♭') return 'b'; // ♭
	if (char === '♯') return '#'; // ♯
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

function isWord(transposed, index) {
	if (transposed[index + 1] === 'H' ||
		transposed[index + 1] === 'h' ||
		transposed[index + 1] === 'R' ||
		transposed[index + 1] === 'r') {
		return true;
	}

	return false;
}
