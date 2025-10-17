import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const GameModal = ({ show, winner, onReset }) => (
  <Modal show={show} onHide={onReset} centered backdrop="static" keyboard={false}>
    <Modal.Header closeButton className="bg-success text-white">
      <Modal.Title>🏆 Congratulations!</Modal.Title>
    </Modal.Header>
    <Modal.Body className="text-center">
      {winner} wins the game!
      <p>🎲 Well played! 🎲</p>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="warning" onClick={onReset}>🔄 Reset Game</Button>
    </Modal.Footer>
  </Modal>
);

export default GameModal;