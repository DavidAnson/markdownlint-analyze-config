"use strict";

const fetch = require("node-fetch");
const rules = require("./node_modules/markdownlint/lib/rules");
const repos = require("./repos");

const ruleNames = {
  "default": "default"
};
for (const { names } of rules) {
  const base = names[0];
  for (const name of names) {
    ruleNames[name] = base;
  }
}

(async() => {
  for (const { org, repo } of repos) {
    const url = `https://raw.githubusercontent.com/${org}/${repo}/master/.markdownlint.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Not ok response: ${url}`);
    const text = await response.text();
    const json = {
      "default": true,
      ...JSON.parse(text)
    };
    const config = {};
    for (const name of Object.values(ruleNames)) {
      config[name] = json.default;
    }
    for (const [ name, value ] of Object.entries(json)) {
      const rule = ruleNames[name];
      if (!rule) throw new Error(`Unknown rule: ${name}`);
      config[rule] = Boolean(value);
    }
    delete config.default;
    console.dir(config);
    break;
  }
})();
