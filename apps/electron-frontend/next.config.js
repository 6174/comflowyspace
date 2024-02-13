const path = require("path");
const { withSentryConfig } = require("@sentry/nextjs");
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
  webpack(config, { dev }) {
    if (!dev) {
      config.optimization.minimize = false;
    }
    return config;
  },
  sentry: {
  }
}
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, configFile, stripPrefix, urlPrefix, include, ignore

  org: "httpscomflowycom",
  project: "javascript-nextjs",

  // An auth token is required for uploading source maps.
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: true, // Suppresses all logs

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};


module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
