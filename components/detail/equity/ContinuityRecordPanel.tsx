'use client';
import { useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import type { ArcData, ArcRecord, ArcRevisionEntry } from './types';

export default function ContinuityRecordPanel({ data, eraColors }: {
  data: ArcData;
  eraColors: { border: string };
}) {
  const CR = '#8fadc7';
  const [showRevisionHistory, setShowRevisionHistory] = useState(false);
  const { primaryArc: pa, secondaryArcs, totalArcs } = data;
  const arcTypeLabel = (t: string) => t.toUpperCase();
  const fmtDrawdown = (v: number) => { const sign = v <= 0 ? '' : '+'; return `${sign}${v.toFixed(1)}%`; };

  return (
    <>
      <style>{`@keyframes cr-fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${CR}1a`, backgroundColor: 'rgba(143,173,199,0.009)', boxShadow: `0 0 24px rgba(143,173,199,0.028)`, animation: 'cr-fadein 140ms ease-out both' }}>
        <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: `${CR}08`, borderBottom: `1px solid ${CR}13` }}>
          <MapIcon className="w-3.5 h-3.5" style={{ color: CR, opacity: 0.85 }} />
          <span className="text-[10px] font-semibold flex-1" style={{ color: CR, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Continuity Record</span>
          <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.40)', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {totalArcs} arc intersection{totalArcs !== 1 ? 's' : ''} · Structural Canon
          </span>
        </div>
        <div className="p-3.5">
          {pa && (
            <div>
              <div className="mb-1.5" style={{ color: 'rgba(255,255,255,0.42)', fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Primary Arc</div>
              <div className="flex items-baseline justify-between gap-4 mb-1">
                <span style={{ color: (pa.arcStress?.t3PlusEvents ?? 0) > 0 ? 'rgba(255,237,200,0.78)' : 'rgba(255,255,255,0.78)', fontFamily: 'monospace', fontSize: '15px', letterSpacing: '0.10em', lineHeight: 1 }}>{pa.name}</span>
                <span style={{ color: CR, fontFamily: 'monospace', fontSize: '10px', flexShrink: 0, opacity: 0.88 }}>Part {pa.partNumber} of {pa.issueCount}</span>
              </div>
              <div className="mb-2" style={{ color: 'rgba(255,255,255,0.54)', fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.08em' }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>{pa.arcType}</span>
                <span style={{ color: 'rgba(255,255,255,0.38)' }}> · </span>{pa.publisher}
                <span style={{ color: 'rgba(255,255,255,0.38)' }}> · </span>{pa.era}
              </div>
              <div className="mb-2" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'monospace', fontSize: '8px' }}>{pa.startIssueKey} → {pa.endIssueKey}</div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 rounded-full" style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="rounded-full" style={{ height: '1px', width: `${pa.significanceWeight * 100}%`, backgroundColor: CR, opacity: 0.7 }} />
                </div>
                <span style={{ color: CR, fontFamily: 'monospace', fontSize: '9px', flexShrink: 0, opacity: 0.7 }}>{pa.significanceWeight.toFixed(3)} weight</span>
              </div>

              {pa.arcRanking && (
                <>
                  <style>{`.ct-wrap { position: relative; display: inline-block; cursor: default; } .ct-tip { position: absolute; bottom: calc(100% + 5px); left: 0; opacity: 0; pointer-events: none; transition: opacity 90ms ease 180ms; white-space: nowrap; background: rgba(14,18,24,0.97); border: 1px solid rgba(255,255,255,0.07); padding: 3px 8px; font-family: monospace; font-size: 9px; color: rgba(255,255,255,0.38); letter-spacing: 0.07em; z-index: 50; } .ct-wrap:hover .ct-tip { opacity: 1; }`}</style>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px', marginTop: '8px', marginBottom: '10px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '5px' }}>Canon Index</div>
                    <div className="flex flex-col" style={{ gap: '3px' }}>
                      {[
                        { label: 'Structural Rank', val: `${pa.arcRanking.structuralRank} of ${pa.arcRanking.totalArcs}`, color: 'rgba(255,255,255,0.76)' },
                        { label: 'Canon Tier', val: pa.arcRanking.canonTier, color: pa.arcRanking.canonTier === 'S' ? `${CR}ee` : pa.arcRanking.canonTier === 'A' ? `${CR}bb` : 'rgba(255,255,255,0.48)' },
                        { label: 'Resilience Quartile', val: pa.arcRanking.resilienceQuartile, color: 'rgba(255,255,255,0.48)' },
                      ].map(({ label, val, color }) => (
                        <div key={label} className="flex items-baseline" style={{ gap: '6px' }}>
                          <span style={{ color: `${CR}50`, fontSize: '9px', lineHeight: 1 }}>·</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '9px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.48)' }}>{label}: </span>
                            <span style={{ color }}>{val}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {pa.arcRanking && pa.revisionLog && pa.revisionLog.length > 0 && (() => {
                const latest = pa.revisionLog[0];
                const deltaAsi = latest.delta_asi ? parseFloat(latest.delta_asi) : null;
                const deltaStr = deltaAsi !== null ? (deltaAsi >= 0 ? `+${deltaAsi.toFixed(3)}` : deltaAsi.toFixed(3)) : null;
                const tierShifted = latest.prev_tier && latest.prev_tier !== latest.new_tier;
                return (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px', marginTop: '8px', marginBottom: '10px' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '5px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Canon Revision Log</div>
                      <button onClick={() => setShowRevisionHistory(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: `${CR}60`, fontSize: '8px', fontFamily: 'monospace', letterSpacing: '0.08em', padding: 0 }}>
                        {showRevisionHistory ? 'collapse' : 'view history'}
                      </button>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '9px', lineHeight: 1.6 }}>
                      <div style={{ color: 'rgba(255,255,255,0.58)' }}>Last structural shift: <span style={{ color: 'rgba(255,255,255,0.74)' }}>Tick {latest.tick_number}</span></div>
                      {tierShifted && <div style={{ color: 'rgba(255,255,255,0.58)' }}>Tier <span style={{ color: 'rgba(255,255,255,0.44)' }}>{latest.prev_tier}</span>{' → '}<span style={{ color: latest.new_tier === 'S' ? `${CR}ee` : latest.new_tier === 'A' ? `${CR}bb` : 'rgba(255,255,255,0.52)' }}>{latest.new_tier}</span></div>}
                      {deltaStr && <div style={{ color: 'rgba(255,255,255,0.58)' }}>Δ ASI <span style={{ color: deltaAsi! >= 0 ? `${CR}99` : 'rgba(200,100,100,0.7)' }}>{deltaStr}</span></div>}
                    </div>
                    {showRevisionHistory && (
                      <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px' }}>
                        {pa.revisionLog.map((entry: ArcRevisionEntry, i: number) => (
                          <div  className="flex items-baseline justify-between" style={{ fontFamily: 'monospace', fontSize: '8px', color: 'rgba(255,255,255,0.76)', lineHeight: 1.7, borderBottom: i < pa.revisionLog!.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', paddingBottom: '1px' }}>
                            <span>Tick {entry.tick_number}</span>
                            <span style={{ color: entry.new_tier === 'S' ? `${CR}cc` : entry.new_tier === 'A' ? `${CR}99` : 'rgba(255,255,255,0.36)' }}>Tier {entry.new_tier}</span>
                            <span style={{ color: 'rgba(255,255,255,0.42)' }}>{parseFloat(entry.new_asi).toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {pa.notes && <div className="mb-3" style={{ color: 'rgba(255,255,255,0.40)', fontFamily: 'monospace', fontSize: '8px', lineHeight: '1.55', maxWidth: '82%' }}>{pa.notes.length > 120 ? pa.notes.slice(0, 120) + '…' : pa.notes}</div>}

              {pa.arcStress && (
                <>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px' }}>Structural Exposure</div>
                    {!pa.arcStress.hasTradingHistory ? (
                      <div style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,255,255,0.48)', fontStyle: 'italic', lineHeight: 1.5 }}>No sufficient trading history at grade 9.8 to compute stress profile.</div>
                    ) : (
                      <div className="flex flex-col" style={{ gap: '3px' }}>
                        {[
                          { label: 'Max Drawdown', value: fmtDrawdown(pa.arcStress.maxDrawdownPct) },
                          { label: 'Peak Volatility', value: pa.arcStress.peakVolatility.toFixed(3) },
                          { label: 'T3+ Events', value: String(pa.arcStress.t3PlusEvents) },
                          { label: 'Principal Interventions', value: String(pa.arcStress.principalInterventions) },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-baseline" style={{ gap: '6px' }}>
                            <span style={{ color: `${CR}50`, fontSize: '9px', lineHeight: 1 }}>·</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '9px' }}><span style={{ color: 'rgba(255,255,255,0.48)' }}>{label}: </span><span style={{ color: 'rgba(255,255,255,0.48)' }}>{value}</span></span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {pa.arcStress.lifespanDays > 0 && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px', marginTop: '10px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px' }}>Active Duration</div>
                      <div className="flex flex-col" style={{ gap: '3px' }}>
                        <div className="flex items-baseline" style={{ gap: '6px' }}>
                          <span style={{ color: `${CR}50`, fontSize: '9px', lineHeight: 1 }}>·</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '9px' }}><span style={{ color: 'rgba(255,255,255,0.48)' }}>Trading span: </span><span style={{ color: 'rgba(255,255,255,0.48)' }}>{pa.arcStress.lifespanDays} days</span></span>
                        </div>
                        {pa.arcStress.marketTimelinePct > 0 && (
                          <div className="flex items-baseline" style={{ gap: '6px' }}>
                            <span style={{ color: `${CR}50`, fontSize: '9px', lineHeight: 1 }}>·</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '9px' }}><span style={{ color: 'rgba(255,255,255,0.48)' }}>Market timeline: </span><span style={{ color: 'rgba(255,255,255,0.48)' }}>{pa.arcStress.marketTimelinePct.toFixed(1)}%</span></span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {pa.arcStress.recoveryDays != null && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px', marginTop: '10px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px' }}>Resilience Profile</div>
                      <div className="flex flex-col" style={{ gap: '3px' }}>
                        <div className="flex items-baseline" style={{ gap: '6px' }}>
                          <span style={{ color: `${CR}50`, fontSize: '9px', lineHeight: 1 }}>·</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '9px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.48)' }}>{pa.arcStress.isFullyRecovered ? 'Recovered in' : 'Unrecovered —'}</span>{' '}
                            <span style={{ color: 'rgba(255,255,255,0.48)' }}>{pa.arcStress.recoveryDays} days{!pa.arcStress.isFullyRecovered ? ' elapsed' : ''}</span>
                          </span>
                        </div>
                        {pa.arcStress.recoveryVsMedianPct != null && (
                          <div className="flex items-baseline" style={{ gap: '6px' }}>
                            <span style={{ color: `${CR}50`, fontSize: '9px', lineHeight: 1 }}>·</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '9px' }}>
                              {pa.arcStress.recoveryVsMedianPct > 0 ? (
                                <span style={{ color: `${CR}cc` }}>{pa.arcStress.recoveryVsMedianPct}% faster than market baseline</span>
                              ) : pa.arcStress.recoveryVsMedianPct < 0 ? (
                                <span style={{ color: 'rgba(255,255,255,0.62)' }}>{Math.abs(pa.arcStress.recoveryVsMedianPct)}% slower than market baseline</span>
                              ) : (
                                <span style={{ color: 'rgba(255,255,255,0.62)' }}>At market baseline</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {secondaryArcs.length > 0 && (
            <div className="mt-3.5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="mb-1.5" style={{ color: 'rgba(255,255,255,0.42)', fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Also intersects</div>
              <div className="flex flex-col" style={{ gap: '3px' }}>
                {secondaryArcs.map((arc: ArcRecord) => (
                  <div key={arc.arcId} className="flex items-baseline" style={{ gap: '6px' }}>
                    <span style={{ color: `${CR}45`, fontSize: '9px', lineHeight: 1 }}>·</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '8px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.66)' }}>{arc.name}</span>
                      <span style={{ color: 'rgba(255,255,255,0.42)' }}>{' — '}{arc.partNumber != null ? `Part ${arc.partNumber} · ` : ''}{arcTypeLabel(arc.arcType)} · {arc.significanceWeight.toFixed(2)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!pa && secondaryArcs.length === 0 && <div style={{ color: 'rgba(255,255,255,0.46)', fontFamily: 'monospace', fontSize: '9px' }}>No arc placement on record.</div>}
        </div>
      </div>
    </>
  );
}
