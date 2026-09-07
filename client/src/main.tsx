import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"
import { Toaster } from "sonner"

import { TooltipProvider } from "@workspace/ui/components/tooltip"
import "@workspace/ui/globals.css"

import { router } from "@/app/router"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="bottom-right" />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
)
