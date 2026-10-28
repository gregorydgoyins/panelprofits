'use client';

export default function AISectionBlock({
  text,
  accentColor,
  label = 'AI Analysis',
}: {
  text: string | null | undefined;
  accentColor: string;
  label?: string;
}) {
  if (!text) return null;
  return (
    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
        <span style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'monospace', fontSize: '7px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>{label}</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <span style={{ color: 'rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: '7px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>OpenRouter</span>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.76)', fontSize: '10px', lineHeight: '1.68', margin: 0, borderLeft: `2px solid ${accentColor}45`, paddingLeft: '10px' }}>
        {text}
      </p>
    </div>
  );
}
