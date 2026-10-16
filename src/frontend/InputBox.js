import React, { useState, useEffect, useRef, useCallback } from 'react';
import { colourChordsInput } from './ColourChords';
import findChords from '../backend/FindChords';
import { ReactComponent as Tick } from './svg/Tick.svg';


const InputBox = ({ onSubmit }) => {
	const [outputText, setOutputText] = useState('');
	const [method, setMethod] = useState('pure');
	const [bracketsEnabled, setBracketsEnabled] = useState(false);
	const [openInline, setOpenInline] = useState('[');
	const [closeInline, setCloseInline] = useState(']');
	const contentEditableRef = useRef(null);

	// handling enter button
	const handleKeyDown = (event) => {
		if (event.keyCode === 13) {
			event.preventDefault();

			// Manually insert the newline at the cursor position
			const selection = window.getSelection();
			if (selection.rangeCount === 0) return;
			const range = selection.getRangeAt(0);
			let newNode = null;
			newNode = document.createTextNode('\n');
			range.deleteContents();
			range.insertNode(newNode);

			// Move the cursor after the inserted newline
			range.setStartAfter(newNode);
			range.collapse(true);
			selection.removeAllRanges();
			selection.addRange(range);

		}
	};

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

	// send
	const sendText = useCallback(async () => {
		const contentEditableDiv = contentEditableRef.current;
		const text = contentEditableDiv ? contentEditableDiv.textContent : '';
		const modifiedText = await findChords(text, method, openInline, closeInline);
		setOutputText(modifiedText);
	}, [method, openInline, closeInline]);

	// useEffects
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			styleInput(contentEditableRef.current, outputText);
			onSubmit(outputText);
		}, 1000);
		return () => clearTimeout(timeoutId);
	}, [outputText, onSubmit]);

	useEffect(() => {
		sendText();
	}, [sendText]);

	return (
		<div className="input-container">
			<div
				id="editable-text"
				contentEditable='true'
				spellCheck="false"
				onInput={sendText}
				onKeyDown={handleKeyDown}
				ref={contentEditableRef}
				placeholder="Enter Chords..."
				role="textbox"
				aria-multiline="true"
				aria-label="Chord sheet input"
			/>
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

// Re-render the input with chords highlighted. The caret is only saved and
// restored when the input has focus, so clicking elsewhere during the
// debounce never moves content or steals focus.
function styleInput(contentEditableDiv, markedText) {
	if (!contentEditableDiv) return;

	const caret = getCaretOffset(contentEditableDiv);
	contentEditableDiv.innerHTML = colourChordsInput(markedText);
	if (caret !== null) {
		setCaretOffset(contentEditableDiv, caret);
	}
}

// Character offset of the caret within `root`, or null if the selection is
// not inside it.
function getCaretOffset(root) {
	const selection = window.getSelection();
	if (!selection || selection.rangeCount === 0) return null;

	const range = selection.getRangeAt(0);
	if (!root.contains(range.startContainer)) return null;

	const preSelectionRange = document.createRange();
	preSelectionRange.selectNodeContents(root);
	preSelectionRange.setEnd(range.startContainer, range.startOffset);
	return preSelectionRange.toString().length;
}

function setCaretOffset(root, offset) {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	const range = document.createRange();
	let remaining = offset;
	let node = walker.nextNode();
	let placed = false;

	while (node) {
		if (remaining <= node.length) {
			range.setStart(node, remaining);
			placed = true;
			break;
		}
		remaining -= node.length;
		node = walker.nextNode();
	}

	if (!placed) {
		// offset is past the end (or there is no text): put the caret at the end
		range.selectNodeContents(root);
		range.collapse(false);
	}
	range.collapse(true);

	const selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
}

export default InputBox;
