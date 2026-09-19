import * as THREE from 'three';
import { addSatinGrain } from '@/components/webgl-viewer/satin-grain';
import sourceData from './phone-material-data.json';

type Surface = {diffuseColor?:number[];metallic?:number;roughness?:number;opacity?:number;clearcoat?:number;clearcoatRoughness?:number;ior?:number};
const bindings:Record<string,string> = sourceData.bindings;
const source:Record<string,Surface> = sourceData.materials;
const finishes = ['#673c46','#b0bfdc','#f2f2ef','#454544'];
const lensCoatings = new Set(['rWTUuVcPAAIaxme','obqsXOwHbuntmdg']);
const bodyPaint = new Set(['DodbyqhrrBLNbcB','vmHtEpzvjsKvWzR','NTEUvFZCGwiAbXI','hGSiEINnkluBUrq','crYYDRbonRWlXIT','bKCxnOaKtDpUlmo','nuwSyerWvJfhsMd','WElbLmMkunjUugH','ZKYcumThEAllgKc','vUgmkmbQjXTaqEc','mEyfsugDbInWtmQ']);

const response:Record<string,number[]>={
          WElbLmMkunjUugH:[.62,.88,1.02,.54],
          DodbyqhrrBLNbcB:[.19,.32,.46,.54],
          vUgmkmbQjXTaqEc:[1.4,1.62,1.65,1.16],
          IxiedJEUxrDhLIX:[.45,.55,.7,.43],
          yPeTOPaiWwFMSdb:[.45,.55,.7,.43],
        };

export function dressPhone(model:THREE.Object3D, screens:THREE.Texture[], onFinish?:(index:number)=>void) {
  const owned = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const paints:{material:THREE.MeshPhysicalMaterial;brightness:number}[]=[];
  const displays:THREE.MeshPhysicalMaterial[]=[];
  const remember=(material:THREE.Material)=>{
    owned.add(material);
    Object.values(material).forEach(value=>{if(value?.isTexture)textures.add(value);});
  };
  model.traverse(node=>{
    const mesh=node as THREE.Mesh;if(!mesh.isMesh)return;
    const originals=Array.isArray(mesh.material)?mesh.material:[mesh.material];
    originals.forEach(remember);
    const original=originals[0] as THREE.MeshPhysicalMaterial;
    const id=bindings[mesh.name];const usd=source[id]??{};
    // Caps sit proud of the frame; keep their source bevels and move only the cap.
    if(['IhutpDtXiHOXZQQ','MLXiLvzAcyadwsO','tGmDwIVAJzsXtCr'].includes(mesh.name))mesh.position.x+=.00018;
    if(mesh.name==='PiNlHXRokKeMMue')mesh.position.x-=.00018;

    const material=new THREE.MeshPhysicalMaterial();
    // Copy common PBR maps. USD colors are already linear; decoding them as sRGB twice
    // crushes the glass/optics. USD normal scale=(2,2,2) is decoding, not bump strength.
    THREE.MeshStandardMaterial.prototype.copy.call(material,original);
    material.name=id;material.normalScale.set(1,1);
    material.clearcoat=usd.clearcoat??0;material.clearcoatRoughness=usd.clearcoatRoughness??.1;
    material.ior=usd.ior??1.5;
    if(!material.map && usd.diffuseColor)material.color.fromArray(usd.diffuseColor);
    material.aoMapIntensity=.35;
    if(usd.metallic!==undefined)material.metalness=usd.metallic;
    if(usd.roughness!==undefined)material.roughness=usd.roughness;
    Object.values(material).forEach(value=>{if(value?.isTexture){value.anisotropy=8;textures.add(value);}});
    if(bodyPaint.has(id)) {
      material.map=null; // Color atlas is baked burgundy; microtexture/normal/AO maps stay intact.
      material.metalness=id==='vUgmkmbQjXTaqEc'?.82:id==='WElbLmMkunjUugH'?.48:.58;
      material.roughnessMap=null;material.roughness=id==='vUgmkmbQjXTaqEc'?.22:.36;
      material.clearcoat=0;material.clearcoatRoughness=.38;addSatinGrain(material,id==='WElbLmMkunjUugH'?.68:1);
      material.opacity=1;material.transparent=false;
      paints.push({material,brightness:id==='bKCxnOaKtDpUlmo'?.6:id==='WElbLmMkunjUugH'?.68:1});
    }
    // The camera deck and rim share one source material. Keep the curved rim bright
    // while calibrating the flat deck, using the source's metre-scale coordinates.
    if(mesh.name==='tOqBbRZfYgrynTi') {
      const positions=mesh.geometry.getAttribute('position'),normals=mesh.geometry.getAttribute('normal');
      const colors=new Float32Array(positions.count*3);
      for(let i=0;i<positions.count;i++) {
        const deck=positions.getY(i)>.028 && positions.getZ(i)>.014;
        const weight=deck?THREE.MathUtils.smoothstep(normals.getZ(i),.6,.98):0;
        const shade=THREE.MathUtils.lerp(1,.48,weight);
        colors.set([shade,shade,shade],i*3);
      }
      mesh.geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));material.vertexColors=true;
    }
    if(['IhutpDtXiHOXZQQ','MLXiLvzAcyadwsO','tGmDwIVAJzsXtCr','PiNlHXRokKeMMue'].includes(mesh.name)){material.metalness=.35;material.roughness=.4;material.clearcoat=0;}
    if(mesh.name==='AMGhLuACKLHpcxk'){material.metalness=.02;material.roughness=.62;material.clearcoat=0;material.specularIntensity=.15;}
    if(mesh.name==='lHgsWfYosJjEHHx') {
      // Clear glass sits above the color-matched backing; an opaque diffuse fill looks pasted on.
      material.map=null;material.color.set('#ffffff');material.metalness=0;material.roughness=.18;
      material.clearcoat=1;material.clearcoatRoughness=.17;material.ior=1.47;
      material.opacity=.008;material.transparent=true;material.depthWrite=false;material.aoMap=null;material.envMapIntensity=.06;
    }
    if(mesh.name==='nWyRniYpXOXakrY'||id==='yPeTOPaiWwFMSdb') {
      material.map=null;material.metalness=.25;material.roughness=.4;material.clearcoat=.05;material.opacity=1;material.transparent=false;
      addSatinGrain(material,.65);paints.push({material,brightness:1.8});
    }
    if(lensCoatings.has(id)) {
      material.roughness=.06;material.metalness=.35;material.clearcoat=1;material.clearcoatRoughness=.025;
      material.envMapIntensity=.035;material.specularIntensity=.2;
      material.ior=1.52;material.iridescence=.2;material.iridescenceIOR=1.3;material.iridescenceThicknessRange=[110,230];
      material.depthWrite=!material.transparent;
    }
    if(id==='rWTUuVcPAAIaxme'){material.opacity=.065;material.clearcoat=.4;}
    if(id==='DnIwCkKmEzIWdJQ'||id==='JledLPXRPXpnGDQ'){material.metalness=.25;material.roughness=.12;material.clearcoat=.7;material.clearcoatRoughness=.04;material.emissiveMap=material.map;material.emissive.set('#a6b2ff');material.emissiveIntensity=1.1;material.iridescence=.35;material.iridescenceThicknessRange=[260,430];}
    // Lens front covers reflect light while the layered optical elements remain visible.
    if(id==='obqsXOwHbuntmdg') {
      material.color.set('#000000');material.opacity=.055;material.transparent=true;material.depthWrite=false;
      material.metalness=0;material.roughness=.04;material.envMapIntensity=.035;material.specularIntensity=.15;material.clearcoat=.1;
    }
    // USB-C is already modelled with an oval shell, central tongue and contacts.
    // Give these separate materials instead of tinting the entire opening like the housing.
    if(['ezeCtoGqBgkuXkM','OLElVJaUyUAkJTK','eCqaCdRQIHdBJaT','QpCUTBrfGeqSJlQ','XelLsxQxbVjyAEf','BmSvIMTLRwhIMei'].includes(mesh.name)) {
      const paint=paints.findIndex(p=>p.material===material);if(paint>=0)paints.splice(paint,1);
      material.color.set('#adb1b8');material.metalness=.88;material.roughness=.28;material.clearcoat=0;
    }
    if(['kVoChGBtLBcaCVZ','jBMFTYJdkiLEILT','CkWvqHNVFiGJvpB','gVjDdjCvpxUAQBO'].includes(mesh.name)) {
      const paint=paints.findIndex(p=>p.material===material);if(paint>=0)paints.splice(paint,1);
      material.color.set('#121316');material.metalness=.05;material.roughness=.55;material.clearcoat=0;
    }
    if(mesh.name==='ezeCtoGqBgkuXkM'){material.map=original.map;material.color.set('#e0e1e4');material.metalness=.8;material.roughness=.27;}
    if(id==='SEutxTyFlxVznkH'){material.color.set('#b3a887');material.metalness=.8;material.roughness=.32;}
    if(['OqjdceRKCgCxebm','ZdjEdUeNrJlHfPr'].includes(mesh.name)) {material.color.set('#000000');material.metalness=0;material.roughness=.23;material.envMapIntensity=0;material.specularIntensity=0;material.clearcoat=0;}
    if(['oXwhgMrETYHoWMi','ajlSZFAJxVQUboJ','TbrMzrvsrKQFokG'].includes(mesh.name)) {
      material.color.set('#010102');material.metalness=0;material.roughness=.45;material.clearcoat=0;material.envMapIntensity=.05;
    }
    if(mesh.name==='eMqbNZEirboZmlk'){material.emissiveMap=material.map;material.emissive.set('#ffffff');material.emissiveIntensity=.3;}
    if(mesh.name==='NHIflnmDqkYynWz'){material.color.set('#dddddd');material.metalness=.05;material.roughness=.38;}
    if(mesh.name==='EHjrGDHNHzgNjtE') {
      material.color.set('#060608');material.map=null;material.emissive.set('#ffffff');material.emissiveMap=screens[0];
      material.emissiveIntensity=1.05;material.metalness=0;material.roughness=.16;
      material.clearcoat=.35;material.clearcoatRoughness=.12;material.envMapIntensity=.25;material.ior=1.5;
      material.aoMap=null;material.normalMap=null;material.toneMapped=false;displays.push(material);
    }
    if(material.transparent)material.depthWrite=false;
    if(['oXwhgMrETYHoWMi','ajlSZFAJxVQUboJ','TbrMzrvsrKQFokG'].includes(mesh.name)) {
      const island=new THREE.MeshBasicMaterial({color:0x000000,toneMapped:false});
      owned.add(material);owned.add(island);mesh.material=island;return;
    }
    owned.add(material);mesh.material=material;
  });
  return {
    setFinish(index:number) {
      onFinish?.(index);
      const color=new THREE.Color(finishes[index]??finishes[0]);
      paints.forEach(({material,brightness})=>{
        material.color.copy(color).multiplyScalar(brightness);
        // Multipliers calibrated against aligned rear-view references, separately for
        // the backing, camera deck, machined rim and logo (burgundy, blue, silver, black).
        material.color.multiplyScalar(response[material.name]?.[index]??1);
      });
      displays.forEach(material=>{material.emissiveMap=screens[index]??screens[0];material.needsUpdate=true;});
    },
    dispose(){owned.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());},
  };
}
