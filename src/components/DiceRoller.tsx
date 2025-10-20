import { useEffect, useRef, useState } from "react";
import { DicePips, generateRollSequence, getDiceFace } from "../utils/dice";

type Props = {
    onResult?: (value: DicePips) => void;
    disabled?: boolean;
    durationMs?: number;
    fps?: number;
    initial?: DicePips;
};

export default function DiceRoller({
    onResult,
    disabled = false,
    durationMs = 600,
    fps = 24,
    initial = 1,
}: Props) {
    const [value, setValue] = useState<DicePips>(initial);
    const [rolling, setRolling] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

    const handleRoll = () => {
        if (rolling || disabled) return;
        setRolling(true);

        const seq = generateRollSequence(durationMs, fps);
        const interval = Math.max(16, Math.floor(durationMs / seq.length));

        let i = 0;
        timerRef.current = window.setInterval(() => {
            setValue(seq[i]);
            i++;
            if (i >= seq.length) {
                if (timerRef.current) window.clearInterval(timerRef.current);
                timerRef.current = null;
                setRolling(false);
                onResult?.(seq[seq.length - 1]);
            }
        }, interval);
    };

    return (
        <button
            type="button"
            onClick={handleRoll}
            disabled={rolling || disabled}
            aria-live="polite"
            aria-label={rolling ? "Rolling…" : `Roll dice: currently ${value}`}
            style={{
                padding: "0.6rem 1rem",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.15)",
                background: rolling ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.08)",
                cursor: rolling || disabled ? "not-allowed" : "pointer",
            }}
        >
            <span style={{ fontSize: "2rem", lineHeight: 1 }}>{getDiceFace(value)}</span>
            <div style={{ fontSize: "0.8rem" }}>{rolling ? "Rolling…" : "Roll"}</div>
        </button>
    );
}
