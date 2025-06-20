import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
ffmpeg.setFfmpegPath(ffmpegPath);

// Տեքստի բաժանում ≤400 սիմվոլ
function splitText(text, maxLength = 400) {
  const chunks = [];
  let current = "";

  text.split(" ").forEach((word) => {
    if ((current + " " + word).length <= maxLength) {
      current += " " + word;
    } else {
      chunks.push(current.trim());
      current = word;
    }
  });

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// Ձայն ստեղծում, միավորում, ուղարկում
export async function sendVoiceFromText(bot, chatId, text, lang = "en") {
  const chunks = splitText(text, 400);
  const dir = path.join(__dirname, `voices_${chatId}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const partPaths = [];

  for (let i = 0; i < chunks.length; i++) {
    const voicePath = path.join(dir, `part${i + 1}.mp3`);
    partPaths.push(voicePath);

    try {
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          voice: lang === "hy" ? "onyx" : lang === "ru" ? "echo" : "nova",
          input: chunks[i],
        }),
      });

      const buffer = await response.arrayBuffer();
      fs.writeFileSync(voicePath, Buffer.from(buffer));
    } catch (err) {
      console.error(`❌ Error generating part ${i + 1}:`, err.message);
    }
  }

  const mergedPath = path.join(__dirname, `merged_${chatId}.mp3`);

  try {
    await mergeAudioFiles(partPaths, mergedPath);
    await bot.sendVoice(chatId, mergedPath);
  } catch (err) {
    console.error("❌ Merge error:", err.message);
    await bot.sendMessage(chatId, "🎙️ Error merging voice parts.");
  } finally {
    partPaths.forEach((file) => fs.existsSync(file) && fs.unlinkSync(file));
    if (fs.existsSync(mergedPath)) fs.unlinkSync(mergedPath);
    fs.existsSync(dir) && fs.rmdirSync(dir);
  }
}

// ⬇️ Ձայնային ֆայլերի միավորման ֆունկցիա
function mergeAudioFiles(files, outputPath) {
  return new Promise((resolve, reject) => {
    const command = ffmpeg();

    files.forEach((file) => command.input(file));

    command
      .on("error", reject)
      .on("end", resolve)
      .mergeToFile(outputPath);
  });
}
