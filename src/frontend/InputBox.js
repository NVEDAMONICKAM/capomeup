import React, { useRef } from 'react';
import { ChordLines } from './ColourChords';
import { normaliseText } from '../backend/Normalise';
import { ReactComponent as Tick } from './svg/Tick.svg';


// The input is a plain <textarea> with transparent text laid exactly over a
// highlight layer that draws the same text with chords coloured. The browser
// handles typing, Enter, undo/redo, selection and mobile keyboards natively;
// we never rewrite the text under the caret.
const InputBox = ({ text, markedText, onTextChange, inline, onInlineChange, onCaretLineChange }) => {
	const textareaRef = useRef(null);

	// Inline button
	const handleOpenChange = (e) => {
		onInlineChange({ ...inline, open: e.target.value });
	}

	const handleCloseChange = (e) => {
		onInlineChange({ ...inline, close: e.target.value });
	}

	const handleCheckboxChange = (e) => {
		onInlineChange({ ...inline, enabled: e.target.checked });
	};

	// which line the caret is on, so the output can highlight it
	const reportCaretLine = (e) => {
		const textarea = e.target;
		onCaretLineChange(textarea.value.slice(0, textarea.selectionStart).split('\n').length - 1);
	};

	// Paste plain text only, cleaned up (e.g. Apple Notes uses NBSPs and
	// U+2028 line separators) but with its spacing and lines kept.
	const handlePaste = (e) => {
		const pasted = e.clipboardData && e.clipboardData.getData('text/plain');
		if (!pasted) return;
		e.preventDefault();
		insertText(textareaRef.current, normaliseText(pasted));
	};

	return (
		<div className="input-container">
			<div className="editor">
				<div className="editor-highlight" aria-hidden="true">
					<ChordLines markedText={markedText} />
				</div>
				<textarea
					id="editable-text"
					ref={textareaRef}
					value={text}
					onChange={(e) => onTextChange(e.target.value)}
					onPaste={handlePaste}
					onSelect={reportCaretLine}
					onFocus={reportCaretLine}
					onBlur={() => onCaretLineChange(null)}
					placeholder="Enter Chords..."
					aria-label="Chord sheet input"
					spellCheck="false"
					autoCapitalize="off"
					autoCorrect="off"
					autoComplete="off"
				/>
			</div>
			<div className="rounded-box">

				<div className="group group-1">
					<span className="tooltip">
						<span className="text-1">Only detects chords within brackets.</span>
						<br></br>
						<br></br>
						<span className="text-2"> I get <span className="text-1">[A6]</span> eaten by the worms, and weird <span className="text-1">[Gmaj7]</span> fishes.</span>
						<div className="triangle-down"></div>
					</span>

					<input
						type="checkbox"
						id="mycheckbox"
						onChange={handleCheckboxChange}
						className="hidden-checkbox"
					/>

					<label htmlFor="mycheckbox" className="checkbox-container">
						<span className="checkmark">
							<Tick className='tick' />
						</span>
					</label>

					<label htmlFor="mycheckbox" className="inline-text">Inline Chords</label>
					<div className='brackets'>
						<input
							className='bracket1'
							type="text"
							defaultValue="["
							maxLength={1}
							aria-label="Opening bracket character"
							disabled={!inline.enabled}
							onChange={handleOpenChange}
							onFocus={(e) => e.target.select()}
						/>
						<input
							className='bracket2'
							type="text"
							defaultValue="]"
							maxLength={1}
							aria-label="Closing bracket character"
							disabled={!inline.enabled}
							onChange={handleCloseChange}
							onFocus={(e) => e.target.select()}
						/>
					</div>
				</div>
			</div>

		</div>
	);
};

// Insert text at the caret the way typing would, so it lands in the undo
// history and fires the normal input/change events.
function insertText(textarea, text) {
	textarea.focus();
	if (document.execCommand && document.execCommand('insertText', false, text)) return;

	textarea.setRangeText(text, textarea.selectionStart, textarea.selectionEnd, 'end');
	textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

export default InputBox;
