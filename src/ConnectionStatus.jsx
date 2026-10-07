import React, { useEffect, useId, useRef, useState } from 'react';
import { Wifi, WifiOff, Server, Globe2, RefreshCw, X } from 'lucide-react';
import { checkConnection, connectionLevel } from './connection-model';

const labels = { online: 'سرور و اینترنت متصل‌اند', offline: 'اتصال قطع است', uncertain: 'اتصال نیاز به بررسی دارد' };
export default function ConnectionStatus() {
    const [state, setState] = useState({ server: 'checking', internet: 'checking', checkedAt: null });
    const [checking, setChecking] = useState(true);
    const refresh = useRef(() => {}), dialog = useRef(null), title = useId();
    useEffect(() => {
        let disposed = false, controller, timer, generation = 0;
        async function run() {
            clearTimeout(timer); controller?.abort();
            const current = ++generation;
            controller = new AbortController();
            setChecking(true);
            if (!navigator.onLine) setState(old => ({ ...old, internet: 'offline' }));
            const result = await checkConnection({ online: navigator.onLine, signal: controller.signal });
            if (disposed || current !== generation) return;
            setState(result); setChecking(false);
            timer = setTimeout(run, document.hidden ? 60000 : 30000);
        }
        const visible = () => { if (!document.hidden) run(); };
        refresh.current = run;
        run();
        window.addEventListener('online', run); window.addEventListener('offline', run);
        window.addEventListener('focus', visible); document.addEventListener('visibilitychange', visible);
        return () => {
            disposed = true; controller?.abort(); clearTimeout(timer);
            window.removeEventListener('online', run); window.removeEventListener('offline', run);
            window.removeEventListener('focus', visible); document.removeEventListener('visibilitychange', visible);
        };
    }, []);
    const level = connectionLevel(state), StatusIcon = level === 'offline' ? WifiOff : Wifi;
    return <>
        <button className={`connection-light connection-${level}`} onClick={() => dialog.current.showModal()} aria-label={`وضعیت اتصال: ${labels[level]}`} title={labels[level]}><StatusIcon size={20} aria-hidden="true" /><i aria-hidden="true" /></button>
        <dialog className="connection-dialog" ref={dialog} aria-labelledby={title} onClick={e => { if (e.target === e.currentTarget) dialog.current.close(); }}>
            <div className="dialog-heading"><h2 id={title}>وضعیت اتصال</h2><button className="icon-button" aria-label="بستن وضعیت اتصال" onClick={() => dialog.current.close()}><X size={22} /></button></div>
            <div role="status" aria-live="polite" className="connection-details">
                <p className={`connection-summary connection-${level}`}><i />{checking ? 'در حال بررسی اتصال…' : labels[level]}</p>
                <div><span><Server size={20} />سرور برنامه</span><strong>{state.server === 'up' ? 'در دسترس' : state.server === 'down' ? 'پاسخی دریافت نشد' : 'در حال بررسی'}</strong></div>
                <div><span><Globe2 size={20} />اینترنت</span><strong>{state.internet === 'up' ? 'در دسترس' : state.internet === 'offline' ? 'مرورگر آفلاین است' : state.internet === 'unknown' ? 'قابل تأیید نیست' : 'در حال بررسی'}</strong></div>
                {state.checkedAt && <p>آخرین بررسی: {new Date(state.checkedAt).toLocaleTimeString('fa-IR')}</p>}
            </div>
            <p className="feature-note">هنگام باز بودن صفحه، هر ۳۰ ثانیه بررسی می‌شود؛ با بازگشت به برنامه، وضعیت تازه می‌شود. اگر سرویس بررسی اینترنت مسدود باشد، اتصال قابل تأیید نیست.</p>
            <button className="primary" disabled={checking} onClick={() => refresh.current()}><RefreshCw size={17} />{checking ? 'در حال بررسی…' : 'بررسی دوباره'}</button>
        </dialog>
    </>;
}
