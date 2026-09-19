'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Plus, Minus, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import type { createPhoneScene } from './phone-scene';
import { finishes } from './iphone-content';
import styles from './phone-viewer.module.css';

type Scene = Awaited<ReturnType<typeof createPhoneScene>>;
const details = [
  {title:'Цвета', text:'Четыре оттенка. Стекло задней панели в тон корпусу. Найдите свой iPhone.'},
  {title:'Два размера', text:'iPhone 18 Pro с дисплеем 6,3 дюйма и iPhone 18 Pro Max с дисплеем 6,9 дюйма. Super Retina XDR с ProMotion до 120 Гц.', image:'size-ru'},
  {title:'Новая основная камера', text:'Переменная диафрагма камеры Fusion 48 Мп подстраивается под свет и глубину резкости. Больше возможностей для каждого кадра.', image:'viewer_aperture_endframe'},
  {title:'Новый Dynamic Island', text:'До трёх событий одновременно. Музыка, маршрут и важные обновления — перед глазами.', image:'dynamic_island_endframe-ru'},
  {title:'Прочность', text:'Цельный алюминиевый корпус. Ceramic Shield сзади и Ceramic Shield 2 спереди. Продуманная защита на каждый день.', image:'durability'},
  {title:'Управление камерой', text:'Снимайте фото, записывайте видео и меняйте настройки одним движением. Нужный момент всегда под рукой.', image:'camera_control'},
  {title:'Кнопка действия', text:'Назначьте любимую функцию: бесшумный режим, перевод, камеру или быструю команду. Для запуска просто удерживайте кнопку.', image:'action_button-ru'},
];
export function PhoneViewer({selected,onSelect}:{selected:number;onSelect:(index:number)=>void}) {
  const container=useRef<HTMLDivElement>(null);
  const engine=useRef<Scene|null>(null);
  const visual=useRef<HTMLDivElement>(null);
  const current=useRef(selected);
  const [active,setActive]=useState(0);
  const [expanded,setExpanded]=useState(false);
  const [allow3D,setAllow3D]=useState<boolean|null>(null);
  const [status,setStatus]=useState<'loading'|'ready'|'failed'>('loading');
  useEffect(()=>{current.current=selected;engine.current?.setColor(finishes[selected].color,selected);},[selected]);
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      const device=navigator as Navigator&{deviceMemory?:number;connection?:{saveData?:boolean;effectiveType?:string}};
      const constrained=Boolean(device.connection?.saveData||(device.connection?.effectiveType&&device.connection.effectiveType!=='4g')||(device.deviceMemory!==undefined&&device.deviceMemory<=4)||(device.hardwareConcurrency!==undefined&&device.hardwareConcurrency<=4)||matchMedia('(prefers-reduced-motion: reduce)').matches);
      setAllow3D(!constrained);
    });
    return()=>cancelAnimationFrame(frame);
  },[]);
  useEffect(()=>{
    const host=container.current;if(!host)return;
    if(allow3D!==true)return;
    let cancelled=false;let started=false;
    const observer=new IntersectionObserver(entries=>{if(started||!entries.some(e=>e.isIntersecting))return;started=true;observer.disconnect();
      void import('./phone-scene').then(({createPhoneScene})=>createPhoneScene(host,()=>{})).then(scene=>{if(cancelled){scene.dispose();return;}engine.current=scene;scene.setColor(finishes[current.current].color,current.current);setStatus('ready');}).catch(()=>{if(!cancelled)setStatus('failed');});
    },{rootMargin:'300px'});observer.observe(host);
    return()=>{cancelled=true;observer.disconnect();engine.current?.dispose();engine.current=null;};
  },[allow3D]);
  function choose(index:number) {
    setActive(index);setExpanded(active===index?!expanded:true);
    if(index!==active && matchMedia('(max-width:760px)').matches) requestAnimationFrame(()=>{
      const top=visual.current?.getBoundingClientRect().top;
      if(top!==undefined)window.scrollTo({top:window.scrollY+top-168,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    });
  }
  function step(delta:number) {setActive((active+delta+details.length)%details.length);setExpanded(true);}
  return <div className={styles.viewer}>
    <div className={styles.menu} aria-label="Рассмотрите iPhone подробнее">
      {details.map((item,index)=><div className={styles.menuItem} key={item.title} data-open={active===index&&expanded}>
        <button className={styles.menuButton} aria-expanded={active===index&&expanded} aria-controls={`phone-detail-${index}`} onClick={()=>choose(index)}>
          {index===0?<span className={styles.dot} style={{background:finishes[selected].color}}/>:active===index&&expanded?<Minus size={15}/>:<Plus size={15}/>} {item.title}
        </button>
        <div id={`phone-detail-${index}`} className={styles.description} hidden={!(active===index&&expanded)}>
          <p>{item.text}</p>
          {index===0&&<><fieldset className={styles.swatches}><legend>Цвет корпуса</legend>{finishes.map((finish,i)=><label key={finish.english} title={finish.name}><input type="radio" name="viewer-finish" checked={selected===i} onChange={()=>onSelect(i)}/><span style={{background:finish.color}}/><span className={styles.srOnly}>{finish.name}</span></label>)}</fieldset><p className={styles.finish} aria-live="polite">{finishes[selected].name}</p></>}
        </div>
      </div>)}
    </div>
    <div className={styles.visual} ref={visual}>
      <div className={styles.model} data-visible={active===0} aria-hidden={active!==0}>
        <div className={styles.stage} ref={container} tabIndex={active===0&&status==='ready'?0:-1} role="region" aria-label="Трёхмерная модель iPhone. Перетаскивайте для вращения. Стрелки — поворот, Home — исходный ракурс." onKeyDown={event=>{
          const actions:Record<string,()=>void>={ArrowLeft:()=>engine.current?.rotate(-.15,0),ArrowRight:()=>engine.current?.rotate(.15,0),ArrowUp:()=>engine.current?.rotate(0,-.12),ArrowDown:()=>engine.current?.rotate(0,.12),Home:()=>engine.current?.view(true)};
          if(actions[event.key]){event.preventDefault();actions[event.key]();}
        }}/>
        {status!=='ready'&&<Image className={styles.poster} src={`/media/iphone-18-pro/viewer/color_${finishes[selected].english.toLowerCase()}.jpg`} alt={`iPhone 18 Pro, ${finishes[selected].name}`} fill quality={88} sizes="(max-width:760px) 100vw, 900px"/>}
      </div>
      {active!==0&&<div className={styles.feature} key={active}><Image src={`/media/iphone-18-pro/viewer/${details[active].image}.jpg`} alt={details[active].title} fill quality={95} loading="eager" sizes="(max-width:760px) 100vw, 1100px" /></div>}
      {active===0&&<div className={styles.modelTools}>
        <span role="status">{status==='ready'?'Потяните, чтобы повернуть':status==='failed'?'Фотографии · 3D недоступно в этом браузере':allow3D===false?'Фото загружено · 3D доступно по запросу':'Загружаем 3D…'}</span>
        {allow3D===false&&<button type="button" onClick={()=>setAllow3D(true)}>Включить 3D</button>}
        {status==='ready'&&<div><button tabIndex={active===0?0:-1} onClick={()=>engine.current?.view(true)}>Спереди</button><button onClick={()=>engine.current?.view(false)}>Сзади</button><button aria-label="Приблизить модель" onClick={()=>engine.current?.zoom(.88)}><Plus size={16}/></button><button aria-label="Отдалить модель" onClick={()=>engine.current?.zoom(1.14)}><Minus size={16}/></button><button aria-label="Сбросить ракурс" onClick={()=>engine.current?.view(true)}><RotateCcw size={15}/></button></div>}
      </div>}
    </div>
    <div className={styles.steps}><button aria-label="Предыдущая деталь" onClick={()=>step(-1)}><ChevronUp size={18}/></button><button aria-label="Следующая деталь" onClick={()=>step(1)}><ChevronDown size={18}/></button></div>
  </div>;
}
