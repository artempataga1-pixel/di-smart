// Bake native lock-screen UI over generated wallpaper. Run with the local preview available.
const {chromium}=require('@playwright/test');
const sharp=require('sharp');
(async()=>{const browser=await chromium.launch();try{const page=await browser.newPage();await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:3000/iphone-18-pro');
const images=await page.evaluate(async screenDate=>{
const THREE={SRGBColorSpace:'srgb',CanvasTexture:class{constructor(canvas){this.image=canvas;}}};


/** Generated depth-effect artwork; date and system controls remain crisp, localized native UI. */
async function createPhoneScreens() {
  const sources = ['burgundy','glacier','silver','black'];
  const formatted=new Intl.DateTimeFormat('ru-RU',{weekday:'short',day:'numeric',month:'long',timeZone:'Europe/Minsk'}).format(new Date(screenDate+'T12:00:00Z'));
  const date=formatted.charAt(0).toUpperCase()+formatted.slice(1);
  return Promise.all(sources.map(async (source,index)=>{
    const photo=new Image();photo.src=`/media/iphone-18-pro/screens/${source}-editorial.webp`;
    await photo.decode();
    const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=2340;
    const ctx=canvas.getContext('2d');ctx.scale(1.2,1.2);
    ctx.fillStyle=['#72584e','#738da9','#96928a','#383838'][index];ctx.fillRect(0,0,900,1950);
    if(photo.naturalWidth)ctx.drawImage(photo,0,0,900,1950);
    else {ctx.fillStyle='#fff';ctx.font='200 260px -apple-system, sans-serif';ctx.textAlign='center';ctx.fillText('9:41',450,440);}
    ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='500 36px -apple-system, sans-serif';ctx.fillText(date,450,165);
    // Dynamic Island plus familiar cellular/Wi-Fi/battery status.
    ctx.fillStyle='#fff';for(let i=0;i<4;i++){ctx.beginPath();ctx.roundRect(688+i*13,77-i*7,9,12+i*7,2);ctx.fill();}
    ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.lineCap='round';
    for(const radius of [11,20,29]){ctx.beginPath();ctx.arc(765,86,radius,Math.PI*1.23,Math.PI*1.77);ctx.stroke();}
    ctx.beginPath();ctx.arc(765,86,3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.roundRect(806,58,45,25,6);ctx.stroke();ctx.fillRect(853,66,4,10);ctx.beginPath();ctx.roundRect(811,63,32,15,3);ctx.fill();
    // Filled system-style glyphs; the complete composition is baked into the display texture.
    [128,772].forEach(x=>{ctx.fillStyle='#30303088';ctx.beginPath();ctx.arc(x,1805,51,0,Math.PI*2);ctx.fill();});
    ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(114,1780,28,6,2);ctx.fill();
    ctx.beginPath();ctx.moveTo(114,1790);ctx.lineTo(142,1790);ctx.lineTo(136,1800);ctx.lineTo(136,1828);ctx.quadraticCurveTo(128,1836,120,1828);ctx.lineTo(120,1800);ctx.closePath();ctx.fill();
    ctx.fillStyle='#555';ctx.beginPath();ctx.roundRect(126,1806,4,10,2);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(746,1790,52,36,6);ctx.fill();
    ctx.beginPath();ctx.moveTo(759,1791);ctx.lineTo(764,1784);ctx.lineTo(782,1784);ctx.lineTo(787,1791);ctx.closePath();ctx.fill();
    ctx.fillStyle='#555';ctx.beginPath();ctx.arc(773,1808,12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(773,1808,8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#555';ctx.beginPath();ctx.arc(791,1797,2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffffffee';ctx.beginPath();ctx.roundRect(310,1903,280,9,5);ctx.fill();
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;return texture;
  }));
}

return (await createPhoneScreens()).map(t=>t.image.toDataURL('image/png').split(',')[1]);
},process.env.SCREEN_DATE||'2026-09-14');for(const [i,name] of ['burgundy','glacier','silver','black'].entries())await sharp(Buffer.from(images[i],'base64')).webp({quality:96}).toFile(`public/media/iphone-18-pro/screens/${name}-lockscreen-v2.webp`);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
