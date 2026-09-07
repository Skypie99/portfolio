"""Read public endpoints only; retain allowlisted response headers, never cookies/body."""
import urllib.request,urllib.error,json,sys
from datetime import datetime,timezone
from concurrent.futures import ThreadPoolExecutor
urls=['https://skypistudio.com/','https://skypistudio.com/work/','https://skypistudio.com/flagstone/','https://skypistudio.com/robots.txt','https://skypistudio.com/sitemap.xml','http://skypistudio.com/','https://www.skypistudio.com/','https://skypie99.github.io/portfolio/','https://skypie99.github.io/studio-archive/','https://archive.skypistudio.com/']
keys=['server','content-type','location','strict-transport-security','content-security-policy','content-security-policy-report-only','x-frame-options','x-content-type-options','referrer-policy','permissions-policy','x-xss-protection','cache-control','via']
def check(url):
 row={'url':url,'measured_utc':datetime.now(timezone.utc).isoformat(),'method':'GET; follow redirects; default TLS verification'}
 try:
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Portfolio-Phase09-read-only-audit'}),timeout=25) as r:
   row.update(status=r.status,final_url=r.url,headers={k:r.headers[k] for k in keys if k in r.headers})
 except Exception as e:row['error']=str(e)
 return row
rows=list(ThreadPoolExecutor(max_workers=5).map(check,urls));open(sys.argv[1],'w').write(json.dumps(rows,indent=2)+'\n');print(json.dumps(rows,indent=2))
