import React, { useEffect, useRef } from "react";
import styles from "./GameModal.module.css";
import ConfettiBurst from "./ConfettiBurst";

/**
 * Props for the winner modal.
 */
export type GameModalProps = {
  /** Whether the modal is visible. */
  show: boolean;
  /** Winner label, e.g., "Player 1". */
  winner: string | null;
  /**
   * Start a brand-new game:
   * - Generate a new snakes/ladders layout
   * - Reset positions, close modal
   */
  onNewGame: () => void;
  /**
   * Restart current game with the same layout:
   * - Reset positions, close modal
   */
  onRestart: () => void;
};

const GameModal: React.FC<GameModalProps> = ({
  show,
  winner,
  onNewGame,
  onRestart,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (!show || !dialogRef.current) return;
    const previousActive = document.activeElement as HTMLElement | null;
    const focusable = dialogRef.current.querySelector(
      "button"
    ) as HTMLButtonElement | null;
    focusable?.focus();
    return () => previousActive?.focus();
  }, [show]);

  if (!show) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-modal-title"
      ref={dialogRef}
    >
      <div className={styles.dialog}>
        <div className={styles.confetti}>
          <ConfettiBurst fire={show} durationMs={2000} particles={180} />
        </div>

        <div id="game-modal-title" className={styles.header}>
          🏆 Congratulations!
        </div>

        <div className={styles.body}>
          {winner ? (
            <>
              <p>
                <strong>{winner}</strong> wins the game!
              </p>
              <p>🎲 Well played! 🎲</p>
            </>
          ) : (
            <p>Game over!</p>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.buttons}>
            <button className={styles.button} onClick={onNewGame}>
              🧩 New Game
            </button>
            <button className={`${styles.button} ${styles.buttonGhost}`} onClick={onRestart}>
              🔄 Restart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameModal;