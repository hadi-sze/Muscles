import assert from 'node:assert/strict';
import { activitySummary, exerciseTrend, localDay, loggedExercises } from '../src/progress-model.js';

const now = new Date(2026, 9, 5, 12).getTime();
const time = (day, hour = 12) => new Date(2026, 9, day, hour).getTime();
const exercise = (id, en, values) => ({ id, name: en, en, sets: values.map(([amount, weight]) => ({ amount, weight })) });
const session = (id, startedAt, exercises, done = true) => ({ id, startedAt, ...(done ? { finishedAt: startedAt + 60000 } : {}), exercises });
const history = [
    session('today', time(5), [exercise(0, 'Bench press', [[10, 12.5], [8, 15]]), exercise(15, 'Plank', [[30, 0], [45, 0]])]),
    session('same-day', time(5, 9), [exercise(0, 'Bench press', [[12, 10]])]),
    session('edge', time(-1, 0), [exercise(0, 'Bench press', [[8, 5]])]),
    session('too-old', time(-2), [exercise(0, 'Bench press', [[8, 20]])]),
    session('active', time(4), [exercise(0, 'Bench press', [[8, 99]])], false),
    session('empty', time(4), [exercise(2, 'Unlogged exercise', [])]),
    session('future', time(6), [exercise(0, 'Bench press', [[8, 30]])]),
];
const week = activitySummary(history, 7, now);
assert.equal(week.sessions, 3);
assert.equal(week.sets, 6);
assert.equal(week.activeDays, 2);
assert.equal(week.dates.length, 7);
assert.equal(week.dates[0].date, localDay(time(-1)));
assert.equal(week.dates.at(-1).sessions, 2, 'Multiple sessions on the same day must share a bucket.');
assert.equal(week.dates.at(-1).sets, 5);
assert.equal(week.dates[1].sets, 0, 'Missing days must remain zero.');
assert.equal(activitySummary(history, 28, now).sessions, 4);
assert.equal(activitySummary([], 7, now).sets, 0);
assert.deepEqual(loggedExercises(history).map(item => item.id), [0, 15]);
assert.ok(loggedExercises(history).find(item => item.id === 15).timed);
const weights = exerciseTrend(history, 0, 'weight');
assert.deepEqual(weights.map(point => point.id), ['too-old', 'edge', 'same-day', 'today', 'future']);
assert.equal(weights.find(point => point.id === 'today').value, 15);
assert.equal(exerciseTrend(history, 0, 'amount').find(point => point.id === 'today').value, 10);
assert.equal(exerciseTrend(history, 15, 'amount')[0].value, 45);
assert.equal(exerciseTrend(history, 15, 'weight')[0].value, 0, 'Bodyweight zero must remain a valid data point.');
assert.deepEqual(exerciseTrend(history, 99), []);
assert.equal(activitySummary(history, 7, now).sets, 6, 'Chart computations must not mutate history.');
console.log('PASS: local-day boundaries, zero days, multiple sessions, active/empty exclusions, range filtering, chronological trends, decimal weights and timed/bodyweight metrics.');
