import React, { useState, useEffect } from 'react';
import { inputSubmit } from '../backend/Submit';
import { colourChordsInput } from './ColourChords';

const InputBox = ({ onSubmit }) => {
	const [inputText, setInputText] = useState('');
	const [outputText, setOutputText] = useState('');
	const [method, setMethod] = useState('pure');
	const [bracketsEnabled, setBracketsEnabled] = useState(false);
	const [openInline, setOpenInline] = useState('[');
	const [closeInline, setCloseInline] = useState(']');

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

	const processText = async (e) => {
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
		document.getElementById('editable-text').innerHTML = styled;
		onSubmit(outputText);
	}

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			styleInput();
		}, 1000);
		return () => clearTimeout(timeoutId);
	}, [outputText]);

	useEffect(() => {
		setInputText(inputText);
		sendText(inputText);
	}, [method, bracketsEnabled, openInline, closeInline]);

	return (
		<div className="input-container">
			<div
				id="editable-text"
				contentEditable='true'
				spellCheck="false"
				onInput={processText}
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