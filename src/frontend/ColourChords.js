import React, { useMemo } from "react";
import { toLines } from "../backend/Lines";

// Renders marked text (chords wrapped in U+203B) as one block per line with
// chords coloured. Used by both the input's highlight layer and the output,
// so their lines match one for one. Each line only re-renders when its own
// content changes, which keeps typing fast in long songs.
export const ChordLines = ({ markedText, currentLine = null }) => {
	const lines = useMemo(() => toLines(markedText).map((segments) => ({
		segments,
		signature: segments.map((s) => (s.chord ? '\u0001' : '\u0002') + s.text).join(''),
	})), [markedText]);

	return lines.map((line, index) => (
		<ChordLine
			key={index}
			segments={line.segments}
			signature={line.signature}
			current={index === currentLine}
		/>
	));
};

const ChordLine = React.memo(({ segments, current }) => (
	<div className={current ? 'chord-line chord-line--current' : 'chord-line'}>
		{segments.length === 0 ? <br /> : segments.map((segment, index) => (
			segment.chord
				? <span key={index} style={{ color: "#EFD3D9", whiteSpace: 'pre-wrap' }}>{segment.text}</span>
				: <span key={index}>{segment.text}</span>
		))}
	</div>
), (prev, next) => prev.signature === next.signature && prev.current === next.current);
