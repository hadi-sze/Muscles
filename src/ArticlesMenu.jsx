import React from 'react';
import { Newspaper, ChevronDown, ExternalLink } from 'lucide-react';
import './articles-menu.css';

// Category destinations verified against the Persian MuscleWiki category menu.
const categories = [
    ['تغذیه', 'https://musclewiki.com/fa-ir/articles?category=1'],
    ['برای مبتدیان', 'https://musclewiki.com/fa-ir/articles?category=7'],
    ['کاهش چربی بدن', 'https://musclewiki.com/fa-ir/articles?category=5'],
];

export default function ArticlesMenu({ open, onToggle, onNavigate }) {
    return <div className={`articles-menu ${open ? 'is-open' : ''}`}>
        <button className="nav-item articles-trigger" onClick={onToggle} aria-expanded={open} aria-controls="articles-submenu">
            <span><Newspaper size={28} aria-hidden="true" /></span><span>مقالات</span><ChevronDown className="articles-chevron" size={16} aria-hidden="true" />
        </button>
        <div id="articles-submenu" className="articles-submenu" hidden={!open}>
            {categories.map(([title, href]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer" onClick={onNavigate} aria-label={`${title} (باز شدن در زبانه جدید)`}>
                <span>{title}</span><ExternalLink size={13} aria-hidden="true" />
            </a>)}
        </div>
    </div>;
}
