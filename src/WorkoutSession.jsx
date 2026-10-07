import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Dumbbell, Play, RotateCcw, Timer, Trash2 } from 'lucide-react';
import { equipment, muscles } from './data';
import { FlipClock } from './Timer';
import { isTimedExercise, setCount } from './workout-model';
import './workout.css';

const number = value => value.toLocaleString('fa-IR');
const date = timestamp => new Date(timestamp).toLocaleDateString('fa-IR', { month: 'long', day: 'numeric', year: 'numeric' });

function SessionStats({ session }) {
    return <div className="session-stats">
        <span><strong>{number(setCount(session))}</strong>ست ثبت‌شده</span>
        <span><strong>{number(session.exercises.filter(exercise => exercise.sets.length > 0).length)}</strong>حرکت ثبت‌شده</span>
        {session.finishedAt && <span><strong>{number(Math.max(1, Math.ceil((session.finishedAt - session.startedAt) / 60000)))}</strong>دقیقه</span>}
    </div>;
}

function SessionRecord({ session }) {
    return <div className="session-record"><SessionStats session={session} />
        {session.exercises.filter(exercise => exercise.sets.length).map(exercise => <div key={exercise.id}>
            <strong>{exercise.name}</strong>
            <ul>{exercise.sets.map((set, index) => <li key={set.id}>
                ست {number(index + 1)}: {number(set.amount)} {isTimedExercise(exercise) ? 'ثانیه' : 'تکرار'} · {number(set.weight)} کیلوگرم
            </li>)}</ul>
        </div>)}
    </div>;
}

export function WorkoutHistory({ history }) {
    if (!history.length) return null;
    return <section className="workout-history" aria-label="جلسه‌های قبلی"><h2>جلسه‌های قبلی</h2>
        <p>ثبت‌شده روی همین دستگاه</p>
        {history.map(session => <details key={session.id}><summary><span>{date(session.startedAt)}</span><span>{number(setCount(session))} ست</span></summary><SessionRecord session={session} /></details>)}
    </section>;
}

export function WorkoutPlanAction({ count, active, onStart }) {
    return <section className="workout-plan-action" aria-label="شروع جلسه تمرین"><span className="workout-action-icon"><Dumbbell size={27} /></span>
        <div><h2>{active ? 'جلسه شما آماده ادامه است' : 'برنامه‌تان را به یک جلسه تبدیل کنید'}</h2><p>{active ? 'ست‌ها و زمان استراحت شما حفظ شده‌اند.' : 'تمرین‌ها را دنبال کنید و هر ست را ثبت کنید.'}</p></div>
        <button className="primary" disabled={!active && count === 0} onClick={onStart}><Play size={18} />{active ? 'ادامه جلسه' : 'شروع جلسه'}</button>
    </section>;
}

function SetForm({ exercise, workout }) {
    const previous = exercise.sets.at(-1);
    const [amount, setAmount] = useState(previous?.amount ?? '');
    const [weight, setWeight] = useState(previous?.weight ?? (exercise.equipment === 'bodyweight' ? 0 : ''));
    const [error, setError] = useState('');
    const timed = isTimedExercise(exercise);
    function submit(event) {
        event.preventDefault();
        try { workout.record(amount, weight); setError(''); }
        catch (failure) { setError(failure.message); }
    }
    return <form className="set-form" onSubmit={submit}>
        <div className="set-inputs"><label>{timed ? 'مدت (ثانیه)' : 'تعداد تکرار'}<input aria-label={timed ? 'مدت (ثانیه)' : 'تعداد تکرار'} type="number" inputMode="numeric" min="1" max="9999" step="1" required value={amount} onChange={event => setAmount(event.target.value)} /></label>
            <label>وزن (کیلوگرم)<input aria-label="وزن (کیلوگرم)" type="number" inputMode="decimal" min="0" max="9999" step="any" required value={weight} onChange={event => setWeight(event.target.value)} /></label></div>
        <p className="workout-note">برای حرکت بدون وزنه، وزن را صفر وارد کنید.</p>
        {error && <p className="workout-error" role="alert">{error}</p>}
        <button className="primary log-set" disabled={!!workout.session.rest} type="submit"><Check size={19} />ثبت ست و شروع استراحت</button>
        {workout.session.rest && <p className="workout-note">برای ثبت ست بعدی، استراحت را تمام کنید یا رد کنید.</p>}
    </form>;
}

function RestSettings({ duration, onChange }) {
    const [custom, setCustom] = useState(duration);
    return <div className="session-rest-settings">
        <div className="rest-presets" role="group" aria-label="زمان استراحت">{[30, 60, 90, 120].map(seconds => <button key={seconds} className="secondary" aria-pressed={duration === seconds} onClick={() => { onChange(seconds); setCustom(seconds); }}>{number(seconds)} ثانیه</button>)}</div>
        <form onSubmit={event => { event.preventDefault(); onChange(Number(custom)); }}><label>استراحت ست بعدی (ثانیه)<input aria-label="استراحت ست بعدی (ثانیه)" type="number" inputMode="numeric" min="1" max="600" step="1" required value={custom} onChange={event => setCustom(event.target.value)} /></label><button className="secondary" type="submit">تنظیم</button></form>
    </div>;
}

export default function WorkoutSession({ workout, completed, onBack, onGuide }) {
    const session = workout.session;
    if (!session) return <section className="workout-complete" dir="rtl">
        <span className="workout-complete-mark"><Check size={32} /></span><h1>{completed ? 'جلسه ثبت شد' : 'جلسه بسته شد'}</h1>
        <p>{completed ? 'جزئیات تمرین در جلسه‌های قبلی ذخیره شد.' : 'هنوز ستی ثبت نشده است.'}</p>
        {completed && <SessionRecord session={completed} />}
        <button className="primary" onClick={onBack}>بازگشت به برنامه من<ArrowLeft size={18} /></button>
    </section>;
    const exercise = session.exercises[session.currentIndex];
    const hasRest = !!session.rest;
    const paused = hasRest && session.rest.deadline === null;
    return <section className="workout-session" dir="rtl" aria-label="جلسه تمرین">
        <div className="session-heading"><div><span className="eyebrow">جلسه تمرین · {date(session.startedAt)}</span><h1>تمرین امروز شما</h1></div>
            <button className="secondary" onClick={onBack}><ArrowRight size={17} />برنامه من</button></div>
        <SessionStats session={session} />
        {workout.storageError && <p className="workout-error" role="alert">ذخیره روی دستگاه انجام نشد؛ داده‌ها فعلاً فقط در این صفحه باقی می‌مانند.</p>}
        <div className="session-layout"><div className="session-exercise">
            <div className="session-exercise-title"><span className="workout-action-icon"><Dumbbell size={25} /></span><div><span className="workout-note">حرکت {number(session.currentIndex + 1)} از {number(session.exercises.length)}</span><h2>{exercise.name}</h2><p dir="ltr">{exercise.en}</p></div></div>
            <div className="session-tags"><span>{muscles[exercise.muscle]?.[0]}</span><span>{equipment.find(item => item[0] === exercise.equipment)?.[1]}</span></div>
            <button className="guide-source session-guide" onClick={() => onGuide(exercise.id)}>راهنمای اجرای حرکت</button>
            <SetForm key={exercise.id} exercise={exercise} workout={workout} />
            <section className="logged-sets" aria-label="ست‌های این حرکت"><h3>ست‌های این حرکت</h3>
                {!exercise.sets.length ? <p className="workout-note">هنوز ستی ثبت نشده است.</p> : <table><thead><tr><th scope="col">ست</th><th scope="col">{isTimedExercise(exercise) ? 'ثانیه' : 'تکرار'}</th><th scope="col">کیلوگرم</th><th scope="col">ویرایش</th></tr></thead><tbody>{exercise.sets.map((set, index) => <tr key={set.id}><td>{number(index + 1)}</td><td>{number(set.amount)}</td><td>{number(set.weight)}</td><td><button className="icon-button" aria-label={`حذف ست ${number(index + 1)}`} onClick={() => workout.undoSet(set.id)}><Trash2 size={17} /></button></td></tr>)}</tbody></table>}
            </section>
            <div className="exercise-navigation"><button className="secondary" disabled={session.currentIndex === 0} onClick={() => workout.selectExercise(session.currentIndex - 1)}><ArrowRight size={17} />حرکت قبلی</button><button className="secondary" disabled={session.currentIndex === session.exercises.length - 1} onClick={() => workout.selectExercise(session.currentIndex + 1)}>حرکت بعدی<ArrowLeft size={17} /></button></div>
        </div><aside className={`session-rest ${workout.restFinished ? 'rest-done' : ''}`} aria-label="استراحت جلسه">
            <h2><Timer size={20} />استراحت بین ست‌ها</h2><FlipClock seconds={hasRest ? workout.seconds : 0} />
            <p className="session-rest-status" role="status">{workout.restFinished ? 'استراحت تمام شد؛ آماده ست بعدی باشید.' : paused ? 'استراحت متوقف شده است.' : hasRest ? 'زمان استراحت شما' : 'تایمر پس از ثبت ست شروع می‌شود.'}</p>
            {hasRest && <div className="session-rest-buttons"><button className="secondary" onClick={paused ? workout.resumeRest : workout.pauseRest}>{paused ? 'ادامه استراحت' : 'توقف استراحت'}</button><button className="secondary" onClick={workout.skipRest}>رد کردن استراحت</button></div>}
            <RestSettings duration={session.restDuration} onChange={workout.setRestDuration} />
        </aside></div>
        <nav className="session-plan" aria-label="حرکت‌های جلسه">{session.exercises.map((item, index) => <button key={item.id} className={session.currentIndex === index ? 'current' : ''} aria-current={session.currentIndex === index ? 'step' : undefined} onClick={() => workout.selectExercise(index)}><span>{number(index + 1)}</span><strong>{item.name}</strong><small>{number(item.sets.length)} ست</small></button>)}</nav>
        <div className="session-finish"><p>ست‌های ثبت‌شده با پایان جلسه در سابقه ذخیره می‌شوند.</p><button className="primary" onClick={workout.finish}><Check size={18} />{setCount(session) ? 'پایان و ذخیره جلسه' : 'بستن جلسه بدون ثبت'}</button></div>
    </section>;
}

export function WorkoutResume({ workout, onResume }) {
    return <div className="workout-resume" dir="rtl"><span role="status">{workout.restFinished ? 'استراحت تمام شد' : workout.session.rest ? `استراحت: ${number(workout.seconds)} ثانیه` : 'جلسه تمرین در حال اجرا'}</span><button onClick={onResume}><RotateCcw size={17} />ادامه جلسه</button></div>;
}
