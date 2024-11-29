import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

interface TooltipProps {
  id: string;
  content: string;
  children: React.ReactNode;
  place?: 'top' | 'right' | 'bottom' | 'left';
}

export default function Tooltip({ id, content, children, place = 'top' }: TooltipProps) {
  return (
    <>
      <div data-tooltip-id={id}>{children}</div>
      <ReactTooltip
        id={id}
        content={content}
        place={place}
        className="z-50 max-w-xs bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm"
      />
    </>
  );
}