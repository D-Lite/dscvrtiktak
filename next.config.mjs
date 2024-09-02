import withBundleAnalyzer from "@next/bundle-analyzer"
import withPlugins from "next-compose-plugins"

/**
 * @type {import('next').NextConfig}
 */
const config = withPlugins([[withBundleAnalyzer({ enabled: false })]], {
  output: "export",
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    if (dev) {
      Object.defineProperty(config, 'devtool', {
        get() {
            return "cheap-source-map";
        },
        set() {},
    });
    }
    return config;
  }
})

export default config
