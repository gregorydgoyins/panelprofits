import React from 'react';

type Stat = {

  label: string;

  value: string;

  color?: string;

};

function StatCard(
  {
    label,
    value,
    color
  }: Stat
) {

  return (

    <div
      style={{
        padding: '12px',
        borderRadius: '8px',
        background:
          'rgba(255,255,255,.02)',
        border:
          '1px solid rgba(255,255,255,.06)'
      }}
    >

      <div
        style={{
          fontSize: '10px',
          color:
            'rgba(255,255,255,.55)',
          marginBottom: '6px',
          letterSpacing: '.08em',
          textTransform: 'uppercase'
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color:
            color ||
            'rgba(255,255,255,.92)'
        }}
      >
        {value}
      </div>

    </div>

  );

}

export default function PriceStatsPanel(_props?: { history?: any; eraColors?: any; issueReferencePoints?: any }) {

  const stats: Stat[] = [

    {
      label: 'Momentum',
      value: '+4.28%',
      color: '#4ade80'
    },

    {
      label: 'Volatility',
      value: 'Moderate',
      color: '#fbbf24'
    },

    {
      label: 'Liquidity',
      value: 'High',
      color: '#60a5fa'
    },

    {
      label: 'Spread',
      value: '2.1%',
      color: '#f87171'
    }

  ];

  return (

    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(4,minmax(0,1fr))',
        gap: '12px',
        width: '100%'
      }}
    >

      {stats.map(
        (
          stat,
          i
        ) => (

          <StatCard
            
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />

        )
      )}

    </div>

  );

}
