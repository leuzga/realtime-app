export const InsightHint = ({ recommendation, duration }: { recommendation: string; duration: string }) => (
  <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px', lineHeight: '1.3' }}>
    <div>{recommendation}</div>
    <div style={{ marginTop: '2px', opacity: 0.6 }}>In state: {duration}</div>
  </div>
);
