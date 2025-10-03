'use client';

import React, { useState } from 'react';
import Viewer from '../components/Viewer';
import { generateAdapter } from '../lib/api';

export default function Page(){
  const [from, setFrom] = useState({L:140, W:100, H:80});
  const [to,   setTo]   = useState({L:120, W:90,  H:60});
  const [orientationDeg, setOrientationDeg] = useState(0);
  const [status, setStatus] = useState<string>('');

  const submit = async () => {
    setStatus('Generating…');
    try{
      const res = await generateAdapter({rtu_from: from, rtu_to: to, orientationDeg});
      setStatus(`OK · job_id=${res.job_id}`);
    }catch(e:any){
      setStatus('Offline demo mode. Viewer is client‑side.');
    }
  };

  return (
    <main>
      <div className="grid" />
      <div className="container">
        <h1>Curbonomix</h1>
        <p className="footer">AI curb adapter engineering · demo viewer</p>

        <div className="panel" style={{padding:16, marginTop:16}}>
          <div className="controls">
            <div>
              <label>From L</label>
              <input type="number" value={from.L} onChange={e=>setFrom({...from, L:+e.target.value})}/>
            </div>
            <div>
              <label>From W</label>
              <input type="number" value={from.W} onChange={e=>setFrom({...from, W:+e.target.value})}/>
            </div>
            <div>
              <label>From H</label>
              <input type="number" value={from.H} onChange={e=>setFrom({...from, H:+e.target.value})}/>
            </div>
            <div>
              <label>To L</label>
              <input type="number" value={to.L} onChange={e=>setTo({...to, L:+e.target.value})}/>
            </div>
            <div>
              <label>To W</label>
              <input type="number" value={to.W} onChange={e=>setTo({...to, W:+e.target.value})}/>
            </div>
            <div>
              <label>To H</label>
              <input type="number" value={to.H} onChange={e=>setTo({...to, H:+e.target.value})}/>
            </div>
          </div>
          <div style={{display:'flex', gap:12, margin:'12px 0'}}>
            <div style={{flex:1}}>
              <label>Orientation (°)</label>
              <input type="range" min="-90" max="90" value={orientationDeg} onChange={e=>setOrientationDeg(+e.target.value)}/>
            </div>
            <button className="cta" onClick={submit}>Generate adapter</button>
            <span className="footer">{status}</span>
          </div>
          <Viewer inputs={{from, to, orientationDeg}}/>
          <div className="footer">
            Supply = light blue. Return = light orange. RTUs are faded watermark. Isometric view.
          </div>
        </div>

        <div style={{marginTop:24}}>
          <a className="cta" href="/shop">Go to Shop</a>
        </div>
      </div>
    </main>
  );
}
