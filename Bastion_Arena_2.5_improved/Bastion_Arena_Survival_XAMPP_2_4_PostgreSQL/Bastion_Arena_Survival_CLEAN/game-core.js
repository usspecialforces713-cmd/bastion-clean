const R=22,$=id=>document.getElementById(id);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x12142b);scene.fog=new THREE.Fog(0x12142b,32,75);
const cam=new THREE.PerspectiveCamera(50,1,.1,200);
const ren=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});ren.setPixelRatio(Math.min(devicePixelRatio,1.6));ren.outputEncoding=THREE.sRGBEncoding;ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=1.12;
$('c').appendChild(ren.domElement);
// Bastion 2.5 — free GPU memory when temporary objects leave the scene (long runs used to slow down).
const KEEP=o=>{if(o){o.userData=o.userData||{};o.userData.keep=true}return o};
function disposeObj(root){root.traverse(o=>{if(o.geometry&&!(o.geometry.userData&&o.geometry.userData.keep))o.geometry.dispose();
  const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);ms.forEach(m=>{if(!(m.userData&&m.userData.keep))m.dispose()})})}
{const _rm=scene.remove.bind(scene);scene.remove=function(...objs){_rm(...objs);for(const o of objs){if(o&&!o.userData.noDispose&&!o.userData.keep)try{disposeObj(o)}catch(e){}}return scene}}
function rs(){ren.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',rs);rs();
scene.add(new THREE.HemisphereLight(0x9fb4ff,0x1a1030,.9));
const sun=new THREE.DirectionalLight(0xffffff,.8);sun.position.set(10,20,8);scene.add(sun);
const normalArena=new THREE.Group(); normalArena.name='Bastion_Normal_Arena';
const floor=new THREE.Mesh(new THREE.CircleGeometry(R,96),new THREE.MeshStandardMaterial({color:0x101a35,metalness:.38,roughness:.68}));
floor.rotation.x=-Math.PI/2;floor.position.y=-.045;normalArena.add(floor);
// Arena architecture: all pieces are procedural and share materials/geometries where practical.
const arenaMetal=new THREE.MeshStandardMaterial({color:0x263958,metalness:.72,roughness:.32});
const arenaDark=new THREE.MeshStandardMaterial({color:0x111a31,metalness:.55,roughness:.42});
const arenaCyan=new THREE.MeshStandardMaterial({color:0x48e7dc,emissive:0x22bdb9,emissiveIntensity:1.25,metalness:.25,roughness:.28});
const arenaGold=new THREE.MeshStandardMaterial({color:0xffc857,emissive:0x9b6218,emissiveIntensity:.7,metalness:.3,roughness:.35});
const torusGeo=KEEP(new THREE.TorusGeometry(1,.08,8,96));
for(const [r,t,col] of [[R,.22,0x5ee6d0],[R*.83,.045,0x243a62],[R*.66,.065,0x2c6384],[R*.48,.035,0x243a62],[R*.33,.07,0x2c6384],[R*.17,.035,0x243a62]]){
  const ring=new THREE.Mesh(torusGeo,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:r===R?.9:.68}));ring.scale.setScalar(r);ring.rotation.x=Math.PI/2;ring.position.y=.025;normalArena.add(ring);
}
// Radial inlays and central reactor emblem.
for(let i=0;i<24;i++){const a=i*Math.PI/12,inner=3.2,outer=R-1.1,len=outer-inner;
  const strip=new THREE.Mesh(new THREE.BoxGeometry(i%3===0?.12:.045,.025,len),i%3===0?arenaCyan:arenaMetal);
  strip.position.set(Math.sin(a)*(inner+outer)/2,.012,Math.cos(a)*(inner+outer)/2);strip.rotation.y=a;normalArena.add(strip);
}
const reactor=new THREE.Mesh(new THREE.CylinderGeometry(2.5,3,.12,8),arenaDark);reactor.position.y=.03;normalArena.add(reactor);
const reactorRing=new THREE.Mesh(new THREE.TorusGeometry(2.15,.09,8,48),arenaCyan);reactorRing.rotation.x=Math.PI/2;reactorRing.position.y=.12;normalArena.add(reactorRing);
const core=new THREE.Mesh(new THREE.OctahedronGeometry(.72,0),new THREE.MeshStandardMaterial({color:0x7af5e3,emissive:0x20c8c1,emissiveIntensity:1.7,metalness:.35,roughness:.2}));core.position.y=.62;normalArena.add(core);
const pylons=[];
for(let i=0;i<12;i++){const a=i*Math.PI/6,x=Math.sin(a)*(R-1.2),z=Math.cos(a)*(R-1.2),g=new THREE.Group();
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.9,1.1,.42,6),arenaDark);base.position.y=.2;g.add(base);
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.42,.68,2.7,6),arenaMetal);shaft.position.y=1.72;g.add(shaft);
  const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.52,0),i%3===0?arenaGold:arenaCyan);crystal.position.y=3.35;g.add(crystal);
  const band=new THREE.Mesh(new THREE.TorusGeometry(.58,.055,6,18),i%3===0?arenaGold:arenaCyan);band.rotation.x=Math.PI/2;band.position.y=2.55;g.add(band);
  g.position.set(x,0,z);g.rotation.y=-a;normalArena.add(g);pylons.push({g,crystal,phase:i*.7});
}

scene.add(normalArena);

// Two imported arenas: Meshy Colosseum for waves, dark fortress for the mega-boss.
let colosseumArena=null,bossFortressArena=null,arenaLoadState={normal:false,boss:false};
// A clean, level combat surface for the boss arena. The imported fortress has an
// uneven/thick base, which visually hides the lower parts of characters.
const bossFloor=new THREE.Mesh(
  new THREE.CircleGeometry(27.1,128),
  new THREE.MeshStandardMaterial({color:0x292e35,metalness:.22,roughness:.82})
);
bossFloor.name='BossArenaCombatFloor';
// Slightly lower than character origin: prevents the visual floor from clipping the lower body.
bossFloor.rotation.x=-Math.PI/2;
bossFloor.position.y=-.28;
bossFloor.visible=false;
scene.add(bossFloor);
function setArenaMode(mode){
  S.arenaMode=mode; normalArena.visible=(mode==='normal'&&!arenaLoadState.normal);
  if(colosseumArena)colosseumArena.visible=(mode==='normal'&&arenaLoadState.normal);
  if(bossFortressArena)bossFortressArena.visible=(mode==='boss'&&arenaLoadState.boss);
  bossFloor.visible=(mode==='boss'&&arenaLoadState.boss);
  if(mode==='boss'&&!arenaLoadState.boss)normalArena.visible=true;
}
// Normalize imported GLB assets: Meshy exports can have wildly different units/origins.
// Fit each arena to the gameplay footprint, center it on (0,0,0), and rest it on y=0.
function fitArenaModel(root,targetDiameter,options={}){
  root.updateMatrixWorld(true);
  if(options.zUp) root.rotation.x=-Math.PI/2; // Blender-style Z-up -> Three.js Y-up
  root.updateMatrixWorld(true);
  let bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3());
  const footprint=Math.max(size.x,size.z);
  if(!Number.isFinite(footprint)||footprint<0.001) throw new Error('Dimensions GLB invalides');
  root.scale.multiplyScalar(targetDiameter/footprint);
  // For Z-up assets, local Z becomes world height after the -90 degree correction.
  // Compress that axis only so the boss fortress keeps its footprint but has lower walls/towers.
  if(options.zUp && Number.isFinite(options.heightScale)){
    root.scale.z*=THREE.MathUtils.clamp(options.heightScale,.1,1);
  }
  root.updateMatrixWorld(true);
  bounds=new THREE.Box3().setFromObject(root);
  const center=bounds.getCenter(new THREE.Vector3());
  root.position.x-=center.x; root.position.z-=center.z; root.position.y-=bounds.min.y;
  root.updateMatrixWorld(true);
  // Keep a conservative visual/gameplay footprint close to the 44-unit combat radius.
  root.userData.arenaBounds={width:targetDiameter,minY:0};
}
if(THREE.GLTFLoader){const loader=new THREE.GLTFLoader();
  loader.load('./colosseum.glb',g=>{
    colosseumArena=g.scene;colosseumArena.name='Meshy_Colosseum';
    try{fitArenaModel(colosseumArena,52);}catch(err){console.warn('Normalisation Colisée impossible',err);}
    colosseumArena.visible=false;scene.add(colosseumArena);arenaLoadState.normal=true;setArenaMode(S.arenaMode||'normal');
  },undefined,e=>console.warn('Colisée Meshy non chargé, décor procédural utilisé.',e));
  loader.load('./boss_fortress.glb',g=>{
    bossFortressArena=g.scene;bossFortressArena.name='Dark_Fortress_Boss_Arena';
    try{fitArenaModel(bossFortressArena,58,{zUp:true,heightScale:.42});}catch(err){console.warn('Normalisation forteresse impossible',err);}
    bossFortressArena.visible=false;scene.add(bossFortressArena);arenaLoadState.boss=true;setArenaMode(S.arenaMode||'normal');
  },undefined,e=>console.warn('Forteresse boss non chargée, décor procédural utilisé.',e));
}

const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
// Role silhouettes: every hero gets a recognisable accessory instead of only a colour.
const HERO_KIT={tireur:'gun',ingenieur:'gun',mecha:'gun',pirate:'gun',magnet:'gun',archer:'bow',chasseur:'bow',boomerang:'bow',
  guerrier:'sword',assassin:'daggers',samourai:'katana',ombre:'daggers',gardien:'shield',terre:'shield',paladin:'halo',medic:'halo',
  mage:'hat',neant:'hat',givre:'hat',volt:'hat',pyro:'hat',meteor:'hat',necro:'hood',toxine:'hood',druide:'hood',plant:'hood',
  dragon:'horns',joker:'hat',miroir:'halo',maree:'hood',vent:'hood',sable:'hood'};
const SHADOW_GEO=KEEP(new THREE.CircleGeometry(.75,20)),SHADOW_MAT=KEEP(new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.32,depthWrite:false}));
function human(col,kit){
  const tint=new THREE.Color(0x24324f).lerp(new THREE.Color(col),.28);
  const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.32,metalness:.3,roughness:.4}),
    armor=new THREE.MeshStandardMaterial({color:tint,metalness:.65,roughness:.32}),
    trim=new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.75,metalness:.3,roughness:.25}),
    sk=new THREE.MeshStandardMaterial({color:0xc9a995,roughness:.8}),visor=new THREE.MeshStandardMaterial({color:0x10182b,emissive:col,emissiveIntensity:.9,metalness:.5,roughness:.18});
  const part=(geo,mat,x,y,z,par)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);(par||g).add(o);return o};
  const torso=part(new THREE.BoxGeometry(.78,.92,.48),m,0,1.57,0);torso.scale.set(1,.92,.82);
  part(new THREE.BoxGeometry(.62,.48,.19),armor,0,1.65,.29);
  part(new THREE.BoxGeometry(.46,.075,.055),trim,0,1.72,.395);
  part(new THREE.SphereGeometry(.3,12,10),armor,0,2.28,0);
  part(new THREE.BoxGeometry(.36,.13,.12),visor,0,2.29,.255);
  part(new THREE.BoxGeometry(.16,.1,.09),trim,0,2.08,.21);
  part(new THREE.BoxGeometry(.66,.16,.44),armor,0,1.19,0);
  part(new THREE.BoxGeometry(.18,.12,.46),trim,0,1.19,.02);
  const limb=(x,y,w,h,isLeg=false)=>{const p=new THREE.Group();p.position.set(x,y,0);g.add(p);
    part(new THREE.BoxGeometry(w,h,w),isLeg?armor:m,0,-h/2,0,p);
    if(isLeg){const boot=part(new THREE.BoxGeometry(w*1.2,.2,w*1.5),armor,0,-h+.08,.08,p);boot.userData.isBoot=true}
    return p};
  g.userData.legs=[limb(-.23,1.02,.31,.96,true),limb(.23,1.02,.31,.96,true)];
  g.userData.arms=[limb(-.59,1.98,.27,.78),limb(.59,1.98,.27,.78)];
  // Shoulder pauldrons, forearm guards, and a compact backpack create a premium sci-fi silhouette.
  for(const side of [-1,1]){
    const pad=part(new THREE.SphereGeometry(.28,8,6),armor,side*.62,2.02,0);pad.scale.set(1,.72,1);
    const stripe=part(new THREE.BoxGeometry(.1,.25,.31),trim,side*.62,2.02,.08);stripe.rotation.z=side*.18;
    const bracer=part(new THREE.BoxGeometry(.3,.22,.34),armor,side*.61,1.48,.05);bracer.rotation.z=side*.12;
  }
  part(new THREE.BoxGeometry(.52,.52,.24),armor,0,1.7,-.32);
  part(new THREE.BoxGeometry(.32,.08,.08),trim,0,1.77,-.46);
  const weapon=new THREE.Group();part(new THREE.BoxGeometry(.12,.13,.75),armor,.61,1.4,.49,weapon);
  const blade=part(new THREE.BoxGeometry(.08,.08,.54),trim,.61,1.4,.98,weapon);blade.rotation.x=-.12;g.add(weapon);g.userData.weapon=weapon;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.9,.07,8,32),new THREE.MeshBasicMaterial({color:0xffc857,transparent:true,opacity:.88}));
  ring.rotation.x=Math.PI/2;ring.position.y=.08;ring.visible=false;g.add(ring);g.userData.ring=ring;
  const aura=new THREE.Mesh(new THREE.CylinderGeometry(.65,.85,.035,24),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.18}));aura.position.y=.035;g.add(aura);
  g.userData.aura=aura;g.userData.trim=trim;g.userData.baseCol=col;g.userData.torso=torso;
  const shadow=new THREE.Mesh(SHADOW_GEO,SHADOW_MAT);shadow.rotation.x=-Math.PI/2;shadow.position.y=.03;g.add(shadow);g.userData.shadow=shadow;
  addKit(g,kit,col,armor,trim,part);
  return g;
}
function addKit(g,kit,col,armor,trim,part){
  if(!kit)return;const arm=g.userData.arms[1],off=g.userData.arms[0],glow=new THREE.MeshBasicMaterial({color:col});
  if(kit==='sword'||kit==='katana'){g.userData.weapon.visible=false;const L=kit==='katana'?1.5:1.15;
    const b=part(new THREE.BoxGeometry(.09,.06,L),new THREE.MeshStandardMaterial({color:0xe8eef8,metalness:.9,roughness:.15,emissive:col,emissiveIntensity:.25}),0,-.72,L/2+.05,arm);
    part(new THREE.BoxGeometry(.34,.08,.08),trim,0,-.72,.06,arm);arm.userData.blade=b}
  else if(kit==='daggers'){g.userData.weapon.visible=false;for(const a of [arm,off])part(new THREE.BoxGeometry(.07,.05,.55),new THREE.MeshStandardMaterial({color:0xdfe6f2,metalness:.9,roughness:.2,emissive:col,emissiveIntensity:.35}),0,-.72,.3,a)}
  else if(kit==='shield'){const sh=part(new THREE.BoxGeometry(.12,.95,.75),armor,-.2,-.5,.22,off);part(new THREE.BoxGeometry(.13,.5,.12),trim,-.27,-.5,.22,off);sh.rotation.y=.15}
  else if(kit==='gun'){part(new THREE.BoxGeometry(.1,.1,.6),armor,.61,1.4,1.05,g.userData.weapon);part(new THREE.BoxGeometry(.13,.13,.08),trim,.61,1.4,1.37,g.userData.weapon)}
  else if(kit==='bow'){g.userData.weapon.visible=false;const bow=new THREE.Mesh(new THREE.TorusGeometry(.55,.04,6,20,Math.PI),trim);bow.rotation.set(0,Math.PI/2,Math.PI/2);bow.position.set(-.05,-.7,.25);off.add(bow)}
  else if(kit==='halo'){const h=part(new THREE.TorusGeometry(.32,.04,6,24),glow,0,2.72,0);h.rotation.x=Math.PI/2;g.userData.halo=h}
  else if(kit==='hat'){part(new THREE.CylinderGeometry(.5,.5,.05,16),m(),0,2.47,0);const c=part(new THREE.ConeGeometry(.3,.75,12),m(),0,2.85,-.04);c.rotation.x=-.18;
    const orb=part(new THREE.SphereGeometry(.15,10,8),glow,0,-.85,.12,off);g.userData.orb=orb}
  else if(kit==='hood'){const h=part(new THREE.SphereGeometry(.36,12,10,0,Math.PI*2,0,Math.PI*.62),m(),0,2.31,-.05);h.scale.set(1,1.08,1.08);
    const cape=part(new THREE.BoxGeometry(.7,1.1,.05),m(),0,1.55,-.47);cape.rotation.x=.12;g.userData.cape=cape}
  else if(kit==='horns'){for(const s of [-1,1]){const h=part(new THREE.ConeGeometry(.08,.42,8),trim,s*.2,2.55,-.05);h.rotation.z=-s*.5}}
  function m(){return new THREE.MeshStandardMaterial({color:new THREE.Color(col).multiplyScalar(.55),roughness:.7,metalness:.1})}
}
// Floating health bar above heroes and tough enemies.
const BAR_BG=KEEP(new THREE.MeshBasicMaterial({color:0x05070f,transparent:true,opacity:.75,depthTest:false})),BAR_GEO=KEEP(new THREE.PlaneGeometry(1,1));
function addBar(obj,w,y,col){const g=new THREE.Group(),bg=new THREE.Mesh(BAR_GEO,BAR_BG),fg=new THREE.Mesh(BAR_GEO,new THREE.MeshBasicMaterial({color:col,depthTest:false,transparent:true}));
  bg.scale.set(w+.08,.2,1);fg.scale.set(w,.13,1);fg.position.z=.01;bg.renderOrder=20;fg.renderOrder=21;g.add(bg);g.add(fg);g.position.y=y;g.userData={fg,w,y};obj.userData.bar=g;scene.add(g);g.userData.owner=obj;BARS.push(g);return g}
const BARS=[];
function updateBars(){for(let i=BARS.length-1;i>=0;i--){const b=BARS[i],o=b.userData.owner,c=o.userData.hero;let ratio,show;
  if(c){ratio=Math.max(0,c.hp/c.max);show=c.alive&&!c.off&&o.visible&&(c!==A||ratio<1)}else{if(!o.parent){scene.remove(b);BARS.splice(i,1);continue}ratio=Math.max(0,o.userData.hp/o.userData.mx);show=ratio<1&&!o.userData.mega}
  b.visible=show&&S.mode!=='menu';if(!b.visible)continue;const p=o.position;b.position.set(p.x,p.y+(c?b.userData.y*o.scale.y:b.userData.y),p.z);b.quaternion.copy(cam.quaternion);
  const f=b.userData.fg;f.scale.x=Math.max(.001,b.userData.w*ratio);f.position.x=-(b.userData.w*(1-ratio))/2;
  if(c)f.material.color.setHex(ratio<.3?0xff4d6d:ratio<.6?0xffc857:0x5ee6a0)}}
const ROLES={
  tireur:{name:'Tireur',col:0x5ee6d0,hp:70,spd:8.5,rate:.22},
  guerrier:{name:'Fighter',col:0xff9a3c,hp:150,spd:8.5,rate:.14,melee:2.6,mdmg:.7,kb:1.6},
  medic:{name:'Médic',col:0xb06bff,hp:80,spd:8,rate:.5},
  mage:{name:'Mage',col:0x5aa0ff,hp:65,spd:7.5,rate:.9},
  assassin:{name:'Assassin',col:0x9dff6a,hp:60,spd:10.5,rate:.35,melee:2.2,mdmg:3},
  neant:{name:'Néant',col:0xc8c8e0,hp:90,spd:7.5,rate:4},
  pyro:{name:'Pyro',col:0xff5a1f,hp:85,spd:8,rate:.07},
  meteor:{name:'Météore',col:0xb08a5a,hp:95,spd:7,rate:1.1},
  terre:{name:'Géo',col:0x6b8f3a,hp:120,spd:7.5,rate:.5},
  plant:{name:'PlantG',col:0x3fd96b,hp:90,spd:8,rate:.25},
  givre:{name:'Givre',col:0x9fd8ff,hp:80,spd:8,rate:.3,kite:1},
  volt:{name:'Volt',col:0xf5f06a,hp:75,spd:9,rate:.3},
  necro:{name:'Nécro',col:0xe8dcb0,hp:70,spd:7.5,rate:2.2,kite:1},
  gardien:{name:'Gardien',col:0x3d5afe,hp:200,spd:7,rate:.45,melee:3.2,mdmg:1.5,kb:-1.2},
  ingenieur:{name:'Ingénieur',col:0xb8651b,hp:85,spd:8,rate:.3,kite:1},
  toxine:{name:'Toxine',col:0xd048c8,hp:80,spd:8,rate:.7,kite:1},
  archer:{name:'Archer',col:0xc2a86b,hp:70,spd:8.5,rate:.45,kite:1},
  ombre:{name:'Ombre',col:0x5a3a8a,hp:65,spd:10,rate:.4},
  samourai:{name:'Samouraï',col:0xb01e2e,hp:110,spd:8.5,rate:.55,melee:4.8,mdmg:3},
  paladin:{name:'Paladin',col:0xffe9a8,hp:130,spd:7.5,rate:.35},
  dragon:{name:'Dragon',col:0xc23b22,hp:120,spd:8,rate:.25,trate:.15},
  druide:{name:'Druide',col:0x8a7a3a,hp:100,spd:8,rate:.4,trate:.3,kite:1},
  mecha:{name:'Mecha',col:0x6a7a8a,hp:110,spd:7.5,rate:.1,trate:.5,kite:1},
  miroir:{name:'Miroir',col:0xf4f4f4,hp:100,spd:9,rate:.35,kite:1},
  boomerang:{name:'Boomerang',col:0x7a8fb8,hp:85,spd:8.5,rate:.5,kite:1},
  joker:{name:'Joker',col:0xff7ab8,hp:90,spd:8.5,rate:.45,kite:1},
  pirate:{name:'Pirate',col:0x2d4a8a,hp:110,spd:7.5,rate:.9,kite:1},
  chasseur:{name:'Chasseur',col:0x6b4f3a,hp:100,spd:8.5,rate:.45,kite:1},
  maree:{name:'Marée',col:0x1fa8c9,hp:95,spd:8,rate:.12},
  vent:{name:'Vent',col:0xb8e6c8,hp:90,spd:9,rate:.3},
  sable:{name:'Sable',col:0xe0b870,hp:95,spd:8,rate:.15},
  magnet:{name:'Magnétique',col:0x8a3dd4,hp:140,spd:8,rate:1.2,kite:1}};
const G={c:new THREE.BoxGeometry(1.4,1.4,1.4),f:new THREE.OctahedronGeometry(.8),t:new THREE.IcosahedronGeometry(1.5),s:new THREE.TetrahedronGeometry(.6),b:new THREE.DodecahedronGeometry(2.4),r:new THREE.ConeGeometry(.7,1.7,6)};
const bGeo=KEEP(new THREE.SphereGeometry(.22,8,8)),fxGeo=KEEP(new THREE.BoxGeometry(.25,.25,.25));Object.values(G).forEach(KEEP);
let S,C=[],A=null,E=[],B=[],F=[],Z=[],SEL=['tireur','guerrier','medic','mage'],QK=0,LS=null,EP=[],JV={x:0,z:0},joy=null,ORD=0,PL=[],CY=0;
const keys={},mouse=new THREE.Vector2(),ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-1),aim=new THREE.Vector3();
let down=false,rdown=false;addEventListener('contextmenu',e=>e.preventDefault());
const typing=e=>{const t=e.target;return t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)};
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;down=false;rdown=false;if(S&&S.mode==='play')pause()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S&&S.mode==='play')pause()});
addEventListener('keydown',e=>{if(typing(e))return;
  if(S&&S.mode==='up'&&/^Digit[1-3]$/.test(e.code)){const b=document.querySelectorAll('.upgrade-card')[+e.code.slice(5)-1];if(b){e.preventDefault();b.click()}return}
  if(e.code==='KeyM'&&!e.repeat&&typeof setMuted==='function'){setMuted(!MUTED);return}
  keys[e.code]=true;
  if(e.code=='Space'||e.code=='Tab')e.preventDefault();
  if((e.code=='ShiftLeft'||e.code=='ShiftRight')&&!e.repeat&&S.mode=='play')tryDodge();
  if(e.code=='KeyP'||e.code=='Escape'){if(S.mode=='pause')resume();else pause()}if(e.code=='KeyV'&&S.mode=='play')cycleOrd();if(e.code=='KeyF'&&!e.repeat&&S.mode=='play')focusTarget();
  if(e.code=='Space'&&!e.repeat&&S.mega&&S.mode=='play'&&A&&(A.jc||0)<2){A.vy=12;A.jc=(A.jc||0)+1}
  if(S.mode=='play'){if(e.code=='Digit1')pick(0);if(e.code=='Digit2')pick(1);if(e.code=='Digit3')pick(2);if(e.code=='Digit4')pick(3);if(e.code=='Digit5')pick(4);if(e.code=='Digit6')pick(5);if(e.code=='Digit7')pick(6);
    if(e.code=='Tab'){for(let i=1;i<=C.length;i++){const n=(C.indexOf(A)+i)%C.length;if(C[n].alive){pick(n);break}}}}});
addEventListener('keyup',e=>{if(typing(e))return;keys[e.code]=false;if(e.code==='KeyR'&&typeof releaseChargedAttack==='function')releaseChargedAttack(A)});
// Only clicks on the 3D view fire (clicking menus/buttons no longer shoots). Touch: left side = visual joystick.
const JOY_EL=()=>$('joy');
addEventListener('pointerdown',e=>{if(e.target.tagName!=='CANVAS')return;
  if(e.pointerType=='touch'&&e.clientX<innerWidth*.45&&!joy){joy={id:e.pointerId,x:e.clientX,y:e.clientY};const j=JOY_EL();if(j){j.style.left=e.clientX+'px';j.style.top=e.clientY+'px';j.classList.add('on');j.firstElementChild.style.transform='translate(-50%,-50%)'}}
  else{mouse.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);if(e.button==2)rdown=true;else down=true}});
const endPointer=e=>{if(joy&&e.pointerId==joy.id){joy=null;JV.x=0;JV.z=0;const j=JOY_EL();if(j)j.classList.remove('on')}else{down=false;rdown=false}};
addEventListener('pointerup',endPointer);addEventListener('pointercancel',endPointer);
addEventListener('pointermove',e=>{if(joy&&e.pointerId==joy.id){let dx=e.clientX-joy.x,dz=e.clientY-joy.y;const l=Math.hypot(dx,dz),mx=55;if(l>mx){dx*=mx/l;dz*=mx/l}JV.x=dx/mx;JV.z=dz/mx;const j=JOY_EL();if(j)j.firstElementChild.style.transform='translate(calc(-50% + '+dx+'px),calc(-50% + '+dz+'px))'}else mouse.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1)});

function pick(i){const n=C[i];if(!n||!n.alive)return;
  if(S.mega&&A&&n!=A){if(A.alive&&(S.mega.sw||0)>0)return;const o=A,p=o.g.position;n.g.position.set(p.x,p.y,p.z);n.vy=o.vy||0;n.jc=o.jc||0;n.g.rotation.y=o.g.rotation.y;o.off=true;o.g.visible=false;n.off=false;n.g.visible=true;n.inv=Math.max(n.inv,.8);flash(p,2.5,n.r.col);burst(p,n.r.col);S.mega.sw=1.5}
  A=n;C.forEach(c=>c.g.userData.ring.visible=c==A);hud()}
function focusTarget(){if(!A)return;let best=null,bd=1e9;for(const e of E){const d=Math.hypot(e.position.x-A.g.position.x,e.position.z-A.g.position.z);if(d<bd){bd=d;best=e}}if(best){S.focusTarget=best;banner('CIBLE PRIORITAIRE : '+(best.userData.boss?'BOSS':'ENNEMI'));flash(best.position,2.1,0xffc857)}}
function reset(){
  [...C.map(c=>c.g),...E,...B,...F,...EP,...Z.map(z=>z.m),...BARS].forEach(o=>scene.remove(o));E=[];B=[];F=[];EP=[];Z=[];C=[];BARS.length=0;
  S={score:0,wave:0,rm:1,dm:0,sm:1,mode:'menu',toSpawn:0,spT:0,xp:0,xpNext:12,level:1,pendingChoices:0,pendingLevels:0,runKills:0,hitStop:0,combo:0,comboT:0,focusTarget:null,critBonus:0,killHeal:0,comboBonus:0};
  SEL.map(k=>ROLES[k]).forEach((r,i)=>{const g=human(r.col,HERO_KIT[SEL[i]]);g.position.set((i-(SEL.length-1)/2)*3,0,0);scene.add(g);
    const hc={r,g,key:SEL[i],hp:r.hp,max:r.hp,cd:0,alive:true,inv:0,heal:0,spc:3,mv:false,t:Math.random()*6,comboCount:0,comboAt:0,finisherReady:false,attackAnim:0};g.userData.hero=hc;addBar(g,1.3,3.25,0x5ee6a0);C.push(hc)});
  pick(0);
  buildCards();
  hud();
}
function buildCards(){$('team').innerHTML='';C.forEach((c,i)=>{const d=document.createElement('button');d.type='button';d.className='card';d.onclick=()=>pick(i);
  d.style.setProperty('--hero-color','#'+c.r.col.toString(16).padStart(6,'0'));
  d.innerHTML='<b><kbd>'+(i+1)+'</kbd> '+c.r.name+'</b><i><u></u></i><em></em>';$('team').appendChild(d);c.el=d});hud()}
function hud(){
  $('w').textContent=S.wave;$('s').textContent=S.score;const xp=$('xp');if(xp)xp.textContent='Niv. '+(S.level||1)+' · XP '+(S.xp||0)+'/'+(S.xpNext||12);const xb=document.querySelector('#xp-bar u');if(xb)xb.style.width=Math.min(100,(S.xp||0)/(S.xpNext||12)*100)+'%';$('ord').textContent=['⚔ Attaquer','➜ Suivre','🛡 Défendre'][ORD]+' · V';$('ord').title='Ordre de l’escouade (touche V)';
  C.forEach(c=>{if(!c.el)return;c.el.className='card'+(c==A?' on':'')+(c.alive?'':' dead');c.el.querySelector('u').style.width=Math.max(0,c.hp/c.max*100)+'%'});
}
let BAN_T=0,BAN_PRI=0;
function banner(t,ms=1400){const b=$('ban');if(!b)return;b.textContent=t;b.style.opacity=1;b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');clearTimeout(BAN_T);BAN_T=setTimeout(()=>b.style.opacity=0,ms)}
function startWave(){S.wave++;setArenaMode('normal');if(S.wave%5==0){S.megaOnly=false;S.campaignMega=true;S.mode='pick';hud();megaPick();return}S.toSpawn=Math.round((12+S.wave*5)*(.6+.15*C.length)*(S.wave%4==3?1.5:1));S.horde=S.wave%4==3;if(S.wave%2==0)for(let i=0;i<1+(S.wave/4|0);i++)spawn('b');S.spT=1.4;S.mode='play';$('ov').hidden=true;banner(S.wave%2==0?'Vague '+S.wave+' : MINI-BOSS — progression conservée':(S.horde?'Vague '+S.wave+' : HORDE !':'Vague '+S.wave));hud()}
function spawn(bt){
  const w=S.wave,r=Math.random();let t=bt||'c';if(bt);else if(S.horde)t='s';else if(w>=2&&Math.random()<.18)t='r';else if(w>=5&&r<.18)t='t';else if(w>=3&&r<.4)t='f';else if(w>=2&&r<.7)t='s';
  const d={c:[1+(w/4|0),2.6+.12*w,0xff5a7a,.9,1],f:[1,4.2+.12*w,0xffc857,.6,1],t:[6+w,1.6+.05*w,0xb06bff,1.5,3],s:[1,5.5+.1*w,0xff8a4a,.55,1],b:[60+w*10,1.5,0xff2a2a,2.4,5],r:[1+(w/5|0),2.4+.05*w,0xb6ff3a,.8,2]}[t];
  const m=new THREE.Mesh(G[t],new THREE.MeshStandardMaterial({color:d[2],emissive:d[2],emissiveIntensity:.35,metalness:.35,roughness:.35,flatShading:true}));
  // 2.5: glowing core + energy shell so enemies read clearly against the sand arena.
  const shell=new THREE.Mesh(G[t],ENEMY_SHELL[t]||(ENEMY_SHELL[t]=KEEP(new THREE.MeshBasicMaterial({color:new THREE.Color(d[2]).lerp(new THREE.Color(0xffffff),.45),wireframe:true,transparent:true,opacity:.35}))));shell.scale.setScalar(1.18);m.add(shell);
  const coreM=new THREE.Mesh(ENEMY_CORE,ENEMY_CORE_MAT);coreM.scale.setScalar(d[3]*.55);m.add(coreM);
  const a=Math.random()*6.283;m.position.set(Math.cos(a)*(R-1),1,Math.sin(a)*(R-1));
  m.userData={mx:d[0],boss:t=='b',rng:t=='r',hp:d[0],sp:Math.min(d[1],9),rad:d[3],pts:d[4],type:t,spawnT:.45};m.scale.setScalar(.01);scene.add(m);E.push(m);
  flash(m.position,d[3]+.8,d[2]);
  if(d[0]>=4)addBar(m,Math.min(3.2,.9+d[3]*.8),d[3]+1.3,t=='b'?0xff3b5c:0xffc857);
}
const ENEMY_SHELL={},ENEMY_CORE=KEEP(new THREE.IcosahedronGeometry(.5,0)),ENEMY_CORE_MAT=KEEP(new THREE.MeshBasicMaterial({color:0xfff4d6}));
function burst(p,col){while(F.length>150){const old=F.shift();scene.remove(old)}for(let i=0;i<6;i++){const m=new THREE.Mesh(fxGeo,new THREE.MeshBasicMaterial({color:col}));
  m.position.copy(p);m.userData={v:new THREE.Vector3((Math.random()-.5)*8,Math.random()*6,(Math.random()-.5)*8),l:.5};scene.add(m);F.push(m)}}
function flash(p,rad,col){const m=new THREE.Mesh(new THREE.TorusGeometry(rad,.12,6,32),new THREE.MeshBasicMaterial({color:col,transparent:true}));
  m.rotation.x=Math.PI/2;m.position.set(p.x,.3,p.z);m.userData={v:new THREE.Vector3(),l:.25,ring:1};scene.add(m);F.push(m)}
const UP=[['Précision létale : critiques +8 %',()=>S.critBonus=(S.critBonus||0)+.08],['Récolte vitale : éliminations soignent 2 % des PV max',()=>S.killHeal=(S.killHeal||0)+.02],['Finisher maîtrisé : dégâts finisher +0,2×',()=>S.comboBonus=(S.comboBonus||0)+.2],['Héros actif : recharge de capacité -20 %',()=>A.cdr=(A.cdr||1)*.8],['Héros actif : PV max +40',()=>{A.max+=40;A.hp+=40}],['Héros actif : vitesse +20 %',()=>A.spm=(A.spm||1)*1.2],['Cadence de tir +20 %',()=>S.rm*=.8],['Dégâts +1 pour tous',()=>S.dm++],['Vitesse +12 %',()=>S.sm*=1.12],
 ['PV max +25 pour tous',()=>C.forEach(c=>{c.max+=25;if(c.alive)c.hp+=25})],
 ['Ranimer un héros tombé',()=>{const d=C.find(c=>!c.alive);if(d){d.alive=true;d.hp=d.max*.6;d.g.visible=true}else C.forEach(c=>c.hp=c.max)}]];
function upgrades(){
  S.mode='up';Z.forEach(z=>scene.remove(z.m));Z=[];EP.forEach(o=>scene.remove(o));EP=[];C.forEach(c=>{if(c.alive)c.hp=Math.min(c.max,c.hp+25)});hud();
  // Chaque vague donne un choix; les niveaux gagnés pendant le combat en ajoutent d'autres.
  S.pendingChoices=(S.pendingChoices||0)+1;
  showUpgradeChoice(true);
}
function showUpgradeChoice(waveReward=false){
  S.mode='up';const o=$('ov');o.hidden=false;
  const title=(S.pendingLevels||0)>0?'Niveau '+S.level+' atteint !':'Vague '+S.wave+' repoussée';
  o.innerHTML='<div class="box up-box"><div class="eyebrow">AMÉLIORATION · '+(S.pendingChoices||1)+' CHOIX RESTANT'+((S.pendingChoices||1)>1?'S':'')+'</div><h1>'+title+'</h1><p>Choisissez une amélioration pour cette partie. Touches <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> ou clic.</p><div id="opts" class="upgrade-options"></div></div>';
  [...UP].sort(()=>Math.random()-.5).slice(0,3).forEach((u,i)=>{const b=document.createElement('button');b.className='upgrade-card';b.innerHTML='<span class="upgrade-index">'+(i+1)+'</span><b>'+u[0].replace('Héros actif',A.r.name)+'</b><small>'+upgradeDescription(u[0])+'</small>';b.onclick=()=>{u[1]();if((S.pendingLevels||0)>0)S.pendingLevels--;S.pendingChoices=Math.max(0,(S.pendingChoices||1)-1);hud();if(S.pendingChoices>0)showUpgradeChoice(false);else startWave()};$('opts').appendChild(b)});
}
function upgradeDescription(label){
  if(label.includes('critiques'))return 'Augmente les chances de coup critique du héros contrôlé.';
  if(label.includes('Récolte vitale'))return 'Chaque élimination rend une petite quantité de PV à l’escouade.';
  if(label.includes('Finisher'))return 'Renforce les attaques finales des combos de trois coups.';
  if(label.includes('dégâts'))return 'Augmente les dégâts de toute l’escouade.';
  if(label.includes('PV'))return 'Renforce la survie de l’équipe.';
  if(label.includes('vitesse')||label.includes('Vitesse'))return 'Déplacements plus rapides pendant cette partie.';
  if(label.includes('Cadence'))return 'Attaques plus fréquentes pour toute l’équipe.';
  if(label.includes('Ranimer'))return 'Relève un héros tombé au combat.';
  return 'Amélioration active jusqu’à la fin de la partie.';
}
function gainXP(amount){
  if(!S||S.megaOnly)return;S.xp=(S.xp||0)+amount;
  while(S.xp>=S.xpNext){S.xp-=S.xpNext;S.level=(S.level||1)+1;S.xpNext=Math.round((S.xpNext||12)*1.28+4);S.pendingChoices=(S.pendingChoices||0)+1;S.pendingLevels=(S.pendingLevels||0)+1;banner('NIVEAU '+S.level+' · amélioration gagnée');snd(740,.16,'triangle')}
  hud();
}
function over(){if(S.mega){megaLose();return}
  S.mode='over';const o=$('ov');o.hidden=false;
  const rec=bestTxt();
  o.innerHTML='<div class="box over-box"><div class="eyebrow">FIN DE PARTIE</div><h1>Escouade tombée</h1><div class="pause-stats"><div><small>VAGUE</small><b>'+S.wave+'</b></div><div><small>SCORE</small><b>'+S.score+'</b></div><div><small>ÉLIMINATIONS</small><b>'+(S.kills||0)+'</b></div><div><small>NIVEAU</small><b>'+(S.level||1)+'</b></div></div><p>'+rec+'</p><div class="pause-actions"><button id="again" class="primary-action">REJOUER <span>↻</span></button><button id="chg" class="secondary-action">CHANGER D’ÉQUIPE</button></div></div>';
  $('again').onclick=()=>{reset();startWave()};$('chg').onclick=()=>{reset();menu()};
}
