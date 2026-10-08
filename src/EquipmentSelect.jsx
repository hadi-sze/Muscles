import React, { useId } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import MuiFilterTheme from './MuiFilterTheme';
import { equipment } from './data';
import { normalizeSearch } from './search-model';

const options = [
    { id: '', label: 'همه تجهیزات' },
    ...equipment.filter(([id]) => id !== 'featured').map(([id, label]) => ({ id, label })),
];
const multipleOption = { id: 'multiple', label: 'چند نوع تجهیزات' };

export default function EquipmentSelect({ value, onChange }) {
    const inputId = useId();
    const selected = value === 'multiple' ? multipleOption : options.find(option => option.id === value) || options[0];

    return <MuiFilterTheme>
        <div className="library-filter-field" dir="rtl">
            <label htmlFor={inputId}>تجهیزات</label>
            <Autocomplete
                id={inputId}
                size="small"
                fullWidth
                value={selected}
                options={value === 'multiple' ? [multipleOption, ...options] : options}
                getOptionLabel={option => option.label}
                isOptionEqualToValue={(option, current) => option.id === current.id}
                getOptionDisabled={option => option.id === 'multiple'}
                onChange={(_, option) => onChange(option?.id || '')}
                filterOptions={(items, { inputValue }) => items.filter(option =>
                    normalizeSearch(`${option.label} ${option.id}`).includes(normalizeSearch(inputValue))
                )}
                disableClearable
                openOnFocus
                selectOnFocus
                autoHighlight
                noOptionsText="تجهیزاتی پیدا نشد"
                openText="نمایش تجهیزات"
                closeText="بستن فهرست تجهیزات"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        minHeight: 44, borderRadius: '9px', fontSize: 12,
                        backgroundColor: 'background.paper',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--line)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--blue)' },
                        '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(49,100,237,.15)' },
                    },
                    '& .MuiAutocomplete-input:focus-visible': { outline: 'none' },
                }}
                slotProps={{
                    popper: { dir: 'rtl', placement: 'bottom-start', sx: { zIndex: 20 } },
                    paper: { sx: {
                        marginTop: '6px', borderRadius: '12px', border: '1px solid var(--line)',
                        boxShadow: '0 12px 32px rgba(15,23,42,.18)',
                        '& .MuiAutocomplete-noOptions': { fontSize: 12, padding: '12px', color: 'text.secondary' },
                    } },
                    listbox: { sx: {
                        maxHeight: 340,
                        '& .MuiAutocomplete-option': {
                            minHeight: 44, fontSize: 13, marginInline: '6px', borderRadius: '7px',
                        },
                        '& .MuiAutocomplete-option[aria-selected="true"]': { fontWeight: 700 },
                    } },
                }}
                renderInput={params => <TextField
                    {...params}
                    placeholder="جستجوی تجهیزات…"
                    slotProps={{
                        ...params.slotProps,
                        htmlInput: { ...params.slotProps.htmlInput, 'aria-label': 'فیلتر تجهیزات' },
                    }}
                />}
            />
        </div>
    </MuiFilterTheme>;
}
