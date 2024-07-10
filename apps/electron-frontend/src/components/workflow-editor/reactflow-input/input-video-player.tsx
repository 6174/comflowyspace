import React, { useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

interface InputVideoPlayerProps {
  url: string;
  controls?: boolean;
}

const InputVideoPlayer: React.FC<InputVideoPlayerProps> = ({ url, controls }) => {
  const playerRef = useRef(null);

  useEffect(() => {
    if (playerRef.current) {
      // Start loading the video when the component mounts
      // playerRef.current.load();
    }
  }, []);

  return (
    <ReactPlayer ref={playerRef} url={url} controls={controls ?? true} />
  );
};

export default InputVideoPlayer;