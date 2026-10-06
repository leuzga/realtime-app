import { Tooltip } from './Tooltip.js';

interface InfoIconProps {
  readonly text: string;
}

export const InfoIcon = ({ text }: InfoIconProps) => (
  <Tooltip text={text}>
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: 'var(--palette-border)',
        color: 'var(--palette-fg)',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'help'
      }}
    >
      ?
    </span>
  </Tooltip>
);
