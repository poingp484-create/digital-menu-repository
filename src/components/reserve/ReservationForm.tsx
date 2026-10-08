"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CaretDown, Check, WarningCircle } from "@phosphor-icons/react";
import {
  seatingOptions,
  validateReservation,
  type FieldErrors,
  type ReservationInput,
  type Seating,
} from "@/lib/reservation";
import { cn } from "@/lib/cn";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; reference: string }
  | { kind: "error"; message: string };

const empty: ReservationInput = {
  seating: "counter",
  date: "",
  time: "",
  guests: 2,
  name: "",
  email: "",
  phone: "",
  notes: "",
};

const inputClass =
  "h-12 w-full border border-line-strong bg-transparent px-4 text-base text-ink placeholder:text-muted transition-colors hover:border-ink focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-[invalid=true]:border-accent";

function toISODate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function Field({
  id,
  label,
  helper,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {helper && !error && (
        <p id={`${id}-help`} className="text-sm text-muted">
          {helper}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-sm text-accent">
          <WarningCircle size={16} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export function ReservationForm() {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const reduce = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);

  const [values, setValues] = useState<ReservationInput>(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [minDate, setMinDate] = useState<string>();

  useEffect(() => setMinDate(toISODate(new Date())), []);

  const seating = seatingOptions[values.seating];

  const set = <K extends keyof ReservationInput>(key: K, value: ReservationInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const chooseSeating = (next: Seating) => {
    const opts = seatingOptions[next];
    setValues((v) => ({
      ...v,
      seating: next,
      time: opts.times.includes(v.time) ? v.time : "",
      guests: Math.min(v.guests, opts.maxGuests),
    }));
  };

  const describedBy = (name: keyof ReservationInput, hasHelper = false) =>
    errors[name] ? `${id(name)}-error` : hasHelper ? `${id(name)}-help` : undefined;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateReservation(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        setStatus({ kind: "idle" });
        return;
      }
      if (!res.ok || !data.reference) throw new Error();
      setStatus({ kind: "success", reference: data.reference });
    } catch {
      setStatus({
        kind: "error",
        message: "We could not send your request. Please try again, or call us to book.",
      });
    }
  }

  const fade = {
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: -12 },
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  };

  if (status.kind === "success") {
    const date = new Date(`${values.date}T12:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    return (
      <motion.div {...fade} role="status" className="border border-line-strong p-8 md:p-10">
        <span className="grid size-11 place-items-center bg-accent text-accent-ink">
          <Check size={22} weight="bold" aria-hidden="true" />
        </span>
        <h2 className="mt-8 text-3xl font-semibold tracking-tight">Request received.</h2>
        <p className="mt-4 max-w-[46ch] leading-relaxed text-muted">
          {seating.label} for {values.guests} on {date} at {values.time}. We will email{" "}
          <span className="text-ink">{values.email}</span> within a day to confirm.
        </p>
        <p className="mt-8 font-mono text-sm text-muted">Reference {status.reference}</p>
        <button
          type="button"
          className="btn btn-ghost mt-10"
          onClick={() => {
            setValues(empty);
            setStatus({ kind: "idle" });
          }}
        >
          Make another request
        </button>
      </motion.div>
    );
  }

  const submitting = status.kind === "submitting";

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-8" aria-busy={submitting}>
      <fieldset>
        <legend className="text-sm font-medium">Where would you like to sit?</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(Object.keys(seatingOptions) as Seating[]).map((key) => {
            const opt = seatingOptions[key];
            const on = values.seating === key;
            return (
              <label
                key={key}
                className={cn(
                  "relative flex cursor-pointer flex-col gap-1 border p-5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                  on ? "border-ink bg-surface" : "border-line-strong hover:border-ink",
                )}
              >
                <input
                  type="radio"
                  name="seating"
                  value={key}
                  checked={on}
                  onChange={() => chooseSeating(key)}
                  className="sr-only"
                />
                <span className="font-medium">{opt.label}</span>
                <span className="text-sm text-muted">{opt.detail}</span>
                {on && (
                  <motion.span
                    layoutId={`${uid}-seat`}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 34 }}
                    className="absolute top-0 left-0 h-full w-0.5 bg-accent"
                  />
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-8 sm:grid-cols-3">
        <Field id={id("date")} label="Date" error={errors.date}>
          <input
            id={id("date")}
            name="date"
            type="date"
            min={minDate}
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
            aria-invalid={!!errors.date}
            aria-describedby={describedBy("date")}
            className={inputClass}
          />
        </Field>

        <Field id={id("time")} label="Time" error={errors.time}>
          <div className="relative">
            <select
              id={id("time")}
              name="time"
              value={values.time}
              onChange={(e) => set("time", e.target.value)}
              aria-invalid={!!errors.time}
              aria-describedby={describedBy("time")}
              className={cn(inputClass, "appearance-none pr-10", !values.time && "text-muted")}
            >
              <option value="">Select</option>
              {seating.times.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <CaretDown size={16} aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted" />
          </div>
        </Field>

        <Field id={id("guests")} label="Guests" error={errors.guests}>
          <div className="relative">
            <select
              id={id("guests")}
              name="guests"
              value={values.guests}
              onChange={(e) => set("guests", Number(e.target.value))}
              aria-invalid={!!errors.guests}
              aria-describedby={describedBy("guests")}
              className={cn(inputClass, "appearance-none pr-10")}
            >
              {Array.from({ length: seating.maxGuests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "guest" : "guests"}
                </option>
              ))}
            </select>
            <CaretDown size={16} aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted" />
          </div>
        </Field>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field id={id("name")} label="Name" error={errors.name} className="sm:col-span-2">
          <input
            id={id("name")}
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name")}
            className={inputClass}
          />
        </Field>
        <Field id={id("email")} label="Email" error={errors.email}>
          <input
            id={id("email")}
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("email")}
            className={inputClass}
          />
        </Field>
        <Field id={id("phone")} label="Phone" helper="Optional, for same-day changes." error={errors.phone}>
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy("phone", true)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        id={id("notes")}
        label="Allergies or occasion"
        helper="The kitchen reads every note before service."
        error={errors.notes}
      >
        <textarea
          id={id("notes")}
          name="notes"
          rows={4}
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
          aria-invalid={!!errors.notes}
          aria-describedby={describedBy("notes", true)}
          className={cn(inputClass, "h-auto resize-y py-3")}
        />
      </Field>

      <AnimatePresence>
        {status.kind === "error" && (
          <motion.p
            {...fade}
            role="alert"
            className="flex items-start gap-2 border border-accent p-4 text-sm text-ink"
          >
            <WarningCircle size={18} className="mt-px shrink-0 text-accent" aria-hidden="true" />
            {status.message}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" disabled={submitting} className="btn btn-primary h-12 px-8 text-base disabled:opacity-70">
          {submitting ? "Sending" : "Request a table"}
        </button>
        <p className="text-sm text-muted">We confirm every request by email.</p>
      </div>
    </form>
  );
}
