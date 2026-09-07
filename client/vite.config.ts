import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { loadEnv } from "vite"
import { defineConfig } from "vitest/config"

import { chatApiPlugin } from "./src/server/vite-chat-plugin"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, "")

  return {
    plugins: [react(), tailwindcss(), chatApiPlugin(env.XAI_API_KEY)],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
        "@infra": path.resolve(import.meta.dirname, "../infra"),
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
    },
  }
})
