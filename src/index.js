#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { Translate } = require("@google-cloud/translate").v2;

let translate = undefined;

async function updateTranslationFile(baseContent, targetContent, lang) {
  for (const [key, value] of Object.entries(baseContent)) {
    if (typeof value === "object" && value !== null) {
      targetContent[key] = targetContent[key] || {};
      await updateTranslationFile(value, targetContent[key], lang);
    } else {
      if (!targetContent.hasOwnProperty(key)) {
        const [translation] = await translate.translate(value, lang);
        targetContent[key] = translation;
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
        console.log(fullPath);
        const ptFilePath = path.join(fullPath, "pt.json");
        const targetFilePath = path.join(fullPath, `${targetLang}.json`);

        console.log(ptFilePath);
        if (fs.existsSync(ptFilePath)) {
          const ptContent = JSON.parse(fs.readFileSync(ptFilePath, "utf8"));
          console.log(ptContent);
          let targetContent = {};

          if (fs.existsSync(targetFilePath)) {
            targetContent = JSON.parse(fs.readFileSync(targetFilePath, "utf8"));
          }
          console.log(targetContent);

          await updateTranslationFile(ptContent, targetContent, targetLang);

          fs.writeFileSync(
            targetFilePath,
            JSON.stringify(targetContent, null, 2),
            "utf8"
          );
          console.log(`Arquivo de tradução atualizado: ${targetFilePath}`);
        }
      } else {
        await traverseAndTranslate(fullPath, targetLang);
      }
    }
  }
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
