from pathlib import Path
import json,subprocess,hashlib
repo=Path('/Users/skypie/Portfolio-codex/portfolio-3.0-phase05-reconciled-20260904');out=Path('/Users/skypie/Documents/Codex/2026-09-04/files-pasted-by-the-user-skypi-2/outputs/reconciliation');accepted='ceea4044ac53ac412feb33cf644705a53bec574d'
def git(*a):return subprocess.check_output(['git','-C',str(repo),*a],text=True).strip()
plan=json.loads((out/'intake-and-reconciliation-plan.json').read_text());changed=git('diff',accepted,'--name-only').splitlines();source=[f for f in changed if not f.startswith('qa-reports/')];assert set(source)==set(plan['proposedSourceFiles'])
old=json.loads(git('show',accepted+':content/deliverables.json'));new=json.loads((repo/'content/deliverables.json').read_text());assert [x['id'] for x in old]==[x['id'] for x in new];assert old[0]['id']=='flagstone';changes={}
for a,b in zip(old,new):
 keys=[k for k in a if a[k]!=b[k]]
 if keys:changes[a['id']]=keys
 for k in ['title','summary','status','verifiedDate','role','links','featured']:assert a[k]==b[k],(a['id'],k)
 if a['id']=='flagstone':assert a==b
assert changes==plan['p05ProductFields'];assert not git('diff',accepted,'--','app','components','lib','public/flagstone','content/profile.json','content/certificates.json','content/blog.json','package.json','package-lock.json')
body=next(r for r in new if r['id']=='dashboard')['body'];assert body.count('making blockers visible, routing decisions')==1;assert 'share mode configuration' in body and 'independent layers' not in body
for slug in ['dashboard','claude-corp']:
 shots=next(r for r in new if r['id']==slug)['shots'];assert all('Local candidate' in s.get('caption','') or 'local candidate' in s.get('caption','') for s in shots)
m0=json.loads(git('show',accepted+':content/showcase.manifest.json'));m1=json.loads((repo/'content/showcase.manifest.json').read_text());assert len(m0['captures'])==len(m1['captures']);changedRows=[]
for a,b in zip(m0['captures'],m1['captures']):
 if a!=b:
  assert a['project'] in ['dashboard','claude-corp'] and a['viewport']=='desktop';changedRows.append([a['project'],a['scene'],a['theme']]);assert 'local-approved-candidate; not deployed' in b['flags']
assert len(changedRows)==10
for n,v in m0['projects'].items():
 if n not in ['dashboard','claude-corp']:assert v==m1['projects'][n]
# Measure depth from preserved case-study bodies; don't manufacture new content to pad order.
depths={r['id']:len(r.get('body','')) for r in new};assert max(depths,key=depths.get)=='flagstone'
result={'result':'PASS','acceptedP04':accepted,'acceptedP04Tree':'2c350cad76563d52dcf987e57cc0bc8d64cf874a','changedSourceFiles':source,'changedProjectFields':changes,'FlagstoneObjectExact':True,'P04AboutContrastTestsAndCinematicExact':True,'statusesLinksDatesRolesFeaturedAndOrderExact':True,'changedManifestRows':changedRows,'bodyLengths':depths,'fileSha256':{f:hashlib.sha256((repo/f).read_bytes()).hexdigest() for f in source},'workingDiffSha256':hashlib.sha256(subprocess.check_output(['git','-C',str(repo),'diff','--binary',accepted,'--',*source])).hexdigest()};(out/'final-preservation.json').write_text(json.dumps(result,indent=2));print('PASS exact P04 preservation,22file scope,10manifest rows,claim/private/local boundaries,Flagstone first/deepest')
