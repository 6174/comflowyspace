import * as React from "react"

function SvgComponent(props: any) {
  return (
    <svg
      width={24}
      height={25}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6.81 19.255h10.373c1.635 0 2.486-.844 2.486-2.456V7.631c0-1.612-.851-2.456-2.486-2.456H6.809c-1.627 0-2.478.836-2.478 2.456v9.168c0 1.612.851 2.456 2.478 2.456zm-.008-1.5c-.625 0-.972-.323-.972-.986v-6.93c0-.664.347-.988.972-.988H17.19c.625 0 .971.324.971.987v6.931c0 .663-.346.987-.971.987H6.8zm1.288-6.2h7.827c.272 0 .475-.21.475-.489a.462.462 0 00-.475-.467H8.09a.464.464 0 00-.482.467c0 .279.203.49.482.49zm0 2.223h7.827a.462.462 0 00.475-.467.476.476 0 00-.475-.49H8.09a.478.478 0 00-.482.49c0 .264.203.467.482.467zm0 2.223h4.942a.462.462 0 00.475-.468.47.47 0 00-.475-.482H8.09a.471.471 0 00-.482.482c0 .264.203.468.482.468z"
        fill="#fff"
      />
    </svg>
  )
}

export default SvgComponent
