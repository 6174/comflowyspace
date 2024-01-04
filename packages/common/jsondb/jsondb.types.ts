export type JSONCollectionMeta = {
  name: string
  docs: string[]
  docsMeta: Record<string, any>
}

export type JSONDocMeta = {
  id: string,
  create_at: number,
  update_at?: number,
  deleted?: boolean,
  deleted_at?: number
}

export type JSONDBEvent = {
  type: "DELETE" | "DELETE_HARD" | "UPDATE" | "CREATE",
  db: string
  docId: string
}

export type JSONDBReponse<T = any> = {
  success: boolean;
  error?: string;
  data: T
}