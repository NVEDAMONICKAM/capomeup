const marker = '\u203B';

// Split ※-marked text into lines, each a list of { text, chord } segments.
// Works even when a chord spans a line break (possible in Inline mode).
export function toLines(markedText) {
	const lines = [[]];
	markedText.split(marker).forEach((part, index) => {
		const chord = index % 2 === 1;
		part.split('\n').forEach((piece, pieceIndex) => {
			if (pieceIndex > 0) lines.push([]);
			if (piece !== '') lines[lines.length - 1].push({ text: piece, chord });
		});
	});
	return lines;
}
