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

	const insertHtmlIntoContentEditable = (htmlString) => {
		// clear input
		document.getElementById('editable-text').innerHTML = '';

		// insert new input
		const range = window.getSelection().getRangeAt(0);
		const fragment = range.createContextualFragment(htmlString);
		range.deleteContents();
		range.insertNode(fragment);
	};

	const setCursor = (position, htmlString) => {
		const contentEditableDiv = contentEditableRef.current;

		if (!contentEditableDiv || !htmlString) {
			return;
		}

		// Insert the HTML string into the contenteditable div
		insertHtmlIntoContentEditable(htmlString);

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

	// begin send
	const processText = async (e) => {
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			const preSelectionRange = range.cloneRange();
			preSelectionRange.selectNodeContents(contentEditableRef.current);
			preSelectionRange.setEnd(range.startContainer, range.startOffset);
			const startOffset = preSelectionRange.toString().length;
			setCursorPosition(startOffset);
			console.log("startOffset: ", startOffset);
		}

		const text = e.target.textContent;
		setInputText(text);
		sendText(text);
	};

	const sendText = async (text) => {
		const modifiedText = await inputSubmit(text, method, openInline, closeInline);
		if (modifiedText !== null) {
			setOutputText(modifiedText);
		} else {
			console.log('Error occurred during form submission');
		}
	}

	const styleInput = () => {
		const styled = colourChordsInput(outputText);

		setCursor(cursorPosition, styled);
		onSubmit(outputText);
	}


	useEffect(() => {
		const timeoutId = setTimeout(() => {
			styleInput();
		}, 1000);
		return () => clearTimeout(timeoutId);
	}, [outputText]);

	useEffect(() => {
		sendText(inputText);
	}, [method, bracketsEnabled, openInline, closeInline]);

	return (
		<div className="input-container">
			<div
				id="editable-text"
				contentEditable='true'
				spellCheck="false"
				onInput={processText}
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