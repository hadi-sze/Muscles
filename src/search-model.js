export const levels = { beginner: 'مبتدی', intermediate: 'متوسط', advanced: 'پیشرفته' };
export function readSavedExercises(storage, exercises) {
    try {
        const saved = JSON.parse(storage.getItem('mw-saved'));
        return Array.isArray(saved) ? [...new Set(saved)].filter(id => exercises.some(exercise => exercise.id === id)) : [];
    } catch { return []; }
}
export function normalizeSearch(value) {
    return String(value).normalize('NFKC').toLowerCase().replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[\u200c\u200d\-]/g, ' ').replace(/\s+/g, ' ').trim();
}
export function filterExercises(exercises, { muscle = '', query = '', equipment = [], difficulty = '' }, muscles) {
    const terms = normalizeSearch(query).split(' ').filter(Boolean);
    return exercises.filter(exercise => {
        const text = normalizeSearch(`${exercise.name} ${exercise.en} ${muscles[exercise.muscle][0]} ${muscles[exercise.muscle][1]}`);
        return (!muscle || muscle === exercise.muscle) && (!difficulty || difficulty === exercise.difficulty) &&
            (!equipment.length || equipment.includes('featured') || equipment.includes(exercise.equipment)) && terms.every(term => text.includes(term));
    });
}
