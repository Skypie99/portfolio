/**
 * caseShowcase.ts — Release 5 project showcases (2026-10-20).
 *
 * The presentation spec for the four case-study showcases: /work/prompt-library/,
 * /work/claude-corp/, /work/ghost-code/ and /work/dashboard/. Each entry says
 * which existing captures the page exhibits, at which size, with which label,
 * caption and provenance, and how the phone composition differs from the
 * desktop one. Nothing here is content data: the case-study prose, status,
 * role, dates and the authored shot captions stay in content/deliverables.json
 * and are not read through this module. This is presentation copy in the same
 * sense as Flagstone's numbered proof labels in app/work/[slug]/page.tsx.
 *
 * Every image path points at a file the site already ships, or at a detail
 * cut from one by qa-reports/release5-showcases-20261020/tools/cut-details.mjs
 * (the originals are never modified; a detail is always labelled as a detail
 * and carries the provenance of the capture it was cut from). The spec is
 * validated with zod the first time it is read, so a missing field, a bad alt
 * or an em dash fails the build the way a content error does.
 *
 * Phone and desktop are separate reading experiences: a `phone` image is an
 * authentic phone-composed capture (or a tighter detail), never a shrunken
 * desktop screenshot. The component shows exactly one of the two per width.
 */
import { z } from 'zod';

import { AltTextSchema } from '@/lib/schema';

const EM_DASH = '—';
const noEmDash = (s: string) => !s.includes(EM_DASH);

const AssetPath = z
  .string()
  .regex(/^\/(images\/deliverables|showcase)\/[a-z0-9-]+\//, 'showcase assets live under /images/deliverables/<slug>/ or /showcase/<slug>/');

const VariantSchema = z.object({
  src: AssetPath,
  avif: AssetPath.optional(),
  webp: AssetPath.optional(),
});

const ImageSchema = VariantSchema.extend({
  alt: AltTextSchema.refine(noEmDash, 'no em dash in alt text'),
  /** The file's own pixel size: the exhibit box takes this exact aspect, so
   *  the capture is never cropped or letterboxed. */
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** The dark twin of the same scene (same alt, same box). */
  dark: VariantSchema.optional(),
});

/** Where a capture came from: the factory manifest's date and project SHA,
 *  and the scene it was taken from. `detail` marks an exhibit that was cut
 *  from that capture rather than being the whole frame. */
const ProvenanceSchema = z.object({
  capturedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  commit: z.string().regex(/^[0-9a-f]{7,8}$/),
  scene: z.string().min(2).max(60).refine(noEmDash),
  detail: z.boolean().optional(),
  /** An extra truth the line must carry, e.g. "synthetic data". */
  note: z.string().min(2).max(60).refine(noEmDash).optional(),
});

/** One row of a typeset ledger: the decision, who holds it, one sentence. */
const LedgerRowSchema = z.object({
  title: z.string().min(2).max(40).refine(noEmDash),
  holder: z.string().min(2).max(48).refine(noEmDash),
  text: z.string().min(10).max(240).refine(noEmDash),
});

/** A still-first clip the deliverable already authors in content/
 *  deliverables.json (`shots[shotIndex].video`, with its dark twin, alt and
 *  `autoplay: false`): the chapter renders that data, so the clip's alt and
 *  playback setting stay content, guarded where they are. */
const ClipSchema = z.object({
  shotIndex: z.number().int().min(0).max(2),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const ExhibitSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
    /** A whole capture, a detail cut from one, a still-first clip, or a
     *  ledger typeset from the case study's own prose (never an image, so it
     *  can never be mistaken for telemetry or a live screen). */
    kind: z.enum(['capture', 'detail', 'clip', 'ledger']),
    rows: z.array(LedgerRowSchema).min(2).max(6).optional(),
    clip: ClipSchema.optional(),
    label: z.string().min(4).max(60).refine(noEmDash, 'no em dash in a label'),
    caption: z.string().min(10).max(360).refine(noEmDash, 'no em dash in a caption'),
    desktop: ImageSchema.optional(),
    phone: ImageSchema.optional(),
    /** When the phone variant shows a different scene or a tighter detail,
     *  its own label and caption, so the words always describe the pixels
     *  actually laid out at that width. */
    phoneLabel: z.string().min(4).max(60).refine(noEmDash).optional(),
    phoneCaption: z.string().min(10).max(360).refine(noEmDash).optional(),
    provenance: ProvenanceSchema.optional(),
    /** The phone variant's own provenance when it is a different capture. */
    phoneProvenance: ProvenanceSchema.optional(),
    /** `full` spans the content column; `inset` steps in one column of
     *  twelve at lg, so a detail reads as subordinate to the capture above;
     *  `aside` seats a portrait plane beside its caption at lg. */
    layout: z.enum(['full', 'inset', 'aside']).default('full'),
  })
  .refine((e) => e.kind === 'ledger' || e.kind === 'clip' || Boolean(e.desktop || e.phone), 'an exhibit needs a desktop or a phone image')
  .refine((e) => e.kind === 'ledger' || Boolean(e.provenance), 'a capture, detail or clip needs its provenance')
  .refine((e) => e.kind !== 'ledger' || Boolean(e.rows?.length), 'a ledger needs rows')
  .refine((e) => e.kind !== 'ledger' || !(e.desktop || e.phone), 'a ledger carries no image')
  .refine((e) => e.kind !== 'clip' || Boolean(e.clip), 'a clip exhibit names the authored shot it plays')
  .refine((e) => e.kind === 'clip' || !e.clip, 'only a clip exhibit carries clip data');

/** The showcase hero: the capture-true, content-wide exhibit that replaces
 *  the shared two-column hero well on a route whose first impression is a
 *  desktop screen. Desktop shows the deliverable's own heroShot at the
 *  capture's aspect; below md the phone-composed capture stands on the same
 *  stage. Each carries the label and provenance printed under the well. */
const HeroSchema = z.object({
  desktop: ImageSchema,
  phone: ImageSchema,
  label: z.string().min(4).max(60).refine(noEmDash),
  phoneLabel: z.string().min(4).max(60).refine(noEmDash),
  provenance: ProvenanceSchema,
  phoneProvenance: ProvenanceSchema,
});

const DoorwaySchema = z.object({
  label: z.string().min(4).max(40).refine(noEmDash),
  href: z.string().url().startsWith('https://'),
});

const SpecSchema = z.object({
  hero: HeroSchema.optional(),
  heading: z.string().min(4).max(40).refine(noEmDash),
  standfirst: z.string().min(10).max(160).refine(noEmDash).optional(),
  exhibits: z.array(ExhibitSchema).min(1).max(4),
  doorway: DoorwaySchema.optional(),
});

export type ShowcaseImage = z.infer<typeof ImageSchema>;
export type ShowcaseHero = z.infer<typeof HeroSchema>;
export type ShowcaseProvenance = z.infer<typeof ProvenanceSchema>;
export type ShowcaseExhibit = z.infer<typeof ExhibitSchema>;
export type ShowcaseSpec = z.infer<typeof SpecSchema>;

type SpecInput = z.input<typeof SpecSchema>;

const PL = '/showcase/prompt-library';
const PL_IMG = '/images/deliverables/prompt-library';
const CC = '/showcase/claude-corp';
const CC_IMG = '/images/deliverables/claude-corp';
const GC = '/showcase/ghost-code';

/** Light + dark twins of one scene under one path stem, e.g. `${PL}/home.{theme}.desktop`. */
const twin = (stem: string, ext: 'webp' = 'webp') => ({
  src: `${stem.replace('{theme}', 'light')}.${ext}`,
  avif: `${stem.replace('{theme}', 'light')}.avif`,
  webp: `${stem.replace('{theme}', 'light')}.webp`,
  dark: {
    src: `${stem.replace('{theme}', 'dark')}.${ext}`,
    avif: `${stem.replace('{theme}', 'dark')}.avif`,
    webp: `${stem.replace('{theme}', 'dark')}.webp`,
  },
});

const SPECS: Record<string, SpecInput> = {
  'prompt-library': {
    heading: 'A closer look.',
    standfirst: 'The library as it opens, then one prompt opened and ready to run.',
    exhibits: [
      {
        id: 'library',
        kind: 'capture',
        label: 'The library, as it opens.',
        caption:
          'Search, category and tag filters, and the featured prompt leading a grid of prompt cards. Everything on this screen lives in the browser; there is no account and no backend.',
        desktop: {
          ...twin(`${PL}/home.{theme}.desktop`),
          width: 1290,
          height: 806,
          alt: 'The Prompt Library home, with a search bar and category chips over a grid of prompt cards and the featured card leading.',
        },
        /* The phone reading size gets one card from the same capture rather
           than the whole grid shrunk: the 2026-07-31 phone capture of the home
           was not used because its privacy line predates the truth pass. */
        phone: {
          ...twin(`${PL_IMG}/r5-featured-card.{theme}`),
          width: 330,
          height: 206,
          alt: 'Detail of the featured prompt card: the Learning category, the title Explain Like I’m Five, its one-line description and three tags.',
        },
        phoneLabel: 'One prompt card, as the library opens.',
        phoneCaption:
          'The featured prompt as the library opens: its category, title, description and tags. The whole library, prompts, favorites, run history and settings, lives in the browser; there is no account and no backend.',
        provenance: { capturedDate: '2026-09-02', commit: '78b961e', scene: 'home · desktop' },
        phoneProvenance: { capturedDate: '2026-09-02', commit: '78b961e', scene: 'home · desktop', detail: true },
      },
      {
        id: 'prompt-open',
        kind: 'detail',
        label: 'One prompt, opened.',
        caption:
          'The template on the left carries two variables and the fields on the right fill them. Copy the filled prompt, or run it with Claude: the browser sends the prompt and the user’s own key directly to Anthropic over HTTPS.',
        desktop: {
          ...twin(`${PL_IMG}/r5-prompt-open.{theme}`),
          width: 1024,
          height: 544,
          alt: 'Detail of an opened prompt: the Explain Like I’m Five template with topic and audience variables, two fields to fill, Copy filled and Run with Claude.',
        },
        phone: {
          ...twin(`${PL_IMG}/r5-prompt-variables.{theme}`),
          width: 520,
          height: 400,
          alt: 'Detail of the variables panel: Topic to explain and Audience fields, Copy filled, Run with Claude, and the model choice.',
        },
        provenance: { capturedDate: '2026-07-31', commit: '052b37a', scene: 'prompt-detail · desktop', detail: true },
        layout: 'inset',
      },
    ],
    doorway: { label: 'Explore Prompt Library', href: 'https://prompts.skypistudio.com' },
  },

  /* Claude Corp: the operating model first, as four decisions typeset from
     the case study itself, then the pipeline and the roles as the public site
     draws them. The Branch Atlas concept diagram stays the hero, labelled.
     The 2026-09-05 desktop captures come from a locally approved candidate
     build of the public site (manifest flag), so the provenance says so. */
  'claude-corp': {
    heading: 'A closer look.',
    standfirst: 'Who decides what, then the pipeline and the fifteen roles as the public site shows them.',
    exhibits: [
      {
        id: 'decisions',
        kind: 'ledger',
        label: 'Who decides what.',
        caption:
          'The authority order runs intent, then the Constitution, then each role’s own file, then its skills, and no agent may amend it.',
        rows: [
          {
            title: 'Intent',
            holder: 'Sky',
            text: 'The brief and the acceptance gates a cycle is judged against are written before any role starts.',
          },
          {
            title: 'Routing',
            holder: 'A project manager role',
            text: 'Decisions are routed to the right lane. Fifteen roles each own a domain, and every role works on its own branch, never on main.',
          },
          {
            title: 'Review',
            holder: 'Gates, not discretion',
            text: 'A UI change passes a seven-layer design-compile gate before it counts as done. Exactly one role may message Sky; the other fourteen write reports.',
          },
          {
            title: 'Release',
            holder: 'Sky',
            text: 'Merging is Sky’s. One narrow exception, mechanically gated and reviewed quarterly, covers a single project.',
          },
        ],
      },
      {
        id: 'pipeline',
        kind: 'detail',
        label: 'The pipeline, as the public site draws it.',
        caption:
          'Five stages from intent to merge: Sky sets intent, Morgan plans and routes, fifteen roles build in parallel on scoped branches, Safety applies the seven-layer compiler, and main merges on human approval. A diagram on the public site, not telemetry.',
        desktop: {
          ...twin(`${CC_IMG}/r5-pipeline.{theme}`),
          width: 990,
          height: 298,
          alt: 'Detail of the orchestration pipeline diagram: five stages, Sky sets intent, Morgan plans and routes, 15 roles build in parallel, Safety runs the 7-layer compiler, main merges on human approval.',
        },
        provenance: { capturedDate: '2026-09-05', commit: '4a03980', scene: 'hero-pipeline · desktop', detail: true, note: 'local build' },
        layout: 'inset',
      },
      {
        id: 'roles',
        kind: 'capture',
        label: 'Fifteen roles, each with a domain.',
        caption:
          'The role grid on the public site. Each card is a purpose-built Claude agent with a scoped skill file and its own branch namespace, named for its craft: the names are role names, not people.',
        desktop: {
          ...twin(`${CC}/team.{theme}.desktop`),
          width: 1600,
          height: 1000,
          alt: 'The fifteen-role team grid, with each agent card naming its craft from Quinn on product through Morgan on reporting.',
        },
        phone: {
          ...twin(`${CC_IMG}/r5-team-phone.{theme}`),
          width: 780,
          height: 1300,
          alt: 'Detail of the role grid on a phone: the 15 specialized roles heading, the role filters, and the Morgan and Shamus role cards.',
        },
        provenance: { capturedDate: '2026-09-05', commit: '4a03980', scene: 'team · desktop', note: 'local build' },
        phoneProvenance: { capturedDate: '2026-07-31', commit: '7e961a3', scene: 'team · phone', detail: true },
      },
    ],
  },

  /* Ghost Code: the real game, large. The title screen is the hero at full
     content width (the deliverable's own heroShot, capture-true), a round on
     a phone stands in for it below md; the chapter shows the board at a size
     where the prompt and tokens read, then the authored still-first clip
     beside its caption. Nothing plays on its own. */
  'ghost-code': {
    hero: {
      desktop: {
        ...twin(`${GC}/title.{theme}.desktop`),
        width: 1290,
        height: 806,
        alt: 'Ghost Code’s title screen: the Phantom mark beside the wordmark, three mastery counters, a one-line how to play, and Press Start with a theme control below.',
      },
      phone: {
        ...twin(`${GC}/board.{theme}.phone`),
        width: 780,
        height: 1688,
        alt: 'A Ghost Code round on a phone, with the Phantom, four command tokens, prompt, and score in a focused play view.',
      },
      label: 'Current product capture · title screen',
      phoneLabel: 'Current product capture · a round, on a phone',
      provenance: { capturedDate: '2026-07-31', commit: '1e6b963', scene: 'title · desktop' },
      phoneProvenance: { capturedDate: '2026-07-31', commit: '1e6b963', scene: 'board · phone' },
    },
    heading: 'See it in motion.',
    standfirst: 'A round on the board, then the Phantom in motion when you press play.',
    exhibits: [
      {
        id: 'board',
        kind: 'capture',
        label: 'A round, in play.',
        caption:
          'A prompt appears, four command tokens surround the Phantom, and you steer it to the right one. Arcade mode keeps score and takes a spirit for every miss; Learn mode drops the pressure and escalates instead: a hint, a second try, then the answer.',
        desktop: {
          ...twin(`${GC}/board.{theme}.desktop`),
          width: 1600,
          height: 1000,
          alt: 'A Ghost Code round in play, with the Phantom at the centre of four command tokens, the prompt above, and score and streak counters keeping pace.',
        },
        provenance: { capturedDate: '2026-07-31', commit: '1e6b963', scene: 'board · desktop' },
      },
      {
        id: 'round',
        kind: 'clip',
        label: 'The round, in motion.',
        caption:
          'A seeded round of a few seconds: the Phantom moves between the four tokens while the prompt reads above, in whichever theme the page is in. Press play to run it; nothing plays on its own.',
        clip: { shotIndex: 0, width: 390, height: 844 },
        provenance: { capturedDate: '2026-07-31', commit: '1e6b963', scene: 'round · phone clip' },
        layout: 'aside',
      },
    ],
  },
};

const parsed = new Map<string, ShowcaseSpec>();

/** The showcase spec for a case study, validated once; undefined for every
 *  deliverable that keeps the shared presentation (Flagstone and any future
 *  entry without a spec). */
export function caseShowcaseFor(id: string): ShowcaseSpec | undefined {
  const input = SPECS[id];
  if (!input) return undefined;
  const cached = parsed.get(id);
  if (cached) return cached;
  const result = SpecSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`lib/caseShowcase.ts["${id}"] failed validation:\n${JSON.stringify(result.error.format(), null, 2)}`);
  }
  parsed.set(id, result.data);
  return result.data;
}

/** The ids that carry a showcase, for tests and for the page's scoping. */
export const CASE_SHOWCASE_IDS: readonly string[] = Object.freeze(Object.keys(SPECS));
