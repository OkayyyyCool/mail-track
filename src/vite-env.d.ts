/// <reference types="vite/client" />

import type React from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'md-filled-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { disabled?: boolean; type?: string };
            'md-outlined-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { disabled?: boolean; type?: string };
            'md-text-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { disabled?: boolean; type?: string };
            'md-elevated-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { disabled?: boolean; type?: string };
            'md-filled-tonal-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { disabled?: boolean; type?: string };
            'md-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { slot?: string };
            'md-icon-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { disabled?: boolean; type?: string; href?: string; target?: string };
            'md-checkbox': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { checked?: boolean; disabled?: boolean; 'touch-target'?: 'wrapper' };
            'md-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            'md-list-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { type?: string; href?: string; target?: string };
            'md-divider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            'md-outlined-text-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; placeholder?: string; value?: string; type?: string; error?: boolean; 'supporting-text'?: string; onInput?: (e: any) => void; };
            'md-outlined-select': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; value?: string };
            'md-select-option': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { value?: string; selected?: boolean };
            'md-tabs': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { activeTabIndex?: number };
            'md-primary-tab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            'md-secondary-tab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            'md-fab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; size?: 'small' | 'medium' | 'large'; variant?: string };
            'md-dialog': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { open?: boolean };
            'md-navigation-bar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { activeIndex?: number };
            'md-navigation-tab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; active?: boolean };
            'md-circular-progress': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { indeterminate?: boolean };
            'md-linear-progress': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { indeterminate?: boolean };
            'md-filter-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { label?: string; selected?: boolean };
            'md-switch': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { selected?: boolean; icons?: boolean; 'show-only-selected-icon'?: boolean };
            'md-radio': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { name?: string; value?: string; checked?: boolean; disabled?: boolean };
        }
    }
}

export { };
