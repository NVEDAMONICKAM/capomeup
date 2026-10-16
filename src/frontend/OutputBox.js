import React from 'react';
import { ChordLines } from './ColourChords';
import ToggleButton from './Toggle';
import { ReactComponent as UpTone } from './svg/UpTone.svg';
import { ReactComponent as DownTone } from './svg/DownTone.svg';
import { ReactComponent as UpSemi } from './svg/UpSemitone.svg';
import { ReactComponent as DownSemi } from './svg/DownSemitone.svg';


const transposeButtons = [
	{ delta: 2, label: 'Transpose up a tone', Icon: UpTone },
	{ delta: 1, label: 'Transpose up a semitone', Icon: UpSemi },
	{ delta: -1, label: 'Transpose down a semitone', Icon: DownSemi },
	{ delta: -2, label: 'Transpose down a tone', Icon: DownTone },
];

// Rendered from the derived output on every change. Lines match the input
// one for one, so the line the caret is on in the input can be highlighted.
const OutputBox = ({ output, caretLine, onTranspose, onAccidentalChange }) => {
	const handleButtonKeyDown = (event, delta) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onTranspose(delta);
		}
	};

	return (
		<div className='output-container'>
			<div className='copy-button-container'>
				<button
					id='copy-button'
					className='button copy-button'
					type='button'
					aria-label='Copy to clipboard'
					onClick={() => copyToClipboard(output.replace(/\u203B/g, ''))}
				>
					<span className='copy-text'>
						COPY TO CLIPBOARD
					</span>
				</button>
			</div >

			<div className='output'>
				{output !== '' && <ChordLines markedText={output} currentLine={caretLine} />}
			</div>
			<div className='output-buttons'>
				{transposeButtons.map(({ delta, label, Icon }) => (
					<div
						key={delta}
						className='button'
						role='button'
						tabIndex={0}
						aria-label={label}
						onClick={() => onTranspose(delta)}
						onKeyDown={(event) => handleButtonKeyDown(event, delta)}
					>
						<Icon aria-hidden='true' />
					</div>
				))}
				<div className='button'>
					<ToggleButton onStateChange={onAccidentalChange} />
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
