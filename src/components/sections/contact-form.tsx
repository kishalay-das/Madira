"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";

const inputClass =
  "h-12 w-full rounded-full border border-hairline bg-night/60 px-5 text-sm text-cream placeholder:text-muted-2 focus:border-gold focus:outline-none";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // No contact endpoint exists yet — acknowledge locally so the form is usable.
    // Wire this to a route handler (e.g. POST /api/contact) when the backend is ready.
    setSent(true);
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="glass-dark flex flex-col items-center gap-4 rounded-[var(--radius-luxe)] border border-hairline p-10 text-center"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Check size={22} />
        </span>
        <h3 className="font-display text-2xl text-cream">Message received</h3>
        <p className="max-w-sm text-sm text-muted">
          Thank you for reaching out. Our concierge will be in touch within one business day.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-dark space-y-4 rounded-[var(--radius-luxe)] border border-hairline p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <input required name="name" placeholder="Full name" className={inputClass} />
        <input
          required
          type="email"
          name="email"
          placeholder="Email address"
          className={inputClass}
        />
      </div>
      <input name="subject" placeholder="Subject" className={inputClass} />
      <textarea
        required
        name="message"
        placeholder="How can our concierge help?"
        rows={5}
        className="w-full rounded-[var(--radius-luxe)] border border-hairline bg-night/60 px-5 py-4 text-sm text-cream placeholder:text-muted-2 focus:border-gold focus:outline-none"
      />
      <button
        type="submit"
        className="h-12 w-full rounded-full bg-gradient-to-b from-gold-bright to-gold text-sm font-medium text-ink transition-shadow hover:shadow-[0_14px_30px_-12px_rgba(200,162,75,0.7)]"
      >
        Send message
      </button>
    </form>
  );
}
