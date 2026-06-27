import React from 'react';

const ToggleSwitch = ({ enabled, onChange, label, description, size = 'md' }) => {
    const sizes = {
        sm: {
            toggle: 'w-9 h-5',
            dot: 'w-4 h-4',
            translate: 'translate-x-4'
        },
        md: {
            toggle: 'w-11 h-6',
            dot: 'w-5 h-5',
            translate: 'translate-x-5'
        },
        lg: {
            toggle: 'w-14 h-7',
            dot: 'w-6 h-6',
            translate: 'translate-x-7'
        }
    };

    const { toggle, dot, translate } = sizes[size];

    return (
        <div className="flex items-start justify-between group">
            <div className="flex-1 pr-4">
                {label && (
                    <label
                        htmlFor={`toggle-${label}`}
                        className="text-sm font-medium text-[var(--text-primary)] cursor-pointer"
                    >
                        {label}
                    </label>
                )}
                {description && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                        {description}
                    </p>
                )}
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => onChange(!enabled)}
                className={`${toggle} relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] ${enabled
                        ? 'bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)]'
                        : 'bg-[var(--surface-hover)] hover:bg-[var(--surface-active)]'
                    }`}
                id={`toggle-${label}`}
            >
                <span
                    className={`${dot} transform transition-transform duration-200 rounded-full bg-white shadow-lg ${enabled ? translate : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    );
};

export default ToggleSwitch;