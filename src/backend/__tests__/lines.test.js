import { toLines } from '../Lines';

const mark = (s) => s.split('|').join('\u203B');
const flat = (lines) => lines.map((line) => line.map((seg) => (seg.chord ? `[${seg.text}]` : seg.text)).join(''));

describe('toLines', () => {
	test.each([
		['', ['']],
		['plain text', ['plain text']],
		['|G|  |D|\nHere comes', ['[G]  [D]', 'Here comes']],
		['a\n\nb\n', ['a', '', 'b', '']],
		['|Am|\n|F|', ['[Am]', '[F]']],
		// a chord spanning a newline (unclosed bracket in Inline mode)
		['[|Am\nfoo|]', ['[[Am]', '[foo]]']],
	])('%j', (input, expected) => {
		expect(flat(toLines(mark(input)))).toEqual(expected);
	});

	test('line count always matches the input text', () => {
		const text = 'G D\n\nHello\nEm';
		expect(toLines(mark('|G| |D|\n\nHello\n|Em|')).length).toBe(text.split('\n').length);
	});
});
