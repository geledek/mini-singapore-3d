#!/usr/bin/env node
/**
 * Rebuild a railway's coordinates main polyline from its station sequence.
 * Generates a densified polyline by interpolating 20 points per segment.
 *
 * Usage:
 *   node scripts/make-line-from-stations.js --railway SMRT.TEL
 */
const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i=0;i<args.length;i++) {
    const a=args[i];
    if (a==='--railway') out.railway=args[++i];
  }
  return out;
}

function interpolate(a,b,steps=20){
  const pts=[]; for(let i=0;i<=steps;i++){const t=i/steps; pts.push([
    a[0] + (b[0]-a[0])*t,
    a[1] + (b[1]-a[1])*t
  ]);} return pts;
}

function main(){
  const { railway } = parseArgs();
  if(!railway){ console.error('Usage: --railway <ID>'); process.exit(1);} 
  const stations = JSON.parse(fs.readFileSync(path.join(__dirname,'../data/stations.json'),'utf8'));
  const railways = JSON.parse(fs.readFileSync(path.join(__dirname,'../data/railways.json'),'utf8'));
  const coords = JSON.parse(fs.readFileSync(path.join(__dirname,'../data/coordinates.json'),'utf8'));
  const r = railways.find(x=>x.id===railway);
  const cEntry = coords.railways.find(x=>x.id===railway);
  if(!r||!cEntry){console.error('Railway not found in data/'); process.exit(1);} 
  const seq = r.stations.map(id=>{
    const s = stations.find(x=>x.id===id);
    if(!s) throw new Error('Missing station '+id);
    return s.coord;
  });
  const poly=[];
  for(let i=1;i<seq.length;i++){
    const seg = interpolate(seq[i-1], seq[i], 20);
    if(i>1) seg.shift();
    poly.push(...seg);
  }
  cEntry.sublines = [{ type:'main', coords: poly }];
  fs.writeFileSync(path.join(__dirname,'../data/coordinates.json'), JSON.stringify(coords,null,'\t'));
  console.log(`✓ Rebuilt ${railway} from stations with ${poly.length} points`);
}

main();

