import { useState } from 'react';
import Confetti from 'react-confetti';
import { Container, Table, Image, Button } from "react-bootstrap";
import GameBoard from './components/GameBoard';
import GameInfo from './components/GameInfo';
import GameModal from './components/GameModal';
import { rollDice, diceImages } from './utils/dice';
import { generateSnakesAndLadders, getNewPosition, Snakes, Ladders } from './utils/sn&lad';
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';

function App() {
  const [diceValue, setDiceValue] = useState(1);
  const [position1, setPosition1] = useState(1);
  const [position2, setPosition2] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [{ snakes, ladders }, setBoard] = useState<{ snakes: Snakes; ladders: Ladders }>(() => generateSnakesAndLadders());

  const [confettiActive, setConfettiActive] = useState(false);

  const handleRoll = () => {
    setDiceValue(rollDice());
  };

  const handleMove = () => {
    const current = currentPlayer === 1 ? position1 : position2;
    const setPosition = currentPlayer === 1 ? setPosition1 : setPosition2;

    let newPos = Math.min(current + diceValue, 30);
    newPos = getNewPosition(newPos, snakes, ladders);

    setPosition(newPos);

    if (newPos === 30) {
      setWinner(`Player ${currentPlayer}`);
      setShowModal(true);
      setConfettiActive(true);
    } else {
      setCurrentPlayer(prev => (prev === 1 ? 2 : 1));
    }
  };

  const resetGame = () => {
    setPosition1(1);
    setPosition2(1);
    setCurrentPlayer(1);
    setShowModal(false);
    setBoard(generateSnakesAndLadders()); // 🎯 regenerate positions
    setConfettiActive(false);
  };

  return (
    <Container className="text-center mt-5 p-4 rounded shadow bg-light">
      {confettiActive && <Confetti />}
      <h1 className="mb-4">🎮 Turn: <span className={currentPlayer === 1 ? "text-primary" : "text-info"}>
        Player {currentPlayer}</span></h1>

      <Table bordered striped className="bg-white shadow-sm">
        <tbody>
          <GameBoard position1={position1} position2={position2} snakes={snakes} ladders={ladders} />
        </tbody>
      </Table>

      <h2 className="text-success mb-3">🎲 Dice: {diceValue}</h2>
      <Image src={diceImages[diceValue - 1]} className="myimg mb-3 rounded" onClick={handleRoll} />

      <div className="mb-3">
        <Button variant="primary" onClick={handleRoll} className="mx-2">🎲 Roll</Button>
        <Button variant="success" onClick={handleMove} className="mx-2">➡️ Move</Button>
      </div>

      <GameInfo dice={diceValue} position1={position1} position2={position2} currentPlayer={currentPlayer} />
      <GameModal show={showModal} winner={winner} onReset={resetGame} />
    </Container>
  );
}

export default App;