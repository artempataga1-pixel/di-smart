'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdaptiveHeroVideo } from '@/components/media/AdaptiveHeroVideo';
import styles from './page.module.css';

// The supplied hero film plays independently of page scrolling.
export const heroMedia: { poster: string; videoSrc?: string; wideVideoSrc?: string } = {
  poster: '/media/galaxy-s26-ultra/video/poster.webp',
  videoSrc: '/media/galaxy-s26-ultra/video/hero.mp4',
  wideVideoSrc: '/media/galaxy-s26-ultra/video/hero-wide.mp4',
};

export function HeroMedia({
  videoSrc = heroMedia.videoSrc,
  wideVideoSrc = heroMedia.wideVideoSrc,
}: { videoSrc?: string; wideVideoSrc?: string }) {
  const [activeSrc, setActiveSrc] = useState<string>();
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!videoSrc) return;
    const wideScreen = matchMedia('(min-width: 900px)');
    const selectSource = () => {
      const nextSource = wideScreen.matches && wideVideoSrc ? wideVideoSrc : videoSrc;
      setVisible(false);
      setFailed(false);
      setActiveSrc(nextSource);
    };
    selectSource();
    wideScreen.addEventListener('change', selectSource);
    return () => wideScreen.removeEventListener('change', selectSource);
  }, [videoSrc, wideVideoSrc]);

  return <div className={styles.heroFilm} data-media-slot="galaxy-hero-video">
    <picture className={styles.filmPoster}>
      <source media="(min-width: 900px)" srcSet="/media/galaxy-s26-ultra/video/poster-wide.webp" />
      <img src={heroMedia.poster} alt="Galaxy S26 Ultra — вступительный фильм" width="1280" height="720" />
    </picture>
    {activeSrc && !failed && <>
      <AdaptiveHeroVideo key={activeSrc} sources={[{ src: activeSrc, type: 'video/mp4' }]} poster={heroMedia.poster} className={visible ? styles.filmReady : undefined}
        onPlaying={() => setVisible(true)}
        onError={() => setFailed(true)} />
    </>}
    <Link className={`${styles.buy} ${styles.filmBuy}`} href="/product/galaxy-s26-ultra">Выбрать свой Galaxy</Link>
  </div>;
}
