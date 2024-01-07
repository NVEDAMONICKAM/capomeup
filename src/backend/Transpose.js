import { oldKeys, newKeys } from "./Keys.js";

export function transpose(text, method, accidental) {
	if (text == '') return '';

	const openChar = '\u203B';
	const closeChar = '\u203B';

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
			const modifiedText = transpose(text, 'upsemi', accidental);
			text = modifiedText;
			diff = 11;
			break;
		default:
			return null;
	}

	// begin chord search and change 
	let index = text.indexOf(openChar);
	let trigger = index - 1;
	index++;

	while (trigger < index) {
		while (text[index] != closeChar) {
			let newKeyIndex = getKeyIndex(text[index]);
			if ((newKeyIndex != -1) && !isWord(text, index)) {
				if (text[index + 1] == 'b' || text[index + 1] == '#') {
					newKeyIndex = (getKeyIndex(text[index] + text[index + 1]) + diff) % 12;
					text = text.slice(0, index + 1) + text.slice(index + 2);
					text = setCharAt(text, index, newKeys[newKeyIndex][accidental]);
				} else {
					newKeyIndex = (newKeyIndex + diff) % 12;
					text = setCharAt(text, index, newKeys[newKeyIndex][accidental]);
				}
			}
			index++;
		}
		index++;
		index = text.indexOf(openChar, index) + 1;
		trigger++;
	}

	return text;
}

// Helper Functions
function getKeyIndex(char) {
	for (let i = 0; i < 12; i++) {
		if (char == oldKeys[i][0] || char == oldKeys[i][1]) {
			return i;
		}
	}
	return -1;
}

function isWord(transposed, index) {
	if (transposed[index + 1] == 'H' ||
		transposed[index + 1] == 'h' ||
		transposed[index + 1] == 'R' ||
		transposed[index + 1] == 'r') {
		return true;
	}

	return false;
}

function setCharAt(str, index, chr) {
	if (index > str.length - 1) return str;
	return str.substring(0, index) + chr + str.substring(index + 1);
}
