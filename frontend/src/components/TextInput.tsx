import { useState, type FormEvent } from 'react';

interface TextInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function TextInput({ onSend, disabled = false }: TextInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-strong border-t border-border px-4 sm:px-5 py-3 flex gap-3 shrink-0"
      aria-label="Send a customer question"
    >
      <div className="flex-1 min-w-0">
        <label htmlFor="question-input" className="sr-only">
          Customer question
        </label>
        <input
          id="question-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={disabled ? 'Connect to send questions…' : 'Type a customer question…'}
          disabled={disabled}
          autoComplete="off"
          className="w-full min-h-[44px] rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-white/[0.07] disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="min-h-[44px] px-5 btn-primary-glow text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        Send
      </button>
    </form>
  );
}
