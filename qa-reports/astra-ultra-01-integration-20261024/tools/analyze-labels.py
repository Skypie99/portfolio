import json,sys
def load(p):
    m={}
    for r in json.load(open(p)):
        cnt={}
        for l in r['links']:
            i=cnt.get(l['kind'],0); cnt[l['kind']]=i+1
            f=[]
            if l.get('overflowX',0)>0: f.append('overflowX')
            if (l.get('outsideRow') or 0)>0.5: f.append('outsideRow%.0f'%l['outsideRow'])
            if (l.get('outsideColumn') or 0)>0.5: f.append('outsideCol%.0f'%l['outsideColumn'])
            if l.get('collisions'): f.append('collide')
            if l['lines']>1: f.append('lines%d'%l['lines'])
            m[(r['scheme'],r['width'],r['zoom'],r['route'],l['kind'],i)]=(f,l['text'],l)
    return m
b=load(sys.argv[1]); c=load(sys.argv[2])
for zoom in (100,200):
    print(f'=== zoom {zoom}: candidate flags (light only; dark identical layout)')
    tot=new=0
    for k,(f,t,l) in sorted(c.items(), key=lambda x:(x[0][1],x[0][3])):
        if k[2]!=zoom or k[0]!='light' or k[4]=='other': continue
        if not f: continue
        tot+=1
        bf=b.get(k,([],'',None))[0]
        isnew=[x for x in f if x.rstrip('0123456789') not in [y.rstrip('0123456789') for y in bf]]
        if isnew: new+=1
        if zoom==100 or isnew: print(f"  {k[1]:>4} {k[3]:<22} {k[4]}#{k[5]} {t!r:28} {f} base={bf} {'NEW' if isnew else ''}")
    print(f'  flagged {tot}, new-vs-baseline {new}')
    # dark vs light parity
diff=[k for k in c if k[0]=='dark' and c[k][0]!=c.get(('light',)+k[1:],([],))[0]]
print('dark/light flag differences:',len(diff))
