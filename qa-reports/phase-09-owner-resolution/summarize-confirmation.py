import json, statistics, collections, pathlib, gzip, hashlib
p=pathlib.Path(__file__).parent
raw=(p/'performance-confirmation.json').read_bytes() if (p/'performance-confirmation.json').exists() else gzip.decompress((p/'performance-confirmation.json.gz').read_bytes())
d=json.loads(raw)
assert len(d['rows'])==32
assert all('error' not in r and r['status']==200 and not r['errors'] and not r['failed'] and not r['responses'] for r in d['rows'])
s={'records':32,'groups':{},'pairedWarmDeltas':{},'longFrameAttribution':[]}
for condition in ['fresh','warm']:
 for target in ['phase00-exact-deployed-artifact','phase09-candidate']:
  rows=sorted([r for r in d['rows'] if r['condition']==condition and r['target']==target],key=lambda r:r['rep'])
  assert len(rows)==8
  g={}
  for metric in ['longTaskExcessMs','lcp','cls','transferBytes']:
   vals=[r[metric] for r in rows]
   g[metric]={'values':vals,'median':statistics.median(vals),'min':min(vals),'max':max(vals)}
  s['groups'][condition+'/'+target]=g
  for r in rows:
   for f in r.get('longAnimationFrames',[]):
    if f.get('blockingDuration',0)>0:
     s['longFrameAttribution'].append({'target':target,'condition':condition,'rep':r['rep'],'frame':{k:f.get(k) for k in ['startTime','duration','blockingDuration','renderStart','styleAndLayoutStart','scripts']}})
for metric in ['longTaskExcessMs','lcp']:
 b=s['groups']['warm/phase00-exact-deployed-artifact'][metric]['values']
 c=s['groups']['warm/phase09-candidate'][metric]['values']
 delta=[y-x for x,y in zip(b,c)]
 s['pairedWarmDeltas'][metric]={'values':delta,'median':statistics.median(delta),'positiveCount':sum(x>0 for x in delta),'negativeCount':sum(x<0 for x in delta),'equalCount':sum(x==0 for x in delta)}
(p/'performance-summary.json').write_text(json.dumps(s,indent=2)+'\n')
print(json.dumps({k:v for k,v in s.items() if k!='longFrameAttribution'},indent=2))
compressed=gzip.compress(raw,mtime=0)
assert gzip.decompress(compressed)==raw
(p/'performance-confirmation.json.gz').write_bytes(compressed)
(p/'performance-compression.json').write_text(json.dumps({'rawBytes':len(raw),'rawSha256':hashlib.sha256(raw).hexdigest(),'gzipBytes':len(compressed),'gzipSha256':hashlib.sha256(compressed).hexdigest(),'roundTripVerified':True},indent=2)+'\n')
(p/'performance-confirmation.json').unlink(missing_ok=True)
