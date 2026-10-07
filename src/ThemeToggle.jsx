import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const KEY = 'mw-theme';
export default function ThemeToggle() {
    const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');
    useEffect(() => {
        const system = window.matchMedia('(prefers-color-scheme: dark)');
        const apply = value => {
            document.documentElement.dataset.theme = value;
            document.documentElement.style.colorScheme = value;
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', value === 'dark' ? '#111b2c' : '#f5f6f9');
            setTheme(value);
        };
        const onSystem = () => { try { if (['light','dark'].includes(localStorage.getItem(KEY))) return; } catch {} apply(system.matches ? 'dark' : 'light'); };
        const onStorage = event => { if (event.key === KEY) apply(event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : system.matches ? 'dark' : 'light'); };
        system.addEventListener('change', onSystem); window.addEventListener('storage', onStorage);
        return () => { system.removeEventListener('change', onSystem); window.removeEventListener('storage', onStorage); };
    }, []);
    const toggle = () => {
        const value = theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(KEY, value); } catch {}
        document.documentElement.dataset.theme = value;
        document.documentElement.style.colorScheme = value;
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', value === 'dark' ? '#111b2c' : '#f5f6f9');
        setTheme(value);
    };
    return <button className="theme-toggle" onClick={toggle} aria-label={theme === 'dark' ? 'فعال کردن حالت روشن' : 'فعال کردن حالت تیره'} title={theme === 'dark' ? 'حالت روشن' : 'حالت تیره'} aria-pressed={theme === 'dark'}>{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</button>;
}
