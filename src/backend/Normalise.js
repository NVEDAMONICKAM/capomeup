// Clean up pasted text (e.g. from Apple Notes) without changing its layout:
// every line break becomes \n, every space-like character becomes exactly one
// ordinary space (so chords stay aligned over lyrics), and invisible
// characters are removed. Tabs, quotes and everything else are left alone.
export function normaliseText(text) {
	return text
		.replace(/\r\n?/g, '\n')
		.replace(/[\u2028\u2029]/g, '\n')
		.replace(/[\u00A0\u2007\u202F]/g, ' ')
		.replace(/[\u200B\u200C\u200D\u2060\uFEFF\u00AD]/g, '');
}
