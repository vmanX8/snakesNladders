import React from "react";
import styles from "./GameInfo.module.css";

export type GameInfoProps = {
  dice: number | null;
  position1: number;
  position2: number;
  currentPlayer: 1 | 2;
};

const GameInfo: React.FC<GameInfoProps> = ({
  dice,
  position1,
  position2,
  currentPlayer,
}) => {
  return (
    <div className={styles.wrapper} aria-label="Game information panel">
      <h4 className={styles.title}>🎯 Game Info</h4>

      <div className={`${styles.section} ${styles.dice}`}>
        🎲 Dice Roll: <strong>{dice ?? "–"}</strong>
      </div>

      <div className={`${styles.section} ${styles.player1}`}>
        🏃‍♂️ Player 1 Position: <strong>{position1}</strong>
      </div>

      <div className={`${styles.section} ${styles.player2}`}>
        🏃‍♀️ Player 2 Position: <strong>{position2}</strong>
      </div>

      <div className={`${styles.section} ${styles.turn}`}>
        🎮 Current Turn: <strong>Player {currentPlayer}</strong>
      </div>
    </div>
  );
};

export default GameInfo;
