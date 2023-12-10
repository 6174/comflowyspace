import * as React from 'react'
import {useDashboardState} from "@comflowy/common/store/dashboard-state";

const Bootstrap = () => {
  const {onInit, env, loading} = useDashboardState();
  
  return (
    <div>
      <h1>Workspace</h1>
      <p></p>
    </div>
  )
}

export default Bootstrap;
