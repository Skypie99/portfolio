"""Read-only public HEAD checks; no cookies/auth, no response body retained."""
import concurrent.futures, datetime, json, pathlib, subprocess

root = pathlib.Path('qa-reports/phase-09-evidence')
data = json.loads((root / 'artifact.json').read_text())
def check(url):
    p = subprocess.run(['curl', '--head', '--location', '--silent', '--show-error',
                        '--max-time', '20', '--max-redirs', '6', '--output', '/dev/null',
                        '--write-out', '%{http_code}\t%{url_effective}', url], capture_output=True, text=True)
    status, _, final = p.stdout.partition('\t')
    return dict(url=url, status=status, final=final, exit=p.returncode, error=p.stderr.strip())
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    rows = list(pool.map(check, data['external']))
result = dict(date=datetime.datetime.now(datetime.timezone.utc).isoformat(), artifactDigest=data['artifactDigest'],
              method='Public HEAD, normal TLS, redirects followed, 20s cap; status is endpoint observation, not authenticated access or GET/content proof', rows=rows)
(root / 'external-links.json').write_text(json.dumps(result, indent=2))
print(json.dumps({'count':len(rows),'non2xx':[r for r in rows if not r['status'].startswith('2')]},indent=2))
