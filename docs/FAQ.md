## gitlab CI 中报：`lerna ERR! ENOGIT Detached git HEAD, please checkout a branch to choose versions.`

这是因为执行`npx lerna version prerelease --no-push --conventional-commits`时，默认会情况下终端中会有确认操作。我们需要让其默认行为就是 yes，所以需要在命令中加上`--yes`：`npx lerna version prerelease --no-push --conventional-commits --yes`
