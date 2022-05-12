import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

export default defineConfig({
  plugins: [reactRefresh()],
  resolve: {
    alias: [
      {
        find: /^@material-ui\/icons\/(.*)/,
        replacement: "@material-ui/icons/esm/$1",
      },
      {
        find: /^@material-ui\/core\/(.+)/,
        replacement: "@material-ui/core/es/$1",
      },
      {
        find: /^@material-ui\/core$/,
        replacement: "@material-ui/core/es",
      },
    ],
  },
  define: {
    global: "window", // fix for packages that support both node and browser,
    "process.env": {}, // fix for packages that depends on process.env
  },
});
