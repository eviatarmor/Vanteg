import {
  createMockIntegrationsAdapter,
  type IntegrationsAdapter,
} from "@workspace/integrations"

let adapter: IntegrationsAdapter = createMockIntegrationsAdapter()

export function getIntegrationsAdapter(): IntegrationsAdapter {
  return adapter
}

export function setIntegrationsAdapter(next: IntegrationsAdapter) {
  adapter = next
}

export function resetIntegrationsAdapter() {
  adapter = createMockIntegrationsAdapter()
}
