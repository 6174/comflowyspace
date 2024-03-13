import { SDNode, Widget } from "@comflowy/common/types";

export type NodeMenuProps = { 
  node: SDNode, 
  hide: () => void, 
  widget: Widget,
  id: string
}