import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector"

import {
  getAgentModel,
  getAgentProvider,
  modelsByProvider,
  type AgentModel,
  type AgentProviderId,
} from "../model/types"

export function AgentModelSelect({
  value,
  onChange,
  compact = false,
  size,
  providers,
  isModelAvailable,
  unavailableHint,
}: {
  value: AgentModel
  onChange: (value: AgentModel) => void
  compact?: boolean
  size?: "sm" | "default"
  providers?: readonly AgentProviderId[]
  isModelAvailable?: (model: AgentModel) => boolean
  unavailableHint?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = getAgentModel(value)
  const selectedProvider = getAgentProvider(selected.provider)
  const triggerSize = size ?? (compact ? "sm" : "default")

  return (
    <ModelSelector open={open} onOpenChange={setOpen}>
      <ModelSelectorTrigger asChild>
        <Button
          type="button"
          variant="outline"
          id="agent-model"
          aria-label="Model"
          size={triggerSize}
          className={
            compact
              ? "justify-between gap-2 bg-card px-2 font-normal"
              : "w-full justify-between bg-card font-normal"
          }
        >
          <span className="flex min-w-0 items-center gap-2">
            <ModelSelectorLogo provider={selectedProvider.logo} />
            <ModelSelectorName>{selected.label}</ModelSelectorName>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="Search models" />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          {unavailableHint ? (
            <p className="px-2 py-1.5 text-xs whitespace-normal text-muted-foreground">
              {unavailableHint}
            </p>
          ) : null}
          {modelsByProvider()
            .filter(
              ({ provider }) => !providers || providers.includes(provider.id)
            )
            .map(({ provider, models }) => (
              <ModelSelectorGroup heading={provider.name} key={provider.id}>
                {models.map((model) => {
                  const available =
                    !isModelAvailable || isModelAvailable(model.value)
                  return (
                    <ModelSelectorItem
                      key={model.value}
                      value={`${provider.name} ${model.label}`}
                      data-checked={model.value === value}
                      disabled={!available}
                      onSelect={() => {
                        if (!available) {
                          return
                        }
                        onChange(model.value)
                        setOpen(false)
                      }}
                    >
                      <ModelSelectorLogo provider={provider.logo} />
                      <ModelSelectorName>{model.label}</ModelSelectorName>
                      {available ? null : (
                        <span className="text-xs text-muted-foreground">
                          Unavailable
                        </span>
                      )}
                    </ModelSelectorItem>
                  )
                })}
              </ModelSelectorGroup>
            ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  )
}
