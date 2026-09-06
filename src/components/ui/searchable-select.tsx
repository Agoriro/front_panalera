import React, { useId, useMemo, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Input } from './input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export interface SearchableSelectOption {
  value: string
  label: string
  description?: string
  color?: string
  keywords?: string
}

interface SearchableSelectProps {
  value?: string
  onValueChange: (value: string) => void
  options: SearchableSelectOption[]
  placeholder: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  id?: string
  onSearchChange?: (query: string) => void
}

export function SearchableSelect({ value, onValueChange, options, placeholder, searchPlaceholder = 'Buscar...', emptyMessage = 'No se encontraron resultados.', disabled, className, id, onSearchChange }: SearchableSelectProps) {
  const generatedId = useId()
  const triggerId = id || generatedId
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = options.find((option) => option.value === value)
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es')
    if (!normalizedQuery) return options
    return options.filter((option) => `${option.label} ${option.keywords || ''}`.toLocaleLowerCase('es').includes(normalizedQuery))
  }, [options, query])

  return (
    <Popover open={open} onOpenChange={(nextOpen) => {
      setOpen(nextOpen)
      if (!nextOpen) {
        setQuery('')
        onSearchChange?.('')
      }
    }}>
      <PopoverTrigger
        id={triggerId}
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${triggerId}-options`}
        className={cn('flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-left text-sm shadow-xs outline-none transition-[border-color,box-shadow] hover:border-primary/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50', selected?.description && 'h-auto min-h-10 py-2', className)}
      >
        <span className={cn('flex min-w-0 items-center gap-2 truncate', !selected && 'text-muted-foreground')}>
          {selected?.color && <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15" style={{ backgroundColor: selected.color }} />}
          <span className="min-w-0">
            <span className="block truncate">{selected?.label || placeholder}</span>
            {selected?.description && <span className="block whitespace-normal break-words text-xs text-muted-foreground">{selected.description}</span>}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--anchor-width)] min-w-56 gap-2 p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input autoFocus value={query} onChange={(event) => { setQuery(event.target.value); onSearchChange?.(event.target.value) }} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="pl-9" />
        </div>
        <div id={`${triggerId}-options`} role="listbox" className="max-h-56 overflow-y-auto py-1">
          {filteredOptions.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
          ) : filteredOptions.map((option) => {
            const isSelected = option.value === value
            return (
              <button key={option.value} type="button" role="option" aria-selected={isSelected}
                onClick={() => { onValueChange(option.value); setOpen(false); setQuery(''); onSearchChange?.('') }}
                className={cn('flex min-h-10 w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted', isSelected && 'bg-primary/10 font-semibold text-primary')}>
                {option.color && <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15" style={{ backgroundColor: option.color }} />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{option.label}</span>
                  {option.description && <span className="block whitespace-normal break-words text-xs text-muted-foreground">{option.description}</span>}
                </span>
                {isSelected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
