#!/usr/bin/env python3
"""html-diff.py — compare two static builds' pages after normalising build hashes.

  python3 -I html-diff.py <out-A> <out-B> [page ...]

Strips what every rebuild changes (build id, hashed asset paths, webpack module
ids and chunk names inside the RSC flight payload) and reports, per page, whether
the remaining HTML is identical, and if not, the changed tag chunks.
"""
import sys, re, os, difflib
A, B = sys.argv[1], sys.argv[2]
PAGES = sys.argv[3:] or ['index.html', 'work/index.html', 'about/index.html', 'work/claude-corp/index.html', 'work/dashboard/index.html', 'work/ghost-code/index.html', 'work/prompt-library/index.html', 'work/flagstone/index.html']
def norm(p):
    s = open(p, encoding='utf8').read()
    s = re.sub(r'/_next/static/[^"\'\s>\\]+', '/_next/static/X', s)
    s = re.sub(r'static/chunks/[^"\\\s]+', 'static/chunks/X', s)
    s = re.sub(r'<!--[A-Za-z0-9_-]{15,}-->', '<!--BUILDID-->', s)
    s = re.sub(r'\\"b\\":\\"[A-Za-z0-9_-]{15,}\\"', '\\"b\\":\\"BUILDID\\"', s)
    s = re.sub(r':I\[\d+,', ':I[MOD,', s)  # webpack module ids in client references
    s = re.sub(r'\\"\d+\\",\\"static/chunks/X\\"', 'CHUNK', s)  # chunk group ids beside chunk names
    return s
def markup_only(s):
    # Rendered markup only: hydration payloads and asset links are bundle plumbing.
    s = re.sub(r'<script\b[\s\S]*?</script>', '', s)
    s = re.sub(r'<link rel="(stylesheet|preload|modulepreload)"[^>]*>', '', s)
    return s
for rel in PAGES:
    a, b = os.path.join(A, rel), os.path.join(B, rel)
    na, nb = norm(a), norm(b)
    if na == nb:
        print(f'{rel}: IDENTICAL after build-hash normalisation'); continue
    if markup_only(na) == markup_only(nb):
        print(f'{rel}: rendered markup IDENTICAL (only bundle plumbing inside <script>/<link> differs)'); continue
    d = [l for l in difflib.unified_diff(na.split('><'), nb.split('><'), lineterm='', n=0) if l.startswith(('+', '-')) and not l.startswith(('+++', '---'))]
    print(f'{rel}: DIFFERS: {len(d)} changed tag chunks')
    for l in d[:12]: print('    ' + l[:260].replace('\n', ' '))
