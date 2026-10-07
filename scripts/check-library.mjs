import assert from 'node:assert/strict';
import { exercises, muscles } from '../src/data.js';
import { filterExercises, normalizeSearch, readSavedExercises } from '../src/search-model.js';

const find = filters => filterExercises(exercises, filters, muscles).map(exercise => exercise.en);
assert.deepEqual(find({ query:'bench chest', equipment:['barbell'], difficulty:'beginner', muscle:'chest' }), ['Barbell bench press']);
assert.deepEqual(find({ query:'سيم كش', muscle:'back' }), ['Lat pulldown']);
assert.deepEqual(find({ query:'پلانک', equipment:['bodyweight'], difficulty:'intermediate' }), ['Side plank']);
assert.deepEqual(find({ query:'squat', equipment:['machine'] }), []);
assert.equal(normalizeSearch(' كِشـ  ورزشي '), 'کش ورزشی');
assert.equal(find({ query:'   ' }).length, 31);
assert.equal(find({ query:'does not exist' }).length, 0);
assert.equal(find({ equipment:['cardio'] }).length, 0);
assert.deepEqual(readSavedExercises({ getItem:()=>'[16,0,16,999,"1"]' }, exercises), [16,0]);
assert.deepEqual(readSavedExercises({ getItem:()=>'{}' }, exercises), []);
assert.deepEqual(readSavedExercises({ getItem:()=>'{invalid' }, exercises), []);
assert.deepEqual(readSavedExercises({ getItem:()=>{ throw new Error('Unavailable'); } }, exercises), []);
assert.equal(new Set(exercises.map(exercise => exercise.id)).size, 31);
assert.equal(exercises.filter(exercise => exercise.video).length, 4);
for (const exercise of exercises) {
    assert.ok(['beginner','intermediate','advanced'].includes(exercise.difficulty));
    assert.equal(exercise.steps.length, 3);
    assert.ok(exercise.steps.every(step => typeof step === 'string' && step.length > 20));
    assert.equal(new URL(exercise.sourceUrl).protocol, 'https:');
}
console.log('PASS: combined filters, Persian/Arabic spelling, empty results, saved-order recovery, and complete exercise guides.');
