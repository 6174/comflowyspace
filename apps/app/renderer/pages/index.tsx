import {useIsMobile} from "ui/utils/use-is-mobile";
import {Button} from "antd";
export default function WebsiteHomepage() {
  const isMobile = useIsMobile();
  return (
    <div className="homepage">
      homepage 
      <Button type="primary">Button</Button>
      <style jsx>{`
        .homepage {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}

