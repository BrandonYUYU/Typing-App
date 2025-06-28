import { useEffect, useState } from 'react'
import './App.css'


function App() {
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentInput, setCurrentInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (startTime === null){
      setStartTime(Date.now());
    }

    if (value.endsWith(' ')){
      if (value.trim() === words[currentIndex]){
        setCurrentIndex(currentIndex + 1);
      }
      setCurrentInput('');
    } else {
      setCurrentInput(value);
    }
  }

  useEffect(() => {
    const loadWords = async () => {
      try {
        // Simulate an API call with local words (you can replace with real fetch)
        const response = await fetch('https://random-word-api.herokuapp.com/word?number=20');
        const data = await response.json();
        setWords(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load words:', error);
      }
    };

    loadWords();
  }, []);

  useEffect(() => {
    if (startTime === null) return;

    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(seconds);
    }, 1000);

    return () => clearInterval(interval); // cleanup
  }, [startTime]);

  useEffect(() => {
    if (currentIndex >= words.length) {
      setStartTime(null); // stops timer
    }
  }, [currentIndex]);

  const wpm = elapsedTime > 0 ? Math.round((currentIndex / elapsedTime) * 60) : 0;

  const handleRestart = async () => {
    setCurrentInput('');
    setCurrentIndex(0);
    setStartTime(null);
    setElapsedTime(0);
    setLoading(true);

    /***setLoading(true);
    fetch('https://random-word-api.herokuapp.com/word?number=20')
      .then((res) => res.json())
      .then((data) => {
        setWords(data);
        setLoading(false);
      .catch(error => {
        console.error('Error fetching:', error);
        setLoading(false);
      });
      });***/

      try {
        const response = await fetch('https://random-word-api.herokuapp.com/word?number=20');
        const data = await response.json();
        setWords(data);
      } catch (error) {
        console.error('Failed to load words:', error);
      } finally {
        setLoading(false);  // ✅ always runs, even if fetch fails
      }
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Loading words...</div>;
  }

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Typing Practice</h1>

      <div style={{ margin: '20px 0', fontSize: 24 }}>
        {words.map((word, index) => {
          //show typed word with per-letter feedback
          if (index === currentIndex){
            return (
              <span key={index} style={{ marginRight: 12}}>
                {word.split('').map((char,i) => {
                  const typedchar = currentInput[i];
                  let color = 'black';

                  if (typedchar == null) {
                    color = 'black'; // not typed yet
                  } else if (typedchar === char){
                    color = 'green'; // correct
                  } else{
                    color = 'red'; // incorrect
                  }
                  
                  return(
                    <span key={i} style={{ color }}>
                      {char}
                    </span>
                  );
                })}
              </span>
            )
          }

          // Already completed word (gray with line-through)
          if (index < currentIndex) {
            return (
              <span
                key={index}
                style={{
                  marginRight: 12,
                  color: 'gray',
                  textDecoration: 'line-through',
                }}
              >
                {word}
              </span>
            );
          }

          // Upcoming words (not started yet)
          return (
            <span key={index} style={{ marginRight: 12, color: 'black' }}>
              {word}
            </span>
          );         

        })}
      </div>

      <div style={{ fontSize: 18, marginBottom: 10 }}>
        Time: {elapsedTime}s | WPM: {wpm}
      </div>


      <input
        value={currentInput}
        onChange={handleInputChange}
        autoFocus
        style={{
          fontSize: 20,
          padding: '8px 12px',
          width: '300px',
        }}
        placeholder="Type here"
      />

      <button
        onClick={handleRestart}
        style={{
          marginTop: 20,
          padding: '8px 16px',
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        Restart
      </button>

    </div>
  );
}

export default App
