import { EventData } from "./types";

export const initialEventData: EventData = {
  coupleNames: "Джаъфар и Ситора",
  groomName: "Джаъфар",
  brideName: "Ситора",
  date: "2026-08-29", // Formatted as YYYY-MM-DD for input elements
  slogan: "Наше счастливое начало",
  heroImage: "/photo1.jpg",
  loveStory: [
    {
      id: "moment1",
      year: "2023",
      title: "Первая встреча",
      description: "Наша история началась июньским днем, когда случайное знакомство изменило всё. С первого момента мы поняли, что нашли родную душу, и этот день стал началом нашего искреннего и теплого союза.",
      image: "/photo2.jpg"
    },
    {
      id: "moment2",
      year: "2024",
      title: "Решение быть вместе",
      description: "За этот год мы разделили множество счастливых моментов, научились понимать друг друга с полуслова и беречь тепло наших чувств. Каждая минута, проведенная вместе, подтверждала, что наш выбор правильный.",
      image: "/photo1.jpg"
    },
    {
      id: "moment3",
      year: "2025",
      title: "Предложение руки и сердца",
      description: "Особенный и трогательный день, когда прозвучали те самые искренние слова признания, заветный вопрос и долгожданное «Да!» С этого момента мы готовимся создать крепкую и счастливую семью.",
      image: "/photo2.jpg"
    }
  ],
  schedule: [
    {
      time: "18:00",
      title: "Сбор гостей",
      description: "Приветственная велкам-зона на уютной веранде. Легкие угощения, напитки, приятная музыка и предвкушение праздника.",
      icon: "users"
    },
    {
      time: "18:30",
      title: "Торжественная церемония",
      description: "Начало официальной части праздника. Самый трогательный момент обмена свадебными клятвами в окружении самых близких людей.",
      icon: "heart"
    },
    {
      time: "19:30",
      title: "Праздничный ужин",
      description: "Торжественный банкет в ресторане «Teia». Поздравления, теплые слова, изысканные блюда и душевная атмосфера.",
      icon: "utensils"
    },
    {
      time: "21:30",
      title: "Свадебный торт и танцы",
      description: "Торжественное разрезание праздничного торта, зажигательная музыкальная программа и танцы под открытым небом.",
      icon: "music"
    }
  ],
  dressCode: {
    description: "Для нас очень важно, чтобы на празднике вы чувствовали себя гармонично и комфортно. Написание нашей семейной истории будет оформлено в изысканных ботанических тонах. Мы будем очень признательны, если при выборе праздничных нарядов вы поддержите благородную палитру нежных и натуральных оттенков.",
    colors: [
      { hex: "#F5F5DC", name: "Beige" },
      { hex: "#E8C5C8", name: "Dusty Rose" },
      { hex: "#E0F2F1", name: "Soft Sage" },
      { hex: "#FAF0E6", name: "Linen" },
      { hex: "#C5B29E", name: "Warm Taupe" }
    ],
    moodboardImages: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1507504038482-76211a7e0fce?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=400"
    ]
  },
  contacts: {
    organizerPhone: "79998887766",
    organizerName: "Мария (Свадебный координатор)",
    playlistUrl: "https://open.spotify.com",
    hashtag: "#JafarAndSitora2026"
  },
  coordinates: {
    lat: "38.5598",
    lng: "68.7870",
    placeName: "Ресторан «Teia»",
    address: "Ресторан «Teia», ул. Навбахор 14",
    mapQuery: "Ресторан Teia"
  }
};
