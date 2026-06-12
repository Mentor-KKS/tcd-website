/* ============================================================
   AKT 1: DIE 3D-TÜR (Three.js)
   Stellt TCD.initDoorScene() bereit – gibt das doorScene-Objekt
   { active, p } zurück (oder null, wenn Three.js fehlt).
   Der Fortschritt p (0–1) wird vom Scrollytelling gesetzt.
   ============================================================ */
window.TCD = window.TCD || {};

TCD.initDoorScene = function(){
  if(!window.THREE) return null;

  const PURPLE = 0xb478c8, PURPLE_HOT = 0xcf8ee6;
  function cTex(w, h, draw){
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    return new THREE.CanvasTexture(c);
  }
  const scene3 = new THREE.Scene();
  scene3.background = null; // transparent: durch die Türöffnung sieht man die Hero-Section
  scene3.fog = new THREE.FogExp2(0x0b0a0e, 0.04);
  const cam3 = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, .1, 60);
  cam3.position.set(0, 1.5, 10.4);
  const look3 = new THREE.Vector3(0, 1.45, 7);
  const r3 = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  r3.setClearColor(0x000000, 0);
  r3.setPixelRatio(Math.min(devicePixelRatio, 2));
  r3.setSize(innerWidth, innerHeight);
  r3.outputEncoding = THREE.sRGBEncoding;
  document.getElementById('doorCanvas').appendChild(r3.domElement);

  /* Wand- und Bodentexturen */
  const wallTex = cTex(512, 512, (x, w, h) => {
    x.fillStyle = '#141118'; x.fillRect(0, 0, w, h);
    for(let i = 0; i < 900; i++){ x.fillStyle = 'rgba(255,255,255,' + Math.random() * .05 + ')'; x.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
    x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 2;
    for(let y = 0; y < h; y += 42){ x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); }
    for(let r = 0; r < h / 42; r++){
      const off = (r % 2) * 60;
      for(let bx = off; bx < w; bx += 120){ x.beginPath(); x.moveTo(bx, r * 42); x.lineTo(bx, r * 42 + 42); x.stroke(); }
    }
  });
  wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
  const floorTex = cTex(512, 512, (x, w, h) => {
    x.fillStyle = '#0c0a0e'; x.fillRect(0, 0, w, h);
    for(let i = 0; i < 700; i++){ x.fillStyle = 'rgba(255,255,255,' + Math.random() * .04 + ')'; x.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
    x.strokeStyle = 'rgba(255,255,255,.05)'; x.lineWidth = 3;
    for(let i = 0; i < w; i += 86){ x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
  });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(4, 5);
  const W3 = 11, H3 = 4, D3 = 14, DW = 1.14, DH = 2.32;
  /* EINE Wand mit echtem Türloch – keine Stückelung, keine Textur-Sprünge */
  const wallShape = new THREE.Shape();
  wallShape.moveTo(-W3 / 2, 0);
  wallShape.lineTo(W3 / 2, 0);
  wallShape.lineTo(W3 / 2, H3);
  wallShape.lineTo(-W3 / 2, H3);
  wallShape.closePath();
  const doorHole = new THREE.Path();
  doorHole.moveTo(-DW / 2, 0);
  doorHole.lineTo(DW / 2, 0);
  doorHole.lineTo(DW / 2, DH);
  doorHole.lineTo(-DW / 2, DH);
  doorHole.closePath();
  wallShape.holes.push(doorHole);
  const wallUv = wallTex.clone(); wallUv.needsUpdate = true;
  wallUv.wrapS = wallUv.wrapT = THREE.RepeatWrapping;
  wallUv.repeat.set(1 / 4.67, 1 / 3.33); // ShapeGeometry-UVs = Weltkoordinaten
  const frontWall = new THREE.Mesh(
    new THREE.ShapeGeometry(wallShape),
    new THREE.MeshStandardMaterial({ map: wallUv, roughness: .95 })
  );
  frontWall.position.z = D3 / 2; scene3.add(frontWall);
  const floor3 = new THREE.Mesh(new THREE.PlaneGeometry(W3, 6.8), new THREE.MeshStandardMaterial({ map: floorTex, roughness: .9 }));
  floor3.rotation.x = -Math.PI / 2; floor3.position.set(0, 0, 10.3); scene3.add(floor3); // nur Flur-Seite
  function b3(w, h, d, mat){ return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); }
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x241c22, roughness: .8 });
  const frL = b3(.09, DH + .09, .3, frameMat); frL.position.set(-DW / 2 - .045, (DH + .09) / 2, D3 / 2); scene3.add(frL);
  const frR = frL.clone(); frR.position.x = DW / 2 + .045; scene3.add(frR);
  const frT = b3(DW + .18, .09, .3, frameMat); frT.position.set(0, DH + .045, D3 / 2); scene3.add(frT);
  /* Die Tür */
  const doorTex = cTex(256, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#2a2026'); g.addColorStop(1, '#1c151a');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(0,0,0,.3)'; x.lineWidth = 2;
    for(let i = 0; i < h; i += 26){ x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); }
    x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = 6;
    x.strokeRect(w * .16, h * .08, w * .68, h * .34);
    x.strokeRect(w * .16, h * .56, w * .68, h * .34);
  });
  const doorGroup = new THREE.Group();
  doorGroup.position.set(-DW / 2, 0, D3 / 2);
  const doorMesh = b3(DW, DH, .07, new THREE.MeshStandardMaterial({ map: doorTex, roughness: .85 }));
  doorMesh.position.set(DW / 2, DH / 2, 0); doorGroup.add(doorMesh);
  const knob3 = b3(.2, .045, .05, new THREE.MeshStandardMaterial({ color: 0x8d8692, metalness: .7, roughness: .35 }));
  knob3.position.set(DW - .14, DH * .48, .07); doorGroup.add(knob3);
  scene3.add(doorGroup);
  /* Lichtspalt + Lichter */
  const leakMat = new THREE.MeshBasicMaterial({ color: PURPLE_HOT, transparent: true });
  const leak3 = new THREE.Mesh(new THREE.PlaneGeometry(.02, DH), leakMat);
  leak3.position.set(.545, DH / 2, D3 / 2 - .1); leak3.rotation.y = Math.PI; scene3.add(leak3);
  scene3.add(new THREE.AmbientLight(0x121116, 1.0));
  const doorLight3 = new THREE.PointLight(PURPLE_HOT, .3, 9, 2);
  doorLight3.position.set(.4, 1.4, D3 / 2 + .6); scene3.add(doorLight3);
  /* Flurlampe: ein Spot von schräg oben beleuchtet die Tür */
  const lamp3 = new THREE.SpotLight(0xcabfd6, 1.1, 10, Math.PI / 4.6, .95, 2);
  lamp3.position.set(0, 3.6, 9.4);
  lamp3.target.position.set(0, 1.1, D3 / 2);
  scene3.add(lamp3); scene3.add(lamp3.target);
  /* "Can you hear it?" als Leuchtschrift AN der Wand über der Tür */
  function claimTexture(){
    return cTex(1024, 360, (x, w, h) => {
      /* Lichthof: elliptisch, läuft an ALLEN Kanten auf 0 aus (keine harten Kanten auf der Wand) */
      x.save();
      x.translate(w / 2, h / 2);
      x.scale(1, h / w); // Kreis → Ellipse in Canvas-Proportion
      const g = x.createRadialGradient(0, 0, 30, 0, 0, w / 2);
      g.addColorStop(0, 'rgba(190,130,210,.5)');
      g.addColorStop(.5, 'rgba(180,120,200,.16)');
      g.addColorStop(.92, 'rgba(180,120,200,0)');
      g.addColorStop(1, 'rgba(180,120,200,0)');
      x.fillStyle = g;
      x.fillRect(-w / 2, -w / 2, w, w);
      x.restore();
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = '84px "Permanent Marker", cursive';
      /* Neonröhre: weiter Schein → mittlerer Schein → fast weißer Kern */
      x.shadowColor = 'rgba(186,110,215,.9)';
      x.shadowBlur = 64; x.fillStyle = 'rgba(186,110,215,.55)';
      x.fillText('»Can you hear it?«', w / 2, h / 2);
      x.shadowColor = 'rgba(207,142,230,1)';
      x.shadowBlur = 30; x.fillStyle = 'rgba(214,154,236,.95)';
      x.fillText('»Can you hear it?«', w / 2, h / 2);
      x.shadowBlur = 10; x.fillStyle = '#f8ecfd';
      x.fillText('»Can you hear it?«', w / 2, h / 2);
      x.shadowBlur = 0;
    });
  }
  const claimMat = new THREE.MeshBasicMaterial({ map: claimTexture(), transparent: true, depthWrite: false });
  const claim3 = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.05), claimMat);
  claim3.position.set(0, 2.92, D3 / 2 + .03);
  claim3.rotation.z = -.04;
  scene3.add(claim3);
  /* die Neonschrift wirft echtes Licht auf die Wand */
  const claimLight = new THREE.PointLight(0xc792dd, .55, 4.5, 2);
  claimLight.position.set(0, 2.95, D3 / 2 + .5); scene3.add(claimLight);
  /* ON-AIR-Lampe neben der Tür, wie im Studio */
  function onAirTexture(){
    return cTex(256, 112, (x, w, h) => {
      x.fillStyle = '#160407'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#3a0d12'; x.lineWidth = 6; x.strokeRect(4, 4, w - 8, h - 8);
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = '54px Anton, sans-serif';
      x.shadowColor = 'rgba(255,60,80,.95)';
      x.shadowBlur = 26; x.fillStyle = 'rgba(255,70,90,.8)';
      x.fillText('ON AIR', w / 2, h / 2 + 3);
      x.shadowBlur = 8; x.fillStyle = '#ffb3bd';
      x.fillText('ON AIR', w / 2, h / 2 + 3);
      x.shadowBlur = 0;
    });
  }
  const onAirBox = b3(.54, .26, .08, new THREE.MeshStandardMaterial({ color: 0x12090b, roughness: .6 }));
  onAirBox.position.set(-1.5, 2.45, D3 / 2 + .04); scene3.add(onAirBox);
  const onAirMat = new THREE.MeshBasicMaterial({ map: onAirTexture() });
  const onAirFace = new THREE.Mesh(new THREE.PlaneGeometry(.47, .21), onAirMat);
  onAirFace.position.set(-1.5, 2.45, D3 / 2 + .085); scene3.add(onAirFace);
  const onAirLight = new THREE.PointLight(0xff3a50, .45, 3.2, 2);
  onAirLight.position.set(-1.5, 2.45, D3 / 2 + .4); scene3.add(onAirLight);
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(() => {
      claimMat.map = claimTexture(); claimMat.needsUpdate = true;
      onAirMat.map = onAirTexture(); onAirMat.needsUpdate = true;
    }).catch(() => {});
  }

  /* ruckartige Knarz-Kurve */
  const creakKeys = [[0,0],[.12,.09],[.18,.07],[.36,.38],[.44,.34],[.66,.78],[.74,.74],[1,1]];
  function creakEase(t){
    for(let i = 1; i < creakKeys.length; i++){
      if(t <= creakKeys[i][0]){
        const [t0, v0] = creakKeys[i - 1], [t1, v1] = creakKeys[i];
        return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
      }
    }
    return 1;
  }
  const doorScene = { active: true, p: 0 };
  const overlayEl = document.getElementById('doorOverlay');
  const hintEl = document.getElementById('doorHint');
  const clock3 = new THREE.Clock();
  let lastP = -1; // zuletzt gerenderter Fortschritt: jede p-Änderung (z. B. der
                  // onRefresh-Sync nach einem Reload) wird noch einmal gerendert,
                  // damit Overlay-Opacity/-Visibility sicher gesetzt sind
  (function loop(){
    requestAnimationFrame(loop);
    const t = clock3.elapsedTime; clock3.getDelta();
    if(!doorScene.active && doorScene.p === lastP && (doorScene.p <= 0 || doorScene.p >= 1)) return; // pausiert außerhalb
    lastP = doorScene.p;
    const p = doorScene.p;
    /* Türphase 0–60 % des Akts */
    const dPh = Math.min(p / .6, 1);
    doorGroup.rotation.y = -creakEase(dPh) * 1.92;
    leakMat.opacity = (1 - dPh) * (.85 + Math.sin(t * 1.1) * .15);
    doorLight3.intensity = .3 + creakEase(dPh) * 1.2;
    /* Neon-Schrift: kurzes, dezentes Dimmen alle paar Sekunden + Wandlicht atmet mit */
    const fl = t % 7;
    claimMat.opacity = (fl > 6.52 && fl < 6.68) ? .55 : 1;
    claimLight.intensity = .55 * claimMat.opacity;
    /* ON-AIR-Lampe pulsiert langsam */
    onAirLight.intensity = .38 + Math.sin(t * 2.2) * .14;
    /* Auf die Hero zugehen: 45–100 % – Kamera durch den Türrahmen */
    const wp = Math.max(0, Math.min((p - .45) / .55, 1));
    const e = wp < .5 ? 2 * wp * wp : 1 - Math.pow(-2 * wp + 2, 2) / 2;
    cam3.position.z = 10.4 + (5.9 - 10.4) * e; // endet knapp hinter der Wand
    cam3.position.y = 1.5 + .1 * e;
    look3.set(0, 1.45 + .2 * e, 7 - 9 * e);
    cam3.lookAt(look3);
    /* Overlays */
    hintEl.style.opacity = String(Math.max(0, 1 - p / .1));
    /* Tür-Welt ausblenden, sobald wir hindurch sind */
    const fade = p > .82 ? Math.max(0, 1 - (p - .82) / .14) : 1;
    overlayEl.style.opacity = String(fade);
    overlayEl.style.visibility = p >= .985 ? 'hidden' : 'visible';
    r3.render(scene3, cam3);
  })();
  addEventListener('resize', () => {
    cam3.aspect = innerWidth / innerHeight;
    cam3.updateProjectionMatrix();
    r3.setSize(innerWidth, innerHeight);
  });

  return doorScene;
};
