import { exercises, muscles } from './data.js';
import { isTimedExercise } from './workout-model.js';

export const CALENDAR_KEY = 'mw-calendar-v1';
export const dateKey = value => {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
export const dateFromKey = key => new Date(`${key}T12:00:00`);
export function weekDays(value = Date.now(), offset = 0) {
    const start = new Date(value);
    start.setHours(12, 0, 0, 0);
    start.setDate(start.getDate() - (start.getDay() + 1) % 7 + offset * 7);
    return Array.from({ length: 7 }, (_, index) => { const day = new Date(start); day.setDate(day.getDate() + index); return day; });
}
export function muscleActivity(history, days, now = Date.now()) {
    const keys = new Set(days.map(dateKey));
    const result = Object.fromEntries(Object.keys(muscles).map(key => [key, { sets: 0, last: null }]));
    for (const session of history) {
        if (!session.finishedAt || session.startedAt > now || !keys.has(dateKey(session.startedAt))) continue;
        for (const entry of session.exercises) {
            const exercise = exercises.find(e => e.id === entry.id), target = result[exercise?.muscle];
            if (!target || !entry.sets.length) continue;
            target.sets += entry.sets.length;
            target.last = Math.max(target.last || 0, session.startedAt);
        }
    }
    return result;
}
export const heatLevel = count => count === 0 ? 0 : count <= 3 ? 1 : count <= 8 ? 2 : 3;

const focuses = {
    full: ['chest', 'quads', 'back', 'glutes', 'shoulders', 'hamstrings', 'abs', 'calves', 'biceps', 'triceps'],
    upper: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'traps', 'abs'],
    lower: ['quads', 'hamstrings', 'glutes', 'calves', 'adductors', 'abs', 'obliques'],
};
export function buildPlan({ focus = 'full', level = 'beginner', equipment = ['bodyweight'], minutes = 30 }) {
    const ranks = { beginner: 0, intermediate: 1, advanced: 2 };
    const available = exercises.filter(e => equipment.includes(e.equipment) && ranks[e.difficulty] <= ranks[level]);
    const count = { 15: 3, 30: 5, 45: 7, 60: 9 }[minutes] || 5;
    return (focuses[focus] || focuses.full).map(muscle => available.find(e => e.muscle === muscle)?.id).filter(id => id !== undefined).slice(0, count);
}
export function personalRecords(history) {
    const result = new Map();
    for (const session of [...history].filter(s => s.finishedAt).sort((a, b) => a.startedAt - b.startedAt)) {
        for (const entry of session.exercises) {
            const exercise = exercises.find(e => e.id === entry.id);
            if (!exercise || !entry.sets.length) continue;
            const record = result.get(entry.id) || { exercise, timed: isTimedExercise(exercise), weight: null, amount: null };
            for (const set of entry.sets) {
                if (set.weight > 0 && (!record.weight || set.weight > record.weight.value)) record.weight = { value: set.weight, date: set.completedAt, amount: set.amount };
                if (!record.amount || set.amount > record.amount.value) record.amount = { value: set.amount, date: set.completedAt, weight: set.weight };
            }
            result.set(entry.id, record);
        }
    }
    return [...result.values()];
}

const validDate = key => typeof key === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(key) && key >= '2000-01-01' && key <= '2200-12-31' && dateKey(dateFromKey(key)) === key;
const validIds = ids => Array.isArray(ids) && ids.length <= exercises.length && new Set(ids).size === ids.length && ids.every(id => exercises.some(e => e.id === id));
function cleanCalendar(calendar) {
    if (!calendar || typeof calendar !== 'object' || Array.isArray(calendar) || Object.keys(calendar).length > 3660) throw new Error('تقویم فایل معتبر نیست.');
    return Object.fromEntries(Object.entries(calendar).map(([key, entry]) => {
        if (!validDate(key) || !entry || !['rest', 'workout'].includes(entry.type) || !validIds(entry.exerciseIds) || (entry.type === 'workout' && !entry.exerciseIds.length) || (entry.type === 'rest' && entry.exerciseIds.length)) throw new Error('یکی از روزهای تقویم معتبر نیست.');
        return [key, { type: entry.type, exerciseIds: [...entry.exerciseIds] }];
    }));
}
export function readCalendar(storage) {
    try { return cleanCalendar(JSON.parse(storage.getItem(CALENDAR_KEY)) || {}); } catch { return {}; }
}
export const mergeHistory = (current, incoming) => {
    const ids = new Set(current.map(s => s.id));
    return [...current, ...incoming.filter(s => !ids.has(s.id))].sort((a, b) => b.startedAt - a.startedAt).slice(0, 100);
};
export function mergeBackup(current, incoming) {
    return { saved: [...new Set([...current.saved, ...incoming.saved])], history: mergeHistory(current.history, incoming.history), calendar: { ...incoming.calendar, ...current.calendar } };
}
export function backupDocument({ saved, history, calendar }) {
    const records = history.map(({ id, startedAt, finishedAt, currentIndex, restDuration, exercises: entries }) => ({
        id, startedAt, finishedAt, currentIndex, restDuration,
        exercises: entries.map(({ id, sets }) => ({ id, sets })),
    }));
    return { app: 'musclewiki', version: 1, exportedAt: new Date().toISOString(), saved, history: records, calendar };
}
export function parseBackup(text) {
    if (new TextEncoder().encode(text).length > 2 * 1024 * 1024) throw new Error('حجم فایل باید کمتر از ۲ مگابایت باشد.');
    let data;
    try { data = JSON.parse(text); } catch { throw new Error('فایل JSON معتبر نیست.'); }
    if (data?.app !== 'musclewiki' || data.version !== 1 || !validIds(data.saved) || !Array.isArray(data.history) || data.history.length > 100) throw new Error('این فایل پشتیبان MuscleWiki نسخه ۱ نیست.');
    const finite = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
    const id = value => typeof value === 'string' && value.length > 0 && value.length <= 100;
    const timestamp = value => finite(value, 0, 8640000000000000);
    const sessionIds = new Set(), setIds = new Set();
    const history = data.history.map(session => {
        if (!session || !id(session.id) || sessionIds.has(session.id) || !timestamp(session.startedAt) || !timestamp(session.finishedAt) || session.finishedAt < session.startedAt || !Number.isInteger(session.restDuration) || !finite(session.restDuration, 1, 600) || !Array.isArray(session.exercises) || !session.exercises.length || !validIds(session.exercises.map(e => e?.id)) || !Number.isInteger(session.currentIndex) || !finite(session.currentIndex, 0, session.exercises.length - 1)) throw new Error('سابقه تمرین در فایل معتبر نیست.');
        sessionIds.add(session.id);
        const entries = session.exercises.map(entry => {
            if (!Array.isArray(entry.sets) || entry.sets.length > 1000) throw new Error('ست‌های تمرین معتبر نیستند.');
            const sets = entry.sets.map(set => {
                if (!set || !id(set.id) || setIds.has(set.id) || !Number.isInteger(set.amount) || !finite(set.amount, 1, 9999) || !finite(set.weight, 0, 9999) || !timestamp(set.completedAt) || set.completedAt < session.startedAt || set.completedAt > session.finishedAt) throw new Error('اطلاعات یکی از ست‌ها معتبر نیست.');
                setIds.add(set.id);
                return { id: set.id, amount: set.amount, weight: set.weight, completedAt: set.completedAt };
            });
            return { ...exercises.find(e => e.id === entry.id), sets };
        });
        return { id: session.id, startedAt: session.startedAt, finishedAt: session.finishedAt, currentIndex: session.currentIndex, restDuration: session.restDuration, rest: null, exercises: entries };
    });
    return { saved: [...data.saved], history, calendar: cleanCalendar(data.calendar) };
}
