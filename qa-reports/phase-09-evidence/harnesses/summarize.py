import collections, json, pathlib, statistics

p = pathlib.Path('qa-reports/phase-09-evidence')
performance = json.loads((p / 'performance.json').read_text())
groups = collections.defaultdict(list)
for row in performance['rows']:
    groups[(row['target'], row['route'], row['device'], row['condition'])].append(row)
summary = []
for (target, route, device, condition), rows in groups.items():
    result = dict(target=target, route=route, device=device, condition=condition, count=len(rows))
    for metric in ['lcp', 'cls', 'longTaskExcessMs', 'requestCount', 'transferBytes', 'encodedBytes', 'cachedResourceCount']:
        values = [r[metric] for r in rows if isinstance(r.get(metric), (int, float))]
        result[metric] = dict(median=statistics.median(values), min=min(values), max=max(values)) if values else None
    for metric, name in [('responseStart', 'responseStartMs'), ('domContentLoadedEventEnd', 'domContentLoadedMs'), ('loadEventEnd', 'loadMs')]:
        values = [r['nav'][metric] for r in rows if 'nav' in r]
        result[name] = dict(median=statistics.median(values), min=min(values), max=max(values)) if values else None
    summary.append(result)
by_key = {(r['target'],r['route'],r['device'],r['condition']):r for r in summary}
comparisons = []
for row in summary:
    if row['target'] != 'phase09-candidate': continue
    before=by_key[('phase00-exact-deployed-artifact',row['route'],row['device'],row['condition'])]
    comparison=dict(route=row['route'],device=row['device'],condition=row['condition'])
    for metric in ['lcp','cls','longTaskExcessMs','requestCount','transferBytes']:
        if row[metric] and before[metric]:
            a=before[metric]['median']; b=row[metric]['median']
            comparison[metric]=dict(phase00=a,phase09=b,delta=b-a,percent=(b-a)/a*100 if a else None)
    comparisons.append(comparison)
errors=[{k:r.get(k) for k in ['target','route','device','condition','rep','error','errors','failed','responses']} for r in performance['rows'] if r.get('error') or r.get('errors') or r.get('failed') or r.get('responses')]
report=dict(metadata=performance['metadata'],cellCount=len(performance['rows']),groups=summary,comparisons=comparisons,errors=errors)
(p/'performance-summary.json').write_text(json.dumps(report,indent=2))
lines=['# September 7 paired local lab performance','', 'Medians of three runs per artifact/device/cache/route. See performance.json for every raw row and exact method. Milliseconds for LCP and fixed-window long-task excess; the latter is not Lighthouse TBT or INP. No field Core Web Vitals claim.','', '| Route | Device | Cache | P00 LCP | P09 LCP (min–max) | P09 CLS | P00/P09 long-task excess | Requests P00/P09 | Resource transfer bytes P00/P09 |','|---|---|---|---:|---:|---:|---:|---:|---:|']
for c in comparisons:
    r=by_key[('phase09-candidate',c['route'],c['device'],c['condition'])]
    if not r['lcp']: continue
    lines.append(f"| {c['route']} | {c['device']} | {c['condition']} | {c['lcp']['phase00']:.0f} | {c['lcp']['phase09']:.0f} ({r['lcp']['min']:.0f}–{r['lcp']['max']:.0f}) | {c['cls']['phase09']:.6f} | {c['longTaskExcessMs']['phase00']:.0f}/{c['longTaskExcessMs']['phase09']:.0f} | {c['requestCount']['phase00']:.0f}/{c['requestCount']['phase09']:.0f} | {c['transferBytes']['phase00']:.0f}/{c['transferBytes']['phase09']:.0f} |")
(p/'performance-table.md').write_text('\n'.join(lines)+'\n')
old=json.loads((p/'phase00-artifact.json').read_text()); new=json.loads((p/'artifact.json').read_text())
bundle=[]
for label,extensions in [('JavaScript',['.js']),('CSS',['.css']),('Fonts',['.woff2']),('Images',['.avif','.webp','.jpg','.png','.svg']),('Video',['.mp4','.webm']),('HTML',['.html'])]:
    def total(data): return sum(data['sums'].get(e,{}).get('bytes',0) for e in extensions)
    a=total(old);b=total(new);bundle.append(dict(category=label,phase00Bytes=a,phase09Bytes=b,deltaBytes=b-a,deltaPercent=(b-a)/a*100))
(p/'bundle-comparison.json').write_text(json.dumps({'method':'Uncompressed exported file totals, not per-route transfer; Phase00 exact original deployed artifact versus final local build','rows':bundle},indent=2))
print(json.dumps({'cells':len(performance['rows']),'groups':len(summary),'errors':len(errors),'comparisons':comparisons,'bundle':bundle},indent=2))
