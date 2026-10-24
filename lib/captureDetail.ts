import type { Deliverable } from '@/lib/schema';

/**
 * captureDetail — the flagship room's detail plate (Creative Release 7
 * candidate, 2026-10-22).
 *
 * The homepage flagship room shows the flagship's real hero capture inside a
 * device frame about 270px wide at 1440 and 190px at 393. At that scale the
 * report card the museum plate describes ("Steep grade: a real barrier report
 * expanded on the map.") renders its words at 3 to 7px: the plate names
 * pixels nobody can read. A detail plate shows that one region of the SAME
 * capture at a size where the product's own text can be read, beside the
 * whole screen. Release 5 established the grammar on four case studies
 * ("a labelled detail of one, shown at a size where the product's own text
 * can be read"); this brings it to the flagship's first impression.
 *
 * TRUTH RULES, and they are load-bearing:
 *  - A detail is a crop of the shipped capture file, never a new asset, a
 *    re-render or a retouch. It reuses the file's own URLs, so the browser
 *    serves it from the request the phone already made.
 *  - A spec is measured on ONE file. It renders only while the deliverable's
 *    heroShot is still that exact file at that exact size; re-capture,
 *    re-wire, a themed twin, a clip or owner artwork in the slot all turn it
 *    off rather than letting it crop the wrong pixels.
 *  - The crop box keeps a margin of the capture around the subject, so it
 *    reads as a piece of the screen, not as a free-floating component.
 */

export type CaptureDetail = {
  /** The capture file the box was measured on (the heroShot `src`). */
  src: string;
  /** That file's pixel size; must equal the heroShot's declared width/height. */
  width: number;
  height: number;
  /** The crop, in capture pixels. */
  box: { x: number; y: number; w: number; h: number };
  /** What the crop is OF, measured on the file, in capture pixels; the box
   *  holds it whole with a margin. The guard reads these pixels back. */
  subject: { x: number; y: number; w: number; h: number };
};

/**
 * Keyed by deliverable id. Flagstone's box was measured on the 1290×2803
 * Explore capture. The expanded report card runs from its orange severity
 * stripe at x 266 to the white face's edge at x 979, y 445 to 1295. The
 * subject is the card's upper part: its title, severity line, report age
 * and photograph, which ends at y 998. The box keeps a 30px margin of the map
 * above and beside it and ends at y 1013, on blank card face, 10px above the
 * report's free-text description (first ink at y 1024). That sentence is
 * the reporter's own words: the crop leaves it out rather than enlarging it,
 * and it stays untouched in the whole screen beside the plate (owner
 * decision, 2026-10-24).
 */
export const CAPTURE_DETAILS: Readonly<Record<string, CaptureDetail>> = {
  flagstone: {
    src: '/showcase/flagstone/explore-current.phone.webp',
    width: 1290,
    height: 2803,
    box: { x: 236, y: 414, w: 774, h: 600 },
    subject: { x: 266, y: 444, w: 714, h: 555 },
  },
};

type DetailSource = Pick<Deliverable, 'id' | 'heroShot' | 'heroArtwork'>;

/** The detail spec for this deliverable's hero capture, or null when there is
 *  none or the hero no longer matches the file it was measured on. */
export function captureDetailFor(d: DetailSource): CaptureDetail | null {
  const spec = CAPTURE_DETAILS[d.id];
  const shot = d.heroShot;
  if (!spec || !shot || d.heroArtwork) return null;
  if (shot.video || shot.dark || shot.matte) return null;
  if (shot.src !== spec.src || shot.width !== spec.width || shot.height !== spec.height) return null;
  return spec;
}

/**
 * Where the whole capture sits inside the detail box, as fractions of the
 * box: rendered `scale` box-widths wide, shifted left by `x` box-widths and
 * up by `y` box-heights. Pure, so the guard can check the arithmetic.
 */
export function cropGeometry({ width, box }: CaptureDetail) {
  return {
    scale: width / box.w,
    x: box.x / box.w,
    y: box.y / box.h,
    aspect: `${box.w} / ${box.h}`,
  };
}
