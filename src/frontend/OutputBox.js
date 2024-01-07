import React, { useState, useEffect } from 'react';
import { colourChordsOutput } from './ColourChords';
import { outputSubmit } from '../backend/Submit';
import ToggleButton from './Toggle';
import { ReactComponent as UpTone } from './svg/UpTone.svg';
import { ReactComponent as DownTone } from './svg/DownTone.svg';
import { ReactComponent as UpSemi } from './svg/UpSemitone.svg';
import { ReactComponent as DownSemi } from './svg/DownSemitone.svg';

const OutputBox = ({ output }) => {
	const [outputText, setOutputText] = useState('');
	const [buttonValue, setButtonValue] = useState(1);

	const handleButtonChange = (newState) => {
		setButtonValue(newState);
	};

	const sendOutput = async (textToSend, method) => {
		return await outputSubmit(textToSend, method, buttonValue);
	}

	const handleSubmit = async (method) => {
		const modifiedText = await sendOutput(outputText, method);
		setOutputText(modifiedText);
	};

	useEffect(() => {
		if (outputText !== '') {
			handleSubmit('switch');
		}
	}, [buttonValue]);

	useEffect(() => {
		setOutputText(output);
	}, [output]);

	return (
		<div class="output-container">
			<button
				class="button copy-button"
				type='button'
				onClick={() => { navigator.clipboard.writeText(outputText.replace(/\u203B/g, '')) }}
			>
				COPY TO CLIPBOARD
			</button>
			<div class="output">{colourChordsOutput(outputText)} </div>
			<div class='output-buttons'>
				<div onClick={() => handleSubmit('uptone')}>
					<UpTone />
				</div>
				<div onClick={() => handleSubmit('upsemi')}>
					<UpSemi />
				</div>
				<div onClick={() => handleSubmit('downsemi')}>
					<DownSemi />
				</div>
				<div onClick={() => handleSubmit('downtone')}>
					<DownTone />
				</div>
				<ToggleButton onStateChange={handleButtonChange} />
			</div>

		</div >
	);
};

export default OutputBox;