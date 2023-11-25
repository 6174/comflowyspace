import { useState, useEffect } from 'react';


export function useIsMobile() {

  const [isMobile, setIsMobile] = useState<boolean>(false);

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  useEffect(() => {
    setIsMobile(checkIsMobile(navigator.userAgent));
  }, [ua]);

  return isMobile;
}


function checkIsMobile(ua: string) {
  if (!ua) return false;
  const isMobile = Boolean(ua.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  ));
  return isMobile;
}