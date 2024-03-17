import { JSONDBClient } from "@comflowy/common/jsondb/jsondb.client";
import { documentDatabaseInstance } from "@comflowy/common/storage";
import { PersistedFullWorkflow, PersistedWorkflowNode, SUBFLOW_WIDGET_TYPE_NAME } from "@comflowy/common/types";
import { Input, Popover, Tooltip } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { FileNameIcon, SearchIcon, WorkflowIcon } from "ui/icons";
import styles from "./create-subflow-node.module.scss";
import { maxMatchLengthSearch } from "@comflowy/common/utils/search";
import { useAppStore } from "@comflowy/common/store";
import { openTabPage } from "@/lib/electron-bridge";
import { useRouter } from "next/router";
/**
 * create subflow entry button
 */
export function CreateSubflowNodeEntry() {
  const [id, setId] = useState(0);
  const handleVisibleChange = (visible: boolean) => {
    setId(id + 1);
  }

  return (
    <Popover
      title={null}
      content={<SubflowNodeList id={id}/>}
      trigger="click"
      arrow={false}
      align={{ offset: [0, -26] }}
      placement="top"
      onOpenChange={handleVisibleChange}
    >
      <Tooltip title={"Add subflow node"}>
        <div className="action action-node-picker">
            <WorkflowIcon />
        </div>
      </Tooltip>
    </Popover>
  )
}

export function SubflowNodeList(props: {id: number}) {
  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [err, setError] = useState<string>();
  const router = useRouter();
  const currentDocId = router.query.id as string;
  const docs = (JSONDBClient.useLiveDoc<PersistedFullWorkflow[]>({
    collectionName: "workflows",
    queryFn: async (): Promise<PersistedFullWorkflow[]> => {
      setError(null);
      try {
        const docs = await documentDatabaseInstance.getDocs();
        return docs.filter(doc => {
          return doc.id !== currentDocId && doc.meta?.sharedAsSubflow
        });
      } catch (err) {
        console.log("fetch documents", err);
        setError(err.message);
      }
      return [];
    }
  }) || []).filter(doc => !doc.deleted);
  
  useEffect(() => {
    setSearchValue('');
  }, [props.id]);

  const handleSearch = useCallback((searchValue: string) => {
    setSearchValue(searchValue);
    const lowercaseSearchValue = searchValue.toLowerCase();
    const findedResult = docs.filter(doc => {
      const search_string = (doc.title + doc.description).toLowerCase();
      const maxMatch = maxMatchLengthSearch(lowercaseSearchValue, search_string);
      if (maxMatch >= 4) {
        return true;
      }
    });

    const reordered = findedResult.sort((a, b) => {
      const aSearchString = (a.title + a.description).toLowerCase();
      const bSearchString = (b.title + b.description).toLowerCase();
      const aMatch = maxMatchLengthSearch(lowercaseSearchValue, aSearchString);
      const bMatch = maxMatchLengthSearch(lowercaseSearchValue, bSearchString);

      // Check for exact matches and prioritize them
      if (lowercaseSearchValue === aSearchString && lowercaseSearchValue !== bSearchString) {
        return -1;
      } else if (lowercaseSearchValue !== aSearchString && lowercaseSearchValue === bSearchString) {
        return 1;
      }

      return bMatch - aMatch;
    });

    setSearchResult(reordered);

  }, [docs]);

  return (
    <div className={styles.createSubflowNodeList}>
      <div className="search-box">
        <Input
          autoFocus={true}
          prefix={<SearchIcon />}
          placeholder="Search subflows"
          onChange={(e) => handleSearch(e.target.value)}
          value={searchValue}
        />
      </div>
      <div className="subflow-list">
        {docs && docs.map(doc => {
          return <CreateSubflowNodeItem doc={doc} key={doc.id}/>
        })}
      </div>
    </div>
  )
}

function CreateSubflowNodeItem(props: {
  doc: PersistedFullWorkflow,
  onNodeCreated?: (node: PersistedWorkflowNode) => void
}) {
  const doc = props.doc;
  const ref = useRef<HTMLDivElement>();
  const onDragStart = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    const widgetInfo = JSON.stringify({
      type: SUBFLOW_WIDGET_TYPE_NAME,
      workflow: doc
    });
    event.dataTransfer.setData('application/reactflow', widgetInfo);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const editorInstance = useAppStore(st => st.editorInstance)
  const onAddSubflowNode = useAppStore(st => st.onAddSubflowNode);
  const createNewNode = useCallback(async (ev: React.MouseEvent) => {
    const rect = ref.current.getBoundingClientRect();
    const pos = editorInstance.screenToFlowPosition({
      x: rect.left + rect.width + 40,
      y: ev.clientY - 100
    });

    const node = onAddSubflowNode(doc, pos);
    props.onNodeCreated && props.onNodeCreated(node);
  }, [ref, doc]);
  
  const [isHovered, setIsHovered] = useState(false);
  
  const openPage = () => {
    openTabPage({
      name: doc.title,
      pageName: "app",
      query: `id=${doc.id}`,
      id: 0,
      type: "DOC"
    });
  }
  
  return (
    <div className="subflow-node action dndnode"
      draggable
      ref={ref}
      onClick={ev => {
        createNewNode(ev);
      }}
      onDragStart={onDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      >
      <div className="icon">
        <WorkflowIcon />
      </div>
      <div className="info">
        <div className="title">{props.doc.title}</div>
        <div className="description">{props.doc.description}</div>
      </div>
      {isHovered && (
        <div onClick={(ev) => {
          ev.stopPropagation();
          openPage();
        }} className="pin-button" style={{ position: "relative", top: 2}}>
          <FileNameIcon/>
        </div>
      )}
    </div>
  )
}