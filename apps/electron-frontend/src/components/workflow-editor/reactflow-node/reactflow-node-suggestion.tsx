import { useAppStore } from "@comflowy/common/store";
import { SDNode, Widget, Widgets } from "@comflowy/common/types";
import { wordSplitSearchAdvance } from "@comflowy/common/utils/search";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import { Space } from "antd";
import { useEffect, useState } from "react";
import { DraggableModal } from "ui/antd/draggable-modal";

/**
 * 当遇到节点不存在的时候，全局弹框进行节点推荐
 */
export function ReplaceNodeSuggestionModal() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [node, setNode] = useState<SDNode | null>(null);
  const [suggestions, setSuggestions] = useState<Widget[]>([]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    if (node) {
      const widgets = useAppStore.getState().widgets;
      const suggestions = findSuggestionNode(node, widgets);
      setSuggestions(suggestions);
    }
  }, [node]);

  useEffect(() => {
    SlotGlobalEvent.on((ev) => {
      if (ev.type === GlobalEvents.show_execution_error) {
        const sdnode = ev.data.node;
        setNode(sdnode);
        showModal();
      }
    })
  }, [])

  const $title = (
    <Space style={{
      lineHeight: "14px"
    }}>
      <span>Node Suggestions</span>
    </Space>
  )

  return (
    <DraggableModal
      open={isModalVisible}
      title={$title}
      onOk={handleOk} onCancel={handleCancel} footer={null}
      >
      suggestion modal 
    </DraggableModal>
  )
}

/**
 * 根据 sdnode 的信息，找到推荐的节点
 * @param node 
 * @returns 
 */
export function findSuggestionNode(node: SDNode, widgets: Widgets): Widget[] {
  const inputs = node.inputs;
  const outputs = node.outputs;
  const widget = widgets[node.widget];
  const node_title = node.title;

  // 如果已经有 widget 了, 那么什么都不推荐
  if (widget) {
    return [];
  }

  // 推荐算法
  // 如果你 widget 和输入和输出一致，并且 widget 的 dispplay_name 和 name 有较大的相似性，那么就作为推荐，相似度越高，排序越靠前
  // title 的相似性用 maxMatchLengthSearch 方法来计算，这个方法输入两个字符串，返回最大匹配长度
  const matchedSlotWidget = Object.entries(widgets).filter(([_, widget]) => {
    const widget_inputs = Object.keys({...widget.input.required, ...widget.input.optional});
    const widget_outputs = widget.output;
    // 如果 widget_inputs 和 widget_outputs 全包含 inputs 和 outputs，那么就是匹配的
    const inputMatch = inputs.every(input => widget_inputs.includes(input.name));
    const outputMatch = outputs.every(output => widget_outputs.includes(output.name as any));
    return inputMatch && outputMatch;
  }).map(([name, widget]) => {
    return widget
  });

  // 如果有匹配的，那么根据 title 的相似性排序
  const sortedWidgets = matchedSlotWidget.sort((widget1, widget2) => {
    const title1 = widget1.display_name + widget1.name;
    const title2 = widget2.display_name + widget2.name;
    return wordSplitSearchAdvance(title1, node_title) - wordSplitSearchAdvance(title2, node_title);
  });

  return sortedWidgets;
}