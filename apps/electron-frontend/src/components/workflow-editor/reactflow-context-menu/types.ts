import { SDNode, Widget } from "@comflowy/common/comfui-interfaces";

export type NodeMenuProps = { 
  node: SDNode, 
  hide: () => void, 
  widget: Widget,
  id: string
}