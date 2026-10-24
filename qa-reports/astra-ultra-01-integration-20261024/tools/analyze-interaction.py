import json,sys,re
rows=json.load(open(sys.argv[1]))
EXPECTED_GEOMETRY=re.compile(r'^(rest|hover|press|released|focus|afterTap)\.(text|width)$')
summary={}
for r in rows:
    real=[d for d in r['diffs'] if not EXPECTED_GEOMETRY.match(d['key'])]
    geo=[d for d in r['diffs'] if EXPECTED_GEOMETRY.match(d['key'])]
    summary.setdefault(r['target'],[]).append((r['mode'],real,geo))
    # also record which states were actually reached
for t,ms in summary.items():
    n=sum(len(x[1]) for x in ms)
    print(f"{t}: interaction-property diffs={n}")
    for mode,real,geo in ms:
        for d in real: print(f"     [{mode}] {d['key']}: {d['baseline']} -> {d['candidate']}")
    g=ms[0][2]
    if g: print('     geometry/text (expected for label change):', '; '.join(f"{d['key']}: {str(d['baseline'])[:28]!r} -> {str(d['candidate'])[:28]!r}" for d in g if d['key'].startswith('rest.')))
# state reach check
bad=[]
for r in rows:
    for side in ('baseline','candidate'):
        s=r[side]
        if r['mode']=='touch':
            if s['hoverMedia']: bad.append((r['target'],side,'touch ctx reports hover:hover'))
            continue
        if not s.get('pointerReachable', True):
            bad.append((r['target'],r['mode'],side,'POINTER BLOCKED by overlay (pre-existing); hover/press not probed'))
        elif not s['hover']['matches']['hover']: bad.append((r['target'],r['mode'],side,'hover not reached'))
        if s.get('pointerReachable', True) and not s['press']['matches']['active']: bad.append((r['target'],r['mode'],side,'press not reached'))
        if not s['focus']['matches']['focusVisible']: bad.append((r['target'],r['mode'],side,'focus-visible not reached'))
print('state-reach problems:',bad if bad else 'none')
