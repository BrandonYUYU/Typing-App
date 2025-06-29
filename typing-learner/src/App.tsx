import { useEffect, useState } from 'react'
import './App.css'


function App() {
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [typedHistory, setTypedHistory] = useState<{word: string; correctness: ('correct' | 'incorrect' | null)[]}[]>([{word: '',correctness:[]}]); // cur and typed use same logic

  const [currentInput, setCurrentInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds

  useEffect(() => {
    const handleKeyDown = (e :KeyboardEvent) => {
      const key = e.key;
      const value = (currentInput + key).trim();
      const expected = words[currentIndex];

      if (startTime === null){
        setStartTime(Date.now());
      }

      const correctness = expected.split('').map((char, i) => {
        if (value[i] === char) return 'correct';
        if (value[i] == null) return null;
        return 'incorrect';
      })

      setTypedHistory(prev => {
        const updated = [...prev]; // make a copy (immutable)
        const lastIndex = updated.length - 1;

        updated[lastIndex] = {
          ...updated[lastIndex],
          word: value,
          correctness: correctness
        };

        return updated;
      });

      if (key === ' ' && typedHistory[currentIndex].word !== ''){    
        setCurrentIndex(currentIndex + 1);
        setCurrentInput('');
        setTypedHistory(prev => [
          ...prev,
          {word: '', correctness:[]}
        ]);
      } else setCurrentInput(value);

    }

    window.addEventListener('keydown',handleKeyDown);

    return () => {
      window.removeEventListener('keydown',handleKeyDown);
    }
  })

  /***const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const trimmed = value.trim();
    const expected = words[currentIndex];

    if (startTime === null){
      setStartTime(Date.now());
    }

    const correctness = expected.split('').map((char, i) => {
      if (trimmed[i] === char) return 'correct';
      if (trimmed[i] == null) return null;
      return 'incorrect';
    });

    setTypedHistory(prev => {
      const updated = [...prev]; // make a copy (immutable)
      const lastIndex = updated.length - 1;

      updated[lastIndex] = {
        ...updated[lastIndex],
        word: trimmed,
        correctness: correctness
      };

      return updated;
    });

    if (value.endsWith(' ')){    
      setCurrentIndex(currentIndex + 1);
      setCurrentInput('');
      setTypedHistory(prev => [
        ...prev,
        {word: '', correctness:[]}
      ]);

    } else setCurrentInput(value);

  }***/

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
    setTypedHistory([{word:'', correctness:[]}])

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
    <div style={{ padding: 40, fontFamily: 'sans-serif'}}>
      <h1>Typing Practice</h1>

      <div style={{ margin: '20px 0', fontSize: 24}}>
        {words.map((word, index) => {

          // Upcoming words
          if (index > currentIndex) {
            return (
              <span
                key={index}
                style={{
                  marginRight: 12,
                  color: 'gray',
                  //textDecoration: 'line-through',
                  display: 'inline-block'
                }}
              >
                {word}
              </span>
            );
          }  
          
          //show typed word with per-letter feedback
          else{
            const correctness = typedHistory[index].correctness;

            return (
              <div key={index} style={{ marginRight: 12, display: 'inline-block'}}>
                {word.split('').map((char,i) => {
                  let color = 'gray';
                  const status = correctness[i];

                  if (status == 'correct') color = 'white';
                  else if (status == null) color = 'gray';
                  else color = 'red';
                    
                  return(
                    <span key={i} style={{ color }}>
                      {char}
                    </span>
                  );
                })}
              </div>
            )
          }



        })}
      </div>

      <div style={{ fontSize: 18, marginBottom: 10 }}>
        Time: {elapsedTime}s | WPM: {wpm}
      </div>


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
