import React, { useState } from "react";
import { Sparkles, Check, Send, AlertCircle, RefreshCw } from "lucide-react";
import { EventConceptId, RsvpResponse } from "../types";
import { initialEventData } from "../data";

interface RsvpFormProps {
  concept: EventConceptId;
  onSuccess: (newRsvp: RsvpResponse) => void;
}

export default function RsvpForm({ concept, onSuccess }: RsvpFormProps) {
  // Form states
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"yes" | "no" | "maybe">("yes");
  const [guestsCount, setGuestsCount] = useState(1);
  const [food, setFood] = useState<"meat" | "fish" | "vegetarian">("meat");
  const [drinks, setDrinks] = useState<string[]>([]);
  const [wishes, setWishes] = useState("");

  // AI assistant states
  const [aiName, setAiName] = useState("");
  const [aiRelation, setAiRelation] = useState("friend");
  const [aiStyle, setAiStyle] = useState("minimalist");
  const [isGeneratingWish, setIsGeneratingWish] = useState(false);
  const [showAiHelper, setShowAiHelper] = useState(false);

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isDone, setIsDone] = useState(false);

  // Toggle drink choices
  const handleDrinkToggle = (drinkId: string) => {
    if (drinks.includes(drinkId)) {
      setDrinks(drinks.filter((d) => d !== drinkId));
    } else {
      setDrinks([...drinks, drinkId]);
    }
  };

  // Generate Wishes using Gemini API via express backend
  const handleGenerateWishes = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSubmitError("");
    const targetName = name.trim() || aiName.trim() || "Дорогой гость";
    
    setIsGeneratingWish(true);
    try {
      const response = await fetch("/api/gemini/generate-wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: targetName,
          relation: aiRelation,
          style: aiStyle,
        }),
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setWishes(data.text);
        if (!name.trim() && aiName.trim()) {
          setName(aiName.trim());
        }
      } else {
        throw new Error(data.error || "Не удалось получить поздравление");
      }
    } catch (err: any) {
      console.warn("AI wishing failed, fallback applied", err);
      // Beautiful romantic fallback text
      setWishes("Желаем, чтобы ваша совместная жизнь была наполнена бесконечным счастьем, доверием и гармонией. Пусть в вашем доме всегда царит нежное тепло любви, взаимопонимание и радость!");
    } finally {
      setIsGeneratingWish(false);
    }
  };

  // Submit RSVP Form to backend with WhatsApp fallback
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!name.trim()) {
      setSubmitError("Пожалуйста, введите ваше имя и фамилию");
      const nameInput = document.getElementById("guest-name-input");
      nameInput?.focus();
      return;
    }

    setIsSubmitting(true);
    
    // 1. Try sending to the Express Backend
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          status,
          guestsCount,
          food,
          drinks,
          wishes,
        }),
      });

      if (response.ok) {
        const savedEntry = await response.json();
        setIsDone(true);
        onSuccess(savedEntry);
        
        setTimeout(() => {
          setName("");
          setStatus("yes");
          setGuestsCount(1);
          setFood("meat");
          setDrinks([]);
          setWishes("");
          setIsDone(false);
        }, 5000);
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      console.warn("Backend RSVP endpoint failed or unavailable. Falling back to WhatsApp redirection.", err);
    }

    // 2. Fallback to WhatsApp redirection (Perfect for static hosting like GitHub Pages)
    try {
      const formattedStatus = status === "yes" ? "Да, с радостью приду!" : status === "maybe" ? "Будет видно" : "Не смогу";
      const formattedFood = food === "meat" ? "Мясо" : food === "fish" ? "Рыба" : "Вегетарианское";
      const formattedDrinks = drinks.length > 0 ? drinks.join(", ") : "Без алкоголя";
      
      const message = `Привет! Отправляю ответ RSVP на приглашение:
Имя: ${name}
Присутствие: ${formattedStatus}
Количество гостей: ${status !== "no" ? guestsCount : 0}
Выбор блюда: ${status !== "no" ? formattedFood : "-"}
Напитки: ${status !== "no" ? formattedDrinks : "-"}
Пожелания: ${wishes || "Нет"}`;

      const phone = initialEventData.contacts.organizerPhone.replace(/\D/g, "");
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, "_blank");
      
      setIsDone(true);
      onSuccess({
        id: Math.random().toString(36).substring(2, 9),
        name,
        status,
        guestsCount,
        food,
        drinks,
        wishes,
      });

      setTimeout(() => {
        setName("");
        setStatus("yes");
        setGuestsCount(1);
        setFood("meat");
        setDrinks([]);
        setWishes("");
        setIsDone(false);
      }, 5000);
    } catch (err: any) {
      setSubmitError("Не удалось отправить RSVP. Пожалуйста, свяжитесь с организатором напрямую.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Concept-specific styles
  const getConceptStyles = () => {
    return {
      card: "bg-[#FDFDFB] border border-[#1A2E22]/15 text-[#1A2E22]",
      heading: "font-serif text-3xl font-medium tracking-tight text-[#1A2E22] border-b border-[#1A2E22]/10 pb-3",
      input: "bg-[#FDFDFB] border border-[#1A2E22]/30 focus:border-[#1A2E22] text-[#1A2E22] rounded-none px-3 py-2 text-base md:text-sm transition-all focus:outline-none placeholder:text-stone-400 focus:ring-1 focus:ring-[#1A2E22]",
      buttonActive: "bg-[#1A2E22] text-[#FDFDFB] border border-[#1A2E22]",
      buttonInactive: "bg-transparent text-[#1A2E22] border border-[#1A2E22]/20 hover:border-[#1A2E22]/80",
      luxurySubmit: "w-full cursor-pointer bg-transparent text-[#1A2E22] border border-[#1A2E22] hover:bg-[#1A2E22] hover:text-[#FDFDFB] rounded-none py-3.5 tracking-widest text-[11px] font-semibold uppercase relative overflow-hidden transition-all duration-500 after:content-[''] after:absolute after:top-0 after:left-[-100%] after:w-full after:h-full after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:transition-all after:duration-1000 hover:after:left-[100%]"
    };
  };

  const style = getConceptStyles();

  const itemBorderRadius = "rounded-none font-serif";

  return (
    <div className={`shadow-xl p-6 md:p-8 relative ${style.card}`}>
      {/* Top Background Design */}
      <span className="absolute top-0 right-10 translate-y-[-50%] bg-[#FDFDFB] text-[#8A9A5B] font-serif italic text-xs px-2 select-none tracking-widest">
        RSVP // ПОДТВЕРЖДЕНИЕ
      </span>

      {isDone ? (
        <div id="rsvp-success-block" className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 animate-bounce bg-[#1A2E22] text-[#FDFDFB]">
            <Check className="w-8 h-8" strokeWidth={3} />
          </div>
          <h4 className="text-2xl font-semibold mb-2 font-serif">
            Спасибо за ответ!
          </h4>
          <p className="text-sm max-w-sm text-stone-500 leading-relaxed">
            Ваше подтверждение успешно отправлено и сохранено. Мы с нетерпением ждем встречи с вами на нашем свадебном торжестве!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmitForm} className="space-y-6">
          <h3 className={style.heading}>
            Приглашаем вас
          </h3>

          {submitError && (
            <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-lg flex items-start gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Guest Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider font-semibold opacity-75">
              Имя и Фамилия
            </label>
            <input
              id="guest-name-input"
              type="text"
              placeholder="Алексей Иванов"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setAiName(e.target.value);
              }}
              className={style.input}
            />
          </div>

          {/* Attendance Status */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-wider font-semibold opacity-75">
              Будете ли вы присутствовать?
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                id="rsvp-status-yes"
                type="button"
                onClick={() => setStatus("yes")}
                className={`py-3 text-xs font-medium cursor-pointer transition-all ${itemBorderRadius} ${status === "yes" ? style.buttonActive : style.buttonInactive}`}
              >
                Да, с радостью!
              </button>
              <button
                id="rsvp-status-maybe"
                type="button"
                onClick={() => setStatus("maybe")}
                className={`py-3 text-xs font-medium cursor-pointer transition-all ${itemBorderRadius} ${status === "maybe" ? style.buttonActive : style.buttonInactive}`}
              >
                Будет видно
              </button>
              <button
                id="rsvp-status-no"
                type="button"
                onClick={() => setStatus("no")}
                className={`py-3 text-xs font-medium cursor-pointer transition-all ${itemBorderRadius} ${status === "no" ? style.buttonActive : style.buttonInactive}`}
              >
                Не смогу
              </button>
            </div>
          </div>

          {status !== "no" && (
            <>
              {/* Guests Count */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase tracking-wider font-semibold opacity-75">
                  Количество гостей в вашей компании
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGuestsCount(num)}
                      className={`py-2 text-xs font-medium cursor-pointer transition-all ${itemBorderRadius} ${guestsCount === num ? style.buttonActive : style.buttonInactive}`}
                    >
                      {num === 1 ? "1 (Я)" : num}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Wishes & AI Generation */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] uppercase tracking-wider font-semibold opacity-75">
                Ваши пожелания {status === "no" ? "молодоженам" : "и комментарии"}
              </label>
              <button
                type="button"
                onClick={() => setShowAiHelper(!showAiHelper)}
                className="text-[11px] flex items-center gap-1 cursor-pointer select-none font-semibold text-[#8A9A5B] hover:text-[#1A2E22]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>ИИ Помощник ✨</span>
              </button>
            </div>

            {/* AI Customization Panel */}
            {showAiHelper && (
              <div className="p-4 mb-3 border text-xs space-y-3.5 transition-all bg-stone-50 border-stone-200 rounded-none">
                <div className="text-[11px] font-medium opacity-80 leading-relaxed">
                  Будем рады помочь составить красивое и теплое поздравление! Наш ИИ сгенерирует текст:
                </div>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold opacity-60">Моя связь с парой</span>
                    <select
                      value={aiRelation}
                      onChange={(e) => setAiRelation(e.target.value)}
                      className="border border-stone-200 rounded p-1.5 text-xs outline-none bg-white text-stone-800"
                    >
                      <option value="friend">Друг / подруга</option>
                      <option value="family">Родственник / семья</option>
                      <option value="colleague">Коллега</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold opacity-60">Стиль пожеланий</span>
                    <select
                      value={aiStyle}
                      onChange={(e) => setAiStyle(e.target.value)}
                      className="border border-stone-200 rounded p-1.5 text-xs outline-none bg-white text-stone-800"
                    >
                      <option value="minimalist">Изящный краткий</option>
                      <option value="humorous">С легким юмором 😄</option>
                      <option value="adventure">Теплый и душевный 💕</option>
                    </select>
                  </div>
                </div>

                {!name.trim() && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold opacity-60">Ваше имя</span>
                    <input
                      type="text"
                      placeholder="Чтобы вписать в открытку"
                      value={aiName}
                      onChange={(e) => setAiName(e.target.value)}
                      className="border border-stone-200 rounded p-1.5 text-xs outline-none bg-white text-stone-800"
                    />
                  </div>
                )}

                <button
                  id="rsvp-ai-generate-btn"
                  type="button"
                  disabled={isGeneratingWish}
                  onClick={handleGenerateWishes}
                  className="w-full py-2 cursor-pointer text-xs font-semibold flex items-center justify-center gap-1.5 bg-[#1A2E22] text-[#FDFDFB] rounded-none"
                >
                  {isGeneratingWish ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Слова подбираются...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>Составить поздравление</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <textarea
              rows={4}
              placeholder="Мы придем с отличным настроением! Безумно рады за вас!"
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
              className={`${style.input} resize-y w-full leading-relaxed min-h-[90px]`}
            />
          </div>

          {/* Submit Button */}
          <button
            id="rsvp-submit-button"
            type="submit"
            disabled={isSubmitting}
            className={style.luxurySubmit}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 font-serif text-[11px] tracking-widest uppercase text-center justify-center w-full">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Отправляем ответ...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Confirm Attendance // Подтвердить участие
              </span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
