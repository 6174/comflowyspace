import { useAppStore } from "@comflowy/common/store";
import { PersistedWorkflowNode, SDNODE_DEFAULT_COLOR, SDNode, ShareAsSubflowConfig } from "@comflowy/common/types";
import { getNodeRenderInfo } from "@comflowy/common/workflow-editor/node-rendering";
import { CSSProperties, useCallback, useEffect, useState } from "react";
import {Node} from "reactflow";
import { NodeHeader } from "../reactflow-controlboard/controlboard-node";
import { Form, Input, Select, Switch } from "antd";
import { ControlBoardUtils } from "@comflowy/common/workflow-editor/controlboard";
import nodeStyles from "../reactflow-node/reactflow-node.style.module.scss";
import _ from "lodash";
import Color from "color";
import { SubflowParams, SubflowSlots } from "../reactflow-node/reactflow-subflow-node";
import { parseSubflow } from "@comflowy/common/store/subflow-state";

type ShareAsSubflowFormProps = ShareAsSubflowConfig;

/**
 * share as subflow need
 * In this module, we will have a subflow editor, which will allow user to edit the subflow and share it
 *  - User can config the inputs\outputs\params of the subflow
 * @returns 
 */
export function ShareAsSubflow() {
  const nodes = useAppStore(st => st.nodes);
  const savedControlBoardData = useAppStore(st => st.controlboard);
  const onChangeControlBoard = useAppStore(st => st.onChangeControlBoard); 
  const [form] = Form.useForm<ShareAsSubflowFormProps>();
  const [nodesToRender, setNodesToRender] = useState<Node[]>([]);

  /**
   * 1) debounced change
   * 2) attach node id
   */
  const triggerChange = useCallback(_.debounce((values: ShareAsSubflowConfig) => {
    const nodes = values.nodes.map((node, index) => {
      return {
        ...node,
        id: nodesToRender[index].id
      }
    });
    const newControlboardData = {
      ...savedControlBoardData,
      shareAsSubflowConfig: {
        ...values,
        nodes
      }
    }
    console.log("newControlboardData", newControlboardData);
    onChangeControlBoard(newControlboardData)
  }, 1000), [onChangeControlBoard, savedControlBoardData, nodesToRender]);

  /**
   * 1) Sort nodes 
   * 2) Consider node order if there is new node come, new node should append after old nodes
   * 3) Remove deleted nodes in config
   */
  useEffect(() => {
    const nodesToRender = ControlBoardUtils.autoSortNodes(nodes);
    const subflowConfigNodes = (savedControlBoardData?.shareAsSubflowConfig?.nodes || []).map(node => {
      return nodes.find(n => n.id === node.id);
    }).filter(n => !!n);
    const otherNodes = nodesToRender.filter(node => !subflowConfigNodes.find(n => n.id === node.id));
    setNodesToRender([...subflowConfigNodes, ...otherNodes]);
    form.setFieldsValue(savedControlBoardData?.shareAsSubflowConfig || {});
  }, [nodes, savedControlBoardData]);

  const onFormChange = useCallback(() => {
    const values = form.getFieldsValue();
    triggerChange(values);
  }, [form, savedControlBoardData, nodesToRender]);

  const docMeta = useAppStore(st => st.persistedWorkflow?.meta);
  const onDocAttributeChange = useAppStore(st => st.onDocAttributeChange);
  const onToggleShare = useCallback(_.debounce((value: boolean) => {
    onDocAttributeChange({
      meta: {
        ...docMeta,
        sharedAsSubflow: value
      }
    })
  }, 1000), [docMeta]);
  const onChangeShareTitle = useCallback(_.debounce((title: string) => {
    onDocAttributeChange({
      meta: {
        ...docMeta,
        shareAsSubflowTitle: title
      }
    })
  }, 1000), [docMeta]);
  return (
    <div className="share-as-subflow">
      <Form form={form} layout="vertical" autoComplete="off" onValuesChange={onFormChange} >
        <div className="section-title">
          Click to toggle share as subflow
        </div>
        <Form.Item<ShareAsSubflowFormProps>
          label={null}
          name={"shared"}
          valuePropName="checked"
        >
          <Switch size="small" onChange={checked => {
            onToggleShare(checked);
          }}/>
        </Form.Item>

        <div className="section-title">
          Preview of the subflow node
        </div>
        <PreviewSubflowNode/>

        <div className="section-title">
          Edit Basic properties
        </div>

        <div className="group">
          <Form.Item<ShareAsSubflowFormProps>
            label="Title"
            name={"title"}
          >
            <Input placeholder="Click to input the title of the subflow" onChange={ev => {
              onChangeShareTitle(ev.target.value.trim());
            }}/>
          </Form.Item>

          <Form.Item<ShareAsSubflowFormProps>
            label="Description"
            name={"description"}
          >
            <Input.TextArea placeholder="Click to add a short description for you subflow" />
          </Form.Item>
        </div>
        <div className="section-title">
          Edit Node properties
        </div>
        {nodesToRender.map((node, index) => {
          return (
            <ShareAsSubflowNodeEditor key={node.id + index} index={index} node={node} />
          )
        })}
      </Form>
    </div>
  )
}


function ShareAsSubflowNodeEditor({ node, index }: { node: Node, index }) {
  const { title, params, inputs, outputs, widget } = getNodeRenderInfo(node.data.value, node.data.widget);

  /**
   * @TODO this filter will filt out subflow node, can add this feature in later versions
   */
  if (params.length === 0 && inputs.length === 0 && outputs.length === 0) {
    return null;
  }
  return (
    <div className={`share-as-subflow-node group ${nodeStyles.reactFlowNode} `}>
      <NodeHeader
        widget={widget}
        title={title}
        node={node}
        nodeError={null}
      />
      {inputs && inputs.length > 0 && (
        <Form.Item<ShareAsSubflowFormProps>
          label="Select inputs"
          name={["nodes", index, "inputs"]}
        >
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Please select"
            options={inputs.map(input => ({ label: input.name, value: input.name }))}
          />
        </Form.Item> 
      )}

      {outputs && outputs.length > 0 && (
        <Form.Item<ShareAsSubflowFormProps>
          label="Select outputs"
          name={["nodes", index, "outputs"]}
        >
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Please select outputs"
            options={outputs.map(output => ({ label: output.name, value: output.name }))}
          />
        </Form.Item> 
      )}

      {params && params.length > 0 && (
        <Form.Item<ShareAsSubflowFormProps>
          label="Select params"
          name={["nodes", index, "fields"]}
        >
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Please select fields"
            options={params.map(param => ({ label: param.property, value: param.property }))}
          />
        </Form.Item> 
      )}
    </div>
  )
}

function PreviewSubflowNode() {
  const savedControlBoardData = useAppStore(st => st.controlboard);
  const workflow = useAppStore(st => st.persistedWorkflow);
  const {title} = savedControlBoardData?.shareAsSubflowConfig || {nodes: []};
  let nodeColor = SDNODE_DEFAULT_COLOR.color;
  let nodeBgColor = SDNODE_DEFAULT_COLOR.bgcolor;
  const widgets =useAppStore(st => st.widgets);
  const subflowRenderingInfo = parseSubflow(workflow, widgets);

  return (
    <div className="preview-subflow">
      <div className={` ${nodeStyles.reactFlowNode} `} style={{
        maxWidth: 300,
        '--node-color': nodeColor,
        '--node-border-color': nodeColor,
        '--node-bg-color': Color(nodeBgColor).alpha(.95).hexa(),
      } as CSSProperties} >
        <div className="node-inner">
          <div className="node-header">
            <h2 className="node-title">
              {title || workflow?.title}
            </h2>
          </div>
          <div className="node-main">
            <SubflowSlots subflowRenderingInfo={subflowRenderingInfo} />
            <SubflowParams subflowRenderingInfo={subflowRenderingInfo} subflowNode={{
              id: "TEST_PREVIEW_WORKFLOW"
            } as any} onChangeHandler={(val, fieldName) => {}} />
          </div>
        </div>
      </div>
    </div>
  )
}
