export const WORKOUT_KEY = 'mw-workouts-v1';
export const isTimedExercise = exercise => ['Plank', 'Side plank'].includes(exercise.en);
export const setCount = session => session.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
export const remainingRest = (rest, now = Date.now()) => rest ? rest.deadline === null ? rest.remaining : Math.max(0, Math.ceil((rest.deadline - now) / 1000)) : 0;

export function createSession(plan, now = Date.now()) {
    if (!plan.length) throw new Error('Add an exercise before starting a session.');
    return { id: crypto.randomUUID(), startedAt: now, currentIndex: 0, restDuration: 60, rest: null,
        exercises: plan.map(exercise => ({ ...exercise, sets: [] })) };
}

export function logSet(session, amount, weight, now = Date.now()) {
    if (String(amount).trim() === '' || String(weight).trim() === '') throw new Error('مقدار تمرین و وزن را وارد کنید.');
    const value = Number(amount), kg = Number(weight);
    if (!Number.isInteger(value) || value < 1 || value > 9999 || !Number.isFinite(kg) || kg < 0 || kg > 9999) throw new Error('مقدار تمرین باید عدد صحیح مثبت و وزن باید صفر یا بیشتر باشد.');
    const entry = { id: crypto.randomUUID(), amount: value, weight: kg, completedAt: now };
    return { ...session, exercises: session.exercises.map((exercise, index) => index === session.currentIndex ? { ...exercise, sets: [...exercise.sets, entry] } : exercise),
        rest: { deadline: now + session.restDuration * 1000, remaining: session.restDuration } };
}

export function finishSession(state, now = Date.now()) {
    if (!state.active || !setCount(state.active)) return { ...state, active: null };
    const record = { ...state.active, rest: null, finishedAt: now };
    return { active: null, history: [record, ...state.history].slice(0, 100) };
}

function validSession(session, completed = false) {
    return session && typeof session.id === 'string' && Number.isFinite(session.startedAt) &&
        (!completed || Number.isFinite(session.finishedAt)) &&
        Number.isInteger(session.currentIndex) && session.currentIndex >= 0 &&
        Number.isInteger(session.restDuration) && session.restDuration >= 1 && session.restDuration <= 600 &&
        Array.isArray(session.exercises) && session.exercises.length > session.currentIndex &&
        session.exercises.every(exercise => Number.isInteger(exercise.id) && typeof exercise.name === 'string' && typeof exercise.en === 'string' &&
            Array.isArray(exercise.sets) && exercise.sets.every(set => typeof set.id === 'string' && Number.isInteger(set.amount) && set.amount > 0 && Number.isFinite(set.weight) && set.weight >= 0 && Number.isFinite(set.completedAt))) &&
        (session.rest === null || (session.rest && (session.rest.deadline === null || Number.isFinite(session.rest.deadline)) && Number.isInteger(session.rest.remaining) && session.rest.remaining >= 0));
}

export function readWorkoutState(storage) {
    try {
        const state = JSON.parse(storage.getItem(WORKOUT_KEY));
        return { active: validSession(state?.active) ? state.active : null,
            history: Array.isArray(state?.history) ? state.history.filter(session => validSession(session, true)).slice(0, 100) : [] };
    } catch { return { active: null, history: [] }; }
}
