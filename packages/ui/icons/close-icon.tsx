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
        d="M6.162 16.33a.871.871 0 00.007 1.212.878.878 0 001.213.008l4.61-4.618 4.618 4.618a.871.871 0 001.213-.008c.324-.339.332-.889 0-1.213l-4.61-4.618 4.61-4.61a.864.864 0 000-1.213c-.339-.324-.889-.332-1.213-.008l-4.617 4.618L7.381 5.88c-.316-.316-.889-.331-1.213.008A.878.878 0 006.162 7.1l4.618 4.61-4.618 4.618z"
        fill="#fff"
        opacity={0.8}
      />
    </svg>
  )
}

export default SvgComponent
