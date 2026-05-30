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
      title: "Welcome",
      description: "Встреча гостей, приветственный фуршет и первые кадры на фотозоне.",
      icon: "users"
    },
    {
      time: "19:00",
      title: "Свадебная церемония",
      description: "Самый трогательный момент — рождение новой семьи.",
      icon: "heart"
    },
    {
      time: "19:15",
      title: "Фотосессия с Джаъфаром и Ситорой",
      description: "Специально выделенное время в холле, чтобы каждый гость мог лично поздравить пару и сделать памятные снимки с молодожёнами.",
      icon: "camera"
    },
    {
      time: "19:25",
      title: "Торжественный ужин и шоу-программа",
      description: "Поздравления, интерактивы от ведущего и живой звук.",
      icon: "utensils"
    },
    {
      time: "20:45",
      title: "Первый танец молодожёнов",
      description: "Особенный момент вечера под знаковую мелодию.",
      icon: "heart"
    },
    {
      time: "21:40",
      title: "Свадебный торт & Свободный танцпол",
      description: "Красивая традиция вечера и яркий танцевальный финал от DJ.",
      icon: "music"
    }
  ],
  dressCode: {
    description: "Наш вечер — это особый праздник, и мы мечтаем видеть вас во всём великолепии. Просим соблюдать дресс-код: Black Tie или Cocktail. Пожалуйста, воздержитесь от белого и чёрного цвета — эти оттенки зарезервированы для молодожёнов.",
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
    lat: "41.330472",
    lng: "69.272406",
    placeName: "Ресторан «Teia»",
    address: "г. Ташкент, ул. Зульфияханум, 73",
    mapQuery: "Ташкент, улица Зульфияханум, 73"
  }
};
