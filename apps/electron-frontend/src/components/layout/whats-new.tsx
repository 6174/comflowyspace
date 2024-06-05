/**
 * show what's new component when the app version updated
 * 1. user can click the "What's new" button to see the release notes
 * 2. user can close the what's new component by clicking the close button
 * 3. store the user viewd whats new state to localstorage, so if user closed it , next time will not see it again
 */

import { comfyElectronApi } from "@/lib/electron-bridge";
import { KEYS, t } from "@comflowy/common/i18n";
import { Badge } from "antd";
import { useCallback, useEffect, useState } from "react";
import { FlagIcon } from "ui/icons";

const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION;
export function WhatsNew() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const viewed = getWhatsNewViewed(currentVersion)
    setShow(!viewed);
  }, []);

  const clickWhatsNew = useCallback(() => {
    comfyElectronApi.openURL("https://comflowy.com/change-log")
    if (show) {
      setShow(false);
      setWhatsNewViewed(currentVersion)
    }
  }, [show]);

  return (
    <div className="whats-navs item" onClick={clickWhatsNew}>
      <div className="action" onClick={ev => {
        ev.preventDefault();
      }}>
        <div className="icon"><FlagIcon /></div>
        {show ? (
          <Badge count={"New"}>
            <div style={{paddingRight: 30}} className="text">{t(KEYS.whatsnew)}</div>
          </Badge>
        ): (
          <div className="text">{t(KEYS.whatsnew)}</div>
        )}
      </div>
    </div>
  )
}

function getWhatsNewViewed(version: string) {
  try {
    const viewed = localStorage.getItem('viewed_whats_new');
    if (!viewed) {
      return false;
    }
    const viewedJson = JSON.parse(viewed) as Record<string, boolean>;
    if (viewedJson[version]) {
      return true;
    }
    return false;
  } catch(err) {
    return false;
  }
}

function setWhatsNewViewed(version: string) {
  const viewed = localStorage.getItem('viewed_whats_new');
  try {
    let viewedJson = {};
    if (viewed) {
      viewedJson = JSON.parse(viewed);
    }
    viewedJson[version] = true;
    localStorage.setItem('viewed_whats_new', JSON.stringify(viewedJson));
  } catch(err) {
    console.log(err);
  }
}


 