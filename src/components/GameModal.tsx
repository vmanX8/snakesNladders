import React, { useEffect, useRef } from "react";
import styles from "./GameModal.module.css";
import ConfettiBurst from "./ConfettiBurst";

export type GameModalProps = {
  show: boolean;
  winner: string | null;
  onReset: () => void;
};

const GameModal: React.FC<GameModalProps> = ({ show, winner, onReset }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show || !dialogRef.current) return;
    const previousActive = document.activeElement as HTMLElement | null;
    const focusable = dialogRef.current.querySelector("button") as HTMLButtonElement | null;
    focusable?.focus();
    return () => previousActive?.focus();
  }, [show]);

  if (!show) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="game-modal-title" ref={dialogRef}>
      <div className={styles.dialog}>
        <div className={styles.confetti}>
          <ConfettiBurst fire={show} durationMs={1600} particles={180} />
        </div>

        <div id="game-modal-title" className={styles.header}>🏆 Congratulations!</div>

        <div className={styles.body}>
          {winner ? (
            <>
              <p><strong>{winner}</strong> wins the game!</p>
              <p>🎲 Well played! 🎲</p>
            </>
          ) : <p>Game over!</p>}
        </div>

        <div className={styles.footer}>
          <button className={styles.button} onClick={onReset} autoFocus>🔄 Reset Game</button>
        </div>
      </div>
    </div>
  );
};

export default GameModal;
