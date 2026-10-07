export function connectionLevel({ server, internet }) {
    if (server === 'down' || internet === 'offline') return 'offline';
    if (server === 'up' && internet === 'up') return 'online';
    return 'uncertain';
}

export async function checkConnection({ fetcher = fetch, online = true, signal, timeout = 5000, now = Date.now() } = {}) {
    async function probe(url, options, validate) {
        const controller = new AbortController();
        const abort = () => controller.abort();
        signal?.addEventListener('abort', abort, { once: true });
        if (signal?.aborted) controller.abort();
        const timer = setTimeout(abort, timeout);
        try {
            const response = await fetcher(url, { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'error', ...options, signal: controller.signal });
            return await validate(response);
        } catch { return false; }
        finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
    }
    const [server, internet] = await Promise.all([
        probe(`/health.json?check=${now}`, {}, async response => {
            if (!response.ok) return false;
            const body = await response.json();
            return body.status === 'ok' && body.service === 'musclewiki';
        }),
        online ? probe(`https://www.gstatic.com/generate_204?check=${now}`, { mode: 'no-cors' }, response => response.type === 'opaque' || response.ok) : false,
    ]);
    return { server: server ? 'up' : 'down', internet: !online ? 'offline' : internet ? 'up' : 'unknown', checkedAt: Date.now() };
}
