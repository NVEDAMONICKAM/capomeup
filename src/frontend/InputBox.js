import React, { useState, useEffect, useRef } from 'react';
import { colourChordsInput } from './ColourChords';
import findChords from '../backend/FindChords';
import { ReactComponent as ArrowRight } from './svg/Arrow-Right.svg';
import { ReactComponent as Tick } from './svg/Tick.svg';


const InputBox = ({ onSubmit }) => {
	const [inputText, setInputText] = useState('');
	const [outputText, setOutputText] = useState('');
	const [method, setMethod] = useState('pure');
	const [bracketsEnabled, setBracketsEnabled] = useState(false);
	const [openInline, setOpenInline] = useState('[');
	const [closeInline, setCloseInline] = useState(']');
	const [cursorPosition, setCursorPosition] = useState(0); // Initial cursor position
	const contentEditableRef = useRef(null);
	const [inButton, setInButton] = useState(false);

	hideLoadingAnimation();

	// ai button
	const aiButton = () => {
		setMethod('ai');
		showLoadingAnimation();
	}

	// handling loading animation 
	function showLoadingAnimation() {
		const loader = document.getElementById('loading-animation');
		if (loader) {
			loader.style.display = 'inline-block';
		}
	}

	function hideLoadingAnimation() {
		const loader = document.getElementById('loading-animation');
		if (loader) {
			loader.style.display = 'none';
		}
	}

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
		setInButton(true);
	}

	const handleCloseChange = (e) => {
		setCloseInline(e.target.value)
		setInButton(true);
	}

	const handleCheckboxChange = (e) => {
		setMethod(e.target.checked ? 'indent' : 'pure');
		setBracketsEnabled(e.target.checked);
		setInButton(true);
	};

	// send
	const sendText = async () => {
		const text = getContent();
		setInputText(text);
		const modifiedText = await findChords(text, method, openInline, closeInline);
		setOutputText(modifiedText);
	};

	// style
	const styleInput = () => {
		const styled = colourChordsInput(outputText);
		hideLoadingAnimation();
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
		if (inButton) {
			contentEditableDiv.innerHTML = newContent;
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

		if (!contentEditableDiv || inputText == '' || inButton) {
			setInButton(false);
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

	// useEffects
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			styleInput();
			onSubmit(outputText);
		}, 1000);
		return () => clearTimeout(timeoutId);
	}, [outputText]);

	useEffect(() => {
		sendText();
	}, [method, openInline, closeInline]);

	return (
		<div class="input-container">
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

				<div class="group group-1">
					<span class="tooltip">
						<span class="text-1">Only detects chords within brackets.</span>
						<br></br>
						<br></br>
						<span class="text-2"> I get <span class="text-1">[A6]</span> eaten by the worms, and weird <span class="text-1">[Gmaj7]</span> fishes.</span>
						<div class="triangle-down"></div>
					</span>

					<input
						type="checkbox"
						id="mycheckbox"
						onChange={handleCheckboxChange}
						class="hidden-checkbox"
					/>

					<label for="mycheckbox" class="checkbox-container">
						<span class="checkmark">
							<Tick class='tick' />
						</span>
					</label>

					<label for="mycheckbox" class="inline-text">Inline Chords</label>
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
				<div class="group group-2">
					<label for="aiButton" class='ai-text'>
						AI<sup>beta</sup>
					</label>
					<button class='ai-button' type="button" id='aiButton' onClick={() => aiButton}>
						<ArrowRight class='arrow-right' />
					</button>
				</div>

			</div>

			<div id="loading-animation" class="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>

		</div>
	);
};

export default InputBox;