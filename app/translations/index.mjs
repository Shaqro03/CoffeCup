const translations = {
  en: {
    CHOOSE_LANGUAGE: "Please choose your language:",
    LANGUAGE_SELECTED: "Language set to English ✅",
    INTRO_COFFEE: "Please send me 1 to 3 photos of your coffee cup ☕. For better accuracy, try to capture it from different angles.\n\nWhen done, type /done.",
    WAITING_PHOTOS: "Waiting for your coffee cup photos...",
    PROCESSING_READING: "🔮 Reading your coffee cup... Please wait a moment...",
    SOMETHING_WENT_WRONG: "Something went wrong. Please try again later.",
    CHOOSE_AUDIO: "Would you like to hear the audio version of the prediction?",
    AUDIO_SENT: "🎧 Here's your audio reading.",
    NO_AUDIO: "Okay! Let me know if you change your mind.",
  },
  ru: {
    CHOOSE_LANGUAGE: "Пожалуйста, выберите язык:",
    LANGUAGE_SELECTED: "Язык установлен на русский ✅",
    INTRO_COFFEE: "Пожалуйста, отправьте от 1 до 3 фото вашей кофейной чашки ☕. Для точности постарайтесь сделать снимки под разными углами.\n\nКогда закончите, напишите /done.",
    WAITING_PHOTOS: "Ожидаю фото вашей кофейной чашки...",
    PROCESSING_READING: "🔮 Читаю вашу кофейную чашку... Пожалуйста, подождите немного...",
    SOMETHING_WENT_WRONG: "Что-то пошло не так. Пожалуйста, попробуйте позже.",
    CHOOSE_AUDIO: "Хотите получить голосовую версию предсказания?",
    AUDIO_SENT: "🎧 Вот ваше аудио предсказание.",
    NO_AUDIO: "Хорошо! Если передумаете — скажите.",
  },
  hy: {
    CHOOSE_LANGUAGE: "Խնդրում եմ ընտրեք լեզուն․",
    LANGUAGE_SELECTED: "Լեզուն՝ Հայերեն ✅",
    INTRO_COFFEE: "Ուղարկիր 1-ից 3 սուրճի բաժակի լուսանկար ☕։ Ավելի ճշգրիտ գուշակության համար նկարիր տարբեր անկյուններից։\n\nԵրբ պատրաստ ես, գրիր /done։",
    WAITING_PHOTOS: "Սպասում եմ սուրճի բաժակի լուսանկարներին...",
    PROCESSING_READING: "🔮 Ուսումնասիրում եմ բաժակդ... Խնդրում եմ սպասիր մի պահ...",
    SOMETHING_WENT_WRONG: "Ինչ-որ սխալ տեղի ունեցավ։ Փորձիր մի փոքր հետո։",
    CHOOSE_AUDIO: "Ցանկանու՞մ եք ստանալ գուշակության ձայնային տարբերակը 📢",
    AUDIO_SENT: "🎧 Ահա ձեր ձայնային գուշակությունը։",
    NO_AUDIO: "Լավ։ Եթե փոխեք միտքդ՝ ասա ինձ :)",

  },
};

export const translate = (key, lang = "en") => {
  if (translations?.[lang]?.[key]) {
    return translations[lang][key];
  }
  return key;
};
