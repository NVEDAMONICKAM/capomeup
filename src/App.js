import React, { useState } from 'react';
import './App.css';
import InputBox from './frontend/InputBox';
import OutputBox from './frontend/OutputBox';
import Logo from './frontend/svg/CapoMeUp-Logo.svg';


function App() {
  const [modifiedText, setModifiedText] = useState('');

  const leftHalf = document.getElementById('leftHalf');
  const rightHalf = document.getElementById('rightHalf');

  // Synchronize scrolling between left and right halves
  if (leftHalf != null && rightHalf != null) {
    leftHalf.addEventListener('scroll', () => {
      rightHalf.scrollTop = leftHalf.scrollTop;
    });

    rightHalf.addEventListener('scroll', () => {
      leftHalf.scrollTop = rightHalf.scrollTop;
    });
  }

  const handleSumbit = async (inputText) => {
    setModifiedText(inputText); // Update state with modified text
  };

  return (
    <div class="app-container">
      <div class="left-half" id="leftHalf">
        <img class='cmu-logo' src={Logo} />
        <InputBox onSubmit={handleSumbit} />
      </div>
      <div class="right-half" id="rightHalf">
        <OutputBox output={modifiedText} />
      </div>
    </div >
  );
}

export default App;