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
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.module.rules.push({
        test: /\.worker\.ts$/,
        loader: 'worker-loader',
        options: {
          filename: 'static/[hash].worker.js',
          publicPath: '/_next/',
        },
      });
    }
    return config;
  },
}

module.exports = nextConfig
