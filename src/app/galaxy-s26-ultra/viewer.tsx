'use client';
import {useEffect,useRef,useState} from 'react';
import {RotateCcw,Plus,Minus} from 'lucide-react';
import {Color} from 'three';
import type {Mesh,BufferGeometry,Material,Texture} from 'three';
import type {DeviceScene} from '@/components/webgl-viewer/device-scene';
import {dressGalaxy} from '../galaxy-s25-ultra/galaxy-materials';
import styles from './page.module.css';

// Real Galaxy S26 Ultra retail colours (Samsung dropped Titanium for Armor
// Aluminium this generation — the S25 Ultra titanium palette no longer
// applies). Sampled from official press photography: Black, Silver Shadow
// and Cobalt Violet are the three most representative launch finishes.
// Back glass reads a touch lighter than the frame, matching the real device.
const S26_PALETTE=[
 {body:new Color('#232427'),back:new Color('#2b2c30')}, // Чёрный
 {body:new Color('#9a9b9d'),back:new Color('#a8a9ab')}, // Серебристая тень (Silver Shadow)
 {body:new Color('#4c3f68'),back:new Color('#5f4f7d')}, // Кобальтовый фиолетовый (Cobalt Violet)
];
const SWATCHES=S26_PALETTE.map(c=>`#${c.body.getHexString()}`);

export function Viewer(){
 const host=useRef<HTMLDivElement>(null),engine=useRef<DeviceScene|null>(null),current=useRef(1);
 const [color,setColor]=useState(1),[status,setStatus]=useState('loading');
 useEffect(()=>{let cancelled=false;const el=host.current!;const observer=new IntersectionObserver(entries=>{if(!entries.some(e=>e.isIntersecting))return;observer.disconnect();void Promise.all([import('@/components/webgl-viewer/device-scene'),import('../galaxy-s25-ultra/galaxy-device')]).then(async([{createDeviceScene},{galaxyConfig}])=>{
 const config={...galaxyConfig,exposeAudit:false,initialRotation:[0,0,0] as [number,number,number],displayHeight:3.5,cameraDistance:7.2,dress(ctx:Parameters<typeof galaxyConfig.dress>[0]){return dressGalaxy(ctx.model,ctx.screens,ctx.onFinishLighting,S26_PALETTE);},async loadAssets(){const assets=await galaxyConfig.loadAssets();const first=assets.model.children[0];
 const keptGeometry=new Set<BufferGeometry>(),keptMaterials=new Set<Material>(),keptTextures=new Set<Texture>();
 first?.traverse(node=>{const m=node as Mesh;if(!m.isMesh)return;keptGeometry.add(m.geometry);(Array.isArray(m.material)?m.material:[m.material]).forEach(mat=>{keptMaterials.add(mat);Object.values(mat).forEach(v=>{if(v?.isTexture)keptTextures.add(v);});});});
 const discardedGeometry=new Set<BufferGeometry>(),discardedMaterials=new Set<Material>(),discardedTextures=new Set<Texture>();
 for(const child of [...assets.model.children])if(child!==first){assets.model.remove(child);child.traverse(node=>{const m=node as Mesh;if(!m.isMesh)return;discardedGeometry.add(m.geometry);(Array.isArray(m.material)?m.material:[m.material]).forEach(mat=>{discardedMaterials.add(mat);Object.values(mat).forEach(v=>{if(v?.isTexture)discardedTextures.add(v);});});});}
 discardedGeometry.forEach(g=>{if(!keptGeometry.has(g))g.dispose();});discardedMaterials.forEach(m=>{if(!keptMaterials.has(m))m.dispose();});discardedTextures.forEach(t=>{if(!keptTextures.has(t))t.dispose();});return assets;}};
 const scene=await createDeviceScene(el,config,()=>{});if(cancelled){scene.dispose();return;}engine.current=scene;scene.setColor('',current.current);scene.view(false);setStatus('ready');}).catch(()=>{if(!cancelled)setStatus('failed');});},{rootMargin:'300px'});observer.observe(el);return()=>{cancelled=true;observer.disconnect();engine.current?.dispose();engine.current=null;};},[]);
 const names=['Чёрный','Серебристая тень','Кобальтовый фиолетовый'];
 return <div className={styles.viewer}><div ref={host} className={styles.canvas} role="region" aria-label="Вращаемая модель Galaxy S26 Ultra"/>{status!=='ready'&&<p className={styles.loading}>{status==='failed'?'Не удалось загрузить 3D. Обновите страницу, чтобы повторить.':'Загружаем Galaxy…'}</p>}<div className={styles.viewerBottom}><p>{names[color]}<span>Потяните, чтобы рассмотреть со всех сторон</span></p><div className={styles.colors} role="radiogroup" aria-label="Цвет Galaxy">{names.map((name,i)=><button key={name} role="radio" aria-checked={color===i} aria-label={name} style={{background:SWATCHES[i]}} onClick={()=>{setColor(i);current.current=i;engine.current?.setColor('',i);}}/>)}</div><div className={styles.controls}><button aria-label="Вид спереди" onClick={()=>engine.current?.view(true)}>Экран</button><button aria-label="Вид сзади" onClick={()=>engine.current?.view(false)}>Корпус</button><button aria-label="Увеличить" onClick={()=>engine.current?.zoom(.9)}><Plus size={18}/></button><button aria-label="Уменьшить" onClick={()=>engine.current?.zoom(1.1)}><Minus size={18}/></button><button aria-label="Сбросить ракурс" onClick={()=>engine.current?.view(false)}><RotateCcw size={17}/></button></div></div></div>;
}
