import * as React from "react"

function SvgComponent(props) {
  return (
    <svg
      width={29}
      height={30}
      viewBox="0 0 29 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M11.26 18.616l2.708-2.707 2.707 2.707a.72.72 0 001.013 0 .72.72 0 000-1.012l-2.708-2.708 2.708-2.708a.72.72 0 000-1.012.72.72 0 00-1.012 0l-2.708 2.708-2.708-2.708a.72.72 0 00-1.012 0 .72.72 0 000 1.012l2.708 2.708-2.708 2.708a.72.72 0 000 1.012.72.72 0 001.012 0z"
        fill="#fff"
      />
    </svg>
  )
}

export default SvgComponent
