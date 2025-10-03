'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Inputs = {
  from: { L:number; W:number; H:number; };
  to:   { L:number; W:number; H:number; };
  orientationDeg: number;
};

export default function Viewer({inputs}: {inputs: Inputs}){
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const width = mount.clientWidth;
    const height = 520;

    const scene = new THREE.Scene();
    scene.background = null;

    // Camera - isometric-like
    const camera = new THREE.PerspectiveCamera(55, width/height, 0.1, 2000);
    camera.position.set(300, 260, 300);
    camera.lookAt(0,0,0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha:true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.9);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(200,300,200);
    scene.add(dir);

    // Grid floor
    const gridHelper = new THREE.GridHelper(1000, 40, 0x224466, 0x112233);
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // Materials
    const matFrom = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent:true, opacity:0.18 });
    const matTo   = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent:true, opacity:0.18 });
    const matSup  = new THREE.MeshStandardMaterial({ color: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--supply').trim()) });
    const matRet  = new THREE.MeshStandardMaterial({ color: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--return').trim()) });
    const matAdapter = new THREE.MeshStandardMaterial({ color: 0x2aa198, metalness:0.3, roughness:0.5 });

    // RTU "watermark" boxes
    const fromGeom = new THREE.BoxGeometry(inputs.from.L, inputs.from.H, inputs.from.W);
    const toGeom   = new THREE.BoxGeometry(inputs.to.L, inputs.to.H, inputs.to.W);

    const fromMesh = new THREE.Mesh(fromGeom, matFrom);
    fromMesh.position.y = inputs.from.H/2;
    scene.add(fromMesh);

    const toMesh = new THREE.Mesh(toGeom, matTo);
    toMesh.position.y = inputs.from.H + inputs.to.H/2 + 40; // stacked with spacing
    toMesh.rotation.y = THREE.MathUtils.degToRad(inputs.orientationDeg);
    scene.add(toMesh);

    // Simple adapter: loft between rectangles
    const adapter = new THREE.Group();
    const shape = new THREE.Shape();
    const L1 = inputs.from.L, W1 = inputs.from.W;
    const L2 = inputs.to.L,   W2 = inputs.to.W;
    // Base rectangle (from)
    shape.moveTo(-L1/2, -W1/2);
    shape.lineTo( L1/2, -W1/2);
    shape.lineTo( L1/2,  W1/2);
    shape.lineTo(-L1/2,  W1/2);
    shape.lineTo(-L1/2, -W1/2);
    const extrudeSettings = {
      steps: 20,
      depth: inputs.from.H + 40, // rise
      bevelEnabled: false
    };
    const base = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const baseMesh = new THREE.Mesh(base, matAdapter);
    baseMesh.position.y = 0;
    adapter.add(baseMesh);

    // Supply + Return colored "plenums" as tubes
    function tube(offsetX:number, colorMat:THREE.Material){
      const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(offsetX, inputs.from.H*0.6, -W1*0.25),
        new THREE.Vector3(offsetX*0.6, inputs.from.H + 20, -W1*0.1),
        new THREE.Vector3(offsetX*0.3, inputs.from.H + inputs.to.H*0.4, -W2*0.1),
        new THREE.Vector3(0, inputs.from.H + 40 + inputs.to.H*0.6, -W2*0.25),
      ]);
      const g = new THREE.TubeGeometry(path, 30, Math.min(W1,W2)*0.06, 16, false);
      return new THREE.Mesh(g, colorMat);
    }
    const sup = tube( L1*0.2, matSup);
    const ret = tube(-L1*0.2, matRet);
    scene.add(sup);
    scene.add(ret);

    scene.add(adapter);

    // Resize
    const onResize = () => {
      const w = mount.clientWidth;
      const h = 520;
      camera.aspect = w/h;
      camera.updateProjectionMatrix();
      renderer.setSize(w,h);
    };
    window.addEventListener('resize', onResize);

    // Animate
    const controls = { t:0 };
    const animate = () => {
      controls.t += 0.005;
      fromMesh.rotation.y = Math.sin(controls.t)*0.02;
      toMesh.rotation.y += 0.002;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [inputs]);

  return <div className="panel" ref={mountRef} style={{width:'100%', height:520, borderRadius:12}} />;
}
