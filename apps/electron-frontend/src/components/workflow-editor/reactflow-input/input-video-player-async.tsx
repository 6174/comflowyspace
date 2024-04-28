import { Suspense, lazy, useEffect, useState } from "react";
import { isWindow } from "ui/utils/is-window";

const AsyncCO = lazy(async () => {
  return await import("./input-video-player");
});

export function AsyncVideoPlayer(props: {url: string}) {
  const [showFrontEndCode, setShowFrontEndCode] = useState(false);
  useEffect(() => {
    if (isWindow) {
      setShowFrontEndCode(true);
    }
  }, [])
  if (!showFrontEndCode) {
    return null;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncCO {...props}/>
    </Suspense>
  );
}