const W = 64, H = 36;
const TILE = { ROAD:0, GRASS:1, DATACENTER:2, CONTAINER:3, WATER:4, BRIDGE:5, TERMINAL:6, DOME:7, FENCE:8, VAULT:9, CABLE:10, GEAR:11, PIPE:12 };
const SOLID = new Set([TILE.DATACENTER, TILE.CONTAINER, TILE.WATER, TILE.DOME, TILE.FENCE, TILE.VAULT, TILE.GEAR]);

const m = Array.from({length:H}, () => Array(W).fill(TILE.GRASS));
const put = (t,x,y) => { if (x>=0&&y>=0&&x<W&&y<H) m[y][x]=t; };

// roads
for (let x=2;x<W-1;x++){ put(TILE.ROAD,x,23); put(TILE.ROAD,x,24); }
for (let x=2;x<52;x++){ put(TILE.ROAD,x,8); put(TILE.ROAD,x,9); }
for (let y=0;y<H;y++) if(y<13||y>15){ put(TILE.ROAD,19,y);put(TILE.ROAD,20,y);put(TILE.ROAD,21,y); }
// river
for (let x=0;x<W;x++) for(let y=13;y<=15;y++) put(TILE.WATER,x,y);
// bridge (git + east)
for (let x=18;x<=22;x++) for(let y=13;y<=15;y++) put(TILE.BRIDGE,x,y);
for (let x=44;x<=48;x++) for(let y=13;y<=15;y++) put(TILE.BRIDGE,x,y);
// east corridor
for (let x=44;x<=48;x++) for(let y=10;y<=22;y++){ if(y===13||y===14||y===15) put(TILE.BRIDGE,x,y); else put(TILE.ROAD,x,y); }

// docker yard
for (let x=3;x<=6;x++) for(let y=2;y<=5;y++) put(TILE.CONTAINER,x,y);
for (let x=10;x<=14;x++) for(let y=2;y<=5;y++) put(TILE.CONTAINER,x,y);
for (let x=7;x<=9;x++) for(let y=2;y<=7;y++) put(TILE.ROAD,x,y);
// k8s walls
for (let y=2;y<=7;y++){ put(TILE.DATACENTER,16,y); put(TILE.DATACENTER,17,y); put(TILE.DATACENTER,23,y); put(TILE.DATACENTER,24,y); }
for (let x=16;x<=24;x++) put(TILE.DATACENTER,x,1);
// observability
for (let x=30;x<=35;x++) for(let y=2;y<=4;y++) put(TILE.DOME,x,y);
// linux
for (let x=3;x<=6;x++) for(let y=26;y<=28;y++) put(TILE.DATACENTER,x,y);
put(TILE.TERMINAL,11,22);
// network
for (let x=32;x<=35;x++) for(let y=26;y<=28;y++) put(TILE.DATACENTER,x,y);
put(TILE.TERMINAL,30,23);

// ---- SECOPS BASTION (x44..51 interior, above avenue) ----
for (let x=44;x<=51;x++) for(let y=2;y<=6;y++) put(TILE.CABLE,x,y);
for (let y=2;y<=8;y++){ put(TILE.VAULT,42,y); put(TILE.VAULT,43,y); put(TILE.VAULT,52,y); put(TILE.VAULT,53,y); }
for (let x=44;x<=53;x++) put(TILE.VAULT,x,1);
for (let x=44;x<=53;x++) if(x<48||x>50) put(TILE.VAULT,x,7);
for (let x=48;x<=50;x++) for(let y=2;y<=8;y++) put(TILE.ROAD,x,y);
// ---- PIPELINE PLAZA (x54..61 interior) ----
for (let x=54;x<=61;x++) for(let y=0;y<=6;y++) put(TILE.CABLE,x,y);
for (let y=0;y<=7;y++){ put(TILE.VAULT,52,y); put(TILE.VAULT,53,y); }
for (let y=0;y<=7;y++) put(TILE.VAULT,62,y);
for (let x=54;x<=63;x++) if(x<58||x>60) put(TILE.VAULT,x,7);
for (let x=58;x<=60;x++) for(let y=2;y<=8;y++) put(TILE.ROAD,x,y);
// ---- EDGE REFINERY (x54..61 interior) ----
for (let x=54;x<=61;x++) for(let y=13;y<=19;y++) put(TILE.PIPE,x,y);
for (let x=54;x<=61;x++){ put(TILE.CABLE,x,14); put(TILE.CABLE,x,17); }
for (let x=53;x<=62;x++) put(TILE.VAULT,x,12);
for (let y=13;y<=20;y++){ put(TILE.VAULT,51,y); put(TILE.VAULT,52,y); put(TILE.VAULT,62,y); }
for (let x=53;x<=62;x++) if(x<56||x>60) put(TILE.VAULT,x,21);
for (let x=56;x<=60;x++) for(let y=20;y<=23;y++) put(TILE.ROAD,x,y);
// ---- STORAGE QUAY ----
for (let x=48;x<=61;x++) for(let y=25;y<=34;y++) put(TILE.CABLE,x,y);
for (let x=48;x<=62;x++) if(x<54||x>58) put(TILE.VAULT,x,24);
for (let y=25;y<=34;y++){ put(TILE.VAULT,46,y); put(TILE.VAULT,47,y); put(TILE.VAULT,62,y); put(TILE.VAULT,63,y); }
for (let x=48;x<=61;x++) put(TILE.VAULT,x,35);
for (let x=54;x<=58;x++) for(let y=23;y<=26;y++) put(TILE.ROAD,x,y);

// interior sampling zones (tile coords)
const ZONES = {
  'pipeline-plaza': [[55,3],[60,1],[54,6],[61,4],[59,2]],
  'secops-bastion': [[44,3],[51,2],[46,6],[45,4],[50,6]],
  'edge-refinery':  [[55,15],[60,18],[54,13],[61,16],[57,14]],
  'storage-quay':   [[55,29],[50,33],[60,26],[49,27],[58,34]],
};

// gate cells per zone (row bands covered by the laser barrier)
const GATES = {
  'k8s-core':      cells(18, 22, 7),
  'pipeline-plaza':cells(58, 60, 7),
  'secops-bastion':cells(48, 50, 7),
  'storage-quay':  cells(54, 58, 24),
  'edge-refinery': cells(56, 60, 21),
};
function cells(x1,x2,y){ const out=[]; for(let x=x1;x<=x2;x++) out.push([x,y]); return out; }

function isSolid(x,y){ return SOLID.has(m[y][x]); }
function reachable(openZones){
  const blocked = new Set();
  for (const [z,gc] of Object.entries(GATES)) if (!openZones.has(z)) gc.forEach(c=>blocked.add(c.join(',')));
  let start=[0,0]; // try find walkable seed
  const seen=new Set([start.join(',')]); const q=[start];
  while(q.length){ const [x,y]=q.pop();
    for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){ const nx=x+dx, ny=y+dy;
      if(nx<0||ny<0||nx>=W||ny>=H) continue;
      const k=nx+','+ny;
      if(seen.has(k)||blocked.has(k)||isSolid(nx,ny)) continue;
      seen.add(k); q.push([nx,ny]);
    } }
  return seen;
}

let allOk = true;
// 1) with ALL gates closed, no new-zone interior reachable
const outside = reachable(new Set());
for (const z of Object.keys(ZONES)){
  const pts = ZONES[z];
  const leaked = pts.filter(([x,y]) => outside.has(x+','+y));
  if (leaked.length) { console.log(`BREACH: ${z} reachable from outside:`, leaked.map(p=>`(${p[0]},${p[1]})`)); allOk=false; }
  else console.log(`OK (closed): ${z} sealed`);
}
// 2) opening each gate lets its zone in, others stay sealed
for (const z of Object.keys(ZONES)){
  const reach = reachable(new Set([z]));
  let ok = true;
  for (const [z2,pts] of Object.entries(ZONES)){
    if (z2===z) continue;
    const leaked = pts.filter(([x,y]) => reach.has(x+','+y));
    if (leaked.length){ ok=false; console.log(`CROSS: opening ${z} leaks into ${z2} at ${leaked.map(p=>`(${p[0]},${p[1]})`)}`); }
  }
  const inZ = ZONES[z].filter(([x,y]) => reach.has(x+','+y));
  if (!inZ.length){ console.log(`ERR: opening ${z} does NOT reach its own interior`); ok=false; }
  else if (ok) console.log(`OK (open): ${z} reachable, others sealed`);
  if(!ok) allOk=false;
}
console.log(allOk ? 'ALL SEALED CORRECTLY' : 'ISSUES FOUND');