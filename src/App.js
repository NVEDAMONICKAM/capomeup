import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';
import InputBox from './frontend/InputBox';
import OutputBox from './frontend/OutputBox';
import Logo from './frontend/svg/CapoMeUp-Logo.svg';
import findChords from './backend/FindChords';
import { transposeBy } from './backend/Transpose';

const SHARPS = 1;

function App() {
  // Single source of truth: the raw input text plus settings. Everything
  // shown (input highlighting, output, copied text) is derived from these on
  // every change, so the output can never drift from the input.
  const [text, setText] = useState('');
  const [inline, setInline] = useState({ enabled: false, open: '[', close: ']' });
  const [semitones, setSemitones] = useState(0);
  const [accidental, setAccidental] = useState(SHARPS);
  const [respell, setRespell] = useState(false);
  const [caretLine, setCaretLine] = useState(null);
  const leftHalfRef = useRef(null);
  const rightHalfRef = useRef(null);

  const markedText = useMemo(
    () => findChords(text, inline.enabled ? 'indent' : 'pure', inline.open, inline.close),
    [text, inline]
  );

  // At 0 semitones the original spellings are shown, unless the user has
  // picked sharps/flats explicitly.
  const outputText = useMemo(
    () => (semitones === 0 && !respell ? markedText : transposeBy(markedText, semitones, accidental)),
    [markedText, semitones, accidental, respell]
  );

  const handleTextChange = (newText) => {
    setText(newText);
    // a cleared input starts the next song in its original key
    if (newText === '') setSemitones(0);
  };

  const handleTranspose = (delta) => {
    if (!markedText.includes('\u203B')) return; // nothing to transpose
    setSemitones((s) => (s + delta + 12) % 12);
  };

  const handleAccidentalChange = (value) => {
    setAccidental(value);
    setRespell(true);
  };

  // Synchronize scrolling between left and right halves
  useEffect(() => {
    const leftHalf = leftHalfRef.current;
    const rightHalf = rightHalfRef.current;

    const syncRight = () => { rightHalf.scrollTop = leftHalf.scrollTop; };
    const syncLeft = () => { leftHalf.scrollTop = rightHalf.scrollTop; };

    leftHalf.addEventListener('scroll', syncRight);
    rightHalf.addEventListener('scroll', syncLeft);
    return () => {
      leftHalf.removeEventListener('scroll', syncRight);
      rightHalf.removeEventListener('scroll', syncLeft);
    };
  }, []);

  return (
    <div className="app-container">
      <div className="left-half" id="leftHalf" ref={leftHalfRef}>
        <img className='cmu-logo' src={Logo} alt="Capo Me Up" />
        <InputBox
          text={text}
          markedText={markedText}
          onTextChange={handleTextChange}
          inline={inline}
          onInlineChange={setInline}
          onCaretLineChange={setCaretLine}
        />
      </div>
      <div className="right-half" id="rightHalf" ref={rightHalfRef}>
        <OutputBox
          output={outputText}
          caretLine={caretLine}
          onTranspose={handleTranspose}
          onAccidentalChange={handleAccidentalChange}
        />
      </div>


    </div >
  );
}

export default App;
