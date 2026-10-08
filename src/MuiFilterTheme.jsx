import React, { useEffect, useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { prefixer } from 'stylis';

const rtlCache = createCache({ key: 'muscle-rtl', stylisPlugins: [prefixer, rtlPlugin] });
const readMode = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

export default function MuiFilterTheme({ children }) {
    const [mode, setMode] = useState(readMode);
    useEffect(() => {
        const observer = new MutationObserver(() => setMode(readMode()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        setMode(readMode());
        return () => observer.disconnect();
    }, []);
    const theme = useMemo(() => createTheme({
        direction: 'rtl',
        typography: { fontFamily: 'Vazirmatn, Tahoma, sans-serif' },
        palette: {
            mode,
            primary: { main: mode === 'dark' ? '#8aaeff' : '#3164ed' },
            background: { paper: mode === 'dark' ? '#1c2b42' : '#ffffff' },
            text: { primary: mode === 'dark' ? '#e0e8f5' : '#253148' },
        },
    }), [mode]);

    return <CacheProvider value={rtlCache}><ThemeProvider theme={theme}>{children}</ThemeProvider></CacheProvider>;
}
