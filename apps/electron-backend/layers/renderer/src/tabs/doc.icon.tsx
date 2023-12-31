import * as React from "react"

function SvgComponent(props) {
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
        d="M6.262 17.843c.207 0 .396-.07.647-.214l3.05-1.645 3.328 1.865c.264.144.54.213.81.213.264 0 .52-.063.753-.2l3.12-1.758c.434-.245.622-.59.622-1.068v-8.43c0-.535-.32-.855-.848-.855-.207 0-.395.082-.653.22l-3.164 1.758-3.29-1.984a1.504 1.504 0 00-1.5-.013L6.036 7.497c-.433.244-.628.577-.628 1.054v8.444c0 .534.32.848.854.848zm3.133-2.982l-2.58 1.418c-.044.02-.082.038-.114.038-.075 0-.113-.056-.113-.144V8.878c0-.176.063-.29.226-.383L9.187 7.12c.07-.044.132-.075.208-.113v7.854zm1.193.03V7.159c.062.03.131.069.194.106l2.63 1.589v7.62c-.081-.043-.163-.087-.25-.137l-2.575-1.444zm4.024 1.67V8.734l2.58-1.406a.209.209 0 01.1-.031c.076 0 .126.056.126.138v7.257c0 .182-.063.295-.232.39L14.9 16.404a3.254 3.254 0 01-.288.157z"
        fill="#fff"
      />
    </svg>
  )
}

export default SvgComponent
