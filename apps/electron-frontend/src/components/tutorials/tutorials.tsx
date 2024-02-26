import { useEffect, useState } from 'react';
import styles from './tutorials.style.module.scss';
import { openExternalURL } from '@/lib/electron-bridge';
import  useTutorialStore  from './tutorial.store';

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
      <h2>Tutorials</h2>
      <div className="tutorial-banner-list">
        {getstartedTutorials.map((card, index) => (
          <TutorialBanner key={index} {...card} />
        ))}
      </div>
      <div className="h3" >Fundamentals</div>
      <div className="p">I strongly suggest that you first learn the fundamentals of Stable Diffusion. This will give you a better understanding of the principles behind AI image generation, and you will be able to use Comflowy more effectively:</div>
      <div className="tutorial-card-list">
        {sdTutorials.map((card, index) => (
          <TutorialCard key={index} {...card} />
        ))}
      </div>
      <div className="h3">Text-to-image</div>
      <div className="p">If you're interested in further learning about text-to-image generation techniques, you can check out the following sections:</div>
      <div className="tutorial-card-list">
        {texttoimageTutorials.map((card, index) => (
          <TutorialCard key={index} {...card} />
        ))}
      </div>
      <div className="h3" >Image-to-image</div>
      <div className="p">If you'd like to learn some image-to-image generation techniques, you can check out the following sections:</div>
      <div className="tutorial-card-list">
        {imagetoimageTutorials.map((card, index) => (
          <TutorialCard key={index} {...card} />
        ))}
      </div>
      <div className="h3" >Best Practices</div>
      <div className="p">In addition to the basic tutorials, there are also some best practice cases that you can refer to and try out:</div>
      <div className="tutorial-card-list">
        {blogs.map((card, index) => (
          <TutorialCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default Tutorials;
