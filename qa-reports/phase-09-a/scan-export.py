"""Read-only exported SEO inventory. Usage: python3 scan-export.py OUT_DIR OUTPUT_JSON."""
import sys,json,hashlib
from pathlib import Path
from html.parser import HTMLParser
from datetime import datetime,timezone
from urllib.parse import urlparse
import xml.etree.ElementTree as ET
class Head(HTMLParser):
 def __init__(self):
  super().__init__();self.canon=[];self.robots=[];self.refresh=[];self.meta_policy=[];self.structured=[];self.active=False;self.buf=''
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='link' and a.get('rel')=='canonical':self.canon.append(a.get('href'))
  if tag=='meta':
   if a.get('name')=='robots':self.robots.append(a.get('content'))
   if a.get('http-equiv','').lower()=='refresh':self.refresh.append(a.get('content'))
   if a.get('http-equiv','').lower()=='content-security-policy':self.meta_policy.append('present')
  if tag=='script' and a.get('type')=='application/ld+json':self.active=True;self.buf=''
 def handle_data(self,d):
  if self.active:self.buf+=d
 def handle_endtag(self,t):
  if t=='script' and self.active:
   try:self.structured.append(json.loads(self.buf))
   except ValueError:self.structured.append({'PARSE_ERROR':True})
   self.active=False
root=Path(sys.argv[1]);rows=[]
sitemap=[e.text for e in ET.parse(root/'sitemap.xml').getroot().iter() if e.tag.endswith('}loc')]
for p in sorted(root.rglob('*.html')):
 rel=p.relative_to(root).as_posix();route='/'+rel.removesuffix('index.html');h=Head();h.feed(p.read_text())
 category='redirect' if h.refresh else 'error' if rel in ['404.html','404/index.html'] else 'noindex' if any('noindex' in r for r in h.robots) else 'indexable'
 types=[]
 for d in h.structured:
  nodes=d if isinstance(d,list) else [d]
  for n in nodes:
   if isinstance(n,dict):types.append(n.get('@type','PARSE_ERROR' if n.get('PARSE_ERROR') else 'unspecified'))
 rows.append(dict(route=route,file=rel,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),category=category,canonicals=h.canon,robots=h.robots,refresh=h.refresh,sitemap=('https://skypistudio.com'+route) in sitemap,meta_csp=bool(h.meta_policy),structured_types=types))
feed=json.loads((root/'feed.json').read_text());rss=ET.parse(root/'feed.xml');rss_urls=[n.text for n in rss.findall('./channel/item/link')];feed_urls=[i['url'] for i in feed['items']]
result=dict(measured_utc=datetime.now(timezone.utc).isoformat(),method='Python HTMLParser, ElementTree, JSON; read-only static export',out=str(root.resolve()),routes=rows,sitemap=sitemap,robots=(root/'robots.txt').read_text(),feed_urls=feed_urls,rss_urls=rss_urls,feed_rss_parity=feed_urls==rss_urls,feed_urls_in_sitemap=all(u in sitemap for u in feed_urls),cross_host_canonicals=[r['route'] for r in rows if any(urlparse(u).netloc!='skypistudio.com' for u in r['canonicals'])])
Path(sys.argv[2]).write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(dict(routes=len(rows),sitemap=len(sitemap),feed=len(feed_urls),feed_rss_parity=result['feed_rss_parity'],missing_indexable_canonical=[r['route'] for r in rows if r['category']=='indexable' and not r['canonicals']],cross_host_canonicals=result['cross_host_canonicals'])))
