import { useEffect, useState } from 'react';
import { CALENDAR_KEY, readCalendar } from './planning-model';
export default function useCalendar() {
    const [calendar, setCalendar] = useState(() => { try { return readCalendar(localStorage); } catch { return {}; } });
    const [error, setError] = useState(false);
    useEffect(() => {
        try { localStorage.setItem(CALENDAR_KEY, JSON.stringify(calendar)); setError(false); } catch { setError(true); }
    }, [calendar]);
    return { calendar, setCalendar, error };
}
