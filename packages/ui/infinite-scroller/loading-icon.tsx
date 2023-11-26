// import Lottie, { AnimationItem } from "lottie-web";
// import React, { useEffect, useRef, useState } from "react";
// import loadingLottieData from "./loading-lottie.json";

// export function LoadingIcon(props: {
//   size?: number
// }) {
//   const {size = 24} = props;
//   const iconRef = useRef();
//   // const [animation, setAnimation] = useState<AnimationItem>(null);
//   useEffect(() => {
//     if (iconRef) {
//       var animation = Lottie.loadAnimation({
//         container: iconRef.current,
//         renderer: 'svg',
//         loop: true,
//         autoplay: true,
//         animationData: loadingLottieData,
//       });
//       animation.setSpeed(2);
//       // setAnimation(animation);
//     }
//     return () => {
//       animation.destroy();
//     }
//   }, [iconRef]);

//   return (
//     <div className="loadingIcon" style={{ width: size, height: size }} >
//       <div className="icon" ref={iconRef}> </div>
//     </div>
//   )
// }