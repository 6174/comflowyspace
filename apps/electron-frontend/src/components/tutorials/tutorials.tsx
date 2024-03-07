import { useEffect, useState } from 'react';
import styles from './tutorials.style.module.scss';
import { openExternalURL } from '@/lib/electron-bridge';
import  useTutorialStore  from './tutorial.store';
import {KEYS, t} from "@comflowy/common/i18n";

interface TutorialCardProps {
  image: string;
  title: string;
  url: string;
  tag: string;
}

interface TutorialBannerProps {
  image: string;
  title: string;
  subtitle: string;
  url: string;
  tag: string;
}

const TutorialCard: React.FC<TutorialCardProps> = ({ image, title, url }) => {
  return (
    <div 
      className="tutorial-card" 
      onClick={() => openExternalURL(url)} 
      style={{ 
      backgroundImage: `url(${process.env.NEXT_PUBLIC_API_SERVER + image})`,
      }}
    >
      <div className="name" style={{ position: 'absolute'}}>
        {title}
      </div>
    </div>
  );
};

export const TutorialBanner: React.FC<TutorialBannerProps> = ({ image, title, subtitle, url, tag }) => {
  return (
    <div 
      className="totorial-banner" 
      onClick={() => openExternalURL(url)} 
      style={{ 
      backgroundImage: `url(${process.env.NEXT_PUBLIC_API_SERVER + image})`,
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'flex-start'
      }}
    >
      <div className="tag">
        {tag}
      </div>
      <div className="title">
        {title}
      </div>
      <div className="subtitle">
        {subtitle}
      </div>
    </div>
  );
};

const Tutorials = () => {
  const { tutorials, fetchTutorials } = useTutorialStore();

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

  const getstartedTutorials = tutorials.filter(tutorial => tutorial.tag === 'get started');
  const sdTutorials = tutorials.filter(tutorial => tutorial.tag === 'SD Fundamentals');
  const texttoimageTutorials = tutorials.filter(tutorial => tutorial.tag === 'text-to-image');
  const imagetoimageTutorials = tutorials.filter(tutorial => tutorial.tag === 'image-to-image');
  const blogs = tutorials.filter(tutorial => tutorial.tag === 'blog');

  return (
    <div className={styles.tutorials}>
      <h2>{t(KEYS.tutorials)}</h2>
      <div className="tutorial-banner-list">
        {getstartedTutorials.map((card, index) => (
          <TutorialBanner key={index} {...card} />
        ))}
      </div>
      <div className="h3" >{t(KEYS.fundamentals)}</div>
      <div className="p">{t(KEYS.fundamentalsDesc)}</div>
      <div className="tutorial-card-list">
        {sdTutorials.map((card, index) => (
          <TutorialCard key={index} {...card} />
        ))}
      </div>
      <div className="h3">{t(KEYS.textToImage)}</div>
      <div className="p">{t(KEYS.textToImageDesc)}</div>
      <div className="tutorial-card-list">
        {texttoimageTutorials.map((card, index) => (
          <TutorialCard key={index} {...card} />
        ))}
      </div>
      <div className="h3">{t(KEYS.imageToImage)}</div>
      <div className="p">{t(KEYS.imageToImageDesc)}</div>
      <div className="tutorial-card-list">
        {imagetoimageTutorials.map((card, index) => (
          <TutorialCard key={index} {...card} />
        ))}
      </div>
      <div className="h3">{t(KEYS.bestPractices)}</div>
      <div className="p">{t(KEYS.bestPracticesDesc)}</div>
      <div className="tutorial-card-list">
        {blogs.map((card, index) => (
          <TutorialCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default Tutorials;
