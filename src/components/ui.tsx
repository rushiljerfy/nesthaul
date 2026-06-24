import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";

type ButtonTone = "primary" | "secondary" | "quiet";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ButtonTone;
}

export function Button({ className = "", tone = "primary", ...props }: ButtonProps) {
  return <button className={`button button-${tone} ${className}`.trim()} {...props} />;
}

export function Card({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`card ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "orange" | "green" | "yellow" | "red" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="empty-state">{children}</p>;
}

export function SectionHeader({
  eyebrow,
  title,
  note
}: {
  eyebrow?: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
      </div>
      {note ? <p className="section-note">{note}</p> : null}
    </div>
  );
}

export function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <Card className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <p>{detail}</p> : null}
    </Card>
  );
}

export function FormField({
  children,
  help,
  label
}: {
  children: ReactNode;
  help?: string;
  label: string;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
      {help ? <small>{help}</small> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} />;
}
