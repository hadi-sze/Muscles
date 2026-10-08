import React, { useId } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { muscles } from './data';
import MuiFilterTheme from './MuiFilterTheme';

export default function MuscleSelect({ value, onChange }) {
    const labelId = useId();
    return <MuiFilterTheme>
        <div className="library-filter-field" dir="rtl">
            <span id={labelId}>عضله هدف</span>
            <Select
                labelId={labelId}
                value={value}
                onChange={event => onChange(event.target.value)}
                displayEmpty
                fullWidth
                size="small"
                inputProps={{ name: 'muscle' }}
                sx={{
                    minHeight: 44, borderRadius: '9px', fontSize: 12,
                    '& .MuiSelect-select': {
                        minHeight: '44px !important', boxSizing: 'border-box',
                        display: 'flex', alignItems: 'center', paddingBlock: '10px', textAlign: 'start',
                    },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--line)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--blue)' },
                    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(49,100,237,.15)' },
                    backgroundColor: 'background.paper',
                }}
                MenuProps={{
                    dir: 'rtl',
                    anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
                    transformOrigin: { vertical: 'top', horizontal: 'right' },
                    slotProps: {
                        paper: { sx: {
                            maxHeight: 340, marginTop: '6px', borderRadius: '12px',
                            border: '1px solid var(--line)',
                            boxShadow: '0 12px 32px rgba(15,23,42,.18)',
                            '& .MuiMenuItem-root': {
                                minHeight: 44, fontSize: 13, marginInline: '6px',
                                borderRadius: '7px', justifyContent: 'flex-start',
                            },
                            '& .Mui-selected': { fontWeight: 700 },
                        } },
                        list: { 'aria-labelledby': labelId },
                    },
                }}
            >
                <MenuItem value="">همه عضلات</MenuItem>
                {Object.entries(muscles).map(([id, muscle]) => <MenuItem key={id} value={id}>{muscle[0]}</MenuItem>)}
            </Select>
        </div>
    </MuiFilterTheme>;
}
