import {useIsMobile} from "ui/utils/use-is-mobile";

export default function WebsiteHomepage() {
  const isMobile = useIsMobile();
  return (
    <div className="homepage">
      homepage
      <style jsx>{`
        .homepage {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}

