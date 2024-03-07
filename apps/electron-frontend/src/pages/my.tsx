import {KEYS, t} from "@comflowy/common/i18n";
import Layout from "@/components/layout/layout";

export default function WorkspaceMyWorkflows() {
  return (
    <Layout title="Comflowy - My workflows">
      <div className="workspace-my-workflows">
        {t(KEYS.myWorkflows)}
      </div>
    </Layout>
  );
}
