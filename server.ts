import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path for storing RSVP responses
const RSVP_FILE = path.join(process.cwd(), "rsvp_responses.json");

// Default initial RSVP responses for presentation
const DEFAULT_RSVP = [
  {
    id: "1",
    name: "Александр и Мария",
    status: "yes",
    guestsCount: 2,
    food: "meat",
    drinks: ["wine_red", "champagne"],
    wishes: "Поздравляем вас с этим невероятным днем! Желаем, чтобы ваш совместный подъем на вершину жизни был полон ярких рассветов, легких троп и верных спутников. С любовью!",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "2",
    name: "Екатерина Смирнова",
    status: "yes",
    guestsCount: 1,
    food: "fish",
    drinks: ["wine_white"],
    wishes: "Ребята, вы потрясающие! До встречи на вершине! Пусть эта экспедиция длиною в жизнь будет самой счастливой.",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "3",
    name: "Дмитрий Петров",
    status: "maybe",
    guestsCount: 1,
    food: "vegetarian",
    drinks: ["whiskey"],
    wishes: "Очень постараюсь быть! Идея с походом и горами просто огонь, предвкушаю крутой вечер у костра!",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  }
];

// Helper to read RSVP
async function readRsvp(): Promise<any[]> {
  try {
    if (fs.existsSync(RSVP_FILE)) {
      const data = await fs.promises.readFile(RSVP_FILE, "utf-8");
      return JSON.parse(data);
    } else {
      // Write defaults first time
      await fs.promises.writeFile(RSVP_FILE, JSON.stringify(DEFAULT_RSVP, null, 2));
      return DEFAULT_RSVP;
    }
  } catch (err) {
    console.error("Error reading RSVP file, using memory fallback", err);
    return memoryRsvp;
  }
}

// Memory fallback in case of write permission issues
let memoryRsvp = [...DEFAULT_RSVP];

async function writeRsvp(data: any[]) {
  try {
    memoryRsvp = data;
    await fs.promises.writeFile(RSVP_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing RSVP file, saved in memory", err);
  }
}

// Lazy Initialize GoogleGenAI client (to prevent crashes if key is missing)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing in Secrets");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API: Setup health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: Get RSVP list
app.get("/api/rsvp", async (req, res) => {
  try {
    const list = await readRsvp();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to load RSVP statistics" });
  }
});

// API: Submit RSVP
app.post("/api/rsvp", async (req, res) => {
  try {
    const { name, status, guestsCount, food, drinks, wishes } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Имя обязательно для заполнения" });
    }

    const list = await readRsvp();
    const newEntry = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      status: status || "yes",
      guestsCount: Number(guestsCount) || 1,
      food: food || "meat",
      drinks: drinks || [],
      wishes: wishes || "",
      createdAt: new Date().toISOString(),
    };

    list.unshift(newEntry);
    await writeRsvp(list);
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ error: "Failed to save RSVP" });
  }
});

// API: Clear RSVP responses (reset)
app.post("/api/rsvp/clear", async (req, res) => {
  try {
    await writeRsvp([]);
    res.json({ message: "RSVP database reset successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset RSVP" });
  }
});

// API: Generate Wishes using Gemini
app.post("/api/gemini/generate-wishes", async (req, res) => {
  try {
    const { name, relation, style } = req.body;
    
    let prompt = `Напиши короткое, душевное и стильное поздравление для молодоженов на свадьбу Джаъфар и Ситора.
Отправитель: ${name || "Гость"}.
Отношение к паре: ${relation || "близкий человек"}.
Стиль поздравления: ${style || "поэтичный"}.

У молодоженов свадебная тема оформлена в изысканном ботаническом/флоральном стиле, очень нежная, гармоничная и глубокая (слоган: "Наше счастливое начало"). Пожалуйста, органично используй метафоры цветущего сада, нежной зелени, природной красоты, гармонии, теплого летнего солнца, уютного очага и чистого звездного неба.
Поздравление должно быть кратким (3-5 предложений), искренним, без банальных заезженных стихов. Напиши на русском языке.`;

    if (style === "humorous") {
      prompt += " Добавь немного легкого, теплого дружеского юмора о семейном счастье и гармонии, но оставайся уважительным.";
    } else if (style === "minimalist") {
      prompt += " Стиль должен быть крайне лаконичным, современным, благородным и минималистичным.";
    } else if (style === "adventure") {
      prompt += " Сделай акцент на нежности, искренности, глубоких чувствах и вечной любви, расцветающей с каждым днем.";
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const resultText = response.text || "Счастья, гармонии и бесконечной любви на долгие годы!";
    res.json({ text: resultText.trim() });
  } catch (err: any) {
    console.error("Gemini wishing generation failed:", err);
    res.status(500).json({ 
      error: "Не удалось сгенерировать поздравление. Проверьте подключение API.",
      details: err.message,
      fallback: "Желаем вам бесконечной любви, взаимопонимания и гармонии на долгие совместные годы!"
    });
  }
});

// API: Improve Love story with Gemini (for editing/admin mode)
app.post("/api/gemini/improve-love-story", async (req, res) => {
  try {
    const { text, concept } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Исходный текст пуст" });
    }

    let conceptDesc = "";
    if (concept === "botanical") {
      conceptDesc = "эко-минимализма, утреннего леса, тишины и чистой поэзии. Стиль благородный, нежный, умиротворяющий";
    } else if (concept === "passion") {
      conceptDesc = "кинематографичной страсти, глубоких чувств, горного заката, тепла костра и искр в ночи. Стиль эмоциональный, красивый, художественный";
    } else if (concept === "tech") {
      conceptDesc = "технологичного экспедиционного логбука, масштаба, альпинистского пути, путевых заметок. Стиль современный, лаконичный, структурный с легким духом приключения";
    } else {
      conceptDesc = "элегантной свадебной истории";
    }

    const prompt = `Преобрази и отредактируй следующий короткий текст истории любви пары для их свадебного сайта.
Исходный текст: "${text}"

Текст должен быть переписан в эстетике концепта: "${conceptDesc}".
Пожалуйста, сделай текст невероятно стильным, легким для чтения, вдохновляющим и уложи его в 2-4 небольших абзаца. Напиши на русском языке. Избегай банальности.`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ text: (response.text || text).trim() });
  } catch (err: any) {
    console.error("Gemini Love story improve failed:", err);
    res.status(500).json({
      error: "Не удалось стилизовать историю любви. Проверьте ключ API.",
      details: err.message
    });
  }
});

// Setup Vite Dev server or build serve
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
