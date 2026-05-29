import React, { useState } from "react";
import { Check, RefreshCw, AlertCircle } from "lucide-react";
import { RsvpResponse } from "../types";
import { initialEventData } from "../data";

interface RsvpFormProps {
  onSuccess: (newRsvp: RsvpResponse) => void;
}

const ACCENT = "#4F6D87";
const ACCENT_DEEP = "#243447";
const INK = "#243447";
const MUTED = "#3F4750";
const LINE = "rgba(36,52,71,0.15)";

export default function RsvpForm({ onSuccess }: RsvpFormProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"yes" | "no">("yes");
  const [wishes, setWishes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isDone, setIsDone] = useState(false);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!name.trim()) {
      setSubmitError("Пожалуйста, введите ваше имя и фамилию");
      document.getElementById("guest-name-input")?.focus();
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status, wishes }),
      });
      if (response.ok) {
        const savedEntry = await response.json();
        setIsDone(true);
        onSuccess(savedEntry);
        setTimeout(resetForm, 5000);
        setIsSubmitting(false);
        return;
      }
    } catch {
      // fallback to WhatsApp
    }

    try {
      const statusLabel = status === "yes" ? "Да, с радостью приду!" : "К сожалению, не смогу";
      const message = `Здравствуйте! Отправляю ответ RSVP:\nИмя: ${name}\nПрисутствие: ${statusLabel}\nПожелания: ${wishes || "Нет"}`;
      const phone = initialEventData.contacts.organizerPhone.replace(/\D/g, "");
      window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`, "_blank");
      setIsDone(true);
      onSuccess({ id: Math.random().toString(36).substring(2, 9), name, status, guestsCount: 1, food: "meat", drinks: [], wishes });
      setTimeout(resetForm, 5000);
    } catch {
      setSubmitError("Не удалось отправить RSVP. Пожалуйста, свяжитесь с организатором напрямую.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName(""); setStatus("yes"); setWishes(""); setIsDone(false);
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--color-bg)",
    border: `1px solid ${LINE}`,
    borderRadius: "10px",
    color: INK,
    padding: "13px 15px",
    width: "100%",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.3s",
    fontFamily: "Inter, sans-serif",
    fontWeight: 400,
  };

  return (
    <div className="p-6 md:p-9 relative rounded-2xl" style={{ background: "rgba(255,255,255,0.95)", border: `1px solid ${LINE}`, boxShadow: "0 8px 24px -12px rgba(36,52,71,0.18)" }}>
      {isDone ? (
        <div id="rsvp-success-block" className="flex flex-col items-center justify-center py-12 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ background: "rgba(123,146,138,0.15)", border: `1px solid ${ACCENT}` }}
          >
            <Check className="w-8 h-8" style={{ color: ACCENT_DEEP }} strokeWidth={2.5} />
          </div>
          <h4 className="text-2xl font-serif italic mb-2" style={{ color: ACCENT_DEEP }}>
            Спасибо за ответ!
          </h4>
          <p className="text-sm max-w-sm font-normal leading-relaxed" style={{ color: MUTED }}>
            Ваше подтверждение успешно отправлено. Мы с нетерпением ждём встречи с вами!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmitForm} className="space-y-6">
          {submitError && (
            <div className="text-xs p-3.5 flex items-start gap-2" style={{ background: "rgba(180,80,80,0.08)", border: "1px solid rgba(180,80,80,0.2)", color: "#a85555" }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Имя */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.18em] font-normal" style={{ color: MUTED }}>
              Имя и фамилия
            </label>
            <input
              id="guest-name-input"
              type="text"
              placeholder="Алексей Иванов"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = ACCENT)}
              onBlur={(e) => (e.target.style.borderColor = LINE)}
            />
          </div>

          {/* Присутствие */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.18em] font-normal" style={{ color: MUTED }}>
              Сможете присутствовать?
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { v: "yes" as const, label: "Да, с радостью!" },
                { v: "no" as const, label: "К сожалению, нет" },
              ].map((opt) => {
                const active = status === opt.v;
                return (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setStatus(opt.v)}
                    className="py-3.5 rounded-xl text-sm font-normal cursor-pointer transition-all duration-200"
                    style={{
                      border: `1px solid ${active ? ACCENT : LINE}`,
                      background: active ? ACCENT : "transparent",
                      color: active ? "#fff" : MUTED,
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Пожелания */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.18em] font-normal" style={{ color: MUTED }}>
              Пожелания молодожёнам
            </label>
            <textarea
              rows={4}
              placeholder="Мы придём с отличным настроением!"
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
              style={{ ...inputStyle, resize: "vertical", minHeight: "90px", lineHeight: "1.6" }}
              onFocus={(e) => (e.target.style.borderColor = ACCENT)}
              onBlur={(e) => (e.target.style.borderColor = LINE)}
            />
          </div>

          {/* Кнопка отправки */}
          <button
            id="rsvp-submit-button"
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer py-4 rounded-xl tracking-[0.18em] text-[12px] font-normal uppercase text-white transition-all duration-300"
            style={{ background: ACCENT, boxShadow: "0 16px 30px -18px rgba(70,89,106,0.7)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = ACCENT_DEEP)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = ACCENT)}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 justify-center">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Отправляем...</span>
              </span>
            ) : (
              <span>Подтвердить участие</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
