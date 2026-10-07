import React, { useEffect, useRef, useState, useId } from 'react';
import { Download } from 'lucide-react';
export default function Pwa() {
    const [prompt, setPrompt] = useState(null), [installed, setInstalled] = useState(false), [offline, setOffline] = useState(!navigator.onLine), [ready, setReady] = useState(false), [update, setUpdate] = useState(false), [error, setError] = useState(false);
    const dialog = useRef(null);
    const titleId = useId();
    useEffect(() => {
        const standalone = window.matchMedia('(display-mode: standalone)');
        const detect = () => setInstalled(standalone.matches || navigator.standalone === true);
        const before = e => { e.preventDefault(); setPrompt(e) };
        const after = () => { setInstalled(true); setPrompt(null); dialog.current?.close() };
        const connection = () => setOffline(!navigator.onLine);
        detect(); standalone.addEventListener('change', detect);
        window.addEventListener('beforeinstallprompt', before); window.addEventListener('appinstalled', after);
        window.addEventListener('online', connection); window.addEventListener('offline', connection);
        let active = true;
        if (import.meta.env.PROD && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(reg => {
                if (!active) return;
                const check = () => { if (active) setUpdate(Boolean(reg.waiting && reg.active)) };
                check(); reg.addEventListener('updatefound', () => reg.installing?.addEventListener('statechange', check));
                navigator.serviceWorker.ready.then(() => { if (active) { setReady(true); check() } });
            }).catch(() => { if (active) setError(true) });
        }
        return () => { active = false; standalone.removeEventListener('change', detect); window.removeEventListener('beforeinstallprompt', before); window.removeEventListener('appinstalled', after); window.removeEventListener('online', connection); window.removeEventListener('offline', connection) };
    }, []);
    const install = async () => {
        if (!prompt) { dialog.current.showModal(); return }
        try { await prompt.prompt(); await prompt.userChoice } catch { dialog.current.showModal() }
        setPrompt(null);
    };
    return <>
        <div className="pwa-actions">
            {offline && <span className="pwa-offline" role="status">آفلاین</span>}
            {!installed && <button className="pwa-install" onClick={install} aria-label="نصب برنامه" title="نصب برنامه"><Download size={19} strokeWidth={1.8} aria-hidden="true" /><span>نصب برنامه</span></button>}
            {update && <span className="pwa-update" role="status">نسخه جدید آماده است؛ همه پنجره‌های برنامه را ببندید و دوباره باز کنید.</span>}
        </div>
        <dialog ref={dialog} aria-labelledby={titleId} className="pwa-dialog" onClick={e => { if (e.target === e.currentTarget) dialog.current.close() }}>
            <div className="dialog-heading"><h2 id={titleId}>نصب MuscleWiki</h2><button className="icon-button" aria-label="بستن راهنمای نصب" onClick={() => dialog.current.close()}>×</button></div>
            <p>برنامه را به صفحه اصلی گوشی یا رایانه اضافه کنید.</p>
            <ul><li>آیفون و آیپد: در Safari، منوی اشتراک‌گذاری و سپس «Add to Home Screen» را انتخاب کنید.</li><li>اندروید: از منوی مرورگر، «Install app» یا «Add to Home screen» را انتخاب کنید.</li><li>رایانه: گزینه نصب در نوار آدرس یا منوی مرورگر را انتخاب کنید.</li></ul>
            <p>اگر گزینه نصب را نمی‌بینید، این نشانی را در مرورگر اصلی دستگاه باز کنید.</p>
            <p className="pwa-cache-state" role="status">{ready ? 'نقشه‌ها، تمرینات و تایمر برای استفاده آفلاین آماده‌اند.' : error ? 'ذخیره آفلاین انجام نشد. اتصال را بررسی کنید و صفحه را دوباره باز کنید.' : import.meta.env.PROD ? 'آماده‌سازی برای استفاده آفلاین…' : 'پشتیبانی آفلاین در نسخه ساخته‌شده فعال می‌شود.'}</p>
            <p className="pwa-note">ویدیوها و پیوندهای سایت اصلی به اینترنت نیاز دارند. برنامه‌های ذخیره‌شده روی همین دستگاه باقی می‌مانند.</p>
        </dialog>
    </>;
}
