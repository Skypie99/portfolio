'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A destructive button that needs two taps: the first arms it ("del" → "sure?"),
 * the second confirms. Auto-disarms after a few seconds. Arm state is local
 * (ephemeral UI), matching the prototype's two-tap deletes.
 */
export function TwoTapButton({
  idleLabel,
  armedLabel,
  onConfirm,
  className,
  armedClassName,
  style,
  armedStyle,
  disarmMs = 3000,
  ariaLabel,
}: {
  idleLabel: string;
  armedLabel: string;
  onConfirm: () => void;
  className?: string;
  armedClassName?: string;
  style?: React.CSSProperties;
  armedStyle?: React.CSSProperties;
  disarmMs?: number;
  ariaLabel?: string;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const click = useCallback(() => {
    if (armed) {
      if (timer.current) clearTimeout(timer.current);
      setArmed(false);
      onConfirm();
    } else {
      setArmed(true);
      timer.current = setTimeout(() => setArmed(false), disarmMs);
    }
  }, [armed, onConfirm, disarmMs]);

  return (
    <button
      type="button"
      className={armed ? (armedClassName ?? className) : className}
      style={armed ? (armedStyle ?? style) : style}
      onClick={click}
      aria-label={ariaLabel ? (armed ? `${ariaLabel} — tap again to confirm` : ariaLabel) : undefined}
    >
      {armed ? armedLabel : idleLabel}
    </button>
  );
}
