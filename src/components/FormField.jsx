// FormField.jsx — one labelled input, plus its error message.
//
// The Login and Signup forms need this exact trio (label, input, error text)
// six times between them. Pulling it into one component means the styling and
// the accessibility wiring are written ONCE.
//
// The accessibility wiring, since it's easy to skip:
//   htmlFor + id      — clicking the label focuses the input.
//   aria-invalid      — tells a screen reader this field is wrong, not just red.
//   aria-describedby  — points the screen reader at the error text, so the user
//                       hears WHAT is wrong, not only that something is.
export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  ...inputProps // placeholder, autoComplete, required, ... pass straight through
}) {
  const errorId = `${name}-error`;

  return (
    <div className='flex flex-col gap-1.5'>
      <label htmlFor={name} className='text-sm font-medium text-(--text-h)'>
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-md border bg-transparent px-3 py-2 outline-none transition
          focus:border-(--accent) focus:ring-2 focus:ring-(--accent-bg)
          ${error ? 'border-red-500' : 'border-(--border)'}`}
        {...inputProps}
      />

      {/* role="alert" makes a screen reader announce the message the moment it appears. */}
      {error && (
        <span id={errorId} role='alert' className='text-sm text-red-500'>
          {error}
        </span>
      )}
    </div>
  );
}