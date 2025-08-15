
interface ChangeDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ChangeDescriptionField({
  value,
  onChange,
  placeholder = "Describe the changes made to this report..."
}: ChangeDescriptionFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="change_description" className="text-sm font-medium">
        What changes are you making?
      </label>
      <textarea
        id="change_description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <p className="text-xs text-muted-foreground">
        This will be recorded in the audit trail for compliance purposes
      </p>
    </div>
  );
}