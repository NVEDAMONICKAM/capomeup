import React, { useState, useEffect, useRef } from 'react';
import { inputSubmit } from '../backend/Submit';
import { colourChordsInput } from './ColourChords';

const InputBox = ({ onSubmit }) => {
	const [inputText, setInputText] = useState('');
	const [outputText, setOutputText] = useState('');
	const [method, setMethod] = useState('pure');
	const [bracketsEnabled, setBracketsEnabled] = useState(false);
	const [openInline, setOpenInline] = useState('[');
	const [closeInline, setCloseInline] = useState(']');
	const [cursorPosition, setCursorPosition] = useState(0); // Initial cursor position
	const contentEditableRef = useRef(null);
	const [inBracket, setInBracket] = useState(false);

	// handling enter button
	const handleKeyDown = (event) => {
		if (event.keyCode === 13) {
			event.preventDefault();

			// Manually insert the newline at the cursor position
			const selection = window.getSelection();
			const range = selection.getRangeAt(0);
			let newNode = null;
			newNode = document.createTextNode('\n');
			range.deleteContents();
			range.insertNode(newNode);

			// Move the cursor after the inserted 'a'
			range.setStartAfter(newNode);
			range.collapse(true);
			selection.removeAllRanges();
			selection.addRange(range);

		}
	};

	// Inline button
	const handleOpenChange = (e) => {
		setOpenInline(e.target.value)
		setInBracket(true);
	}

	const handleCloseChange = (e) => {
		setCloseInline(e.target.value)
		setInBracket(true);
	}

	const handleCheckboxChange = (e) => {
		setMethod(e.target.checked ? 'indent' : 'pure');
		setBracketsEnabled(e.target.checked);
	};

	// send
	const sendText = async () => {
		const text = getContent();
		setInputText(text);
		const modifiedText = await inputSubmit(text, method, openInline, closeInline);
		setOutputText(modifiedText);
	};

	// style
	const styleInput = () => {
		const styled = colourChordsInput(outputText);
		setContent(styled);
		setCursor(cursorPosition, styled);
	}

	// content editable div
	const getContent = () => {
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);

			// cursor
			const preSelectionRange = range.cloneRange();
			preSelectionRange.selectNodeContents(contentEditableRef.current);
			preSelectionRange.setEnd(range.startContainer, range.startOffset);
			const startOffset = preSelectionRange.toString().length;
			setCursorPosition(startOffset);

			// get text
			const contentEditableDiv = contentEditableRef.current;
			if (contentEditableDiv) {
				return contentEditableDiv.textContent || contentEditableDiv.innerText || '';
			}
			return '';
		}
		return '';
	};

	const setContent = (newContent) => {
		// clear input
		const contentEditableDiv = contentEditableRef.current;
		contentEditableDiv.textContent = ''

		// insert new input
		if (inBracket) {
			contentEditableDiv.textContent = newContent;
			return;
		}

		const selection = window.getSelection();
		if (selection && selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			const fragment = range.createContextualFragment(newContent);
			range.deleteContents();
			range.insertNode(fragment);
		}
	};

	const setCursor = (position) => {
		const contentEditableDiv = contentEditableRef.current;

		if (!contentEditableDiv || inputText == '' || inBracket) {
			setInBracket(false);
			return;
		}

		// Set the cursor position
		const selection = window.getSelection();
		const range = document.createRange();

		const textNodes = contentEditableDiv.childNodes;

		let textLength = 0;
		let nodeIndex = 0;

		while (textLength + (textNodes[nodeIndex].textContent || textNodes[nodeIndex].innerHTML).length < position) {
			textLength += (textNodes[nodeIndex].textContent || textNodes[nodeIndex].innerHTML).length;
			nodeIndex++;
		}

		const targetNode = textNodes[nodeIndex];
		const textBeforePosition = (targetNode.textContent || targetNode.innerHTML).substring(0, position - textLength);
		const textAfterPosition = (targetNode.textContent || targetNode.innerHTML).substring(position - textLength);

		// Split the node at the cursor position and insert a new text node
		if (textBeforePosition !== '') {
			targetNode.textContent = textBeforePosition;
		}

		const newNode = document.createTextNode(textAfterPosition);
		targetNode.parentNode.insertBefore(newNode, targetNode.nextSibling);

		range.setStart(newNode, 0);
		range.collapse(true);

		selection.removeAllRanges();
		selection.addRange(range);
	};

	// use Effects
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			styleInput();
			onSubmit(outputText);
		}, 1000);
		return () => clearTimeout(timeoutId);
	}, [outputText]);

	useEffect(() => {
		sendText();
	}, [method, openInline, closeInline, inBracket]);

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
			/>
			<div class="rounded-box">
				<div id="group-1" class="group">
					<div class='checkbox'>
						<input
							type="checkbox"
							onChange={handleCheckboxChange}
						/>
					</div>
					<p class="text">Inline Chords</p>
					<div class='brackets'>
						<input
							class='bracket1'
							type="text"
							defaultValue="["
							disabled={!bracketsEnabled}
							onChange={handleOpenChange}
						/>
						<input
							class='bracket2'
							type="text"
							defaultValue="]"
							disabled={!bracketsEnabled}
							onChange={handleCloseChange}
						/>
					</div>
				</div>
				<div id="group-2" class="group">
					<button className='ai-button' type="button" onClick={() => alert("Sorry, this function is unavailable right now.")}>
						AI<sup>beta</sup>
					</button>
				</div>

			</div>


		</div>
	);
};

export default InputBox;