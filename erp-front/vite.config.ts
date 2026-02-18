import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["."],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
    },
  },

  build: {
    outDir: "dist/spa",
    sourcemap: false, // Disable for production for better performance
    emptyOutDir: true, // Clear the dist folder before building

    minify: "terser",
    terserOptions: {
      compress: { drop_console: true },
    },

    
  },
  plugins: [react()],
  base: "/", // This is crucial for subdomain deployment

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@assets": path.resolve(__dirname, "./client/assets"),
    },
  },
}));

