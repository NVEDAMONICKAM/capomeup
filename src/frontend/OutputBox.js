import React, { useState, useEffect } from 'react';
import { colourChordsOutput } from './ColourChords';
import ToggleButton from './Toggle';
import { ReactComponent as UpTone } from './svg/UpTone.svg';
import { ReactComponent as DownTone } from './svg/DownTone.svg';
import { ReactComponent as UpSemi } from './svg/UpSemitone.svg';
import { ReactComponent as DownSemi } from './svg/DownSemitone.svg';
import { transpose } from '../backend/Transpose';


const OutputBox = ({ output, method }) => {
	const [outputText, setOutputText] = useState('');
	const [buttonValue, setButtonValue] = useState(1);

	const handleButtonChange = (newState) => {
		setButtonValue(newState);
	};

	const sendOutput = async (textToSend, method) => {
		return await transpose(textToSend, method, buttonValue);
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
		<div class='output-container'>
			<div class='copy-button-container'>
				<button
					id='copy-button'
					class='button copy-button'
					type='button'
					onClick={() => { navigator.clipboard.writeText(outputText.replace(/\u203B/g, '')) }}
				>
					<label class='copy-text' for='copy-button'>
						COPY TO CLIPBOARD
					</label>
				</button>
			</div >

			<div class='output'>{colourChordsOutput(outputText)} </div>
			<div class='output-buttons'>
				<div class='button' onClick={() => handleSubmit('uptone')}>
					<UpTone />
				</div>
				<div class='button' onClick={() => handleSubmit('upsemi')}>
					<UpSemi />
				</div>
				<div class='button' onClick={() => handleSubmit('downsemi')}>
					<DownSemi />
				</div>
				<div class='button' onClick={() => handleSubmit('downtone')}>
					<DownTone />
				</div >
				<div class='button'>
					<ToggleButton onStateChange={handleButtonChange} />
				</div>
			</div>

		</div >
	);
};

export default OutputBox;