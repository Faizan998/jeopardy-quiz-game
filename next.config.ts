import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    domains: ['mpdrnktxxvsjkpzfeaxy.supabase.co'],
  },
  webpack: (config) => {
    // Alias all "api" imports to the '@getbrevo/brevo/src/api' directory.
    config.resolve.alias['api'] = path.join(__dirname, 'node_modules/@getbrevo/brevo/src/api');
    // Alias the missing modules.
    config.resolve.alias['ApiClient'] = path.join(__dirname, 'node_modules/@getbrevo/brevo/src/ApiClient');
    config.resolve.alias['model'] = path.join(__dirname, 'node_modules/@getbrevo/brevo/src/model');
    return config;
  },
};

export default nextConfig;