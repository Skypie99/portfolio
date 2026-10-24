# Each control reintroduces one defect (or the rejected Astra copy), runs the
# focused tests, expects FAILURE, then restores the file byte-for-byte.
import subprocess, json, sys, hashlib
TESTS = ['app/__tests__/astra-ultra-integration.test.ts', 'components/__tests__/CountUpStat.preference.test.tsx',
         'components/__tests__/ProjectDestinationLabels.test.tsx', 'lib/__tests__/recruiter-copy-truth.test.ts',
         'app/__tests__/about-contact-editorial.test.tsx', 'app/__tests__/flagstone-release-status.test.ts']
C = [
 ('reduced-motion counter: old effect guard', 'components/CountUpStat.tsx', """    if (!parsed) return;
    // Reduced motion""", """    if (!parsed || reduced || started.current || !inView) return;
    if (false) return;
    // Reduced motion"""),
 ('Ghost Code divider: whole-row border-color on hover', 'app/globals.css', """  #work ol > li:has(a:hover) {
    border-top-color: rgb(var(--rgb-ink) / 0.5);""", """  #work ol > li:has(a:hover) {
    border-color: rgb(var(--rgb-ink) / 0.5);"""),
 ('Ghost Code divider: whole-row border-color on focus/press (dark)', 'app/globals.css', """html.dark #work ol > li:has(a:active) {
  border-top-color""", """html.dark #work ol > li:has(a:active) {
  border-color"""),
 ('REJECTED Contact reorder (Astra pitch first)', 'app/contact/page.tsx', None, None),
 ("Astra's heading instead of the owner's", 'app/page.tsx', 'I set the direction, make the decisions, and guide AI-assisted implementation.', 'I set the direction. AI agents do the implementation.'),
 ('defect wording reverted', 'app/page.tsx', "figure: 'A documented defect',", "figure: 'Last defect',"),
 ('card renders first word only', 'components/CaseStudyCard.tsx', '{demoLink.label} <span aria-hidden="true">↗</span>', "{demoLink.label.split(' ')[0]} <span aria-hidden=\"true\">↗</span>"),
 ('card demo link loses hover colour', 'components/ProjectCard.tsx', 'text-text-meta transition-colors duration-fast ease-out hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"\n                    >\n                      {/* The full', 'text-text-meta transition-colors duration-fast ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"\n                    >\n                      {/* The full'),
 ('demo destination label reverted in content', 'content/deliverables.json', '"label": "Play Ghost Code"', '"label": "Live demo"'),
 ('sitemap build-time lastModified restored', 'app/sitemap.ts', "{ url: `${BASE}/`, changeFrequency", "{ url: `${BASE}/`, lastModified: new Date(), changeFrequency"),
 ('Back to home (blog) loses focus parity', 'app/blog/page.tsx', 'hover:text-accent-text focus-visible:text-accent-text', 'hover:text-accent-text'),
 ('certificate grid floor reverted', 'app/globals.css', 'minmax(min(100%, max(16rem, calc((100% - 8rem) / 3))), 1fr)', 'minmax(max(11.5rem, calc((100% - 8rem) / 3)), 1fr)'),
 ('Footer LinkedIn label reverted', 'components/Footer.tsx', '<span>View LinkedIn profile</span>', '<span>Full history on LinkedIn</span>'),
 ('Contact LinkedIn label reverted', 'app/contact/page.tsx', '<span>View LinkedIn profile</span>', '<span>Full history on LinkedIn</span>'),
]
results = []
for name, path, old, new in C:
    orig = open(path, encoding='utf-8').read()
    if old is None:  # move the roles sentence above the opening paragraph
        a = 'Accessible technology, built with care.'; r = 'Open to senior support roles, and to professional conversations.'
        mod = orig.replace(r, '@@R@@').replace(a, r + '\n' + a).replace('@@R@@', '')
    else:
        assert orig.count(old) == 1, (name, orig.count(old)); mod = orig.replace(old, new)
    open(path, 'w', encoding='utf-8').write(mod)
    try:
        p = subprocess.run(['npx', 'vitest', 'run', *TESTS], capture_output=True, text=True)
        failed = p.returncode != 0
        lines = [l.strip() for l in p.stdout.splitlines() if l.strip().startswith(('×', 'FAIL')) or ' × ' in l][:4]
    finally:
        open(path, 'w', encoding='utf-8').write(orig)
    assert hashlib.sha256(open(path, 'rb').read()).hexdigest() == hashlib.sha256(orig.encode()).hexdigest()
    results.append({'control': name, 'file': path, 'caught': failed, 'failing': lines})
    print(('CAUGHT  ' if failed else 'MISSED  ') + name)
json.dump(results, open(sys.argv[1], 'w'), indent=1)
print(f"{sum(r['caught'] for r in results)}/{len(results)} controls caught")
