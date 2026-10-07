import { isTimedExercise, setCount } from './workout-model.js';

export function localDay(timestamp) {
    const day = new Date(timestamp);
    day.setHours(0, 0, 0, 0);
    return day.getTime();
}

export function activitySummary(history, days = 7, now = Date.now()) {
    const today = localDay(now);
    const dates = Array.from({ length: days }, (_, index) => {
        const day = new Date(today);
        day.setDate(day.getDate() - days + 1 + index);
        return { date: day.getTime(), sessions: 0, sets: 0 };
    });
    const buckets = new Map(dates.map(day => [day.date, day]));
    const sessions = history.filter(session => Number.isFinite(session.finishedAt) && session.startedAt <= now && setCount(session) > 0 && buckets.has(localDay(session.startedAt)));
    for (const session of sessions) {
        const bucket = buckets.get(localDay(session.startedAt));
        bucket.sessions++;
        bucket.sets += setCount(session);
    }
    return { dates, sessions: sessions.length, sets: dates.reduce((total, day) => total + day.sets, 0), activeDays: dates.filter(day => day.sessions > 0).length };
}

export function loggedExercises(history) {
    const found = new Map();
    for (const session of history) {
        if (!Number.isFinite(session.finishedAt)) continue;
        for (const exercise of session.exercises) if (exercise.sets.length && !found.has(exercise.id)) found.set(exercise.id, { id: exercise.id, name: exercise.name, timed: isTimedExercise(exercise) });
    }
    return [...found.values()].sort((a, b) => a.name.localeCompare(b.name, 'fa'));
}

export function exerciseTrend(history, exerciseId, metric = 'weight') {
    return history.filter(session => Number.isFinite(session.finishedAt)).flatMap(session => {
        const exercise = session.exercises.find(item => item.id === exerciseId);
        if (!exercise?.sets.length) return [];
        return [{ id: session.id, date: session.startedAt, value: Math.max(...exercise.sets.map(set => metric === 'weight' ? set.weight : set.amount)), sets: exercise.sets.length }];
    }).sort((a, b) => a.date - b.date);
}
