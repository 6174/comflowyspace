import { useEffect, useRef, useState } from "react";
import styles from "./reactflow-dynamic-run-button.module.scss";
import { Button } from "antd";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";

/**
 * context
 */
export type ReactflowDynamicRunButtonContext = {
  node: HTMLDivElement;
}

/**
 * Dynamic run button for reactflow
 */
export function ReactflowDynamicRunButton() {
  const [context, setContext] = useState<ReactflowDynamicRunButtonContext | null>();
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const size = {
    width: 160,
    height: 46
  }

  useEffect(() => {
    const updatePosition = (node: HTMLDivElement) => {
      const nodePosition = node.getBoundingClientRect();
      setPosition({
        left: Math.min(nodePosition.left + nodePosition.width - size.width, window.innerWidth - 160 - 10),
        top: Math.min(nodePosition.top + nodePosition.height, window.innerHeight - size.height),
      });
    }
    if (context && context.node) {
      console.log("changed", context.node);
       updatePosition(context.node);

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      resizeObserverRef.current = new ResizeObserver(() => {
        updatePosition(context.node);
      });

      resizeObserverRef.current.observe(context.node);

      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }

      intersectionObserverRef.current = new IntersectionObserver(() => {
        updatePosition(context.node);
      });

      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }

      mutationObserverRef.current = new MutationObserver(() => {
        updatePosition(context.node);
      });
      mutationObserverRef.current.observe(context.node, { attributes: true, childList: true, subtree: true });

      window.addEventListener('scroll', updatePosition);

      intersectionObserverRef.current.observe(context.node);
    }

    const disposable = SlotGlobalEvent.on((ev) => {
      if (ev.type === GlobalEvents.update_dynamic_run_button_position) {
        if (context && context.node) {
          updatePosition(context.node);
        }
      }
    });

    return () => {
      disposable.dispose();
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
    };
  }, [context]);

  useEffect(() => {
    const slot = SlotGlobalEvent.on((ev) => {
      if (ev.type === GlobalEvents.show_dynamic_run_button) {
        setContext(ev.data);
      }
    });

    return () => {
      slot.dispose();
    };
  }, []);

  return (
    <div className={styles.dynamicRunButton} style={{
      left: position.left,
      top: position.top,
      // visibility: context ? "visible" : "hidden",
    }}>
      <div className="inner">
        <div className="actions">
          <Button size="small" type="primary">Click to Run Workflow</Button>
        </div>
      </div>
    </div>
  )
}