// No React import needed with automatic JSX runtime

type Option<T extends string> = { value: T; label: string; color?: string }

interface OptionChipsProps<T extends string> {
  label: string
  options: Array<Option<T>>
  value: T
  onChange: (value: T) => void
  columns?: string // e.g. 'grid-cols-2 md:grid-cols-4'
}

export default function OptionChips<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 'grid-cols-2 md:grid-cols-4'
}: OptionChipsProps<T>) {
  return (
    <div className="grid gap-3">
      <label className="text-sm font-medium">{label}</label>
      <div className={`grid ${columns} gap-2`}>
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`text-center text-sm px-3 py-2 rounded border transition-all duration-200 ease-in-out transform ${
              value === option.value
                ? `border-blue-400 ${option.color ?? 'bg-blue-50 text-blue-800'}`
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <div className="font-medium">{option.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
