import React, { useEffect, useRef, useState } from 'react';
import './page-transition.css';

// Orbit Ring adapted from Loading UI (MIT); see LOADING-UI-LICENSE.
export function OrbitRing() {
    return <span className="orbit-ring" aria-hidden="true">
        <span className="orbit-ring-base" />
        <span className="orbit-ring-arc" />
    </span>;
}

export function usePageTransition(initialView) {
    const [view, commitView] = useState(initialView);
    const [pendingView, setPendingView] = useState(null);
    const timer = useRef(null);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    function changeView(nextView) {
        // Repeated search keystrokes must not restart the page transition.
        if (nextView === pendingView) return;
        window.clearTimeout(timer.current);
        if (nextView === view) {
            setPendingView(null);
            return;
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            commitView(nextView);
            setPendingView(null);
            return;
        }
        setPendingView(nextView);
        timer.current = window.setTimeout(() => {
            commitView(nextView);
            setPendingView(null);
        }, 450);
    }

    return { view, changeView, pendingView };
}

export default function PageTransition({ active }) {
    return <div className={`page-transition ${active ? 'is-active' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        {active && <div className="page-transition-content" dir="rtl">
            <OrbitRing />
            <span>در حال بارگذاری…</span>
        </div>}
    </div>;
}
