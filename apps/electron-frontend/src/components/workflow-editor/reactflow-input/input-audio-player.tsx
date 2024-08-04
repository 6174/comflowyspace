import React, { useEffect, useRef } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import styles from "./input-audio-player.module.scss";
interface InputAudioPlayerProps {
  url: string;
  loop?: boolean;
  muted?: boolean;
}

const InputAudioPlayer: React.FC<InputAudioPlayerProps> = (props: { url, controls, loop, muted, playing }) => {
  const playerRef = useRef(null);

  useEffect(() => {
    if (playerRef.current) {
      // Start loading the video when the component mounts
      // playerRef.current.load();
    }
  }, []);

  return (
    <div className={styles.audioPlayer}>
      <AudioPlayer 
        ref={playerRef} 
        src={props.url} 
        showSkipControls={false}
        showJumpControls={false}
        showDownloadProgress={false}
        loop={props.loop} 
        muted={props.muted}
        customAdditionalControls={[]}
      />
    </div>
  );
};

export default InputAudioPlayer;