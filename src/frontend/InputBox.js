import React, { useState, useEffect, useMemo, useRef } from 'react';
import { colourChordsOutput } from './ColourChords';
import findChords from '../backend/FindChords';
import { normaliseText } from '../backend/Normalise';
import { ReactComponent as Tick } from './svg/Tick.svg';


// The input is a plain <textarea> with transparent text laid exactly over a
// highlight layer that draws the same text with chords coloured. The browser
// handles typing, Enter, undo/redo, selection and mobile keyboards natively;
// we never rewrite the text under the caret.
const InputBox = ({ onSubmit }) => {
	const [text, setText] = useState('');
	const [method, setMethod] = useState('pure');
	const [bracketsEnabled, setBracketsEnabled] = useState(false);
	const [openInline, setOpenInline] = useState('[');
	const [closeInline, setCloseInline] = useState(']');
	const textareaRef = useRef(null);

	const markedText = useMemo(
		() => findChords(text, method, openInline, closeInline),
		[text, method, openInline, closeInline]
	);

	// Inline button
	const handleOpenChange = (e) => {
		setOpenInline(e.target.value)
	}

	const handleCloseChange = (e) => {
		setCloseInline(e.target.value)
	}

	const handleCheckboxChange = (e) => {
		setMethod(e.target.checked ? 'indent' : 'pure');
		setBracketsEnabled(e.target.checked);
	};

	// Paste plain text only, cleaned up (e.g. Apple Notes uses NBSPs and
	// U+2028 line separators) but with its spacing and lines kept.
	const handlePaste = (e) => {
		const pasted = e.clipboardData && e.clipboardData.getData('text/plain');
		if (!pasted) return;
		e.preventDefault();
		insertText(textareaRef.current, normaliseText(pasted));
	};

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			onSubmit(markedText);
		}, 1000);
		return () => clearTimeout(timeoutId);
	}, [markedText, onSubmit]);

	return (
		<div className="input-container">
			<div className="editor">
				<div className="editor-highlight" aria-hidden="true">
					{colourChordsOutput(markedText)}
					{/* keeps a line box for a trailing newline so the caret has somewhere to go */}
					{' '}
				</div>
				<textarea
					id="editable-text"
					ref={textareaRef}
					value={text}
					onChange={(e) => setText(e.target.value)}
					onPaste={handlePaste}
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
							disabled={!bracketsEnabled}
							onChange={handleOpenChange}
							onFocus={(e) => e.target.select()}
						/>
						<input
							className='bracket2'
							type="text"
							defaultValue="]"
							maxLength={1}
							aria-label="Closing bracket character"
							disabled={!bracketsEnabled}
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
