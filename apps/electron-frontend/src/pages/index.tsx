import Bootstrap from "@/components/bootstrap/bootstrap";
import Layout from "@/components/layout/layout";
import MyWorkflow from "@/components/my-workflows/my-workflows";
import { useDashboardState } from "@comflowy/common/store/dashboard-state";
export default function WorkspaceHome() {
  const {onInit, env, loading, bootstraped} = useDashboardState();

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
