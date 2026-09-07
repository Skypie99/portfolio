# September 7 same-method local artifact comparison

Medians of three runs per artifact/device/cache/route, with six runs per artifact for mobile Home after a targeted outlier recheck. See performance.json.gz for every raw row and exact method. Milliseconds for LCP and fixed-window long-task excess; the latter is not Lighthouse TBT or INP. No field Core Web Vitals claim.

| Route | Device | Cache | P00 LCP | P09 LCP (min–max) | P09 CLS | P00/P09 long-task excess | Requests P00/P09 | Resource transfer bytes P00/P09 |
|---|---|---|---:|---:|---:|---:|---:|---:|
| / | desktop | fresh | 272 | 224 (224–292) | 0.000010 | 0/0 | 33/34 | 1498116/1500658 |
| / | desktop | warm | 136 | 144 (136–148) | 0.000010 | 0/0 | 33/34 | 0/0 |
| /work/ | desktop | fresh | 140 | 192 (156–240) | 0.000000 | 0/0 | 34/35 | 1334172/1344783 |
| /work/ | desktop | warm | 152 | 152 (136–196) | 0.000010 | 0/0 | 34/35 | 0/0 |
| /work/flagstone/ | desktop | fresh | 216 | 196 (156–252) | 0.001300 | 0/0 | 31/32 | 1258795/1267899 |
| /work/flagstone/ | desktop | warm | 140 | 132 (132–136) | 0.001300 | 0/0 | 31/32 | 0/0 |
| /about/ | desktop | fresh | 136 | 136 (120–192) | 0.000010 | 0/0 | 29/30 | 1103524/1112397 |
| /about/ | desktop | warm | 112 | 120 (116–124) | 0.000010 | 0/0 | 30/31 | 0/0 |
| /contact/ | desktop | fresh | 264 | 100 (100–108) | 0.000010 | 0/0 | 29/30 | 1103924/1112799 |
| /contact/ | desktop | warm | 128 | 120 (112–272) | 0.000010 | 0/0 | 30/31 | 0/0 |
| / | mobile | fresh | 7330 | 6576 (6504–6712) | 0.000000 | 42/44 | 29/30 | 1416753/1417886 |
| / | mobile | warm | 418 | 428 (316–528) | 0.000000 | 0/46 | 29/30 | 0/0 |
| /work/ | mobile | fresh | 6272 | 6240 (6240–6272) | 0.000000 | 58/27 | 26/27 | 1032341/1036135 |
| /work/ | mobile | warm | 420 | 384 (380–504) | 0.000000 | 0/0 | 26/27 | 0/0 |
| /work/flagstone/ | mobile | fresh | 2480 | 2604 (2600–2656) | 0.000000 | 26/30 | 25/26 | 1006433/1008608 |
| /work/flagstone/ | mobile | warm | 408 | 280 (268–284) | 0.000000 | 0/0 | 26/27 | 0/0 |
| /about/ | mobile | fresh | 1984 | 1912 (1836–1952) | 0.000000 | 64/28 | 20/21 | 753026/754064 |
| /about/ | mobile | warm | 304 | 256 (252–280) | 0.000000 | 0/0 | 21/22 | 0/0 |
| /contact/ | mobile | fresh | 2088 | 1800 (1744–1940) | 0.000306 | 228/25 | 20/21 | 753426/754466 |
| /contact/ | mobile | warm | 464 | 284 (284–364) | 0.000000 | 2/0 | 21/22 | 0/0 |
