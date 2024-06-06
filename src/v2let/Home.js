import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [spoken, setSpoken] = useState(false);

  const speakText = () => {
    if (!spoken) {
      const message = new SpeechSynthesisUtterance();
      message.text = "Hey friend, I hope you are doing well. So let's kickstart our joyful journey by diving deep into some learning together, shall we?";
      window.speechSynthesis.speak(message);
      setSpoken(true); 
    }
  };

  useEffect(() => {
    speakText();
  }, []);

  return ( 
    <div className="HApp">
    
      <video
        src="/v2wslet.mp4"
        autoPlay
        loop
        muted
        style={{ width: '100vw', height: '100vh', objectFit: 'cover' }}
      />

      <div className='navwslet'>
        <Link to='/v2lettercard'>
          <button className='nwslet' >lets start</button>
        </Link>
      </div>

    </div>
  );
};
 
export default Home;
