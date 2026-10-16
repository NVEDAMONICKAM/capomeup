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
			<button
				className='toggle-button-container'
				type='button'
				onClick={toggleState}
				aria-label={buttonValue === 1 ? 'Using sharps. Switch to flats' : 'Using flats. Switch to sharps'}
			>
				<img className='toggle-button' src={buttonImage} alt="" />
			</button>
		</div>
	);
};

export default ToggleButton;