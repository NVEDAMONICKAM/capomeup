import findChords from "./FindChords.js";
import { transpose } from "./Transpose.js";

export const inputSubmit = async (inputText, searchMethod, openInline, closeInline) => {
	// error checks
	const modifiedText = findChords(inputText, searchMethod, openInline, closeInline);
	// error checks

	return modifiedText;
};

export const outputSubmit = async (outputText, shift, acc) => {
	// error checks
	const modifiedText = transpose(outputText, shift, acc);
	// error checks
	return modifiedText;
};