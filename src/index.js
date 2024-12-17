#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { Translate } = require("@google-cloud/translate").v2;

let translate = undefined;
const fileMapping = {
  "pt-BR": { default: "pt-BR.json", en: "en-US.json", es: "es-ES.json" },
  pt: { default: "pt.json", en: "en.json", es: "es.json" },
};

async function updateTranslationFile(baseContent, targetContent, lang) {
  for (const [key, value] of Object.entries(baseContent)) {
    if (typeof value === "object" && value !== null) {
      targetContent[key] = targetContent[key] || {};
      await updateTranslationFile(value, targetContent[key], lang);
    } else {
      if (!targetContent.hasOwnProperty(key)) {
        const placeholderRegex = /{{(.*?)}}/g;

        const placeholders = [];
        const protectedText = value.replace(placeholderRegex, (match, p1) => {
          placeholders.push(match);
          return `__PLACEHOLDER_${placeholders.length}__`;
        });
        const [translatedText] = await translate.translate(protectedText, lang);
        console.log("[translatedText]", translatedText);
        const finalText = translatedText.replace(
          /__PLACEHOLDER_(\d+)__/g,
          (match, p1) => {
            return placeholders[parseInt(p1) - 1];
          }
        );
        console.log("[finalText]", finalText);
        targetContent[key] = finalText;
      }
    }
  }
}

async function traverseAndTranslate(directory, targetLang = "en") {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);

    if (fs.statSync(fullPath).isDirectory()) {
      if (file === "i18n") {
        const { filePath, targetFilePath } = await getFilePaths(
          fullPath,
          targetLang
        );
        if (fs.existsSync(filePath)) {
          console.log("[filePath]", filePath);
          const ptContent = JSON.parse(fs.readFileSync(filePath, "utf8"));
          let targetContent = {};

          if (fs.existsSync(targetFilePath)) {
            targetContent = JSON.parse(fs.readFileSync(targetFilePath, "utf8"));
          }

          await updateTranslationFile(ptContent, targetContent, targetLang);

          fs.writeFileSync(
            targetFilePath,
            JSON.stringify(targetContent, null, 2),
            "utf8"
          );
        }
      } else {
        await traverseAndTranslate(fullPath, targetLang);
      }
    }
  }
}

async function getFilePaths(fullPath, targetLang) {
  const langPriority = ["pt-BR", "pt"];
  let filePath, targetFilePath;

  for (const lang of langPriority) {
    const defaultFilePath = path.join(fullPath, fileMapping[lang].default);

    if (fs.existsSync(defaultFilePath)) {
      filePath = defaultFilePath;
      targetFilePath = fileMapping[lang][targetLang]
        ? path.join(fullPath, fileMapping[lang][targetLang])
        : null;
      break;
    }
  }

  return { filePath, targetFilePath };
}
(async function main() {
  const config = path.join(__dirname, "../../../config.json");
  fs.readFile(config, "utf8", (err, data) => {
    if (err) {
      console.error("Erro ao ler o arquivo JSON:", err.message);
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      translate = new Translate(jsonData);
      console.log("Conteúdo do JSON:", jsonData);
      const projectRoot = path.join(__dirname, "../../../src/");
      ["en", "es"].forEach(async (lang) => {
        await traverseAndTranslate(projectRoot, lang);
      });
    } catch (parseErr) {
      console.error("Erro ao analisar o arquivo JSON:", parseErr.message);
    }
  });
})();
