import * as React from "react"

function SvgComponent(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="#1C1C1E"
        d="M12 16.231a1.12 1.12 0 00.817-.37l6.68-6.837c.193-.193.299-.44.299-.73 0-.58-.457-1.045-1.037-1.045-.282 0-.554.114-.756.316l-5.994 6.161-6.012-6.16a1.094 1.094 0 00-.756-.317c-.58 0-1.037.465-1.037 1.046 0 .29.106.536.299.73l6.688 6.837c.238.246.501.37.809.37z"
      />
    </svg>
  )
}

export default SvgComponent
