export interface PageTabNewAction {
  label: string
  placeholder: string
  nameLabel?: string
  valueLabel?: string
  valuePlaceholder?: string
  secret?: boolean
}

export interface PageTab {
  id: string
  label: string
  description: string
  emptyTitle?: string
  newAction: PageTabNewAction
}
