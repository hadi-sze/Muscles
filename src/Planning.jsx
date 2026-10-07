import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowLeft, ArrowRight, CalendarDays, Download, Upload, Sparkles, Trophy, Activity, Trash2, Plus, Check, DatabaseBackup } from 'lucide-react';
import { exercises, equipment, muscles } from './data';
import { levels } from './search-model';
import { backupDocument, buildPlan, dateFromKey, dateKey, heatLevel, muscleActivity, parseBackup, personalRecords, weekDays } from './planning-model';

const number = value => value.toLocaleString('fa-IR');
const dateLabel = value => new Date(value).toLocaleDateString('fa-IR', { day: 'numeric', month: 'long' });
export const planningPages = {
    builder: ['سازنده برنامه', Sparkles], calendar: ['تقویم تمرین', CalendarDays],
    heatmap: ['فعالیت عضلات', Activity], records: ['رکوردهای من', Trophy], backup: ['پشتیبان‌گیری', DatabaseBackup],
};
export function PlanningLinks({ view, onNavigate }) {
    return <nav className="planning-links" aria-label="ابزارهای برنامه‌ریزی">{Object.entries(planningPages).map(([key, [label, Icon]]) => <button key={key} aria-current={view === key ? 'page' : undefined} onClick={() => onNavigate(key)}><Icon size={18} /><span>{label}</span></button>)}</nav>;
}
function WeekPicker({ days, offset, setOffset, future = true }) {
    return <div className="week-picker"><button className="secondary" aria-label="هفته قبل" onClick={() => setOffset(offset - 1)}><ArrowRight size={18} /></button><span>{dateLabel(days[0])} تا {dateLabel(days[6])}<small>{offset === 0 ? 'هفته جاری' : `${days[0].toLocaleDateString('fa-IR', { year: 'numeric' })}`}</small></span><button className="secondary" aria-label="هفته بعد" disabled={!future && offset >= 0} onClick={() => setOffset(offset + 1)}><ArrowLeft size={18} /></button>{offset !== 0 && <button className="feature-text-button" onClick={() => setOffset(0)}>این هفته</button>}</div>;
}
function Builder({ onSave, onGuide, onNavigate }) {
    const [focus, setFocus] = useState('full'), [level, setLevel] = useState('beginner'), [minutes, setMinutes] = useState(30);
    const [gear, setGear] = useState(['bodyweight']), [plan, setPlan] = useState(null), [addition, setAddition] = useState(''), [message, setMessage] = useState('');
    const available = equipment.filter(([id]) => exercises.some(e => e.equipment === id));
    const change = action => { action(); setPlan(null); setMessage(''); };
    function move(index, step) { setPlan(old => { const next = [...old]; [next[index], next[index + step]] = [next[index + step], next[index]]; return next; }); setMessage(''); }
    return <div className="builder-layout"><form className="feature-card" onSubmit={e => { e.preventDefault(); setPlan(buildPlan({ focus, level, minutes, equipment: gear })); setMessage(''); }}>
        <span className="feature-eyebrow">۱ · انتخاب ترجیحات</span><h2>برنامه‌ای متناسب با امکانات شما</h2>
        <label>تمرکز تمرین<select value={focus} onChange={e => change(() => setFocus(e.target.value))}><option value="full">تمام بدن</option><option value="upper">بالاتنه</option><option value="lower">پایین‌تنه</option></select></label>
        <div className="feature-field-row"><label>سطح تمرین<select value={level} onChange={e => change(() => setLevel(e.target.value))}>{Object.entries(levels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label>زمان در دسترس<select value={minutes} onChange={e => change(() => setMinutes(Number(e.target.value)))}>{[15, 30, 45, 60].map(value => <option key={value} value={value}>{number(value)} دقیقه</option>)}</select></label></div>
        <fieldset className="equipment-choices"><legend>تجهیزات در دسترس</legend>{available.map(([id, label]) => <label key={id}><input type="checkbox" checked={gear.includes(id)} onChange={() => change(() => setGear(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]))} />{label}</label>)}</fieldset>
        <p className="feature-note">زمان انتخابی تعداد حرکت‌ها را تعیین می‌کند. مدت واقعی به تعداد ست‌ها و استراحت شما بستگی دارد. پیشنهادها از کتابخانه همین برنامه انتخاب می‌شوند.</p>
        <button className="primary" disabled={!gear.length}><Sparkles size={18} />ساخت پیش‌نمایش</button>
    </form><section className="feature-card" aria-label="پیش‌نمایش برنامه"><span className="feature-eyebrow">۲ · مرور و ویرایش</span><h2>برنامه پیشنهادی شما</h2>
        {plan === null ? <div className="feature-empty"><Sparkles size={32} /><p>ترجیحات خود را انتخاب کنید و پیش‌نمایش بسازید.</p></div> : <>
            <p className="feature-note">{number(plan.length)} حرکت · پیش از ذخیره، ترتیب یا حرکت‌ها را تغییر دهید.</p>
            {!plan.length && <p role="status">با این انتخاب‌ها حرکتی در برنامه نیست. تجهیزات یا سطح را تغییر دهید، یا یک حرکت اضافه کنید.</p>}
            <ol className="builder-exercises">{plan.map((id, index) => { const exercise = exercises.find(e => e.id === id); return <li key={id}><span className="list-number">{number(index + 1)}</span><button className="exercise-name-button" onClick={() => onGuide(id)}>{exercise.name}<small>{muscles[exercise.muscle][0]} · {levels[exercise.difficulty]}</small></button><div className="row-controls"><button disabled={index === 0} aria-label={`بالا بردن ${exercise.name}`} onClick={() => move(index, -1)}><ArrowUp size={17} /></button><button disabled={index === plan.length - 1} aria-label={`پایین بردن ${exercise.name}`} onClick={() => move(index, 1)}><ArrowDown size={17} /></button><button aria-label={`حذف ${exercise.name} از پیش‌نمایش`} onClick={() => { setPlan(plan.filter(x => x !== id)); setMessage(''); }}><Trash2 size={17} /></button></div></li>; })}</ol>
            <div className="builder-add"><label>افزودن حرکت دلخواه<select value={addition} onChange={e => setAddition(e.target.value)}><option value="">انتخاب حرکت</option>{exercises.filter(e => !plan.includes(e.id)).map(e => <option key={e.id} value={e.id}>{e.name} · {levels[e.difficulty]}</option>)}</select></label><button className="secondary" aria-label="افزودن حرکت انتخاب‌شده" disabled={addition === '' || plan.includes(Number(addition))} onClick={() => { setPlan([...plan, Number(addition)]); setAddition(''); setMessage(''); }}><Plus size={20} /></button></div>
            <button className="primary" disabled={!plan.length} onClick={() => { onSave(plan); setMessage('حرکت‌ها به برنامه من اضافه شدند؛ حرکت‌های قبلی حفظ شدند.'); }}><Check size={18} />افزودن به برنامه من</button>
            {message && <div className="feature-success" role="status">{message}<button className="feature-text-button" onClick={() => onNavigate('saved')}>مشاهده برنامه من <ArrowLeft size={16} /></button></div>}
        </>}
    </section></div>;
}
function Calendar({ calendar, setCalendar, saved, history, active, onStart, now, onNavigate }) {
    const [offset, setOffset] = useState(0), [selected, setSelected] = useState(dateKey(now)), [message, setMessage] = useState('');
    const days = weekDays(now, offset), entry = calendar[selected];
    const completed = history.filter(session => dateKey(session.startedAt) === selected);
    const shiftWeek = value => { setOffset(value); setSelected(dateKey(weekDays(now, value)[0])); setMessage(''); };
    const save = value => { setCalendar(old => ({ ...old, [selected]: value })); setMessage('روز انتخاب‌شده ذخیره شد.'); };
    return <><WeekPicker days={days} offset={offset} setOffset={shiftWeek} /><div className="calendar-week" aria-label="روزهای هفته">{days.map(day => { const key = dateKey(day), item = calendar[key], count = history.filter(s => dateKey(s.startedAt) === key).length; return <button key={key} className={key === selected ? 'selected' : ''} aria-pressed={key === selected} onClick={() => { setSelected(key); setMessage(''); }}><span>{day.toLocaleDateString('fa-IR', { weekday: 'short' })}</span><strong>{day.toLocaleDateString('fa-IR', { day: 'numeric' })}</strong><small>{key === dateKey(now) ? 'امروز' : dateLabel(day)}</small><em>{item?.type === 'rest' ? 'استراحت' : item ? `${number(item.exerciseIds.length)} حرکت` : 'آزاد'}</em>{count > 0 && <span className="calendar-done"><Check size={13} />{number(count)} جلسه ثبت‌شده</span>}</button>; })}</div>
        <div className="feature-two-column"><section className="feature-card"><span className="feature-eyebrow">{dateFromKey(selected).toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' })}</span><h2>{entry?.type === 'rest' ? 'روز استراحت' : entry ? 'تمرین برنامه‌ریزی‌شده' : 'برای این روز برنامه بچینید'}</h2>
            {entry?.type === 'workout' && <><ul className="scheduled-exercises">{entry.exerciseIds.map(id => <li key={id}>{exercises.find(e => e.id === id)?.name}</li>)}</ul><button className="primary" onClick={() => onStart(entry.exerciseIds)}>{active ? 'ادامه جلسه در حال اجرا' : 'شروع این برنامه اکنون'}</button></>}
            <p className="feature-note">یک نسخه از «برنامه من» برای این روز ذخیره می‌شود. تغییرات بعدی برنامه، روزهای تقویم را تغییر نمی‌دهند.</p>
            <div className="feature-actions"><button className="secondary" disabled={!saved.length} onClick={() => save({ type: 'workout', exerciseIds: [...saved] })}>{entry ? 'جایگزینی با برنامه من' : 'افزودن برنامه من'}</button><button className="secondary" onClick={() => save({ type: 'rest', exerciseIds: [] })}>روز استراحت</button>{entry && <button className="feature-text-button" onClick={() => { setCalendar(old => { const next = { ...old }; delete next[selected]; return next; }); setMessage('برنامه این روز پاک شد.'); }}>پاک کردن روز</button>}</div>
            {!saved.length && <button className="feature-text-button" onClick={() => onNavigate('builder')}>ابتدا برنامه بسازید <ArrowLeft size={16} /></button>}
            <p className="feature-success" role="status">{message}</p>
        </section><section className="feature-card"><h2>جلسه‌های انجام‌شده</h2><p className="feature-note">بر اساس تاریخ شروع جلسات تکمیل‌شده؛ مستقل از برنامه تقویم.</p>{completed.length ? completed.map(session => <div className="completed-day" key={session.id}><Check size={18} /><span>{number(session.exercises.reduce((sum, e) => sum + e.sets.length, 0))} ست ثبت‌شده<small>{new Date(session.startedAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</small></span></div>) : <div className="feature-empty"><CalendarDays size={32} /><p>هنوز جلسه‌ای برای این روز ثبت نشده است.</p></div>}</section></div>
    </>;
}
function Heatmap({ history, now, BodyMap, gender, onGuide }) {
    const [offset, setOffset] = useState(0), [selected, setSelected] = useState('chest'), [hover, setHover] = useState('');
    const days = weekDays(now, offset), activity = muscleActivity(history, days, now), target = activity[selected];
    const total = Object.values(activity).reduce((sum, item) => sum + item.sets, 0);
    return <><WeekPicker days={days} offset={offset} setOffset={setOffset} future={false} /><p className="feature-note">رنگ‌ها تعداد ست‌های ثبت‌شده برای عضله اصلی هر حرکت را نشان می‌دهند؛ میزان آمادگی یا ریکاوری بدن را مشخص نمی‌کنند.</p><div className="heatmap-layout"><section className="heatmap-stage" aria-label="نقشه فعالیت هفتگی عضلات"><div className="heatmap-bodies">{[0, 1].map(side => <div key={side}><BodyMap gender={gender} side={side} selected={selected} hover={hover} onSelect={setSelected} onHover={setHover} activity={activity} /><span>{side === 0 ? 'نمای جلو' : 'نمای پشت'}</span></div>)}</div><div className="heat-legend">{['بدون ست', '۱–۳ ست', '۴–۸ ست', '۹+ ست'].map((label, index) => <span key={label}><i className={`heat-${index}`} />{label}</span>)}</div><p className="feature-note">مجموع هفته: {number(total)} ست{total === 0 && ' · برای روشن شدن نقشه، یک جلسه را ثبت و تکمیل کنید.'}</p></section><section className="feature-card"><label>جزئیات عضله<select value={selected} onChange={e => setSelected(e.target.value)}>{Object.entries(muscles).map(([id, [label]]) => <option key={id} value={id}>{label} · {number(activity[id].sets)} ست</option>)}</select></label><div className="muscle-week-total"><strong>{number(target.sets)}</strong><span>ست برای {muscles[selected][0]}</span><i className={`heat-${heatLevel(target.sets)}`} /></div><p className="feature-note">{target.last ? `آخرین تمرین این هفته: ${dateLabel(target.last)}` : 'در این هفته ستی برای این عضله ثبت نشده است.'}</p><h3>حرکت‌های این عضله</h3><div className="related-exercises">{exercises.filter(e => e.muscle === selected).map(e => <button key={e.id} onClick={() => onGuide(e.id)}>{e.name}<ArrowLeft size={16} /></button>)}</div></section></div></>;
}
function Records({ history, onNavigate }) {
    const records = personalRecords(history);
    return <><p className="feature-note">بهترین ست‌های جلسات تکمیل‌شده شما. وزن و تعداد تکرار دو رکورد مستقل‌اند؛ وزن ثبت‌شده همان مقدار واردشده توسط شماست.</p>{!records.length ? <div className="feature-empty"><Trophy size={38} /><h2>اولین رکورد در انتظار شماست</h2><p>یک جلسه تمرین را ثبت و تکمیل کنید تا رکوردها اینجا نمایش داده شوند.</p><button className="primary" onClick={() => onNavigate('saved')}>رفتن به برنامه من</button></div> : <div className="records-grid">{records.map(({ exercise, timed, weight, amount }) => <article className="feature-card record-card" key={exercise.id}><span className="record-icon"><Trophy size={23} /></span><span className="feature-eyebrow">{muscles[exercise.muscle][0]}</span><h2>{exercise.name}</h2><div className="record-values">{weight && <div><span>بیشترین وزن</span><strong>{number(weight.value)} <small>کیلوگرم</small></strong><p>{number(weight.amount)} {timed ? 'ثانیه' : 'تکرار'} · {dateLabel(weight.date)}</p></div>}<div><span>{timed ? 'بیشترین زمان' : 'بیشترین تکرار'}</span><strong>{number(amount.value)} <small>{timed ? 'ثانیه' : 'تکرار'}</small></strong><p>{amount.weight > 0 ? `${number(amount.weight)} کیلوگرم · ` : ''}{dateLabel(amount.date)}</p></div></div></article>)}</div>}</>;
}
function Backup({ saved, history, calendar, onImport }) {
    const [preview, setPreview] = useState(null), [error, setError] = useState(''), [message, setMessage] = useState('');
    async function selectFile(event) {
        const file = event.target.files?.[0]; event.target.value = '';
        setPreview(null); setError(''); setMessage('');
        if (!file) return;
        try {
            if (file.size > 2 * 1024 * 1024) throw new Error('حجم فایل باید کمتر از ۲ مگابایت باشد.');
            setPreview(parseBackup(await file.text()));
        } catch (error) { setError(error.message); }
    }
    function download() {
        const blob = new Blob([JSON.stringify(backupDocument({ saved, history, calendar }), null, 2)], { type: 'application/json' });
        if (blob.size > 2 * 1024 * 1024) { setError('اطلاعات بیش از حد مجاز ۲ مگابایت است؛ فایل قابل بازیابی ساخته نشد.'); return; }
        setError('');
        const url = URL.createObjectURL(blob), link = document.createElement('a');
        link.href = url; link.download = `musclewiki-backup-${dateKey(Date.now())}.json`; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        setMessage('فایل پشتیبان برای دانلود آماده شد.');
    }
    const newSessions = preview?.history.filter(s => !history.some(old => old.id === s.id)).length || 0;
    return <div className="feature-two-column"><section className="feature-card"><span className="feature-eyebrow">نگه‌داری یا انتقال اطلاعات</span><h2>یک نسخه برای خودتان نگه دارید</h2><p className="feature-note">برنامه ذخیره‌شده، حداکثر ۱۰۰ جلسه تکمیل‌شده و تقویم در یک فایل ذخیره می‌شوند. جلسه در حال اجرا و تنظیمات ظاهر در این فایل نیستند.</p><div className="backup-counts"><span><strong>{number(saved.length)}</strong>حرکت ذخیره‌شده</span><span><strong>{number(history.length)}</strong>جلسه</span><span><strong>{number(Object.keys(calendar).length)}</strong>روز برنامه‌ریزی‌شده</span></div><button className="primary" onClick={download}><Download size={18} />دریافت فایل پشتیبان</button></section>
        <section className="feature-card"><span className="feature-eyebrow">بازیابی از فایل</span><h2>اطلاعات خود را برگردانید</h2><p className="feature-note">فایل فقط روی همین دستگاه خوانده می‌شود. موارد جدید اضافه می‌شوند؛ برنامه روزهای موجود و جلسه در حال اجرا حفظ می‌شوند. حداکثر ۱۰۰ جلسه جدیدتر نگه‌داری می‌شود.</p><label className="backup-upload"><Upload size={22} /><span>انتخاب فایل JSON · حداکثر ۲ مگابایت</span><input type="file" accept=".json,application/json" aria-label="انتخاب فایل پشتیبان" onChange={selectFile} /></label>
            {preview && <div className="backup-preview"><h3>پیش‌نمایش فایل</h3><p>{number(preview.saved.length)} حرکت · {number(preview.history.length)} جلسه ({number(newSessions)} جدید) · {number(Object.keys(preview.calendar).length)} روز</p><button className="primary" onClick={() => { onImport(preview); setPreview(null); setMessage('اطلاعات فایل با اطلاعات فعلی ادغام شد.'); }}><Check size={18} />تأیید و افزودن اطلاعات</button><button className="feature-text-button" onClick={() => setPreview(null)}>انصراف</button></div>}
            {error && <p role="alert" className="feature-error">{error}</p>}
        </section><p className="feature-success" role="status">{message}</p></div>;
}
export default function Planning(props) {
    const [now, setNow] = useState(Date.now);
    useEffect(() => { const update = () => setNow(Date.now()); const timer = setInterval(update, 60000); document.addEventListener('visibilitychange', update); return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update); }; }, []);
    return <section className="planning-workspace" dir="rtl"><PlanningLinks view={props.view} onNavigate={props.onNavigate} />
        {props.storageError && <p role="alert" className="feature-error">ذخیره اطلاعات روی دستگاه انجام نشد. پیش از بستن صفحه، فایل پشتیبان بگیرید.</p>}
        {props.view === 'builder' ? <Builder {...props} /> : props.view === 'calendar' ? <Calendar {...props} now={now} /> : props.view === 'heatmap' ? <Heatmap {...props} now={now} /> : props.view === 'records' ? <Records {...props} /> : <Backup {...props} />}
    </section>;
}
