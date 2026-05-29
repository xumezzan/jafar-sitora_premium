import React, { useState } from "react";
import { Sparkles, Check, RefreshCw, AlertCircle } from "lucide-react";
import { RsvpResponse } from "../types";
import { initialEventData } from "../data";

interface RsvpFormProps {
  onSuccess: (newRsvp: RsvpResponse) => void;
}

const ACCENT = "#7b928a";
const ACCENT_DEEP = "#54665e";
const INK = "#3c4541";
const MUTED = "#847f74";
const LINE = "rgba(84,102,94,0.2)";

export default function RsvpForm({ onSuccess }: RsvpFormProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"yes" | "no">("yes");
  const [wishes, setWishes] = useState("");

  const [aiName, setAiName] = useState("");
  const [aiRelation, setAiRelation] = useState("friend");
  const [aiStyle, setAiStyle] = useState("minimalist");
  const [isGeneratingWish, setIsGeneratingWish] = useState(false);
  const [showAiHelper, setShowAiHelper] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isDone, setIsDone] = useState(false);

  const handleGenerateWishes = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSubmitError("");
    const targetName = name.trim() || aiName.trim() || "Дорогой гость";
    setIsGeneratingWish(true);
    try {
      const response = await fetch("/api/gemini/generate-wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: targetName, relation: aiRelation, style: aiStyle }),
      });
      const data = await response.json();
      if (response.ok && data.text) {
        setWishes(data.text);
        if (!name.trim() && aiName.trim()) setName(aiName.trim());
      } else {
        throw new Error(data.error || "Не удалось получить поздравление");
      }
    } catch {
      setWishes("Желаем, чтобы ваша совместная жизнь была наполнена бесконечным счастьем, доверием и гармонией. Пусть в вашем доме всегда царит нежное тепло любви, взаимопонимание и радость!");
    } finally {
      setIsGeneratingWish(false);
    }
  };

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
    color: INK,
    padding: "11px 13px",
    width: "100%",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.3s",
    fontFamily: "Jost, sans-serif",
    fontWeight: 300,
  };

  return (
    <div className="p-6 md:p-8 relative" style={{ background: "var(--color-bg)", border: `1px solid ${LINE}` }}>
      {isDone ? (
        <div id="rsvp-success-block" className="flex flex-col items-center justify-center py-12 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6 animate-bounce"
            style={{ background: "rgba(123,146,138,0.15)", border: `1px solid ${ACCENT}` }}
          >
            <Check className="w-8 h-8" style={{ color: ACCENT_DEEP }} strokeWidth={2.5} />
          </div>
          <h4 className="text-2xl font-serif italic mb-2" style={{ color: ACCENT_DEEP }}>
            Спасибо за ответ!
          </h4>
          <p className="text-sm max-w-sm font-light leading-relaxed" style={{ color: MUTED }}>
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
            <label className="text-[10px] uppercase tracking-[0.18em] font-light" style={{ color: MUTED }}>
              Имя и фамилия
            </label>
            <input
              id="guest-name-input"
              type="text"
              placeholder="Алексей Иванов"
              value={name}
              onChange={(e) => { setName(e.target.value); setAiName(e.target.value); }}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = ACCENT)}
              onBlur={(e) => (e.target.style.borderColor = LINE)}
            />
          </div>

          {/* Присутствие: только да/нет */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.18em] font-light" style={{ color: MUTED }}>
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
                    className="py-3 text-sm font-light cursor-pointer transition-all duration-200"
                    style={{
                      border: `1px solid ${active ? ACCENT : LINE}`,
                      background: active ? "rgba(123,146,138,0.15)" : "transparent",
                      color: active ? ACCENT_DEEP : MUTED,
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Пожелания + ИИ */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] uppercase tracking-[0.18em] font-light" style={{ color: MUTED }}>
                Пожелания молодожёнам
              </label>
              <button
                type="button"
                onClick={() => setShowAiHelper(!showAiHelper)}
                className="text-[10px] flex items-center gap-1 cursor-pointer"
                style={{ color: ACCENT }}
              >
                <Sparkles className="w-3 h-3" />
                <span>ИИ-помощник</span>
              </button>
            </div>

            {showAiHelper && (
              <div className="p-4 mb-3 space-y-3 text-xs" style={{ background: "var(--color-bg-alt)", border: `1px solid ${LINE}` }}>
                <div className="text-[11px] font-light leading-relaxed" style={{ color: MUTED }}>
                  Поможем составить тёплое поздравление для молодожёнов:
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-light tracking-wide" style={{ color: MUTED }}>Связь с парой</span>
                    <select value={aiRelation} onChange={(e) => setAiRelation(e.target.value)} style={{ ...inputStyle, padding: "7px 9px", fontSize: "13px" }}>
                      <option value="friend">Друг / подруга</option>
                      <option value="family">Родственник</option>
                      <option value="colleague">Коллега</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-light tracking-wide" style={{ color: MUTED }}>Стиль</span>
                    <select value={aiStyle} onChange={(e) => setAiStyle(e.target.value)} style={{ ...inputStyle, padding: "7px 9px", fontSize: "13px" }}>
                      <option value="minimalist">Изящный краткий</option>
                      <option value="humorous">С лёгким юмором</option>
                      <option value="adventure">Тёплый душевный</option>
                    </select>
                  </div>
                </div>
                {!name.trim() && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-light tracking-wide" style={{ color: MUTED }}>Ваше имя</span>
                    <input type="text" placeholder="Чтобы вписать в открытку" value={aiName} onChange={(e) => setAiName(e.target.value)} style={{ ...inputStyle, padding: "7px 9px", fontSize: "13px" }} />
                  </div>
                )}
                <button
                  id="rsvp-ai-generate-btn"
                  type="button"
                  disabled={isGeneratingWish}
                  onClick={handleGenerateWishes}
                  className="w-full py-2.5 cursor-pointer text-xs font-light tracking-wide flex items-center justify-center gap-1.5 transition-all"
                  style={{ background: "rgba(123,146,138,0.14)", border: `1px solid ${ACCENT}`, color: ACCENT_DEEP }}
                >
                  {isGeneratingWish ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Подбираю слова...</span></>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5" /><span>Составить поздравление</span></>
                  )}
                </button>
              </div>
            )}

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
            className="w-full cursor-pointer py-3.5 tracking-[0.18em] text-[11px] font-light uppercase transition-all duration-300"
            style={{ border: `1px solid ${ACCENT_DEEP}`, color: ACCENT_DEEP, background: "transparent" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(123,146,138,0.14)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
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
