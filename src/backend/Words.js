// Words that start with a chord letter but must never be read as a chord
// or transposed. Matched case-insensitively as whole words, so "Ending",
// "ENDING", "Ending:", "[Ending]" and "Ending 1" are all protected, but
// "Endless" is not. Longer entries must come before their prefixes.
export const PROTECTED_WORDS = [
	'endings',
	'ending',
	'end',
	'coda',
	'capo',
	'fade',
	'ad', // "Ad lib", "Ad-lib"
	'bass',
	'all',
	'n.c.',
	'n.c',
];

// Length of the protected word starting at text[index], or 0 if none.
export function protectedWordLength(text, index) {
	if (isLetter(text[index - 1])) return 0;

	for (const word of PROTECTED_WORDS) {
		const candidate = text.substr(index, word.length);
		if (candidate.toLowerCase() === word && !isLetter(text[index + word.length])) {
			return word.length;
		}
	}
	return 0;
}

// A chord letter followed by H/h/R/r starts a word (Chorus, Bridge, From...)
export function isWord(text, index) {
	const next = text[index + 1];
	return next === 'H' || next === 'h' || next === 'R' || next === 'r';
}

function isLetter(char) {
	return char !== undefined && /\p{L}/u.test(char);
}
