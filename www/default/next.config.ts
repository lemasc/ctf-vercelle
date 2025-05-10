import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  webpack: (config, context) => {
    config.watchOptions = {
      // https://github.com/vercel/next.js/issues/36774#issuecomment-1211818610
      // https://webpack.js.org/configuration/watch/
      ignored: "**/node_modules",
      poll: 3000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

export default nextConfig;
