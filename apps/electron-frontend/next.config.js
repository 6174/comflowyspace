const path = require("path");
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export',
  transpilePackages: ["ui", "@comflowy/common", "antd", "@ant-design"],
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  }
}

module.exports = nextConfig
