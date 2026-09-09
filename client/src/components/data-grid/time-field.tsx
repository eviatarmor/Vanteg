"use client"

import {
  TimePicker,
  TimePickerClear,
  TimePickerContent,
  TimePickerHour,
  TimePickerInput,
  TimePickerInputGroup,
  TimePickerMinute,
  TimePickerPeriod,
  TimePickerSecond,
  TimePickerSeparator,
  TimePickerTrigger,
} from "@workspace/ui/components/time-picker"
import { cn } from "@workspace/ui/lib/utils"

export function TimePickerColumns({
  showSeconds = false,
}: {
  showSeconds?: boolean
}) {
  return (
    <>
      <div className="flex min-w-max flex-row">
        <TimePickerHour />
        <TimePickerMinute />
        {showSeconds ? <TimePickerSecond /> : null}
        <TimePickerPeriod />
      </div>
      <TimePickerClear className="h-7 px-2" />
    </>
  )
}

export function TimeField({
  id,
  value,
  onValueChange,
  showSeconds = false,
  withPicker = true,
  disabled,
  readOnly,
  invalid,
  className,
  "aria-label": ariaLabel,
}: {
  id?: string
  value?: string
  onValueChange?: (value: string) => void
  showSeconds?: boolean
  withPicker?: boolean
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  className?: string
  "aria-label"?: string
}) {
  return (
    <TimePicker
      id={id}
      role="group"
      value={value ?? ""}
      onValueChange={onValueChange}
      showSeconds={showSeconds}
      disabled={disabled}
      readOnly={readOnly}
      invalid={invalid}
      aria-label={ariaLabel}
    >
      <TimePickerInputGroup
        className={cn(
          "h-8 bg-card px-2.5 shadow-none dark:bg-input/30",
          className
        )}
      >
        <TimePickerInput segment="hour" />
        <TimePickerSeparator />
        <TimePickerInput segment="minute" />
        {showSeconds ? (
          <>
            <TimePickerSeparator />
            <TimePickerInput segment="second" />
          </>
        ) : null}
        {withPicker ? <TimePickerTrigger /> : null}
      </TimePickerInputGroup>
      {withPicker ? (
        <TimePickerContent className="flex-col items-stretch gap-0 p-1">
          <TimePickerColumns showSeconds={showSeconds} />
        </TimePickerContent>
      ) : null}
    </TimePicker>
  )
}
