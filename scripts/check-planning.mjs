import assert from 'node:assert/strict';
import { exercises } from '../src/data.js';
import { backupDocument, buildPlan, dateFromKey, dateKey, heatLevel, mergeBackup, muscleActivity, parseBackup, personalRecords, readCalendar, weekDays } from '../src/planning-model.js';
import { createSession, finishSession, logSet } from '../src/workout-model.js';

const now = new Date(2026, 9, 7, 12).getTime();
const days = weekDays(now);
assert.equal(days[0].getDay(), 6); assert.equal(days[6].getDay(), 5);
assert.equal(dateKey(days[0]), '2026-10-03');
assert.equal(dateKey(weekDays(new Date(2026, 0, 1))[0]), '2025-12-27');
assert.equal(dateKey(dateFromKey('2026-10-07')), '2026-10-07');
assert.equal(dateKey(new Date(2026, 9, 7, 0, 1)), '2026-10-07', 'Dates must not shift to the UTC day.');
const beginner = buildPlan({ focus: 'full', level: 'beginner', equipment: ['bodyweight'], minutes: 60 });
assert.ok(beginner.length);
assert.ok(beginner.every(id => exercises[id].equipment === 'bodyweight' && exercises[id].difficulty === 'beginner'));
assert.equal(new Set(beginner.map(id => exercises[id].muscle)).size, beginner.length);
assert.deepEqual(buildPlan({ equipment: [] }), []);
assert.ok(buildPlan({ equipment: ['bodyweight', 'dumbbell', 'cable', 'machine', 'barbell'], level: 'advanced', minutes: 15 }).length <= 3);
assert.ok(buildPlan({ focus: 'lower', level: 'advanced', equipment: ['dumbbell', 'barbell', 'machine'] }).every(id => ['quads','hamstrings','glutes','calves','adductors','abs','obliques'].includes(exercises[id].muscle)));

let active = createSession([exercises[0], exercises[15]], now - 60000);
active = logSet(active, 8, 32.5, now - 50000);
active = logSet(active, 12, 20, now - 40000);
active = logSet({ ...active, currentIndex: 1 }, 45, 0, now - 30000);
const history = finishSession({ active, history: [] }, now).history;
const activity = muscleActivity([...history, { ...history[0], startedAt: now + 86400000 }, { ...history[0], finishedAt: null }], days, now);
assert.equal(activity.chest.sets, 2); assert.equal(activity.abs.sets, 1); assert.equal(activity.back.sets, 0);
assert.equal(heatLevel(0), 0); assert.equal(heatLevel(3), 1); assert.equal(heatLevel(8), 2); assert.equal(heatLevel(9), 3);
const records = personalRecords(history);
assert.equal(records[0].weight.value, 32.5); assert.equal(records[0].weight.amount, 8);
assert.equal(records[0].amount.value, 12); assert.equal(records[0].amount.weight, 20);
assert.equal(records[1].timed, true); assert.equal(records[1].weight, null); assert.equal(records[1].amount.value, 45);
const data = { saved: [0,15], history, calendar: { '2026-10-07': { type: 'workout', exerciseIds: [0,15] }, '2026-10-08': { type: 'rest', exerciseIds: [] } } };
assert.deepEqual(parseBackup(JSON.stringify(backupDocument(data))), data);
const merged = mergeBackup(data, { saved: [15,2], history: [...history, { ...history[0], id: 'new' }], calendar: { '2026-10-07': { type: 'rest', exerciseIds: [] }, '2026-10-09': { type: 'rest', exerciseIds: [] } } });
assert.deepEqual(merged.saved, [0,15,2]); assert.equal(merged.history.length, 2);
assert.equal(merged.calendar['2026-10-07'].type, 'workout', 'Existing day plans must survive import.');
assert.ok(merged.calendar['2026-10-09']);
assert.equal(data.history.length, 1, 'Merging must not mutate current data.');
assert.equal(mergeBackup(data, { ...data, history: Array.from({length:100}, (_,i) => ({ ...history[0], id: `extra-${i}`, startedAt: now + i })) }).history.length, 100);
for (const change of [
    d => { d.version = 3; }, d => { d.saved = [999]; }, d => { d.saved = [0,0]; },
    d => { d.history[0].exercises[0].sets[0].weight = -1; },
    d => { d.history[0].finishedAt = d.history[0].startedAt - 1; },
    d => { d.history.push(d.history[0]); },
    d => { d.calendar['2026-02-31'] = { type: 'rest', exerciseIds: [] }; },
    d => { d.calendar['__proto__'] = null; d.calendar = JSON.parse('{"__proto__":{"type":"rest","exerciseIds":[]}}'); },
    d => { d.calendar['2026-10-07'].exerciseIds = []; },
]) { const candidate = backupDocument(structuredClone(data)); change(candidate); assert.throws(() => parseBackup(JSON.stringify(candidate))); }
assert.throws(() => parseBackup('invalid')); assert.throws(() => parseBackup(' '.repeat(2 * 1024 * 1024 + 1)));
assert.deepEqual(readCalendar({ getItem: () => 'invalid' }), {});
assert.deepEqual(readCalendar({ getItem: () => JSON.stringify(data.calendar) }), data.calendar);
console.log('PASS: local Persian-week boundaries, plan constraints, activity aggregation, independent records, backup round-trip, merge preservation and malformed import rejection.');
