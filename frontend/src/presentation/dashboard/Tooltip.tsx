import type { ReactNode } from 'react';
import { useState } from 'react';

interface TooltipProps {
  readonly text: string;
  readonly children: ReactNode;
}

export const Tooltip = ({ text, children }: TooltipProps) => {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ cursor: 'help' }}
      >
        {children}
      </div>
      {show && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--palette-neutral-12)',
            color: 'var(--palette-neutral-0)',
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            marginBottom: '4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};
