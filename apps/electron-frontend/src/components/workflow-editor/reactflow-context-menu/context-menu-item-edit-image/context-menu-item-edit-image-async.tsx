import { SDNode } from "@comflowy/common/types";
import { Suspense, lazy, useEffect, useState } from "react";
import { isWindow } from "ui/utils/is-window";

const AsyncCO = lazy(async () => {
  return await import("./context-menu-item-edit-image-modal");
});


export function AsyncImageEditor(props: {
  node: SDNode,
  id: string,
  onSave: (blob: Blob) => Promise<void>;
}) {
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