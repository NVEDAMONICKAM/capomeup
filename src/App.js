import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import InputBox from './frontend/InputBox';
import OutputBox from './frontend/OutputBox';
import Logo from './frontend/svg/CapoMeUp-Logo.svg';


function App() {
  const [modifiedText, setModifiedText] = useState('');
  const leftHalfRef = useRef(null);
  const rightHalfRef = useRef(null);

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
        <InputBox onSubmit={setModifiedText} />
      </div>
      <div className="right-half" id="rightHalf" ref={rightHalfRef}>
        <OutputBox output={modifiedText} />
      </div>


    </div >
  );
}

export default App;
