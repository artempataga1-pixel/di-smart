'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,Check,PenLine,ScanSearch,ShieldCheck,Sparkles} from 'lucide-react';
import {Viewer} from './viewer';
import {HeroMedia} from './hero-media';
import {ProductPurchasePanel} from '@/components/product/ProductPurchasePanel';
import {ProductSpecsTable} from '@/components/product/ProductSpecsTable';
import {RelatedProducts} from '@/components/product/RelatedProducts';
import {BuyAnchor} from '@/components/storefront/BuyAnchor';
import type {CatalogCardData,ProductDetail} from '@/lib/catalog';
import styles from './page.module.css';
const stories=[{title:'Найдите. Просто обведите.',body:'Circle to Search помогает искать то, что привлекло ваше внимание, прямо на экране.',icon:ScanSearch},{title:'Опишите. И измените.',body:'Photo Assist помогает редактировать фотографии с помощью слов. От идеи до нового кадра — в привычной Галерее.',icon:Sparkles},{title:'Ваш день. Уже перед вами.',body:'Now Brief собирает персональные подсказки и напоминания, чтобы важное оставалось под рукой.',icon:Check}];
export function GalaxyPage({product,related}:{product:ProductDetail;related:CatalogCardData[]}){const root=useRef<HTMLDivElement>(null);const [ai,setAi]=useState(0);useEffect(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.animate([{opacity:.35,transform:'translateY(32px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,easing:'cubic-bezier(.2,.7,.2,1)'});observer.unobserve(e.target);}}),{threshold:.12});root.current?.querySelectorAll('[data-reveal]').forEach(e=>{if(e.parentElement?.closest('[data-reveal]'))return;observer.observe(e);});return()=>observer.disconnect();},[]);const ActiveIcon=stories[ai].icon;
 return <div ref={root} className={styles.page}>
 <h1 className="sr-only">Samsung Galaxy S26 Ultra</h1>
 <HeroMedia/>

 <section id="buy" className="scroll-mt-20 bg-white px-4 pb-10 pt-14 md:px-6 md:pb-14 md:pt-20" data-reveal>
   <div className="mx-auto max-w-6xl">
     <ProductPurchasePanel product={product}/>
   </div>
 </section>

 <section id="product-details" className="scroll-mt-20 bg-white px-4 pb-16 md:px-6" data-reveal>
   <div className="mx-auto max-w-6xl">
     <ProductSpecsTable specs={product.specs} description={product.description}/>
   </div>
 </section>

 <section id="design" className={styles.section}><div className={styles.heading} data-reveal><p>Дизайн</p><h2>Рассмотрите ближе.<br/>С любой стороны.</h2><p className={styles.description}>Чистые линии. Плавные грани. Выберите оттенок и поверните Galaxy так, как повернули бы его в руках.</p></div><Viewer/></section>
 <section id="camera" className={styles.section}><div className={styles.heading} data-reveal><p>Камера</p><h2>В кадре — всё,<br/>что вы почувствовали.</h2></div><div className={styles.cameraCard} data-reveal><div><h3>200 миллионов<br/>причин приблизить.</h3><p>Основная камера 200 Мп сохраняет мелкие детали. Более широкая диафрагма помогает снимать при слабом освещении, а Nightography Video — передавать настроение вечера.</p></div><div className={styles.cameraVisual}><Image src="/media/galaxy-s26-ultra/photos/camera-photo.webp" alt="Крупный план камер Galaxy S26 Ultra" fill sizes="(max-width: 700px) 100vw, 650px"/></div></div></section>
 <section className={`${styles.section} ${styles.duo}`}><article className={styles.penCard} data-reveal><PenLine size={30}/><h2>Мысль появилась.<br/>Сохраните её.</h2><p>S Pen — для набросков, заметок и точных штрихов. Ваш привычный жест становится частью цифрового мира.</p><div className={styles.detailPhoto}><Image src="/media/galaxy-s26-ultra/photos/spen-photo.webp" alt="Рука рисует архитектурный эскиз стилусом S Pen на Galaxy" fill sizes="(max-width: 760px) 100vw, 580px"/></div></article><article className={styles.privacyCard} data-reveal><ShieldCheck size={30}/><h2>Ваш экран.<br/>Только для вас.</h2><p>Privacy Display ограничивает видимость под боковыми углами. Личные сообщения остаются личными — даже когда вокруг люди.</p><div className={styles.detailPhoto}><Image src="/media/galaxy-s26-ultra/photos/display-photo.webp" alt="Galaxy в руках: личная переписка в светлом кафе" fill sizes="(max-width: 760px) 100vw, 580px"/></div></article></section>
 <section id="intelligence" className={`${styles.section} ${styles.ai}`}><div className={styles.heading} data-reveal><p>Galaxy AI</p><h2>Меньше действий.<br/>Больше возможностей.</h2></div><div className={styles.aiStage}><div className={styles.aiPhoto}><Image key={ai} src={`/media/galaxy-s26-ultra/photos/${['ai-search-photo','ai-edit-photo','ai-day-photo'][ai]}.webp`} alt={['Поиск предмета по изображению на экране Galaxy','Редактирование фотографии рисовых террас Бали на Galaxy','Утренние персональные подсказки на экране Galaxy'][ai]} fill sizes="(max-width: 760px) 100vw, 700px"/></div><div><div className={styles.tabs} role="tablist" aria-label="Возможности Galaxy AI">{['Поиск','Фото','Ваш день'].map((n,i)=><button role="tab" id={`ai-tab-${i}`} aria-selected={ai===i} aria-controls="ai-panel" key={n} onClick={()=>setAi(i)} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=(i+(e.key==='ArrowRight'?1:2))%3;setAi(next);document.getElementById(`ai-tab-${next}`)?.focus();}}} tabIndex={ai===i?0:-1}>{n}</button>)}</div><div role="tabpanel" id="ai-panel" aria-labelledby={`ai-tab-${ai}`} className={styles.aiCopy}><ActiveIcon size={28}/><h3>{stories[ai].title}</h3><p>{stories[ai].body}</p></div></div></div></section>

 <section className={styles.closing}><p>Samsung Galaxy S26 Ultra</p><h2>Ваш следующий Galaxy.</h2><BuyAnchor className={styles.buy}>Выбрать свой Galaxy <ArrowUpRight size={18}/></BuyAnchor><Link href="/trade-in">Обменять свой смартфон по Trade-in</Link></section>

 <section className="bg-white px-4 pb-20 md:px-6">
   <div className="mx-auto max-w-6xl">
     <RelatedProducts products={related}/>
   </div>
 </section>

 <footer className={styles.footnote}><p>Изображения созданы с помощью ИИ для иллюстрации устройства и сценариев использования. Это не реальные снимки, сделанные камерой Galaxy. Оттенки и интерфейсы могут отличаться от устройства.</p><p>Характеристики и возможности: <a href="https://www.samsung.com/uk/smartphones/galaxy-s26-ultra/">Samsung Galaxy S26 Ultra</a>. Доступность Galaxy AI зависит от региона и условий сервиса.</p></footer>
 </div>;
}
