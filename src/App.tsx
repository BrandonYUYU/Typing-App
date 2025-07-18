import { useEffect, useRef, useState } from 'react'
import './App.css'


function App() {
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [typedHistory, setTypedHistory] = useState<{word: string; correctness: ('correct' | 'incorrect' | null)[]}[]>([{word: '',correctness:[]}]);

  const [currentInput, setCurrentInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds

  const wordRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // change line function
  useEffect(() => {
    if (wordRef.current && containerRef.current){
      if (wordRef.current.getBoundingClientRect().bottom > containerRef.current.getBoundingClientRect().bottom - 35){
        containerRef.current?.scrollTo({ // ? -> return null instead of throwing an error
          top: 35,     //wordRef.current.offsetTop - containerRef.current.offsetTop,
          behavior: 'smooth',
        });

        //// versions
        //containerRef.current.scrollTop += 35;
        //wordRef.current.scrollIntoView({ behavior: 'smooth'});
      }     
    }
  },[currentIndex])

  useEffect(() => {
    const handleKeyDown = (e :KeyboardEvent) => {
      const key = e.key;
      let value = '';
      if (key === 'Backspace'){
        console.log(key);
        value = (currentInput.slice(0,-1)).trim();
      } else if (key === ' '){
        value = currentInput.trim();
      }
      else if (/^[a-zA-Z]$/.test(key)){
        if (currentInput.length >= words[currentIndex].length){ //ensure currentindex is valid
          value = currentInput;
        } else value = (currentInput + key).trim();
      }

      const expected = words[currentIndex]; // ensure currentindex is valid

      if (startTime === null){
        setStartTime(Date.now());
      }

      if (key === ' ' && typedHistory[currentIndex].word !== ''){    
        if (!words[currentIndex + 1]){ ////// very important to avoid error on getting words[currentindex] in above code
          alert('congrat');
          setStartTime(null);
          return;
        }
        setCurrentIndex(currentIndex + 1);
        setCurrentInput('');
        setTypedHistory(prev => [
          ...prev,
          {word: '', correctness:[]}
        ]);
      } else {
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
        setCurrentInput(value);
      }

    }

    window.addEventListener('keydown',handleKeyDown);

    return () => {
      window.removeEventListener('keydown',handleKeyDown);
    }
  })

  // load words once
  useEffect(() => {
    const loadWords = async () => {
      try {
        const response = await fetch('https://random-word-api.herokuapp.com/word?number=40'); //maybe can use axios
        const data = await response.json();
        setWords(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load words:', error);
      }
    };

    loadWords();
  }, []);


  // calc time
  useEffect(() => {
    if (startTime === null) return;

    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(seconds);
    }, 1000);

    return () => clearInterval(interval); // cleanup
  }, [startTime]);


  const wpm = elapsedTime > 0 ? Math.round((currentIndex / elapsedTime) * 60) : 0; /////->> should be correctwords

  const handleRestart = async () => {
    setCurrentInput('');
    setCurrentIndex(0);
    setStartTime(null);
    setElapsedTime(0);
    setLoading(true);
    setTypedHistory([{word:'', correctness:[]}])

    // .then approach
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
        setLoading(false);
      }
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Loading words...</div>;
  }

  return (
    <div id='container'>
      <h1><svg width="64px" height="64px" viewBox="0 0 1024 1024" className="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M680.96 488.744421a1666.667789 1666.667789 0 0 0-54.433684-23.95621c-16.006737 12.234105-33.899789 20.264421-60.631579 20.264421h-80.842105c-36.810105 0-83.644632 30.396632-104.394106 67.772631-42.819368 77.123368-53.409684 117.813895-11.021473 201.701053C397.096421 808.879158 431.157895 876.409263 431.157895 970.105263h338.539789l68.338527-138.859789c20.129684-40.96 24.252632-73.701053 24.252631-110.349474 0.026947-57.397895-25.061053-159.717053-181.328842-232.151579z" fill="#FFBDD8"></path><path d="M862.315789 720.896c0 36.621474-4.122947 69.389474-24.252631 110.349474L769.697684 970.105263H485.052632v-53.894737h48.370526C507.877053 880.074105 485.052632 833.509053 485.052632 781.473684c0-59.418947 24.171789-113.313684 63.218526-152.360421l38.103579 38.103579A161.091368 161.091368 0 0 0 538.947368 781.473684c0 54.784 35.381895 104.043789 63.514948 134.736842h133.712842l53.490526-108.759579c15.710316-31.851789 18.755368-55.834947 18.755369-86.554947 0-80.976842-63.434105-150.096842-178.607158-195.503158-17.542737 8.138105-38.292211 13.554526-63.919158 13.554526h-80.842105c-13.958737 0-43.924211 15.979789-57.290106 40.016843l-47.104-26.165895C401.408 515.449263 448.242526 485.052632 485.052632 485.052632h80.842105c37.268211 0 57.478737-15.440842 79.090526-36.45979C625.367579 336.195368 549.753263 269.473684 485.052632 269.473684h-107.789474a21.288421 21.288421 0 0 0-5.955369 2.021053A683.762526 683.762526 0 0 0 302.187789 194.021053c-35.84-34.223158-61.763368-58.933895-94.908631-79.440842A42.442105 42.442105 0 0 0 185.478737 107.789474a22.824421 22.824421 0 0 0-17.381053 7.194947c-10.913684 11.425684-6.063158 28.240842 1.428211 39.181474 21.989053 32.121263 47.912421 56.858947 83.752421 91.109052 20.614737 19.671579 49.259789 43.169684 77.392842 63.08379C281.007158 367.400421 215.578947 484.432842 215.578947 592.842105c0 74.482526 24.791579 124.065684 51.065264 176.586106C294.534737 825.209263 323.368421 882.903579 323.368421 970.105263h-53.894737c0-74.482526-24.791579-124.065684-51.065263-176.586105C190.517895 737.738105 161.684211 680.043789 161.684211 592.842105c0-90.866526 42.226526-197.685895 93.453473-274.485894a803.759158 803.759158 0 0 1-39.046737-34.115369C177.852632 247.754105 150.231579 221.399579 125.035789 184.616421c-24.441263-35.759158-22.797474-78.686316 4.069053-106.819368 26.300632-27.567158 70.898526-31.043368 106.522947-9.000421 37.941895 23.444211 65.562947 49.798737 103.774316 86.258526 9.970526 9.512421 33.037474 32.309895 56.93979 60.550737h68.634947c-27.621053-37.780211-60.416-72.730947-88.522105-99.543579-28.833684-27.540211-54.730105-52.116211-84.533895-74.024421L326.305684 0.296421c31.232 23.228632 57.802105 48.532211 87.309474 76.719158 53.840842 51.388632 94.450526 100.594526 121.74821 146.83621 82.836211 26.650947 150.042947 116.870737 165.025685 230.750316l1.724631 13.177263-9.404631 9.404632c-3.772632 3.772632-7.706947 7.653053-11.802948 11.587368C837.227789 561.178947 862.315789 663.498105 862.315789 720.896zM309.463579 754.526316c3.934316 8.057263 7.895579 16.087579 11.991579 24.144842C348.887579 832.970105 377.263158 889.128421 377.263158 970.105263h53.894737c0-93.696-34.061474-161.226105-61.520842-215.578947h-60.173474z m597.90821 53.894737c-3.422316 9.404632-7.814737 19.806316-13.770105 31.959579L829.790316 970.105263h60.065684l52.143158-105.957052c10.778947-21.935158 17.515789-40.016842 21.90821-55.727158h-56.535579zM514.694737 390.736842c0-34.223158-13.231158-44.463158-29.642105-44.463158s-29.642105 10.24-29.642106 44.463158c0 34.250105 13.231158 44.463158 29.642106 44.463158s29.642105-10.213053 29.642105-44.463158z" fill="#ffffff"></path></g></svg>
      RabbitType</h1>

      <div ref={containerRef}>
        {words.map((word, index) => {

          // Upcoming words
          if (index > currentIndex) {
            return (
              <div
                key={index}
                style={{
                  marginRight: 12,
                  color: 'gray',
                  display: 'inline-block'
                }}
              >
                {word}
              </div>
            );
          }  
          
          //show typed word with per-letter feedback
          else{
            const correctness = typedHistory[index].correctness;

            return (
              <div ref={wordRef} key={index} style={{ marginRight: 12, display: 'inline-block'}}>
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

      <span style={{ fontSize: 18, marginBottom: 10, display: 'block'}}>
        Time: {elapsedTime}s | WPM: {wpm}
      </span>


      <button
        onClick={handleRestart}
        style={{
          marginTop: 15,
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
