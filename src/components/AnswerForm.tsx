import { useEffect, useRef, useState } from "react";

export function useEnterAction(active: boolean, action: () => void) {
  const actionRef = useRef(action);
  actionRef.current = action;
  useEffect(() => {
    if (!active) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Enter" || event.repeat) return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
      event.preventDefault();
      actionRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);
}

export function AnswerForm({
  disabled,
  label = "Provincia",
  extraKeys = [],
  lang,
  continueLabel = "Siguiente",
  onSubmit,
  onContinue,
}: {
  disabled?: boolean;
  label?: string;
  extraKeys?: readonly string[];
  lang?: string;
  continueLabel?: string;
  onSubmit: (value: string) => void;
  onContinue?: () => void;
}) {
  const [value, setValue] = useState("");
  const field = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  useEffect(() => {
    lock.current = false;
  });
  useEffect(() => {
    if (!disabled) field.current?.focus();
  }, [disabled]);

  function send(raw: string) {
    if (disabled || lock.current) return;
    if (onContinue) {
      lock.current = true;
      onContinue();
      setValue("");
      return;
    }
    const next = raw.trim();
    if (!next) return;
    lock.current = true;
    onSubmit(next);
    setValue("");
  }

  function insert(char: string) {
    const el = field.current;
    const focused = document.activeElement === el;
    const start = focused && el ? (el.selectionStart ?? value.length) : value.length;
    const end = focused && el ? (el.selectionEnd ?? value.length) : value.length;
    const next = value.slice(0, start) + char + value.slice(end);
    const caret = start + char.length;
    setValue(next);
    window.setTimeout(() => {
      el?.focus();
      el?.setSelectionRange(caret, caret);
    }, 0);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        send(value);
      }}
    >
      <label>
        {onContinue ? <span className="sr-only">{continueLabel}</span> : label}
        <input
          ref={field}
          value={value}
          disabled={disabled}
          lang={lang}
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint={onContinue ? "next" : "go"}
          placeholder={onContinue ? "Intro otra vez para seguir" : undefined}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.repeat) return;
            event.preventDefault();
            event.stopPropagation();
            send(value);
          }}
          onFocus={(event) => {
            const target = event.currentTarget;
            window.setTimeout(() => target.scrollIntoView?.({ block: "center", inline: "nearest" }), 350);
          }}
        />
      </label>
      {!onContinue && extraKeys.length > 0 ? (
        <div className="extra-keys">
          {extraKeys.map((char) => (
            <button
              key={char}
              type="button"
              className="key-letter"
              disabled={disabled}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => insert(char)}
            >
              {char}
            </button>
          ))}
        </div>
      ) : null}
      <button
        className="primary"
        type="submit"
        disabled={disabled}
        aria-disabled={Boolean(disabled || (!onContinue && value.trim().length === 0))}
      >
        {onContinue ? continueLabel : "Comprobar"}
      </button>
    </form>
  );
}
