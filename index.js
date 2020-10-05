"use strict";

const fs = require("fs").promises;
const path = require("path");
const fetch = require("node-fetch");
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
      const url = `https://raw.githubusercontent.com/${org}/${repo}/master/.markdownlint.json`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Not ok response: ${url}`);
      const text = await response.text();
      await fs.writeFile(cacheFile, text);
    }
    console.log(`Parsing ${org}/${repo}...`);
    const text = await fs.readFile(cacheFile, "utf8");
    const json = {
      "default": true,
      "MD002": false,
      "MD006": false,
      ...JSON.parse(text)
    };
    const config = {};
    for (const name of Object.values(ruleNames)) {
      config[name] = json.default;
    }
    for (const [ name, value ] of Object.entries(json)) {
      const rule = ruleNames[name] || tagNames[name];
      if (!rule) throw new Error(`Unknown rule/tag: ${name}`);
      for (const r of (Array.isArray(rule) ? rule : [ rule ])) {
        config[r] = Boolean(value);
      }
    }
    delete config.default;
    console.dir(config);
  }
})();
