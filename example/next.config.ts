import type { NextConfig } from "next";


const currentDir = __dirname;

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: currentDir
  }
};

export default nextConfig;
