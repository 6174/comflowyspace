import { dt } from "@comflowy/common/i18n";
import { Input, NODE_GET_SELECT_FIELD_NAME, SetNodeInfo } from '@comflowy/common/types';
import { useAppStore } from "@comflowy/common/store";
import { NODE_SET, SDNode, Widget } from "@comflowy/common/types";
import { useMemo } from "react";
import { Edge } from "reactflow";
import { Select, Input as AntInput, message} from "antd";

type GetSetNodeInputProps = {
  widget: Widget,
  node: SDNode,
  value: string,
  input: Input;
  id: string;
  onChange: (val: any) => void;
  name: string;
}
export function InputGetNodeField({ widget, node, value, id, onChange, name }: GetSetNodeInputProps){
  const setNodesInfos = useSetNodesInfo();
  const options = setNodesInfos.map(info => {
    const referenceInfo = (
      <span style={{
        fontSize: 11,
        opacity: .4
      }}>{"("}{info.reference.referenceNode.widget}{">"}{info.reference.referenceField}{")"}</span>
    )
    return {
      referenceInfo,
      label: (
        <>
          <span>{info.field}</span>
          {referenceInfo}
        </>
      ),
      value: info.field
    }
  });

  const currentInfo = options.find(info => info.value === value);

  return (
    <>
      <div className='node-input-label-box get-node-field'>
        <div className='node-input-label-name'>
          <div className='label' style={{
            maxWidth: 10
          }}>Name</div>
        </div>
        <div className='node-input-label-content nopan nodrag'>
          <Select
            value={value}
            showSearch
            popupMatchSelectWidth={false}
            onChange={onChange}
            options={options}
          />
        </div>
      </div>
      <div className="reference-info">
        {currentInfo?.referenceInfo}
      </div>
    </>
  );
}

export function InputSetNodeField({ widget, node, value, id, onChange, name }: GetSetNodeInputProps) {
  const setNodesInfos = useSetNodesInfo();
  const currentInfo = setNodesInfos.find(info => info.id === id);
  let referenceInfo = null;
  if (currentInfo) {
    referenceInfo = (
      <span style={{
        fontSize: 11,
        opacity: .4
      }}>{"("}{currentInfo.reference.referenceNode.widget}{">"}{currentInfo.reference.referenceField}{")"}</span>
    )
  }
  return (
    <>
      <div className='node-input-label-box set-node-field'>
        <div className='node-input-label-name'>
          <div className='label' style={{
            maxWidth: 10
          }}>Name</div>
        </div>
        <div className='node-input-label-content nopan nodrag'>
          <AntInput
            type='text'
            value={value}
            onChange={(ev) => {
              if (ev.target.value === "") {
                return;
              }
              if (setNodesInfos.find(info => info.field === ev.target.value)) {
                message.warning("Field name already exists");
                return
              }
              onChange(ev.target.value);
            }}
          />
        </div>
      </div>
      <div className="reference-info">
        {referenceInfo}
      </div>
    </>
  );
}


function useSetNodesInfo(): SetNodeInfo[] {
  const graph = useAppStore(st => st.graph);
  const connections = useAppStore(st => st.edges);
  const widgets = useAppStore(st => st.widgets);

  const infos = useMemo(() => {
    const infos: SetNodeInfo[] = [];
    connections.forEach(edge => {
      const target = graph[edge.target];
      const source = graph[edge.source];
      if (target.widget === NODE_SET) {
        const sourceWidget = widgets[source.widget];
        // const sourceOuputs = sourceWidget.output;
        infos.push({
          reference: {
            id: source.id,
            referenceNode: source,
            referenceField: edge.sourceHandle!,
            edge
          },
          id: target.id,
          field: target.fields[NODE_GET_SELECT_FIELD_NAME]
        })
      }
    });
    return infos;
  }, [connections, graph, widgets]);

  return infos;
}