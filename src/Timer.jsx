import React, { useState, useEffect, useRef } from 'react';

export function useTimerSound() {
    const audio = useRef(null);
    const prepareSound = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!audio.current && AudioContext) audio.current = new AudioContext();
            if (audio.current?.state === 'suspended') audio.current.resume().catch(() => { });
        } catch {/* The visible completion alert also works when audio is unavailable. */ }
    };
    const playAlert = () => {
        const ctx = audio.current;
        if (!ctx || ctx.state !== 'running') return;
        try {
            for (let i = 0; i < 3; i++) {
                const tone = ctx.createOscillator(), volume = ctx.createGain(), at = ctx.currentTime + i * .3;
                tone.type = 'sine'; tone.frequency.setValueAtTime(880, at);
                volume.gain.setValueAtTime(0, at);
                volume.gain.linearRampToValueAtTime(.16, at + .015);
                volume.gain.exponentialRampToValueAtTime(.001, at + .18);
                tone.connect(volume); volume.connect(ctx.destination);
                tone.onended = () => { tone.disconnect(); volume.disconnect() };
                tone.start(at); tone.stop(at + .2);
            }
        } catch {/* Keep the visual alert available if the audio device changes. */ }
    };
    useEffect(() => () => { audio.current?.close().catch(() => { }) }, []);
    return { prepareSound, playAlert };
}

function FlipDigit({ value }) {
    const [frame, setFrame] = useState({ current: value, previous: value, version: 0 });
    useEffect(() => { setFrame(old => old.current === value ? old : { current: value, previous: old.current, version: old.version + 1 }) }, [value]);
    return <span className="flip-digit" aria-hidden="true">
        <span className="flip-half flip-top"><span>{frame.current}</span></span>
        <span className="flip-half flip-bottom"><span>{frame.current}</span></span>
        {frame.version > 0 && <React.Fragment key={frame.version}>
            <span className="flip-half flip-top flip-out"><span>{frame.previous}</span></span>
            <span className="flip-half flip-bottom flip-in"><span>{frame.current}</span></span>
        </React.Fragment>}
        <span className="flip-seam" />
    </span>;
}
export function FlipClock({ seconds }) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainder = (seconds % 60).toString().padStart(2, '0');
    return <output className="flip-clock" role="timer" aria-live="off" aria-label={`${minutes}:${remainder}`} dir="ltr">
        <span className="flip-unit"><span className="flip-pair">{minutes.split('').map((digit, i) => <FlipDigit key={i} value={digit} />)}</span><span className="flip-label" aria-hidden="true">دقیقه</span></span>
        <span className="flip-colon" aria-hidden="true">:</span>
        <span className="flip-unit"><span className="flip-pair">{remainder.split('').map((digit, i) => <FlipDigit key={i} value={digit} />)}</span><span className="flip-label" aria-hidden="true">ثانیه</span></span>
    </output>;
}
export default function RestTimer() {
    const [seconds, setSeconds] = useState(60), [running, setRunning] = useState(false), [finished, setFinished] = useState(false);
    const armed = useRef(false);
    const { prepareSound, playAlert } = useTimerSound();
    useEffect(() => {
        if (!running) return;
        if (seconds <= 0) {
            setRunning(false);
            if (armed.current) { armed.current = false; setFinished(true); playAlert() }
            return;
        }
        const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
        return () => clearInterval(id);
    }, [running, seconds]);
    const toggle = () => {
        if (running) { setRunning(false); return }
        prepareSound(); setFinished(false); armed.current = true;
        if (seconds === 0) setSeconds(60);
        setRunning(true);
    };
    return <div className={`timer ${finished ? 'timer-finished' : ''}`}><p>زمان استراحت بین ست‌ها</p><FlipClock seconds={seconds} />
        <div className="timer-status" role="status" aria-live="polite" aria-atomic="true">{finished ? 'زمان استراحت تمام شد؛ آماده ست بعدی باشید.' : ''}</div>
        <div>{[30, 60, 90, 120].map(s => <button key={s} className="secondary" onClick={() => { armed.current = false; setRunning(false); setFinished(false); setSeconds(s) }}>{s.toLocaleString('fa-IR')} ثانیه</button>)}</div>
        <button className="primary" onClick={toggle}>{running ? 'توقف' : 'شروع'}</button>
    </div>;
}
