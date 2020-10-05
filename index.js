"use strict";

const fs = require("fs").promises;
const path = require("path");
const fetch = require("node-fetch");
const yaml = require("yaml");
const rules = require("./node_modules/markdownlint/lib/rules");
const repos = require("./repos");

const exists = async (path) => {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

const ruleNames = {
  "default": "default"
};
const tagNames = {};
for (const { names, tags } of rules) {
  const base = names.join("/");
  for (const name of names) {
    ruleNames[name] = base;
  }
  for (const tag of tags) {
    tagNames[tag] = [
      ...(tagNames[tag] || []),
      base
    ];
  }
}

(async() => {
  const cacheDir = path.join(__dirname, "cache");
  if (!await exists(cacheDir)) {
    await fs.mkdir(cacheDir);
  }
  for (const { org, repo } of repos) {
    const cacheFile = path.join(cacheDir, `${org}.${repo}.json`);
    if (!await exists(cacheFile)) {
      console.log(`Downloading ${org}/${repo}...`);
      let url = `https://raw.githubusercontent.com/${org}/${repo}/master/.markdownlint.json`;
      let response = await fetch(url);
      if (!response.ok) {
        url = `https://raw.githubusercontent.com/${org}/${repo}/master/.markdownlint.yaml`;
        response = await fetch(url);
      }
      if (!response.ok) throw new Error(`Not ok response (${response.status}): ${url}`);
      const text = await response.text();
      await fs.writeFile(cacheFile, text);
    }
    console.log(`Parsing ${org}/${repo}...`);
    const text = await fs.readFile(cacheFile, "utf8");
    let configParsed = null;
    try {
      configParsed = JSON.parse(text);
    } catch {
      configParsed = yaml.parse(text);
    }
    const configEffective = {
      "default": true,
      "MD002": false,
      "MD006": false,
      ...configParsed
    };
    const configSimplified = {};
    for (const name of Object.values(ruleNames)) {
      configSimplified[name] = configEffective.default;
    }
    for (const [ name, value ] of Object.entries(configEffective)) {
      const rule = ruleNames[name] || tagNames[name];
      if (!rule) throw new Error(`Unknown rule/tag: ${name}`);
      for (const r of (Array.isArray(rule) ? rule : [ rule ])) {
        configSimplified[r] = Boolean(value);
      }
    }
    delete configSimplified.default;
    console.dir(configSimplified);
  }
})();
