// @ts-check

"use strict";

/*
100 most popular repositories with markdownlint config according to the
following query run on https://console.cloud.google.com/bigquery.

SELECT files.repo_name
FROM `bigquery-public-data.github_repos.files` as files
INNER JOIN `bigquery-public-data.github_repos.sample_repos` as repos
  ON files.repo_name = repos.repo_name
WHERE files.path = ".markdownlint.json" OR files.path = ".markdownlint.yaml"
ORDER BY repos.watch_count DESC
LIMIT 100
*/

const queryOutput = `
sequelize/sequelize
mochajs/mocha
osrg/gobgp
Microsoft/TypeScript-Handbook
mobxjs/mobx-react-devtools
pinterest/elixometer
Codeception/CodeceptJS
viatsko/awesome-vscode
fluentribbon/Fluent.Ribbon
GitTools/GitVersion
luruke/barba.js
cybertk/abao
scop/bash-completion
PowerShell/DscResources
ONLYOFFICE/DocumentServer
FreshRSS/FreshRSS
kubernetes/minikube
Azure/azure-rest-api-specs
DavidAnson/markdownlint
OneDrive/onedrive-api-docs
oblador/react-native-keychain
PowerShell/xSharePoint
ControlzEx/ControlzEx
chocolatey/ChocolateyGUI
PlagueHO/LabBuilder
hfp/libxsmm
auth0/docs
zixia/wechaty
mozilla/treeherder
PowerShell/xSQLServer
dotnet/apireviews
baynezy/Html2Markdown
sockethub/sockethub
FlowM2M/AwaLWM2M
gitlabhq/omnibus-gitlab
petehouston/laravel-docs-vn
PowerShell/xPSDesiredStateConfiguration
PowerShell/xActiveDirectory
naokazuterada/MarkdownTOC
GitTools/GitReleaseManager
PowerShell/xNetworking
mweststrate/mobservable-react-devtools
zixia/docker-simple-mail-forwarder
ralish/PSDotFiles
tekezo/ShowyEdge
online-go/gtp2ogs
PowerShell/xStorage
PowerShell/xComputerManagement
cyotek/Cyotek.Windows.Forms.ImageBox
PowerShell/DscResource.Tests
PowerShell/xCertificate
coast-team/netflux
plantain-00/ws-tool
plantain-00/news-fetcher-client
PowerShell/xDnsServer
graze/standards
radsectors/sqlshim
PlagueHO/ciSCSI
IGS/OSDF
PowerShell/xTimeZone
victor73/OSDF
DavidAnson/vscode-markdownlint
Arturas-K/xSQLServer
armbrustlab/seaflowpy
`;

module.exports = queryOutput.
  split(/\r?\n/g).
  filter((line) => Boolean(line)).
  map((line) => {
    const [org, repo] = line.split("/")
    return {
      org,
      repo
    }
  });
