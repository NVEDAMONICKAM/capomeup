import { oldKeys } from "./Keys.js";

// placeholders
const openPlaceHolder = '\u203B';
const closePlaceHolder = '\u203B';

function findChords(inputText, method, open, close) {
	switch (method) {
		case 'indent':
			return indentMethod(inputText, open, close);
		case 'pure':
			return pureMethod(inputText);
		default:
			return 'error'
	}
}

function indentMethod(text, openChar, closeChar) {
	let modifiedText = '';

	for (let i = 0; i < text.length; i++) {
		modifiedText += text[i];
		if (text[i] === openChar) {
			modifiedText += openPlaceHolder;
			if (text[i + 1] == undefined) {
				return modifiedText += closePlaceHolder;
			}
			i++;
			while (text[i] != closeChar) {
				if (text[i] == undefined) {
					return modifiedText += closePlaceHolder;
				}
				modifiedText += text[i];
				i++;
			}
			modifiedText += closePlaceHolder + text[i];
		}
	}

	modifiedText = (modifiedText);

	return modifiedText;
}

function pureMethod(text) {
	let modifiedText = '';
	for (let i = 0; i < text.length; i++) {
		if (isKey(text[i]) && !isWord(text, i)) {
			modifiedText += openPlaceHolder + text[i];
			if (text[i + 1] == undefined) {
				return modifiedText += closePlaceHolder;
			}

			i++;
			while ((text[i] != ' ') && (text[i] != '\n')) {
				if (text[i] == undefined) {
					return modifiedText += closePlaceHolder;
				}
				modifiedText += text[i];
				i++;
			}

			modifiedText += closePlaceHolder + text[i];
		} else {
			modifiedText += text[i];
		}
	}

	modifiedText = modifiedText;

	return modifiedText;
}

// Helper functions
function isKey(char) {
	for (let i = 0; i < 12; i++) {
		if (char == oldKeys[i][0] || char == oldKeys[i][1]) {
			return true;
		}
	}
	return false;
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

export default findChords;