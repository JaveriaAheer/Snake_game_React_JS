import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Confetti from 'react-confetti';
import snakeImg from './img/snake.png';

const cellSize = 20;
const width = 600;
const height = 400;

const getRandomPosition = () => {
  const x = Math.floor(Math.random() * (width / cellSize));
  const y = Math.floor(Math.random() * (height / cellSize));
  return [x, y];
};

const fruits = [
  { type: 'apple', points: 10, emoji: '🍎' },
  { type: 'banana', points: 5, emoji: '🍌' },
  { type: 'cherry', points: 15, emoji: '🍒' },
  { type: 'pineapple', points: 20, emoji: '🍍' },
  { type: 'grapes', points: 12, emoji: '🍇' },
  { type: 'kiwi', points: 18, emoji: '🥝' },
  { type: 'watermelon', points: 25, emoji: '🍉' }
];

function App() {
  const [snake, setSnake] = useState([[5, 5]]);
  const [direction, setDirection] = useState([1, 0]);
  const [fruit, setFruit] = useState({ position: getRandomPosition(), type: fruits[0] });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef(null);

  const startCountdown = (callback) => {
    let cd = 3;
    setCountdown(cd);
    const countdownInterval = setInterval(() => {
      cd--;
      setCountdown(cd);
      if (cd === 0) {
        clearInterval(countdownInterval);
        setCountdown(0);
        callback();
      }
    }, 1000);
  };

  const startGame = () => {
    setGameOver(false);
    setSnake([[5, 5]]);
    setDirection([1, 0]);
    setScore(0);
    setFruit({ position: getRandomPosition(), type: fruits[Math.floor(Math.random() * fruits.length)] });
    setShowConfetti(false);
    setIsPaused(false);
    setIsRunning(false);
    startCountdown(() => {
      setIsRunning(true);
    });
  };

  const pauseGame = () => {
    clearInterval(intervalRef.current);
    setIsPaused(true);
    setIsRunning(false);
  };

  const resumeGame = () => {
    setIsPaused(false);
    setCountdown(3);
    startCountdown(() => {
      setIsRunning(true);
    });
  };

  const checkCollision = (head) => {
    const headX = head[0] * cellSize;
    const headY = head[1] * cellSize;

    
    return (
      headX < 0 || 
      headX >= width ||
      headY < 0 || 
      headY >= height || 
      snake.some(segment => segment[0] === head[0] && segment[1] === head[1]) 
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp': if (direction[1] !== 1) setDirection([0, -1]); break; 
        case 'ArrowDown': if (direction[1] !== -1) setDirection([0, 1]); break;
        case 'ArrowLeft': if (direction[0] !== 1) setDirection([-1, 0]); break;
        case 'ArrowRight': if (direction[0] !== -1) setDirection([1, 0]); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (!isRunning || gameOver || isPaused) return;

    intervalRef.current = setInterval(() => {
      setSnake(prev => {
        const newHead = [prev[0][0] + direction[0], prev[0][1] + direction[1]];

        
        if (checkCollision(newHead)) {
          clearInterval(intervalRef.current);
          setGameOver(true);
          setShowConfetti(true);
          setIsRunning(false);
          return prev; 
        }

        let newSnake = [newHead, ...prev];
        if (newHead[0] === fruit.position[0] && newHead[1] === fruit.position[1]) {
          setScore(prevScore => prevScore + fruit.type.points);
          setFruit({
            position: getRandomPosition(),
            type: fruits[Math.floor(Math.random() * fruits.length)]
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 200);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, direction, fruit, gameOver]);

  return (
    <div className="container">
      {showConfetti && <Confetti />}
      <h1>Snake Game <img style={{width:50,height:50, marginTop:10}} src={snakeImg} alt="Cute Snake" /> </h1>
      <div className="countdown-box">
        {countdown > 0 && <div className="countdown">{countdown}</div>}

        {!isRunning && !isPaused && countdown === 0 && (
          <button onClick={startGame} className="start-btn">Start Game</button>
        )}

        {isRunning && !isPaused && countdown === 0 && (
          <button onClick={pauseGame} className="pause-btn">Pause Game</button>
        )}

        {isPaused && countdown === 0 && (
          <button onClick={resumeGame} className="resume-btn">Resume Game</button>
        )}
      </div>

      <div className="score">Score: {score}</div>
      
      <div className="game-wrapper">
        <div className='left'></div>
        <div className="fruit-info">
          <h3>Fruit Points <img style={{width:50,height:50, marginLeft:30}} src={snakeImg} alt="Cute Snake" /></h3>
          <ul>
            {fruits.map((f, i) => (
              <li key={i}>{f.emoji} {f.type.toUpperCase()} = <b>{f.points}</b> pts</li>
            ))}
          </ul>
        </div>
        <div className="board" style={{ width, height }}>
          {snake.map((segment, idx) => (
            <div 
              key={idx} 
              className="snake" 
              style={{ 
                left: Math.min(Math.max(segment[0] * cellSize, 0), width - cellSize), 
                top: Math.min(Math.max(segment[1] * cellSize, 0), height - cellSize) 
              }}
            ></div>
          ))}
          <div
            className="fruit"
            style={{ left: fruit.position[0] * cellSize, top: fruit.position[1] * cellSize }}>
            {fruit.type.emoji}
          </div>
        </div>
        {/* <div className='snakeimg'>
          <img src={snakeImg} alt="Cute Snake" />
        </div> */}
      </div>

      {gameOver && (
        <div className="popup">
          <img src={snakeImg} alt="Cute Snake" />
          <h2>Game Over!</h2>
          <p>Your score: {score}</p>
          <button onClick={startGame}>Restart</button>
        </div>
      )}
    </div>
  );
}

export default App;