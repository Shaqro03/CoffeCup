// ✅ File: bot.js
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import * as dotenv from "dotenv";
import OpenAI from "openai";
import { translate } from "../translations/index.mjs";
import { sendVoiceFromText } from "../lib/voiceUtils.mjs";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const userLanguages = new Map();
const userCoffeePhotos = new Map();
const userLastPrediction = new Map();

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, translate("CHOOSE_LANGUAGE", "en"), {
    reply_markup: {
      keyboard: [["\uD83C\uDDE6\uD83C\uDDF2 Հայերեն", "\uD83C\uDDF7\uD83C\uDDFA Русский", "\uD83C\uDDEC\uD83C\uDDE7 English"]],
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  });
});

// Text message handler
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "🇦🇲 Հայերեն") {
    userLanguages.set(chatId, "hy");
    userCoffeePhotos.set(chatId, []);
    bot.sendMessage(chatId, translate("LANGUAGE_SELECTED", "hy"));
    bot.sendMessage(chatId, translate("INTRO_COFFEE", "hy"));
    return;
  }

  if (text === "🇷🇺 Русский") {
    userLanguages.set(chatId, "ru");
    userCoffeePhotos.set(chatId, []);
    bot.sendMessage(chatId, translate("LANGUAGE_SELECTED", "ru"));
    bot.sendMessage(chatId, translate("INTRO_COFFEE", "ru"));
    return;
  }

  if (text === "🇬🇧 English") {
    userLanguages.set(chatId, "en");
    userCoffeePhotos.set(chatId, []);
    bot.sendMessage(chatId, translate("LANGUAGE_SELECTED", "en"));
    bot.sendMessage(chatId, translate("INTRO_COFFEE", "en"));
    return;
  }

  if (text === "/done") {
    const photos = userCoffeePhotos.get(chatId) || [];
    if (photos.length === 0) {
      bot.sendMessage(chatId, "You haven't sent any photos yet.");
      return;
    }
    await handleCoffeeReading(chatId, photos);
  }
});

// Photo collection
bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;
  const photos = userCoffeePhotos.get(chatId) || [];
  const fileId = msg.photo[msg.photo.length - 1].file_id;

  try {
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
    const imageBytes = (await axios.get(fileUrl, { responseType: "arraybuffer" })).data;
    const base64Image = Buffer.from(imageBytes).toString("base64");
    photos.push(base64Image);
    userCoffeePhotos.set(chatId, photos);

    if (photos.length === 1) {
      bot.sendMessage(chatId, translate("WAITING_PHOTOS", userLanguages.get(chatId) || "en"));
    }

    if (photos.length >= 3) {
      await handleCoffeeReading(chatId, photos);
    }
  } catch (err) {
    console.error("Photo error:", err.message);
    bot.sendMessage(chatId, translate("SOMETHING_WENT_WRONG", userLanguages.get(chatId) || "en"));
  }
});

// Main GPT handler
async function handleCoffeeReading(chatId, base64Photos) {
  const lang = userLanguages.get(chatId) || "en";

  bot.sendMessage(chatId, translate("PROCESSING_READING", lang));

  try {
    const messages = [
      {
        role: "system",
        content:
          lang === "hy"
            ? "Դու միստիկ սուրճի բաժակ նայող ես։ Դու կարող ես նկարից գուշակել մարդու ներկան, ներաշխարհը և մոտ ապագան:"
            : lang === "ru"
            ? "Ты мистический толкователь кофейной гущи. Анализируй фото и расскажи о внутреннем мире и будущем человека."
            : "You are a mystical coffee cup reader. You can predict a person's character and future based on coffee cup images.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              lang === "hy"
                ? "Սա սուրճի բաժակ է։ Նայիր բաժակին և պատմիր այն, ինչ տեսնում ես։"
                : lang === "ru"
                ? "Это фото кофейной чашки. Расскажи, что ты видишь."
                : "This is a coffee cup photo. Tell me what you see.",
          },
          ...base64Photos.map((base64) => ({
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64}` },
          })),
        ],
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    });

    const result = response.choices[0].message.content;
    await bot.sendMessage(chatId, result);

    userLastPrediction.set(chatId, { text: result, lang });
    await bot.sendMessage(chatId, translate("CHOOSE_AUDIO", lang), {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔊 Yes", callback_data: "AUDIO_YES" }],
          [{ text: "❌ No", callback_data: "AUDIO_NO" }],
        ],
      },
    });
  } catch (err) {
    console.error("GPT reading error:", err.message);
    bot.sendMessage(chatId, translate("SOMETHING_WENT_WRONG", lang));
  } finally {
    userCoffeePhotos.set(chatId, []);
  }
}

// Voice generation request
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const prediction = userLastPrediction.get(chatId);

  if (!prediction) {
    await bot.answerCallbackQuery(query.id, { text: "No recent prediction found." });
    return;
  }

  const lang = prediction.lang;

  if (data === "AUDIO_YES") {
    await bot.answerCallbackQuery(query.id);
    await bot.sendMessage(chatId, translate("AUDIO_SENT", lang));
    await sendVoiceFromText(bot, chatId, prediction.text, lang);
  }

  if (data === "AUDIO_NO") {
    await bot.answerCallbackQuery(query.id);
    await bot.sendMessage(chatId, translate("NO_AUDIO", lang));
  }
});


export default bot;