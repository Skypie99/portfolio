import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import type { DeviceFrameKind } from '@/lib/signature';

type DeviceFrameProps = {
  /** Which chrome to draw. 'none' is handled by ProductReveal, never here. */
  kind: Exclude<DeviceFrameKind, 'none'>;
  className?: string;
  /** The "screen" content — a real screenshot (carries its own alt) or the
   *  decorative placeholder fill. */
  children: ReactNode;
};

/**
 * DeviceFrame — pure-CSS product chrome (Show-the-work 2026-06-04). The app
 * "screen" rests inside; ProductReveal positions the frame in the golden-hour
 * world and fills the screen with a real screenshot or the placeholder. No
 * images, no state. The CHROME (notch, title-bar dots) is decorative and
 * aria-hidden; the screen's own content carries any alt, so a real screenshot
 * stays in the a11y tree. Both themes via --rgb-* tokens; styling in the
 * `.pr-frame-*` rules in globals.css (outside the locked cinematic range).
 */
export function DeviceFrame({ kind, className, children }: DeviceFrameProps) {
  if (kind === 'phone') {
    return (
      <div className={cn('pr-frame pr-frame-phone panel-lit', className)}>
        <span aria-hidden="true" className="pr-notch" />
        <div className="pr-screen pr-screen-phone">{children}</div>
      </div>
    );
  }

  if (kind === 'window') {
    return (
      <div className={cn('pr-frame pr-frame-window panel-lit', className)}>
        <div aria-hidden="true" className="pr-titlebar">
          <span />
          <span />
          <span />
        </div>
        <div className="pr-screen">{children}</div>
      </div>
    );
  }

  // plate — clean arcade bezel (ghost-code)
  return (
    <div className={cn('pr-frame pr-frame-plate', className)}>
      <div className="pr-screen pr-screen-plate">{children}</div>
    </div>
  );
}
