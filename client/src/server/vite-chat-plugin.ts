import type { IncomingMessage, ServerResponse } from "node:http"
import type { Connect, Plugin, PreviewServer, ViteDevServer } from "vite"

import { handleChatRequest } from "./chat-handler"

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

async function pipeWebResponse(webResponse: Response, res: ServerResponse) {
  res.statusCode = webResponse.status
  webResponse.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })
  if (!webResponse.body) {
    res.end()
    return
  }
  const reader = webResponse.body.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    res.write(Buffer.from(value))
  }
  res.end()
}

function attachChatApi(middlewares: Connect.Server, apiKey?: string) {
  middlewares.use(async (req, res, next) => {
    const path = req.url?.split("?")[0]
    if (path !== "/api/chat" || req.method !== "POST") {
      next()
      return
    }

    try {
      const body = await readBody(req)
      const webRequest = new Request("http://vanteg.local/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: new Uint8Array(body),
      })
      const webResponse = await handleChatRequest(webRequest, { apiKey })
      await pipeWebResponse(webResponse, res)
    } catch (error) {
      res.statusCode = 500
      res.setHeader("content-type", "text/plain")
      res.end(error instanceof Error ? error.message : "Chat failed")
    }
  })
}

export function chatApiPlugin(apiKey?: string): Plugin {
  return {
    name: "vanteg-chat-api",
    configureServer(server: ViteDevServer) {
      attachChatApi(server.middlewares, apiKey)
    },
    configurePreviewServer(server: PreviewServer) {
      attachChatApi(server.middlewares, apiKey)
    },
  }
}
