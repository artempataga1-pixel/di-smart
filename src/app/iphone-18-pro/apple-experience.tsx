'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Cloud, Gamepad2, Music2, ShieldCheck, Sparkles, Tv, WandSparkles } from 'lucide-react';
import styles from './apple-experience.module.css';

const examples = [
  { label: 'Маршрут', question: 'Собери выходной на Бали без спешки.', answer: 'Утро у океана в Сануре, днём — террасы Джатилувих. Вечер оставлю свободным.' },
  { label: 'Найти', question: 'Где мои заметки о поездке?', answer: 'Нашла список мест, номер брони и сохранённый адрес. Показать всё вместе?' },
  { label: 'Написать', question: 'Позови друзей на кофе в субботу.', answer: '«Кофе в субботу? Встречаемся в 12:00 в нашем месте. Кто со мной?»' },
];

export function AppleExperience() {
  const [selected, setSelected] = useState(0);
  return <section className={styles.section} id="intelligence" aria-labelledby="siri-title">
    <header className={styles.heading} data-reveal><p>Siri и Apple Intelligence</p><h2 id="siri-title">Спросите —<br />и просто продолжайте.</h2><p className={styles.intro}>Найти, сверить, написать — одним разговором.</p></header>
    <div className={styles.hero}><Image src="/media/iphone-18-pro/apple/siri-ru.webp" alt="Три iPhone с примерами интерфейса Siri на русском" fill sizes="(max-width:760px) 100vw, 900px" /></div>
    <div className={styles.demo}>
      <div><Sparkles size={34} /><h3>Говорите<br />как обычно.</h3><p>Siri понимает контекст и помогает закончить начатое.</p><div className={styles.tabs} role="tablist" aria-label="Примеры диалога с Siri">{examples.map((item, i) => <button id={`siri-tab-${i}`} key={item.label} role="tab" aria-selected={selected === i} aria-controls="siri-example" tabIndex={selected === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); const next = (i + (event.key === 'ArrowRight' ? 1 : -1) + examples.length) % examples.length; setSelected(next); document.getElementById(`siri-tab-${next}`)?.focus(); } }}>{item.label}</button>)}</div></div>
      <div className={styles.conversation} role="tabpanel" id="siri-example" aria-labelledby={`siri-tab-${selected}`}><span className={styles.demoLabel}>Пример диалога</span><div key={selected} className={styles.messages}><p className={styles.question}>{examples[selected].question}</p><div className={styles.answer}><Sparkles size={21} /><p>{examples[selected].answer}</p></div></div></div>
    </div>
    <p className={styles.note}>Доступность функций зависит от языка и региона.</p>
    <div className={styles.iosHeading} data-reveal><p>iOS и Apple Intelligence</p><h2>Меньше действий —<br />быстрее результат.</h2></div>
    <div className={styles.features}>
      <article data-reveal><WandSparkles /><h3>Правьте снимок,<br />сохраняя исходный замысел.</h3><p>Уберите лишнее, поправьте композицию и оставьте кадр естественным.</p><div className={styles.photo}><Image src="/media/iphone-18-pro/images/natural/landscape.webp" alt="Рисовые террасы Бали" fill sizes="(max-width:760px) 90vw,520px" /></div></article>
      <article data-reveal><ShieldCheck /><h3>Ваши данные —<br />по вашим правилам.</h3><p>Разрешения и доступы собраны там, где их легко проверить.</p><div className={styles.privacy}><ShieldCheck size={72} /><span>Конфиденциальность</span><p>Вы решаете, чем делиться.</p></div></article>
    </div>
    <div className={styles.one} data-reveal><div><p>Apple One</p><h3>Музыка, кино,<br />игры и облако.</h3><p>Любимые сервисы собраны в одной подписке.</p><a href="https://www.apple.com/apple-one/" target="_blank" rel="noreferrer">Подробнее об Apple One ↗</a></div><div className={styles.services}>{[{ Icon: Music2, name: 'Music' }, { Icon: Tv, name: 'TV' }, { Icon: Gamepad2, name: 'Arcade' }, { Icon: Cloud, name: 'iCloud+' }].map(({ Icon, name }) => <div key={name}><Icon size={38} /><span>{name}</span></div>)}</div></div>
  </section>;
}
