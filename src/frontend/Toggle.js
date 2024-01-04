import React, { useState } from 'react';
import sharp from './svg/Sharps.svg';
import flat from './svg/Flats.svg';

const ToggleButton = ({ onStateChange }) => {
	const [buttonImage, setButtonImage] = useState(sharp);
	const [buttonValue, setButtonValue] = useState(1);

	const toggleState = () => {
		const nextImage = buttonImage === sharp ? flat : sharp;
		const nextValue = buttonValue === 1 ? 0 : 1;

		setButtonImage(nextImage);
		setButtonValue(nextValue);
		onStateChange(nextValue);
	};

	return (
		<div>
			<button className='toggle-button-container' onClick={toggleState}>
				<img className='toggle-button' src={buttonImage} alt="Toggle Button" />
			</button>
		</div>
	);
};

export default ToggleButton;