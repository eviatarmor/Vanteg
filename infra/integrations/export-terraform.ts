import { writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { terraformOAuthApps } from "../../packages/integrations/src/index.ts"

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../terraform/oauth_apps.auto.tf.json")
writeFileSync(out, `${JSON.stringify({ locals: { oauth_apps: terraformOAuthApps() } }, null, 2)}\n`)
console.log(`wrote ${out}`)
