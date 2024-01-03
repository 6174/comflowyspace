// useLiveQuery.ts
import { useState, useEffect} from 'react';
import { JSONDBEvent } from './jsondb.types';
import { JSONDBClient } from './jsondb.client';
export function useLiveQuery<T>(options:{
  collectionName: string, 
  documentId?: string,
  queryFn: () => Promise<T>
}) {
  const {collectionName, documentId} = options
  const [data, setData] = useState<T>();
  const [collectionVersion, setCollectionVersion] = useState(0);
  const [docVersion, setDocVersion] = useState(0);

  useEffect(() => {
    const disposable = JSONDBClient.updateEvent.on((event: JSONDBEvent) => {
      if (event.db === collectionName) {
        setCollectionVersion((v) => v + 1);
        if (documentId && documentId === event.docId) {
         setDocVersion(v => v + 1);
        }
      }
    });
    return () => {
      disposable.dispose();
    }
  }, [collectionName, documentId]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await options.queryFn();
      setData(result);
    }
    fetchData();
  }, [collectionVersion, docVersion])

  return data;
}