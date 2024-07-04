import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import wordsData from './words.json'; 
import './v2ws.css';

const V2lettercard = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [letters, setLetters] = useState([]);
  const [answer, setAnswer] = useState('');
  const [randomLetters, setRandomLetters] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [tries, setTries] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [flippedLetters, setFlippedLetters] = useState([]);
  const [gameId, setGameId] = useState(null);
  const [status, setStatus] = useState(false); 
  const synth = window.speechSynthesis;

  useEffect(() => {
    setGameId(generateRandomGameId());
    fetchSessions();
  }, []);

  useEffect(() => {
    if (currentWordIndex < words.length) {
      fetchWords(sessions[currentSessionIndex].words);
    }
  }, [currentWordIndex]);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const currentTime = ((new Date() - startTime) / 1000).toFixed(2);
        setTimeTaken(currentTime);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setTimeTaken(0);
    }
  }, [startTime]);

  useEffect(() => {
    speakDescription();
  }, []);

  useEffect(() => {
    if (letters.length > 0) {
      setTimeout(() => flipLetters(), 3000);
    }
  }, [letters]);

  const formattedTime =
    typeof timeTaken === 'number' && !isNaN(timeTaken) ? timeTaken.toFixed(2) : 0;

  const fetchSessions = () => {
    try {
      console.log('Fetched sessions:', wordsData.sessions);
      setSessions(wordsData.sessions);
      setCurrentSessionIndex(0);
      fetchWords(wordsData.sessions[0].words);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchWords = (sessionWords) => {
    const currentWord = sessionWords[currentWordIndex];
    const lettersArray = currentWord.split('');

    setWords(sessionWords);
    setLetters(lettersArray);
    setFlippedLetters(Array(lettersArray.length).fill(false));
    generateRandomLetters(lettersArray, currentWord);
  };

  const generateRandomLetters = (lettersArray, currentWord) => {
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomChars = [...lettersArray];

    while (randomChars.length < 10) {
      const randomIndex = Math.floor(Math.random() * allLetters.length);
      const randomLetter = allLetters[randomIndex];
      if (!randomChars.includes(randomLetter)) {
        randomChars.push(randomLetter);
      }
    }

    randomChars.sort(() => Math.random() - 0.5);
    setRandomLetters(randomChars);

    setWords((prevWords) => [...prevWords.filter((word) => word !== currentWord), currentWord]);
  };

  const generateRandomGameId = () => {
    return Math.floor(Math.random() * 1000000);
  };

  const pronounceWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    synth.speak(utterance);
  };

  const handleNextWord = () => {
    const endTime = new Date();
    const timeTaken = startTime ? (endTime - startTime) / 1000 : 0;

    if (currentWordIndex + 1 < sessions[currentSessionIndex].words.length) {
      setCurrentWordIndex((prevIndex) => prevIndex + 1);
    } else {
      if (currentSessionIndex + 1 < sessions.length) {
        setCurrentSessionIndex((prevIndex) => prevIndex + 1);
        setCurrentWordIndex(0);
      } else {
        setCurrentSessionIndex(0);
        setCurrentWordIndex(0);
      }
    }
    setAnswer('');
    setShowConfetti(false);
    setTries(0);
    setStartTime(null);
    fetchWords(sessions[currentSessionIndex].words);
  };

  const handleLetterClick = (letter) => {
    setAnswer(answer + letter);
    pronounceWord(letter);
  };

  const handleChange = (event) => {
    setAnswer(event.target.value);
  };

  const checkAnswer = async () => {
    const currentAnswer = answer.toLowerCase();
    const currentWord = sessions[currentSessionIndex]?.words[currentWordIndex]?.toLowerCase();

    if (!startTime) {
      console.error('Error: startTime is not set');
      return;
    }

    if (!currentWord) {
      console.error('Error: currentWord is not defined');
      return;
    }

    if (currentAnswer === currentWord) {
      setShowConfetti(true);
      pronounceWord('Great job');
      setStatus(true); 
    } else {
      pronounceWord('Oops, try again');
      setAnswer('');
      setStatus(false); 
    }

    const currentTries = tries + 1;
    setTries(currentTries);
    console.log(tries);
    try {
      console.log('Sending game data to server...');
      const endTime = new Date();
      const timeTaken = (endTime - startTime) / 1000;

      const response = await fetch('https://jwlgamesbackend.vercel.app/api/caretaker/sendgamedata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tries: currentTries,
          timer: timeTaken,
          status: status,
          timeStarted: startTime,
          timeEnded: new Date(),
          currentWord: sessions[currentSessionIndex]?.words[currentWordIndex] || '',
        }),
      });
      

      if (response.ok) {
        console.log('Game data saved successfully');
      } else {
        console.error('Failed to save game data:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving game data:', error);
    }
  };

  const handleCheckStart = () => {
    if (!startTime) {
      console.log('Setting startTime...');
      setStartTime(new Date());
      checkAnswer();
    } else {
      checkAnswer();
    }
  };

  useEffect(() => {
    if (startTime) {
      console.log('Calling checkAnswer...');
      checkAnswer();
    }
  }, [startTime]);

  const speakDescription = () => {
    const description = document.querySelector('.desc').textContent;
    pronounceWord(description);
  };

  const flipLetters = () => {
    letters.forEach((_, index) => {
      setTimeout(() => {
        setFlippedLetters((prev) => {
          const newFlipped = [...prev];
          newFlipped[index] = true;
          return newFlipped;
        });
      }, (index + 1) * 3000);
    });
  };
  return (
    <div className="wsb">
      <h1 className="desc" text-center style={{ marginTop: '1rem' }} onClick={speakDescription}>
        Look at the letters carefully. Match your letters to what you see
      </h1>
      <div className="word-cards shadow">
        {letters.map((letter, index) => (
          <div
            key={index}
            className={`letter ${flippedLetters[index] ? 'flipped' : ''}`}
            onClick={() => pronounceWord(letter)}
          >
            {flippedLetters[index] ? letter : ''}
          </div>
        ))}
      </div>

      <div className="InputContainer" style={{ marginBottom: '1rem' }}>
        <div className="input-wrapper">
          <input
            placeholder="Your answer"
            value={answer}
            onChange={handleChange}
          />

          <button className="ans-but" onClick={handleCheckStart}>
            Check
          </button>
          {showConfetti && (
            <button className="button-nw" onClick={handleNextWord} style={{ marginLeft: '1rem' }}>
              Next Word
            </button>
          )}
        </div>

        <div
          className="random-cards shadow"
          style={{ display: 'flex', flexWrap: 'wrap', marginTop: '1rem' }}
        >
          {randomLetters.map((letter, index) => (
            <div key={index} className="letter" onClick={() => handleLetterClick(letter)} style={{ margin: '5px' }}>
              {letter}
            </div>
          ))}
        </div>
      </div>
      <div className="info-container">
        <div className="sessioninfo">
          <p className="s">Current Session: {currentSessionIndex + 1}</p>
        </div>
        <div className="wordinfo">
          <p className="w">Current Word: {currentWordIndex + 1}</p>
        </div>
      </div>
      {showConfetti && <Confetti />}
    </div>
  );
};

export default V2lettercard;
