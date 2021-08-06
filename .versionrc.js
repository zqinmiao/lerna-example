module.exports = {
  header: "# Changelog",
  // releaseCommitMessageFormat: "chore(release): v{{currentTag}} :tada:",
  types: [
    { type: "feat", section: "🎸 Features" },
    { type: "feature", section: "🎸 Features" },
    { type: "fix", section: "🐛 Bug Fixes" },
    { type: "perf", section: "⚡️ Performance Improvements" },
    { type: "revert", section: ":rewind: Reverts" },
    { type: "docs", section: "Documentation", hidden: true },
    { type: "style", section: "Styles", hidden: true },
    { type: "chore", section: "Miscellaneous Chores", hidden: true },
    { type: "refactor", section: "💡 Code Refactoring", hidden: true },
    { type: "test", section: "Tests", hidden: true },
    { type: "build", section: "Build System", hidden: true },
    { type: "ci", section: "Continuous Integration", hidden: true },
  ],
  // 跳过的生命周期
  skip: {
    bump: true,
    commit: true,
    tag: true,
  },
};