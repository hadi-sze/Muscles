import React, { useState } from 'react';
import { Play, ExternalLink, BookmarkCheck } from 'lucide-react';
import { levels } from './search-model';
import { muscles, equipment } from './data';
export default function ExerciseGuide({ exercise, saved, onSave }) {
    const [play, setPlay] = useState(false);
    return <div className="exercise-guide"><p className="detail-english" dir="ltr">{exercise.en}</p><div className="exercise-badges"><span className="equipment-tag">{equipment.find(item => item[0] === exercise.equipment)?.[1]}</span><span className={`difficulty-tag difficulty-${exercise.difficulty}`}>{levels[exercise.difficulty]}</span><span className="equipment-tag">{muscles[exercise.muscle][0]}</span></div>
        {exercise.video && <><h3>نمایش حرکت</h3>{play ? <><iframe className="guide-video" title={`ویدیوی آموزشی ${exercise.name}`} src={`https://www.youtube-nocookie.com/embed/${exercise.video}`} allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /><button className="secondary" onClick={() => setPlay(false)}>بستن ویدیو</button></> : <button className="video-placeholder" onClick={() => setPlay(true)}><Play size={26}/>پخش آموزش NASM</button>}<p className="guide-note">ویدیو با انتخاب شما بارگذاری می‌شود و به اینترنت نیاز دارد. اگر پخش داخل صفحه کار نکرد، از پیوند YouTube استفاده کنید.</p><a className="guide-source" href={`https://www.youtube.com/watch?v=${exercise.video}`} target="_blank" rel="noreferrer">تماشا در YouTube<ExternalLink size={14}/></a></>}
        <h3>راهنمای کوتاه اجرا</h3><ol>{exercise.steps.map(step => <li key={step}>{step}</li>)}</ol><p className="guide-tip">{exercise.tip}</p>
        <a className="guide-source" href={exercise.sourceUrl} target="_blank" rel="noreferrer">{exercise.sourceUrl.includes('/equipment/') || exercise.sourceUrl.includes('/body-part/') ? 'کتابخانه تصویری' : 'راهنمای تصویری در'} {exercise.source}<ExternalLink size={16}/></a><p className="guide-note">سطح حرکت یک دسته‌بندی کلی است؛ وزنه مناسب به توان و تجربه شما بستگی دارد. در صورت درد، حرکت را متوقف کنید.</p>
        <div className="guide-actions"><button className="primary" disabled={saved} onClick={onSave}><BookmarkCheck size={18}/>{saved ? 'در برنامه من ذخیره شده' : 'افزودن به برنامه من'}</button><a className="secondary" href="https://musclewiki.com/fa-ir" target="_blank" rel="noreferrer">MuscleWiki<ExternalLink size={16}/></a></div>
    </div>;
}
