import { useEffect, useState } from 'react';
import styles from './tutorials.style.module.scss';
import { openExternalURL } from '@/lib/electron-bridge';
import  useTutorialStore  from './tutorial.store';

interface TutorialCardProps {
  image: string;
  title: string;
  url: string;
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

const Tutorials = () => {
  const { tutorials, fetchTutorials } = useTutorialStore();

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

  console.log(tutorials);

  return (
    <div className={styles.tutorials}>
      <h2>Tutorials</h2>
      <div className="tutorial-card-list">
        {tutorials.map((card, index) => (
          <TutorialCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default Tutorials;
