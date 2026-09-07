// September 2026 bounded Navigation/Resource Timing and PerformanceObserver lab.
// Not Lighthouse; long-task excess is a fixed-window proxy, not INP or LH TBT.
const fs = require('node:fs');
const { chromium } = require('playwright-core');
const executablePath = '/Users/skypie/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const routes = ['/', '/work/', '/work/flagstone/', '/about/', '/contact/'];
const output = process.argv[2] || 'qa-reports/phase-09-evidence/performance.json';
const iterations = Number(process.argv[3] || 3);
const targets = [{label:'phase00-exact-deployed-artifact',base:'http://127.0.0.1:3048'}, {label:'phase09-candidate',base:'http://127.0.0.1:3049'}];
const rows = [];
(async()=>{
  const browser = await chromium.launch({executablePath,headless:true});
  const metadata = {date:new Date().toISOString(),browser:browser.version(),method:'5 seconds after load; no scroll or interaction; normal motion; light OS theme; fixed-window long-task excess above 50ms after FCP (not Lighthouse TBT/INP); ResourceTiming totals exclude main document, matching Phase00 definition; local uncompressed static server with 1h cache; fresh=new context, warm=reload in same context',desktop:'1440x900 DPR1, unthrottled loopback and CPU',mobile:'390x844 DPR3 mobile touch, 4x CPU slowdown, 150ms latency, 1.6Mbps down/750Kbps up via CDP',iterations};
  // Alternate artifacts per repetition and device to reduce temporal bias.
  for(let rep=1;rep<=iterations;rep++) for(const device of ['desktop','mobile']) for(const route of routes) for(const target of (rep%2 ? targets : [...targets].reverse())) {
    const context = await browser.newContext({viewport:device==='mobile'?{width:390,height:844}:{width:1440,height:900},deviceScaleFactor:device==='mobile'?3:1,isMobile:device==='mobile',hasTouch:device==='mobile',colorScheme:'light',reducedMotion:'no-preference'});
    await context.addInitScript(()=>{
      window.__lab = {lcp:[],shifts:[],longTasks:[],events:[]};
      for(const [type,key] of [['largest-contentful-paint','lcp'],['layout-shift','shifts'],['longtask','longTasks'],['event','events']]) {
        try { new PerformanceObserver(list=>{ for(const e of list.getEntries()) window.__lab[key].push(e.toJSON()); }).observe({type,buffered:true,durationThreshold:16}); } catch {}
      }
    });
    const page=await context.newPage();const cdp=await context.newCDPSession(page);
    await cdp.send('Network.enable');
    if(device==='mobile') { await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750,connectionType:'cellular4g'}); }
    for(const condition of ['fresh','warm']) {
      const errors=[]; const failed=[]; const responses=[];
      const onError=e=>errors.push({type:'pageerror',message:e.message});
      const onConsole=e=>{if(['error','warning'].includes(e.type()))errors.push({type:e.type(),message:e.text()})};
      const onFailed=r=>failed.push({url:r.url(),error:r.failure()?.errorText});
      const onResponse=r=>{if(r.status()>=400)responses.push({url:r.url(),status:r.status()})};
      page.on('pageerror',onError);page.on('console',onConsole);page.on('requestfailed',onFailed);page.on('response',onResponse);
      const started=new Date().toISOString();
      try {
        const response=condition==='fresh'?await page.goto(target.base+route,{waitUntil:'load',timeout:60000}):await page.reload({waitUntil:'load',timeout:60000});
        await page.waitForTimeout(5000);
        const data=await page.evaluate(()=>{
          const lab=window.__lab;const nav=performance.getEntriesByType('navigation')[0].toJSON();
          const resources=performance.getEntriesByType('resource').map(x=>x.toJSON());
          const fcp=performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null;
          let cls=0,sum=0,start=0,last=0;
          for(const e of lab.shifts.filter(x=>!x.hadRecentInput)) {if(e.startTime-last>1000 || e.startTime-start>5000){sum=0;start=e.startTime;}sum+=e.value;last=e.startTime;cls=Math.max(cls,sum);}
          return {nav,fcp,lcp:lab.lcp.at(-1)?.startTime??null,cls,longTaskExcessMs:lab.longTasks.filter(x=>x.startTime>=(fcp??0)).reduce((s,x)=>s+Math.max(0,x.duration-50),0),longTasks:lab.longTasks,windowEndMs:performance.now(),resources,requestCount:resources.length,transferBytes:resources.reduce((s,x)=>s+x.transferSize,0),encodedBytes:resources.reduce((s,x)=>s+x.encodedBodySize,0),cachedResourceCount:resources.filter(x=>x.transferSize===0 && x.encodedBodySize>0).length,largestResources:[...resources].sort((a,b)=>b.encodedBodySize-a.encodedBodySize).slice(0,6),heading:document.querySelector('h1')?.textContent.trim()};
        });
        rows.push({target:target.label,route,device,condition,rep,started,status:response.status(),...data,errors,failed,responses});
        console.log(JSON.stringify({target:target.label,route,device,condition,rep,lcp:data.lcp,cls:data.cls,longTaskExcessMs:data.longTaskExcessMs,transferBytes:data.transferBytes,errors:errors.length,failed:failed.length}));
      }catch(e){rows.push({target:target.label,route,device,condition,rep,started,error:String(e),errors,failed,responses});console.log('CELL FAILED',target.label,route,device,condition,String(e));}
      page.off('pageerror',onError);page.off('console',onConsole);page.off('requestfailed',onFailed);page.off('response',onResponse);
      fs.writeFileSync(output,JSON.stringify({metadata,rows},null,2));
    }
    await context.close();
  }
  await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
