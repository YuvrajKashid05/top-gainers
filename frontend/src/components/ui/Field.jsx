/** @param {{label: string, htmlFor: string, help?: string, children: import('react').ReactNode}} props */
export default function Field({ label, htmlFor, help, children }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor} className="field-label">
        {label}
      </label>
      {help && <p className="field-help">{help}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}
