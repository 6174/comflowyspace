import Bootstrap from "@/components/bootstrap/bootstrap";
import Layout from "@/components/layout/layout";
import MyWorkflow from "@/components/my-workflows/my-workflows";
import { useAppStore } from "@comflowy/common/store";
import { useDashboardState } from "@comflowy/common/store/dashboard-state";
import { useEffect } from "react";

export default function WorkspaceHome() {
  const {bootstraped} = useDashboardState();
  
  const {onInit} = useAppStore();
    useEffect(() => {
    if (typeof window !== 'undefined' && bootstraped) {
      onInit();
    }
  }, [bootstraped]);

  if (!bootstraped) {
    return (
      <Bootstrap/>
    )
  }

  return (
    <Layout title="Comflowy - Workspace Home">
      <MyWorkflow/>
    </Layout>
  );
}
