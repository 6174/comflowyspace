import * as React from "react"

function SvgComponent(props: any) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6 12.497C6 13.327 5.325 14 4.513 14A1.51 1.51 0 013 12.497C3 11.68 3.681 11 4.513 11 5.325 11 6 11.68 6 12.497zM13.5 12.497c0 .83-.675 1.503-1.488 1.503a1.51 1.51 0 01-1.512-1.503c0-.817.681-1.497 1.512-1.497.813 0 1.488.68 1.488 1.497zM21 12.497c0 .83-.675 1.503-1.488 1.503A1.51 1.51 0 0118 12.497c0-.817.681-1.497 1.512-1.497.813 0 1.488.68 1.488 1.497z"
        fill="#fff"
      />
    </svg>
  )
}

export default SvgComponent
