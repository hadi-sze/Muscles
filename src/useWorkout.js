import { useEffect, useRef, useState } from 'react';
import { useTimerSound } from './Timer';
import { WORKOUT_KEY, createSession, finishSession, logSet, readWorkoutState, remainingRest } from './workout-model';
import { mergeHistory } from './planning-model';

export default function useWorkout() {
    const [state, setState] = useState(() => { try { return readWorkoutState(window.localStorage); } catch { return { active: null, history: [] }; } });
    const [now, setNow] = useState(Date.now);
    const [restFinished, setRestFinished] = useState(false);
    const [storageError, setStorageError] = useState(false);
    const { prepareSound, playAlert } = useTimerSound();
    const alertedDeadline = useRef(null);
    const session = state.active;
    const seconds = remainingRest(session?.rest, now);

    useEffect(() => {
        try { localStorage.setItem(WORKOUT_KEY, JSON.stringify(state)); setStorageError(false); }
        catch { setStorageError(true); }
    }, [state]);

    const deadline = session?.rest?.deadline;
    useEffect(() => {
        if (deadline == null) return;
        const tick = () => {
            const time = Date.now();
            setNow(time);
            if (time < deadline) return;
            if (alertedDeadline.current !== deadline) {
                alertedDeadline.current = deadline;
                setRestFinished(true);
                playAlert();
            }
            setState(old => old.active?.rest?.deadline === deadline ? { ...old, active: { ...old.active, rest: null } } : old);
        };
        tick();
        const timer = window.setInterval(tick, 250);
        document.addEventListener('visibilitychange', tick);
        return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
    }, [deadline]);

    const update = transform => setState(old => old.active ? { ...old, active: transform(old.active) } : old);
    function start(plan) {
        prepareSound(); if (!session) setRestFinished(false); setNow(Date.now());
        setState(old => old.active ? old : { ...old, active: createSession(plan) });
    }
    function record(amount, weight) {
        // Validate before entering React's updater so form errors are catchable.
        const updated = logSet(session, amount, weight);
        prepareSound(); setNow(Date.now()); setRestFinished(false);
        setState(old => old.active?.id === updated.id ? { ...old, active: updated } : old);
    }
    function pauseRest() {
        update(active => ({ ...active, rest: { deadline: null, remaining: remainingRest(active.rest) } }));
    }
    function resumeRest() {
        prepareSound(); setNow(Date.now());
        update(active => active.rest ? { ...active, rest: { ...active.rest, deadline: Date.now() + active.rest.remaining * 1000 } } : active);
    }
    function skipRest() { setRestFinished(false); update(active => ({ ...active, rest: null })); }
    function selectExercise(index) {
        update(active => ({ ...active, currentIndex: Math.max(0, Math.min(index, active.exercises.length - 1)) }));
    }
    function undoSet(id) {
        setRestFinished(false);
        update(active => ({ ...active, rest: null, exercises: active.exercises.map(exercise => ({ ...exercise, sets: exercise.sets.filter(set => set.id !== id) })) }));
    }
    function finish() {
        const next = finishSession(state);
        setRestFinished(false); setState(next);
        return next.history[0]?.id === session?.id ? next.history[0] : null;
    }
    return { session, history: state.history, seconds, restFinished, storageError, start, record, pauseRest, resumeRest, skipRest, selectExercise, undoSet, finish,
        importHistory: incoming => setState(old => ({ ...old, history: mergeHistory(old.history, incoming) })),
        setRestDuration: duration => update(active => ({ ...active, restDuration: duration })) };
}
