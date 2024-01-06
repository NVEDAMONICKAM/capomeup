import React from "react";

export const colourChordsOutput = (text) => {
	if (text === undefined) return null;
	if (text.length === 0) return '';
	if (!text.includes('\u203B')) return text;

	// Use regular expression to match the placeholders
	const regex = /\u203B[^\u203B]+?\u203B/g;  // Matches placeholders like $$$string$$$

	let match;
	let lastIndex = 0;
	const styledText = [];

	// Find all matches of the placeholders in the text
	while ((match = regex.exec(text)) !== null) {
		const placeholderIndex = match.index;

		// Push the text before the placeholder with default styling
		styledText.push(
			<span key={lastIndex}>
				{text.substring(lastIndex, placeholderIndex)}
			</span>
		);

		// Apply specific styling to the string represented by the placeholder
		styledText.push(
			<span key={placeholderIndex} style={{ color: "#EFD3D9", whiteSpace: 'pre-wrap' }}>
				{getString(match[0])}
			</span>
		);

		lastIndex = regex.lastIndex;
	}

	// Push the remaining text after the last placeholder
	styledText.push(
		<span key={lastIndex}>
			{text.substring(lastIndex)}
		</span>
	);

	return styledText;

};

export const colourChordsInput = (text) => {
	if (text === undefined) return null;
	if (text.length === 0) return '';
	if (!text.includes('\u203B')) return text;

	const regex = /\u203B[^\u203B]+?\u203B/g;
	let match;
	let lastIndex = 0;
	let index = 0; // Variable to generate unique keys

	let styledText = '';

	while ((match = regex.exec(text)) !== null) {
		const placeholderIndex = match.index;

		styledText +=
			text.substring(lastIndex, placeholderIndex) +
			`<span key=${index} style="color: #EFD3D9; white-space: pre-line">${getString(match[0])}</span>`;

		lastIndex = regex.lastIndex;
		index++; // Increment index for the next key
	}

	styledText += text.substring(lastIndex);

	return styledText;
};



// Function to get the string from the placeholder
const getString = (placeholder) => {
	return placeholder.replace(/\u203B/g, '');
};