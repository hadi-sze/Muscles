import React, { useEffect, useState } from 'react';
import { Activity, ArrowRight, BarChart3, CalendarDays, Dumbbell } from 'lucide-react';
import { activitySummary, exerciseTrend, loggedExercises } from './progress-model';
import './progress.css';

const number = value => value.toLocaleString('fa-IR', { maximumFractionDigits: 2 });
const date = value => new Date(value).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });

function ActivityChart({ summary }) {
    const max = Math.max(1, ...summary.dates.map(day => day.sets));
    const ticks = max === 1 ? [0, 1] : [0, Math.ceil(max / 2), max];
    const step = 560 / summary.dates.length;
    return <><svg className="progress-chart" viewBox="0 0 640 230" role="img" aria-label={`فعالیت ${number(summary.dates.length)} روز اخیر: ${number(summary.sets)} ست در ${number(summary.activeDays)} روز`}>
        {ticks.map(value => <g key={value}><line x1="50" x2="610" y1={180 - value / max * 150} y2={180 - value / max * 150} className="chart-grid" /><text x="36" y={185 - value / max * 150} className="chart-axis" textAnchor="end">{number(value)}</text></g>)}
        {summary.dates.map((day, index) => <g key={day.date}><rect x={50 + index * step + step * .18} y={180 - day.sets / max * 150} width={step * .64} height={Math.max(0, day.sets / max * 150)} rx={Math.min(6, step * .15)} className="chart-bar"><title>{date(day.date)}: {number(day.sets)} ست، {number(day.sessions)} جلسه</title></rect>
            {(summary.dates.length === 7 || index % 7 === 0 || index === summary.dates.length - 1) && <text x={50 + index * step + step / 2} y="208" textAnchor="middle" className="chart-axis">{date(day.date)}</text>}
        </g>)}
    </svg><details className="progress-data"><summary>مشاهده داده‌های نمودار</summary><table><thead><tr><th scope="col">روز</th><th scope="col">جلسه</th><th scope="col">ست</th></tr></thead><tbody>{summary.dates.map(day => <tr key={day.date}><td>{date(day.date)}</td><td>{number(day.sessions)}</td><td>{number(day.sets)}</td></tr>)}</tbody></table></details></>;
}

function TrendChart({ points, unit }) {
    const [selectedId, setSelectedId] = useState(null);
    const selected = points.find(point => point.id === selectedId) ?? points.at(-1);
    const max = Math.max(1, ...points.map(point => point.value));
    const x = index => points.length === 1 ? 330 : 50 + index / (points.length - 1) * 560;
    const y = value => 180 - value / max * 150;
    return <>
        <p className="trend-reading" aria-live="polite">{selected && <>{date(selected.date)}<strong>{number(selected.value)} {unit}</strong><span>{number(selected.sets)} ست ثبت‌شده</span></>}</p>
        <svg className="progress-chart trend-chart" viewBox="0 0 640 230" role="group" aria-label={`بیشترین ${unit} ثبت‌شده در هر جلسه؛ نقاط را برای مشاهده جزئیات انتخاب کنید`}>
            {[0, .5, 1].map(fraction => <g key={fraction}><line x1="50" x2="610" y1={180 - fraction * 150} y2={180 - fraction * 150} className="chart-grid" /><text x="36" y={185 - fraction * 150} className="chart-axis" textAnchor="end">{number(max * fraction)}</text></g>)}
            {points.length > 1 && <polyline points={points.map((point, index) => `${x(index)},${y(point.value)}`).join(' ')} className="chart-trend" />}
            {points.map((point, index) => <g key={point.id}>
                <circle cx={x(index)} cy={y(point.value)} r="12" className={`chart-point ${selected?.id === point.id ? 'selected' : ''}`} role="button" tabIndex="0" aria-label={`${date(point.date)}: ${number(point.value)} ${unit}، ${number(point.sets)} ست`} aria-pressed={selected?.id === point.id} onClick={() => setSelectedId(point.id)} onFocus={() => setSelectedId(point.id)} onKeyDown={event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); setSelectedId(point.id); } }}><title>{date(point.date)}: {number(point.value)} {unit}</title></circle>
                {(index === 0 || index === points.length - 1) && <text x={x(index)} y="208" textAnchor="middle" className="chart-axis">{date(point.date)}</text>}
            </g>)}
        </svg>
        <details className="progress-data"><summary>مشاهده جزئیات جلسه‌ها</summary><table><thead><tr><th scope="col">جلسه</th><th scope="col">تاریخ</th><th scope="col">بیشترین {unit}</th><th scope="col">ست</th></tr></thead><tbody>{points.map((point, index) => <tr key={point.id}><td>{number(index + 1)}</td><td>{date(point.date)}</td><td>{number(point.value)}</td><td>{number(point.sets)}</td></tr>)}</tbody></table></details>
        {points.length === 1 && <p className="progress-note">با ثبت جلسه بعدی، تغییرات این حرکت در نمودار مشخص می‌شود.</p>}
    </>;
}

export default function WorkoutProgress({ history, onPlan }) {
    const [days, setDays] = useState(7);
    const [exerciseId, setExerciseId] = useState(null);
    const [metric, setMetric] = useState('weight');
    const [now, setNow] = useState(Date.now);
    useEffect(() => {
        const refresh = () => setNow(Date.now());
        const interval = window.setInterval(refresh, 60000);
        document.addEventListener('visibilitychange', refresh);
        return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', refresh); };
    }, []);
    const summary = activitySummary(history, days, now);
    const available = loggedExercises(history);
    const exercise = available.find(item => item.id === exerciseId) ?? available[0];
    const points = exercise ? exerciseTrend(history, exercise.id, metric) : [];
    const unit = metric === 'weight' ? 'کیلوگرم' : exercise?.timed ? 'ثانیه' : 'تکرار';
    return <section className="workout-progress" dir="rtl" aria-label="پیشرفت من">
        <div className="progress-heading"><div><span className="eyebrow">ثبت‌های واقعی شما</span><h2><Activity size={25} />پیشرفت من</h2><p>آمار جلسه‌های پایان‌یافته، ذخیره‌شده روی همین دستگاه</p></div><button className="secondary" onClick={onPlan}><ArrowRight size={17} />برنامه من</button></div>
        <div className="progress-range" role="group" aria-label="بازه فعالیت">{[7, 28].map(period => <button key={period} aria-pressed={period === days} onClick={() => setDays(period)}>{number(period)} روز اخیر</button>)}</div>
        <div className="progress-totals">
            {[[CalendarDays, summary.sessions, 'جلسه'], [Dumbbell, summary.sets, 'ست ثبت‌شده'], [Activity, summary.activeDays, 'روز فعال']].map(([Icon, value, label]) => <div key={label}><Icon size={21} /><strong>{number(value)}</strong><span>{label}</span></div>)}
        </div>
        <div className="progress-panels"><section className="progress-card"><h3><BarChart3 size={20} />فعالیت روزانه</h3><p className="progress-note">تعداد ست‌ها بر اساس روز شروع جلسه</p><ActivityChart summary={summary} />{!summary.sessions && <p className="progress-note">در این بازه جلسه‌ای ثبت نشده است.</p>}</section>
            <section className="progress-card"><h3>سابقه هر حرکت</h3>{!exercise ? <div className="progress-empty"><Dumbbell size={36} /><p>پس از پایان اولین جلسه، سابقه حرکت‌ها اینجا نمایش داده می‌شود.</p><button className="primary" onClick={onPlan}>رفتن به برنامه من</button></div> : <>
                <label className="progress-exercise">حرکت<select aria-label="حرکت نمودار پیشرفت" value={exercise.id} onChange={event => setExerciseId(Number(event.target.value))}>{available.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <div className="progress-metrics" role="group" aria-label="معیار نمودار"><button aria-pressed={metric === 'weight'} onClick={() => setMetric('weight')}>وزن</button><button aria-pressed={metric === 'amount'} onClick={() => setMetric('amount')}>{exercise.timed ? 'مدت' : 'تکرار'}</button></div>
                <p className="progress-note">بیشترین {unit} ثبت‌شده در هر جلسه · همه جلسه‌های ذخیره‌شده</p>
                <TrendChart key={`${exercise.id}-${metric}`} points={points} unit={unit} />
            </>}</section></div>
        <p className="progress-footnote">جلسه‌های در حال اجرا در این آمار محاسبه نمی‌شوند. روزهای بدون تمرین صفر نمایش داده می‌شوند.</p>
    </section>;
}
