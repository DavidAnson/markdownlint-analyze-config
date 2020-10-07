"use strict";

const fs = require("fs").promises;
const path = require("path");
const fetch = require("node-fetch");
const yaml = require("yaml");
const rules = require("./node_modules/markdownlint/lib/rules");
const repos = require("./repos");

const urlPaths = [
  "master/.markdownlint.json",
  "master/.markdownlint.yaml",
  "main/.markdownlint.json",
  "devel/.markdownlint.json"
];

const exists = async (path) => {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

const canonicalRule = {
  "default": "default"
};
const tagRules = {};
for (const { names, tags } of rules) {
  const base = names.join("/");
  for (const name of names) {
    canonicalRule[name] = base;
  }
  for (const tag of tags) {
    tagRules[tag] = [
      ...(tagRules[tag] || []),
      base
    ];
  }
}
const canonicalRuleSet = new Set(Object.values(canonicalRule));
canonicalRuleSet.delete("default");
const canonicalRules = [ ...canonicalRuleSet ];
canonicalRules.sort();

(async() => {
  const csvLines = [];
  const cacheDir = path.join(__dirname, "cache");
  if (!await exists(cacheDir)) {
    await fs.mkdir(cacheDir);
  }
  for (const { org, repo } of repos) {
    const cacheFile = path.join(cacheDir, `${org}.${repo}.json`);
    if (!await exists(cacheFile)) {
      console.log(`Downloading ${org}/${repo}...`);
      let url = null;
      let response = null;
      for (const urlPath of urlPaths) {
        url = `https://raw.githubusercontent.com/${org}/${repo}/${urlPath}`;
        response = await fetch(url);
        if (response.ok) {
          break;
        }
      }
      if (!response.ok) throw new Error(`Not ok response (${response.status}): ${url}`);
      const text = await response.text();
      await fs.writeFile(cacheFile, text, "utf8");
    }
    console.log(`Parsing ${org}/${repo}...`);
    const text = await fs.readFile(cacheFile, "utf8");
    let configParsed = null;
    try {
      configParsed = JSON.parse(text);
    } catch {
      configParsed = yaml.parse(text);
    }
    delete configParsed.resultVersion;
    const configEffective = {
      "default": true,
      "MD002": false,
      "MD006": false,
      ...configParsed
    };
    const configSimplified = {};
    for (const name of canonicalRules) {
      configSimplified[name] = configEffective.default;
    }
    for (const [ name, value ] of Object.entries(configEffective)) {
      const rule = canonicalRule[name] || tagRules[name];
      if (rule === "default") continue;
      if (!rule) throw new Error(`Unknown rule/tag: ${name}`);
      for (const r of (Array.isArray(rule) ? rule : [ rule ])) {
        configSimplified[r] = Boolean(value);
      }
    }
    console.dir(configSimplified);
    const row = [ `${org}/${repo}` ];
    for (const name of canonicalRules) {
      row.push(configSimplified[name] ? 1 : 0);
    }
    csvLines.push(row.join(","));
  }
  const headings = [
    "Org/Repo",
    ...canonicalRules
  ];
  csvLines.unshift(headings.join(","));
  await fs.writeFile(path.join(__dirname, "analyze-config.csv"), csvLines.join("\n"), "utf8");
})();
