"use client";

import * as React from "react";

interface AnimatedPriceProps {
  value: number;
  prefix?: string;
  decimals?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function AnimatedPrice({
  value,
  prefix = "$",
  decimals = 2,
  style,
  className,
}: AnimatedPriceProps) {
  const formatted = `${prefix}${(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;

  return (
    <span style={style} className={className}>
      {formatted}
    </span>
  );
}
