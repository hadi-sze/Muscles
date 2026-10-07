import React, { useState, useEffect, useRef, useId } from 'react';
import { createRoot } from 'react-dom/client';
import { Dumbbell, Sparkles, PersonStanding, Cable, Circle, Weight, Accessibility, Waves, Disc3, MoveUpRight, Flower2, CircleDot, Activity, HeartPulse, Columns3, RefreshCw, X, Bookmark, SearchX, BookmarkCheck, ExternalLink, House, ClipboardList, CalendarDays, Calculator, BookOpen, Menu, ArrowLeft, ArrowRight, ChevronDown, Search, MousePointer2, ScanLine, RotateCcw, Plus, Minus, SlidersHorizontal, Apple, Play, ChevronLeft, Globe2, Salad } from 'lucide-react';
const Icons = { Dumbbell, Sparkles, PersonStanding, Cable, Circle, Weight, Accessibility, Waves, Disc3, MoveUpRight, Flower2, CircleDot, Activity, HeartPulse, Columns3, RefreshCw, X, Bookmark, SearchX, BookmarkCheck, ExternalLink, House, ClipboardList, CalendarDays, Calculator, BookOpen, Menu, ArrowLeft, ArrowRight, ChevronDown, Search, MousePointer2, ScanLine, RotateCcw, Plus, Minus, SlidersHorizontal, Apple, Play, ChevronLeft, Globe2, Salad };
import { muscles, equipment, exercises } from './data';
import mf from './assets/male-front.svg?raw';
import mb from './assets/male-back.svg?raw';
import ff from './assets/female-front.svg?raw';
import fb from './assets/female-back.svg?raw';
import './style.css';
import './studio-theme.css';
import Pwa from './Pwa';
import ThemeToggle from './ThemeToggle';
import ExerciseGuide from './ExerciseGuide';
import ReadingLibrary from './ReadingLibrary';
import { filterExercises, levels, readSavedExercises } from './search-model';
import RestTimer from './Timer';
import useWorkout from './useWorkout';
import WorkoutProgress from './WorkoutProgress';
import WorkoutSession, { WorkoutPlanAction, WorkoutHistory, WorkoutResume } from './WorkoutSession';
import PageTransition, { usePageTransition } from './PageTransition';
import './improvements.css';
import './dark-theme.css';
import ConnectionStatus from './ConnectionStatus';
import Planning, { PlanningLinks, planningPages } from './Planning';
import useCalendar from './useCalendar';
import { heatLevel, mergeBackup } from './planning-model';
import './planning.css';
const Icon = ({ name, ...props }) => { const C = Icons[name] || Icons.Dumbbell; return <C size={22} strokeWidth={1.6} {...props} /> };
const assets = { male: [mf, mb], female: [ff, fb] };
function BodyMap({ gender, side, selected, hover, onSelect, onHover, onPointer, activity }) {
    const ref = useRef(null);
    useEffect(() => {
        const svg = ref.current;
        svg.querySelectorAll('g[id]').forEach(g => {
            const entry = Object.entries(muscles).find(([, m]) => m[2].includes(g.id));
            if (!entry) return;
            g.dataset.muscle = entry[0]; g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0'); g.setAttribute('aria-label', entry[1][0]); g.setAttribute('aria-pressed', String(selected === entry[0]));
            g.classList.toggle('selected', entry[0] === selected);
            g.classList.toggle('hovered', entry[0] === hover);
            if (activity) { g.style.color = `var(--heat-${heatLevel(activity[entry[0]].sets)})`; g.setAttribute('aria-label', `${entry[1][0]}: ${activity[entry[0]].sets.toLocaleString('fa-IR')} ست`); } else g.style.removeProperty('color');
        });
    }, [gender, side, selected, hover, activity]);
    const target = e => e.target.closest('[data-muscle]')?.dataset.muscle;
    return <div className={`body-map body-${side}`} ref={ref} onMouseMove={onPointer} onFocus={e => onHover(target(e) || '')} onBlur={() => onHover('')} onClick={e => { const m = target(e); if (m) onSelect(m) }} onKeyDown={e => { if (['Enter', ' '].includes(e.key)) { e.preventDefault(); const m = target(e); if (m) onSelect(m) } }} onMouseOver={e => onHover(target(e) || '')} onMouseLeave={() => onHover('')} dangerouslySetInnerHTML={{ __html: assets[gender][side] }} />;
}
function Modal({ title, children, onClose }) {
    const ref = useRef(); const titleId = useId(); useEffect(() => { const prev = document.activeElement; ref.current.showModal(); return () => prev?.focus() }, []);
    return <dialog ref={ref} aria-labelledby={titleId} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose() }}><div className="dialog-heading"><h2 id={titleId}>{title}</h2><button className="icon-button" onClick={onClose} aria-label="بستن"><Icon name="X" /></button></div>{children}</dialog>
}
function App() {
    const [gender, setGender] = useState('male'), [selected, setSelected] = useState(''), [hover, setHover] = useState(''), [filters, setFilters] = useState(['featured']), [query, setQuery] = useState(''), [menu, setMenu] = useState(false), [detail, setDetail] = useState(null), [modal, setModal] = useState(''), [saved, setSaved] = useState(() => { try { return readSavedExercises(localStorage, exercises); } catch { return []; } }), [collapsed, setCollapsed] = useState(() => window.matchMedia('(max-width:680px)').matches), [moreEquipment, setMoreEquipment] = useState(false), [bodySide, setBodySide] = useState(0), [pointer, setPointer] = useState(null);
    const [difficulty, setDifficulty] = useState('');
    const { view, changeView: setView, pendingView } = usePageTransition('map');
    const transitioning = pendingView !== null;
    const currentView = pendingView ?? view;
    const activeView = planningPages[currentView] ? 'builder' : currentView === 'session' ? 'saved' : currentView;
    const workout = useWorkout();
    const { calendar, setCalendar, error: calendarError } = useCalendar();
    const [savedError, setSavedError] = useState(false);
    const planningPage = planningPages[view];
    function importBackup(incoming) {
        const merged = mergeBackup({ saved, history: workout.history, calendar }, incoming);
        setSaved(merged.saved); setCalendar(merged.calendar); workout.importHistory(incoming.history);
    }
    const [completedSession, setCompletedSession] = useState(null);
    const sessionPlan = saved.map(id => exercises.find(exercise => exercise.id === id)).filter(Boolean);
    function openSession(ids) {
        const plan = Array.isArray(ids) ? ids.map(id => exercises.find(e => e.id === id)).filter(Boolean) : sessionPlan;
        if (!workout.session && !plan.length) return;
        workout.start(plan);
        setCompletedSession(null); setSelected(''); setQuery(''); setView('session');
    }
    const sessionWorkout = { ...workout, finish: () => setCompletedSession(workout.finish()) };
    const closeMenuRef = useRef(null);
    const openMenuRef = useRef(null);
    const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width:680px)').matches);
    useEffect(() => { try { localStorage.setItem('mw-saved', JSON.stringify(saved)); setSavedError(false); } catch { setSavedError(true); } }, [saved]);
    useEffect(() => {
        const query = window.matchMedia('(max-width:680px)');
        const onChange = () => setIsMobile(query.matches);
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);
    useEffect(() => {
        if (!menu) return;
        const onKeyDown = e => {
            if (e.key === 'Escape') {
                setMenu(false);
                if (isMobile) openMenuRef.current?.focus();
            }
            if (e.key === 'Tab' && isMobile) {
                const items = [closeMenuRef.current, ...document.querySelectorAll('#site-navigation nav button')];
                const first = items[0], last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
            }
        };
        const previousOverflow = document.body.style.overflow;
        if (isMobile) {
            document.body.style.overflow = 'hidden';
            closeMenuRef.current?.focus();
        }
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            if (isMobile) document.body.style.overflow = previousOverflow;
        };
    }, [menu, isMobile]);
    const toggleFilter = id => setFilters(old => id === 'featured' ? ['featured'] : old.includes(id) ? old.filter(x => x !== id) : [...old.filter(x => x !== 'featured'), id]);
    const choose = id => { setHover(''); setSelected(id); setView('map') };
    const matching = filterExercises(exercises, { muscle: selected, query, equipment: filters, difficulty: view === 'exercises' ? difficulty : '' }, muscles);
    const list = view === 'saved' ? sessionPlan : matching;
    const nav = [['map', 'House', 'خانه'], ['exercises', 'ClipboardList', 'تمرینات'], ['saved', 'CalendarDays', 'برنامه من'], ['progress', 'Activity', 'پیشرفت من'], ['builder', 'Sparkles', 'برنامه‌ریزی'], ['tools', 'Calculator', 'ابزارها'], ['directory', 'BookOpen', 'فهرست عضلات'], ['injuries', 'HeartPulse', 'آسیب ورزشی'], ['nutrition', 'Salad', 'تغذیه']];
    const contentSection = {
        injuries: { title: 'آسیب ورزشی', icon: 'HeartPulse', subtitle: 'شناخت آسیب، مراقبت اولیه و بازگشت به فعالیت', description: 'مطالب مربوط به آسیب‌های ورزشی در این بخش نمایش داده می‌شوند.' },
        nutrition: { title: 'تغذیه', icon: 'Salad', subtitle: 'پایه‌های تغذیه سالم و آب‌رسانی در تمرین', description: 'مطالب مربوط به تغذیه در این بخش نمایش داده می‌شوند.' }
    }[view];
    function navigate(v) { setHover(''); closeMenu(); if (v === 'tools') { setModal('tools'); return } setView(v); setSelected(''); setDifficulty(''); setQuery('') }
    function closeMenu() { setMenu(false); if (isMobile) openMenuRef.current?.focus() }
    return <><a inert={isMobile && menu} className="skip-link" href="#main-content">رفتن به محتوای اصلی</a><div className={`drawer-backdrop ${menu ? 'open' : ''}`} onClick={closeMenu} aria-hidden="true" /><aside id="site-navigation" aria-label="فهرست اصلی" inert={isMobile && !menu} className={`sidebar ${menu ? 'expanded' : ''}`}><div className="drawer-heading"><div className="drawer-identity"><span className="drawer-mark">M</span><span>MuscleWiki<small>منوی اصلی</small></span></div><button ref={closeMenuRef} className="menu-button" onClick={() => menu ? closeMenu() : setMenu(true)} aria-label={menu ? 'بستن منو' : 'باز کردن منو'} aria-expanded={menu} aria-controls="site-navigation"><Icon name={menu ? 'X' : 'Menu'} size={27} /></button></div><nav aria-label="صفحه‌ها">{nav.map(([key, icon, label]) => <button key={key} className={activeView === key ? 'nav-item active' : 'nav-item'} aria-current={activeView === key ? 'page' : undefined} onClick={() => navigate(key)}><span><Icon name={icon} size={28} /></span><span>{label}</span></button>)}</nav><div className="rail-bottom"><Icon name="Dumbbell" size={25} /><span>MuscleWiki</span></div></aside>
        <header className="app-bar" inert={isMobile && menu}><div className="app-bar-top"><button ref={openMenuRef} className="mobile-menu-trigger" onClick={() => setMenu(true)} aria-label="باز کردن منو" aria-expanded={menu} aria-controls="site-navigation"><Icon name="Menu" size={25} /></button><button className="brand" onClick={() => navigate('map')} aria-label="MuscleWiki home"><svg viewBox="0 0 32 40" aria-hidden="true"><path d="M2 2 16 14 30 2v20L16 36 2 22V2Zm5 10v8l9 9 9-9v-8l-9 9-9-9Z" fill="currentColor" /></svg><span>MUSCLE<b>WIKI</b></span></button><div className="header-actions"><ConnectionStatus /><ThemeToggle /><Pwa /><button className="generator" onClick={() => { setView('builder'); setSelected('') }}><strong>سازنده برنامه تمرینی</strong><span>شروع کنید <Icon name="ArrowLeft" size={17} /></span></button><button className="language" onClick={() => setModal('language')} aria-label="زبان برنامه: فارسی" title="زبان برنامه: فارسی"><Icon name="Globe2" size={19} /><span>فارسی</span><Icon name="ChevronDown" size={14} /></button></div></div><label className="search"><Icon name="Search" /><input value={query} onChange={e => { setQuery(e.target.value); setView('exercises'); if (view !== 'exercises') setSelected('') }} placeholder="جستجوی تمرین" aria-label="جستجوی تمرین" />{query && <button onClick={() => setQuery('')} aria-label="پاک کردن جستجو"><Icon name="X" size={16} /></button>}</label></header>
        <main id="main-content" tabIndex={-1} className="page-main" inert={isMobile && menu} aria-busy={transitioning}><PageTransition active={transitioning} /><div className="page-content" inert={transitioning}><div className="workspace-intro"><div><span className="intro-eyebrow">فضای تمرین شما</span><h1>{planningPage ? planningPage[0] : contentSection ? contentSection.title : view === 'progress' ? 'پیشرفت تمرین شما' : view === 'session' ? 'جلسه تمرین شما' : 'تمرین بهتر، انتخاب آگاهانه‌تر.'}</h1><p>{planningPage ? 'برنامه بچینید، فعالیت خود را ببینید و اطلاعاتتان را نگه دارید.' : contentSection ? contentSection.subtitle : view === 'progress' ? 'سابقه تمرین‌ها و فعالیت خود را مرور کنید.' : view === 'session' ? 'هر ست را ثبت کنید و تمرین را قدم‌به‌قدم دنبال کنید.' : 'عضله را انتخاب کنید و تمرین مناسب خود را پیدا کنید.'}</p></div>{view !== 'session' && <button className="rest-shortcut" aria-label="تایمر استراحت" title="تایمر استراحت" onClick={() => setModal('tools')}><Icon name="Calculator" size={20} /><span>تایمر استراحت</span><Icon name="ArrowLeft" size={17} /></button>}</div><section className={`workspace ${planningPage || contentSection || ['session', 'progress'].includes(view) ? 'workspace-content' : ''}`}><div className="canvas">
            {planningPage ? <Planning view={view} saved={saved} history={workout.history} calendar={calendar} setCalendar={setCalendar} active={!!workout.session} gender={gender} BodyMap={BodyMap} onNavigate={navigate} onGuide={id => setDetail(exercises.find(e => e.id === id))} onStart={openSession} onSave={ids => setSaved(old => [...new Set([...old, ...ids])])} onImport={importBackup} storageError={savedError || calendarError || workout.storageError} /> : view === 'progress' ? <><PlanningLinks onNavigate={navigate} /><WorkoutProgress history={workout.history} onPlan={() => navigate('saved')} /></> : view === 'session' ? <WorkoutSession workout={sessionWorkout} completed={completedSession} onBack={() => navigate('saved')} onGuide={id => setDetail(exercises.find(exercise => exercise.id === id))} /> : contentSection ? <ReadingLibrary section={view} /> : view === 'map' ? <><div className="map-card-heading"><div><span className="map-card-icon"><Icon name="Accessibility" size={23} /></span><h2>نقشه عضلات</h2></div><span className="map-status"><i />انتخاب تعاملی</span></div><div className="map-hint"><Icon name="MousePointer2" size={16} /><span>برای دیدن تمرینات، یک عضله را انتخاب کنید</span></div><div className="body-tabs" role="group" aria-label="نمای بدن">{['نمای جلو', 'نمای پشت'].map((label, i) => <button key={label} aria-pressed={bodySide === i} onClick={() => { setBodySide(i); setHover('') }}>{label}</button>)}</div><div className={`bodies show-${bodySide}`} dir="rtl"><BodyMap gender={gender} side={0} selected={selected} hover={hover} onSelect={choose} onHover={setHover} onPointer={e => setPointer({ x: e.clientX, y: e.clientY })} /><BodyMap gender={gender} side={1} selected={selected} hover={hover} onSelect={choose} onHover={setHover} onPointer={e => setPointer({ x: e.clientX, y: e.clientY })} /></div><div className="map-legend"><span><i />عضله انتخاب‌شده</span><span>برای مشاهده تمرین، روی عضله بزنید</span></div><div style={pointer ? { left: Math.max(80, Math.min(pointer.x, window.innerWidth - 80)), top: Math.max(12, pointer.y - 52) } : undefined} className={`muscle-tooltip ${hover && pointer ? 'visible' : ''}`}>{hover ? muscles[hover][0] : 'انتخاب عضله'}</div></> :
                <section className="results" dir="rtl"><button className="back-button" onClick={() => { setView('map'); setSelected(''); setQuery('') }}><Icon name="ArrowRight" size={18} /> بازگشت به نقشه عضلات</button><div className="result-heading"><div><span className="eyebrow">MUSCLEWIKI</span><h1>{view === 'saved' ? 'برنامه من' : view === 'directory' ? 'فهرست عضلات' : selected ? `تمرینات ${muscles[selected][0]}` : 'کتابخانه تمرینات'}</h1></div><span className="count" role="status" aria-live="polite" aria-atomic="true">{view === 'directory' ? Object.keys(muscles).length : list.length} {view === 'directory' ? 'عضله' : 'تمرین'}</span></div>
                    {view === 'directory' ? <div className="muscle-list">{Object.entries(muscles).map(([id, m]) => <button onClick={() => choose(id)} key={id}><span>{m[0]}<small>{m[1]}</small></span><Icon name="ChevronLeft" /></button>)}</div> : <>{view === 'saved' && <><PlanningLinks onNavigate={navigate} />{savedError && <p role="alert" className="feature-error">ذخیره برنامه روی دستگاه انجام نشد؛ فایل پشتیبان بگیرید.</p>}<WorkoutPlanAction count={sessionPlan.length} active={!!workout.session} onStart={openSession} /><button className="workout-progress-link" onClick={() => navigate('progress')}><Icon name="Activity" size={18} />مشاهده پیشرفت من<Icon name="ArrowLeft" size={16} /></button></>}{view === 'exercises' && <div className="library-filters"><label>عضله هدف<select value={selected} onChange={e => setSelected(e.target.value)} aria-label="فیلتر عضله"><option value="">همه عضلات</option>{Object.entries(muscles).map(([id,m]) => <option key={id} value={id}>{m[0]}</option>)}</select></label><label>تجهیزات<select aria-label="فیلتر تجهیزات" value={filters.length === 1 && filters[0] !== 'featured' ? filters[0] : filters.length > 1 ? 'multiple' : ''} onChange={e => setFilters(e.target.value ? [e.target.value] : ['featured'])}><option value="">همه تجهیزات</option>{filters.length > 1 && <option value="multiple" disabled>چند نوع تجهیزات</option>}{equipment.filter(([id]) => id !== 'featured').map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label><label>سطح حرکت<select value={difficulty} onChange={e => setDifficulty(e.target.value)} aria-label="فیلتر سطح تمرین"><option value="">همه سطح‌ها</option>{Object.entries(levels).map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></label><button className="secondary" onClick={() => { setDifficulty(''); setSelected(''); setQuery(''); setFilters(['featured']); }}>پاک کردن فیلترها</button></div>}<div className="selected-chips">{selected && <button onClick={() => setSelected('')}>{muscles[selected][0]} <Icon name="X" size={14} /></button>}{query && <span>نتایج «{query}»</span>}</div>{list.length ? <div className="exercise-grid">{list.map(e => <article className="exercise-card" key={e.id}><div className="exercise-art"><Icon name={equipment.find(x => x[0] === e.equipment)?.[2]} size={60} /><span>{muscles[e.muscle][1]}</span><button className={`save ${saved.includes(e.id) ? 'is-saved' : ''}`} onClick={() => setSaved(old => old.includes(e.id) ? old.filter(x => x !== e.id) : [...old, e.id])} aria-label={saved.includes(e.id) ? 'حذف از برنامه' : 'افزودن به برنامه'}><Icon name={saved.includes(e.id) ? 'BookmarkCheck' : 'Bookmark'} size={20} /></button></div><div className="exercise-content"><div className="exercise-badges"><span className="equipment-tag">{equipment.find(x => x[0] === e.equipment)?.[1]}</span><span className={`difficulty-tag difficulty-${e.difficulty}`}>{levels[e.difficulty]}</span></div><h3>{e.name}</h3><p dir="ltr">{e.en}</p><button onClick={() => setDetail(e)}>مشاهده تمرین <Icon name="ArrowLeft" size={17} /></button></div></article>)}</div> : <div className="empty"><Icon name={view === 'saved' ? 'Bookmark' : 'SearchX'} size={42} /><h3>{view === 'saved' ? 'برنامه شما هنوز خالی است' : 'تمرینی پیدا نشد'}</h3><p>{view === 'saved' ? 'تمرین‌های دلخواه را با نشان ذخیره به برنامه اضافه کنید.' : 'فیلتر تجهیزات یا عبارت جستجو را تغییر دهید.'}</p><button className="primary" onClick={() => { setFilters(['featured']); setDifficulty(''); setQuery(''); setSelected(''); setView('exercises') }}>مشاهده همه تمرینات</button></div>}{view === 'saved' && <WorkoutHistory history={workout.history} />}</>}
                </section>}
        </div><aside className="filter-panel" dir="rtl"><div className="map-controls"><button className="gender-control" onClick={() => setGender(gender === 'male' ? 'female' : 'male')} aria-label="تغییر مدل بدن"><span className={`switch ${gender === 'female' ? 'on' : ''}`}><span>{gender === 'male' ? '♂' : '♀'}</span></span><span>{gender === 'male' ? 'مرد' : 'زن'}</span></button><div className="control-note"><Icon name="ScanLine" size={23} /><span>نقشه عضلات</span></div><button className="reset-control" onClick={() => { setGender('male'); setFilters(['featured']); navigate('map') }}><Icon name="RotateCcw" size={23} /><span>بازنشانی</span></button></div><div className="equipment-heading"><h2>تجهیزات</h2><button aria-expanded={!collapsed} aria-label={collapsed ? 'نمایش تجهیزات' : 'بستن تجهیزات'} onClick={() => setCollapsed(!collapsed)}><Icon name={collapsed ? 'Plus' : 'Minus'} size={19} /></button></div>{!collapsed && <div className="equipment-grid">{equipment.filter(([id]) => moreEquipment || ['featured', 'dumbbell', 'barbell', 'bodyweight', 'machine'].includes(id) || filters.includes(id)).map(([id, label, icon]) => <label key={id} className={filters.includes(id) ? 'checked' : ''}><input type="checkbox" checked={filters.includes(id)} onChange={() => toggleFilter(id)} /><Icon name={icon} size={27} /><span>{label}</span></label>)}<button className="more-equipment" aria-expanded={moreEquipment} onClick={() => setMoreEquipment(!moreEquipment)}>{moreEquipment ? 'تجهیزات کمتر' : 'تجهیزات بیشتر'}<Icon name={moreEquipment ? 'Minus' : 'Plus'} size={17} /></button></div>}<div className="filter-bottom"><Icon name="SlidersHorizontal" size={17} /><span>{filters.includes('featured') ? 'تمرینات منتخب برای هر عضله' : `${filters.length.toLocaleString('fa-IR')} نوع تجهیزات انتخاب شده`}</span><button onClick={() => setFilters(['featured'])}>پاک کردن</button></div>{view === 'map' && selected && <section className="map-exercises" aria-label="تمرینات عضله انتخاب‌شده"><div className="panel-title"><div><span>عضله انتخاب‌شده</span><h2>{muscles[selected][0]}</h2></div><button className="icon-button" onClick={() => setSelected('')} aria-label="بستن تمرینات"><Icon name="X" size={20} /></button></div><p className="panel-count" aria-live="polite">{matching.length.toLocaleString('fa-IR')} تمرین با تجهیزات انتخاب‌شده</p><div className="compact-exercises">{matching.map(e => <article key={e.id}><button className="exercise-open" onClick={() => setDetail(e)}><span className="exercise-symbol"><Icon name={equipment.find(x => x[0] === e.equipment)?.[2]} size={24} /></span><span><strong>{e.name}</strong><small>{equipment.find(x => x[0] === e.equipment)?.[1]}</small></span><Icon name="ChevronLeft" size={17} /></button><button className="compact-save" aria-label={saved.includes(e.id) ? 'حذف از برنامه' : 'افزودن به برنامه'} onClick={() => setSaved(old => old.includes(e.id) ? old.filter(x => x !== e.id) : [...old, e.id])}><Icon name={saved.includes(e.id) ? 'BookmarkCheck' : 'Bookmark'} size={19} /></button></article>)}</div>{!matching.length && <div className="panel-empty"><p>با این تجهیزات، تمرینی برای این عضله موجود نیست.</p><button className="secondary" onClick={() => setFilters(['featured'])}>نمایش همه تجهیزات</button></div>}</section>}</aside></section></div></main>
        {workout.session && view !== 'session' && <div inert={isMobile && menu}><WorkoutResume workout={workout} onResume={openSession} /></div>}
        <footer inert={isMobile && menu}><div className="copyright" dir="rtl"><span dir="ltr">© 2026 MuscleWiki • React recreation</span><div dir="rtl"><a href="https://musclewiki.com/fa-ir" target="_blank" rel="noreferrer">وب‌سایت اصلی</a><span> | </span><button onClick={() => setModal('about')}>درباره این نسخه</button></div></div><div className="store-links"><a href="https://apps.apple.com/app/musclewiki/id1096827640" target="_blank" rel="noreferrer"><Icon name="Apple" size={28} /><span><small>Download on the</small>App Store</span></a><a href="https://play.google.com/store/search?q=MuscleWiki&c=apps" target="_blank" rel="noreferrer"><Icon name="Play" size={28} /><span><small>GET IT ON</small>Google Play</span></a></div><div className="footer-tag"><Icon name="Dumbbell" size={21} /><span>تمرین را ساده کنید.</span></div></footer>
        {detail && <Modal title={detail.name} onClose={() => setDetail(null)}><ExerciseGuide key={detail.id} exercise={detail} saved={saved.includes(detail.id)} onSave={() => setSaved(old => old.includes(detail.id) ? old : [...old, detail.id])} /></Modal>}
        {modal && <Modal title={modal === 'about' ? 'درباره این نسخه' : modal === 'language' ? 'زبان' : 'ابزار تمرین'} onClose={() => setModal('')}>
            {modal === 'about' ? <><p>بازسازی رابط MuscleWiki با React. این نسخه مستقل است و وابسته به MuscleWiki نیست.</p><p>شامل یک کتابخانه نمونه با ۳۱ تمرین و ذخیره برنامه روی همین دستگاه است. چهار آموزش ویدیویی NASM با اتصال اینترنت در دسترس‌اند؛ حساب کاربری و خدمات اشتراکی سایت اصلی در این نسخه ارائه نمی‌شوند.</p><a href="https://github.com/suryamolly/muscle_mapper" target="_blank" rel="noreferrer">نقشه‌های بدن: Surya Mouly · مجوز MIT</a></> : modal === 'language' ? <><p>زبان این نسخه فارسی است.</p><button className="primary" onClick={() => setModal('')}>🇮🇷 فارسی</button><a className="secondary external" href="https://musclewiki.com" target="_blank" rel="noreferrer">نسخه انگلیسی سایت اصلی <Icon name="ExternalLink" size={16} /></a></> : <RestTimer />}</Modal>}
    </>;
}
createRoot(document.getElementById('root')).render(<App />);
