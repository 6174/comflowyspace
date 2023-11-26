// import React from "react";
// import { LoadingIcon } from "./loading-icon";
export default function LoadMoreIndicator() {
  return (
    <div className={"load-more"} style={{
      display: "flex",
      justifyContent: "center",
      alignContent: "center"
    }}>
      {/* <LoadingIcon/> */}
      <div className="load-text">
        Loading...
      </div>
    </div>
  )
}