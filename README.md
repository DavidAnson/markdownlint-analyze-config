# markdownlint-analyze-config

> A simple Node.js program to analyze [`markdownlint`](https://github.com/DavidAnson/markdownlint)'s `.markdownlint.json`/`yaml` configuration files for the most-watched GitHub repositories.

- Repository data comes from [Google BigQuery](https://cloud.google.com/bigquery/), see [repos.js](repos.js).
  - Repository data is [known to be incomplete](https://twitter.com/DavidAns/status/1304962271781687297), happy to find a better way.
- For the most recent analysis output, see [analyze-config.csv](analyze-config.csv).
