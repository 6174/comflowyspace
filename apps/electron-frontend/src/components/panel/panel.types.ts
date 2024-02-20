export type Panel = {
  title: string;
  content: string;
  id: string;
}

export type PanelContainerProps = {
  panels: Panel[];
  children: React.ReactNode;
}