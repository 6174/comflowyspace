import { useEffect, useState } from 'react';
import styles from './tutorials.style.module.scss';
import { openExternalURL } from '@/lib/electron-bridge';
import { tutorialCards } from './tutorialData';

interface TutorialCardProps {
  image: string;
  url: string;
}

const TutorialCard: React.FC<TutorialCardProps> = ({ image, title, url }) => {
  return (
    <div className="tutorial-card" onClick={() => openExternalURL(url)}>
      <img className="image"src={image} alt={title} />
    </div>
  );
};

const Tutorials = () => {
  return (
    <div className={styles.tutorials}>
      <h2>Tutorials</h2>
      <div className="tutorial-card-list">
        {tutorialCards.map((card, index) => (
          <TutorialCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default Tutorials;
