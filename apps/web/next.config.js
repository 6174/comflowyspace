const path = require("path");
const withMDX = require('@next/mdx')();
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["ui", "antd"],
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
};

module.exports = withMDX(nextConfig)
