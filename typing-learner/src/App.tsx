import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const words = ["hello","world","keyboard","practice", "typing"];

function App() {
  const [currentInput, setCurrentInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.endsWith(' ')){
      if (value.trim() === words[currentIndex]){
        setCurrentIndex(currentIndex + 1);
      }
      setCurrentInput('');
    } else {
      setCurrentInput(value);
    }
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
    </div>
  );
}

export default App
