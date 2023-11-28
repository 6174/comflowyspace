import * as React from "react"

function SvgComponent(props: any) {
  return (
    <svg
      width={12}
      height={8}
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        opacity={0.5}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.852 2.169a.635.635 0 010 .814L6.357 5.83a.461.461 0 01-.714 0L3.148 2.983a.635.635 0 010-.814.461.461 0 01.713 0L6 4.61 8.14 2.17a.461.461 0 01.712 0z"
        fill="#90919E"
      />
    </svg>
  )
}

export default SvgComponent
