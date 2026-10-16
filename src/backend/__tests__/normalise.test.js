import { normaliseText } from '../Normalise';
import findChords from '../FindChords';

const M = '\u203B';
const show = (s) => s.split(M).join('|');

// What Apple Notes typically puts on the clipboard as text/plain (constructed
// from known Notes/WebKit behaviour, not captured from a device): runs of
// spaces alternate NBSP and space, soft returns are U+2028, lines end in CRLF,
// and stray zero-width characters can appear.
const NOTES_PLAIN = 'Verse 1\u2028G\u00A0 \u00A0 \u00A0D\u00A0 \u00A0 \u00A0Em\r\nHere comes the sun\u200B\r\n\r\nAm\u00A0 \u00A0F';

describe('normaliseText', () => {
	test.each([
		['plain ascii is unchanged', 'G  D\nHello', 'G  D\nHello'],
		['CRLF -> LF', 'G\r\nD\r\n', 'G\nD\n'],
		['lone CR -> LF', 'G\rD', 'G\nD'],
		['line separator -> LF', 'G\u2028D', 'G\nD'],
		['paragraph separator -> LF', 'G\u2029D', 'G\nD'],
		['NBSP -> space, one for one', 'G\u00A0\u00A0\u00A0D', 'G   D'],
		['narrow NBSP and figure space -> space', 'G\u202FD\u2007E', 'G D E'],
		['zero-width characters removed', '\uFEFFG\u200B D\u200C\u200D\u2060', 'G D'],
		['soft hyphen removed', 'Hal\u00ADle\u00ADlu\u00ADjah', 'Hallelujah'],
		['tabs kept', 'G\tD', 'G\tD'],
		['smart quotes kept', '\u2018Tis the \u201Cseason\u201D', '\u2018Tis the \u201Cseason\u201D'],
		['unicode sharp/flat kept', 'C\u266F D\u266D', 'C\u266F D\u266D'],
		['blank lines and trailing newline kept', 'G\n\n\nD\n', 'G\n\n\nD\n'],
		['leading/trailing spaces kept', '   G   ', '   G   '],
		['empty', '', ''],
	])('%s', (name, input, expected) => {
		expect(normaliseText(input)).toBe(expected);
	});

	test('Notes fixture keeps line structure and spacing', () => {
		expect(normaliseText(NOTES_PLAIN)).toBe('Verse 1\nG     D     Em\nHere comes the sun\n\nAm   F');
	});

	test('Notes fixture: chords detected correctly after normalising', async () => {
		const found = await findChords(normaliseText(NOTES_PLAIN), 'pure', '[', ']');
		expect(show(found)).toBe('Verse 1\n|G|     |D|     |Em|\nHere comes the sun\n\n|Am|   |F|');
	});
});

describe('chord tokens end at any whitespace', () => {
	test.each([
		['G\u00A0D', '|G|\u00A0|D|'],
		['C\tG', '|C|\t|G|'],
		['Cm\r\nD', '|Cm|\r\n|D|'],
		['G\u2028Em', '|G|\u2028|Em|'],
	])('%j -> %j', async (input, expected) => {
		expect(show(await findChords(input, 'pure', '[', ']'))).toBe(expected);
	});
});
