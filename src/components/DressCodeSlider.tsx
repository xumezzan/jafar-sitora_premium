import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Ornament } from "./Decor";

const slides = [
  {
    title: "Стиль вечера",
    content: (ink: string, muted: string) => (
      <>
        <p className="text-base font-semibold mb-3" style={{ color: ink }}>
          Black Tie, Cocktail{" "}
          <span className="font-light" style={{ color: muted }}>или образы в этом стиле.</span>
        </p>
        <p className="text-sm font-light leading-relaxed" style={{ color: muted }}>
          Мы очень ценим праздничную атмосферу вечера и просим вас отказаться от джинсов и
          спортивной одежды.
        </p>
      </>
    ),
  },
  {
    title: "Для гостей",
    content: (_ink: string, muted: string) => (
      <>
        <p className="text-sm leading-relaxed mb-4" style={{ color: muted }}>
          <span className="font-semibold" style={{ color: muted }}>Для дам:</span>{" "}
          Вечерние или коктейльные платья длины макси или миди.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: muted }}>
          <span className="font-semibold" style={{ color: muted }}>Для джентльменов:</span>{" "}
          Классический костюм, смокинг или строгие брюки с рубашкой.
        </p>
      </>
    ),
  },
  {
    title: "Исключения",
    content: (_ink: string, muted: string) => (
      <>
        <p className="text-sm leading-relaxed mb-3" style={{ color: muted }}>
          Просим прекрасных дам не выбирать наряды{" "}
          <span className="font-semibold" style={{ color: muted }}>белого цвета</span>{" "}
          (это цвет невесты).
        </p>
        <p className="text-sm leading-relaxed mb-3" style={{ color: muted }}>
          Также просим воздержаться от полностью{" "}
          <span className="font-semibold" style={{ color: muted }}>чёрного цвета</span> в одежде.
        </p>
        <p className="text-sm font-light" style={{ color: muted }}>
          Любые другие цвета приветствуются!
        </p>
      </>
    ),
  },
];

export default function DressCodeSlider({
  accentDeep,
  muted,
  ink,
}: {
  accentDeep: string;
  muted: string;
  ink: string;
}) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  const slide = slides[current];

  return (
    <div className="reveal d2">
      {/* Карточка */}
      <div
        className="relative rounded-2xl px-8 py-10 text-center"
        style={{ background: "var(--color-bg-alt)" }}
      >
        {/* Кнопка назад */}
        <button
          onClick={prev}
          aria-label="Назад"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center cursor-pointer transition-all"
          style={{ border: "1px solid var(--color-line)" }}
        >
          <ChevronLeft className="w-4 h-4" style={{ color: accentDeep }} />
        </button>

        {/* Кнопка вперёд */}
        <button
          onClick={next}
          aria-label="Вперёд"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center cursor-pointer transition-all"
          style={{ border: "1px solid var(--color-line)" }}
        >
          <ChevronRight className="w-4 h-4" style={{ color: accentDeep }} />
        </button>

        {/* Заголовок слайда */}
        <h3
          className="font-serif italic text-3xl mb-4"
          style={{ color: accentDeep, fontWeight: 400 }}
        >
          {slide.title}
        </h3>
        <Ornament className="mb-5" />

        {/* Контент */}
        <div className="min-h-[120px] flex flex-col justify-center">
          {slide.content(ink, muted)}
        </div>
      </div>

      {/* Точки-индикаторы */}
      <div className="flex items-center justify-center gap-2 mt-5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Слайд ${i + 1}`}
            className="cursor-pointer transition-all duration-300 rounded-full"
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              background: i === current ? accentDeep : "var(--color-line)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
