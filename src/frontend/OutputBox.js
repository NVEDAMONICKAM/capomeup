import React, { useState, useEffect } from 'react';
import { colourChordsOutput } from './ColourChords';
import ToggleButton from './Toggle';
import { ReactComponent as UpTone } from './svg/UpTone.svg';
import { ReactComponent as DownTone } from './svg/DownTone.svg';
import { ReactComponent as UpSemi } from './svg/UpSemitone.svg';
import { ReactComponent as DownSemi } from './svg/DownSemitone.svg';
import { transpose } from '../backend/Transpose';


const transposeButtons = [
	{ method: 'uptone', label: 'Transpose up a tone', Icon: UpTone },
	{ method: 'upsemi', label: 'Transpose up a semitone', Icon: UpSemi },
	{ method: 'downsemi', label: 'Transpose down a semitone', Icon: DownSemi },
	{ method: 'downtone', label: 'Transpose down a tone', Icon: DownTone },
];

const OutputBox = ({ output }) => {
	const [outputText, setOutputText] = useState('');
	const [buttonValue, setButtonValue] = useState(1);

	// re-spell the current chords with the newly chosen sharps/flats
	const handleButtonChange = (newState) => {
		setButtonValue(newState);
		setOutputText((text) => transpose(text, 'switch', newState));
	};

	const handleSubmit = (method) => {
		setOutputText((text) => transpose(text, method, buttonValue));
	};

	const handleButtonKeyDown = (event, method) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleSubmit(method);
		}
	};

	useEffect(() => {
		setOutputText(output);
	}, [output]);

	return (
		<div className='output-container'>
			<div className='copy-button-container'>
				<button
					id='copy-button'
					className='button copy-button'
					type='button'
					aria-label='Copy to clipboard'
					onClick={() => copyToClipboard(outputText.replace(/※/g, ''))}
				>
					<span className='copy-text'>
						COPY TO CLIPBOARD
					</span>
				</button>
			</div >

			<div className='output'>{colourChordsOutput(outputText)}</div>
			<div className='output-buttons'>
				{transposeButtons.map(({ method, label, Icon }) => (
					<div
						key={method}
						className='button'
						role='button'
						tabIndex={0}
						aria-label={label}
						onClick={() => handleSubmit(method)}
						onKeyDown={(event) => handleButtonKeyDown(event, method)}
					>
						<Icon aria-hidden='true' />
					</div>
				))}
				<div className='button'>
					<ToggleButton onStateChange={handleButtonChange} />
				</div>
			</div>

		</div >
	);
};

// navigator.clipboard needs a secure context and is missing on some older
// mobile browsers, so fall back to a hidden textarea + execCommand.
function copyToClipboard(text) {
	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
	} else {
		legacyCopy(text);
	}
}

function legacyCopy(text) {
	const textarea = document.createElement('textarea');
	textarea.value = text;
	textarea.setAttribute('readonly', '');
	textarea.style.position = 'fixed';
	textarea.style.opacity = '0';
	document.body.appendChild(textarea);
	textarea.select();
	try {
		document.execCommand('copy');
	} catch (e) {
		// nothing more we can do
	}
	document.body.removeChild(textarea);
}

export default OutputBox;
