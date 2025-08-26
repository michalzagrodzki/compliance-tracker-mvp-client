import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, X, ChevronDown, Loader2 } from 'lucide-react'
import { useIsoControlSearch } from '@/modules/iso-control/hooks/useIsoControl'
import type { FlattenedControl, ISOFramework } from '@/modules/compliance-gaps/types'

interface IsoControlSelectorProps {
  value: string | null
  onChange: (value: string) => void
  label?: string
}

export default function IsoControlSelector({ value, onChange, label = 'Related ISO Control' }: IsoControlSelectorProps) {
  const [open, setOpen] = useState(false)
  const {
    searchTerm: isoSearchTerm,
    search: searchIsoControls,
    clearSearch: clearIsoSearch,
    controls: isoControls,
    isLoading: isLoadingIsoControls,
    error: isoControlsError,
  } = useIsoControlSearch(300)

  const flattenedControls = useMemo(() => {
    const flattened: FlattenedControl[] = []
    isoControls.forEach((framework: ISOFramework) => {
      Object.entries(framework.controls || {}).forEach(([controlCode, controlData]) => {
        flattened.push({
          id: `${framework.id}-${controlCode}`,
          frameworkName: framework.name,
          controlCode,
          title: controlData.title,
          control: controlData.control,
          category: controlData.category,
          displayText: `${controlCode} - ${controlData.title} (${controlData.category})`,
        })
      })
    })
    return flattened
  }, [isoControls])

  const selected = useMemo(() => {
    if (!value) return null
    return (
      flattenedControls.find((c) => `${c.frameworkName}:${c.controlCode}` === value) || null
    )
  }, [value, flattenedControls])

  const filtered = useMemo(() => {
    if (!isoSearchTerm) return flattenedControls
    const term = isoSearchTerm.toLowerCase()
    return flattenedControls.filter(
      (control) =>
        control.controlCode.toLowerCase().includes(term) ||
        control.title.toLowerCase().includes(term) ||
        control.category.toLowerCase().includes(term) ||
        control.frameworkName.toLowerCase().includes(term)
    )
  }, [flattenedControls, isoSearchTerm])

  const handleSelect = (control: FlattenedControl) => {
    onChange(`${control.frameworkName}:${control.controlCode}`)
    setOpen(false)
    clearIsoSearch()
  }

  const handleClear = () => {
    onChange('')
    clearIsoSearch()
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start items-start h-auto min-h-[3rem] py-3 gap-3"
          onClick={() => setOpen((v) => !v)}
        >
          {selected ? (
            <div className="flex w-full items-start gap-3">
              <div className="pt-0.5">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0 text-left leading-tight">
                <div className="text-sm font-medium truncate">
                  {selected.controlCode} – {selected.title}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {selected.frameworkName} • {selected.category}
                </div>
              </div>
              <div
                className="shrink-0 h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
                aria-label="Clear ISO control"
              >
                <X className="h-4 w-4" />
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            <div className="flex w-full items-center gap-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Select related ISO control</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
            </div>
          )}
        </Button>

        {open && (
          <div className="absolute z-50 mt-2 w-full rounded-md border bg-background shadow-lg">
            <div className="p-3 border-b">
              <Input
                placeholder="Search ISO controls by code, title, category..."
                value={isoSearchTerm}
                onChange={(e) => searchIsoControls(e.target.value)}
                autoFocus
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {isLoadingIsoControls ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : isoControlsError ? (
                <div className="p-3 text-sm text-destructive">{isoControlsError}</div>
              ) : filtered.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">No controls found</div>
              ) : (
                <ul className="divide-y">
                  {filtered.map((control) => (
                    <li key={control.id}>
                      <button
                        type="button"
                        className="w-full text-left p-3 hover:bg-muted/50"
                        onClick={() => handleSelect(control)}
                      >
                        <div className="text-sm font-medium">
                          {control.controlCode} – {control.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {control.frameworkName} • {control.category}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
