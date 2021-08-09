# Lerna example

## 开始的基本操作

```bash
$ mkdir lerna-example && cd $_
$ npm install lerna -D
# 采用独立模式
$ npx lerna init --independent
```

> `lerna.json`的相关解释[到这里](https://github.com/lerna/lerna#lernajson)

## 创建三个 package

在`packages`下新增三个 package

```bash
├── package-a
│   ├── index.js
│   └── package.json
├── package-b
│   ├── index.js
│   └── package.json
└── package-c
    ├── index.js
    └── package.json
```

运行`lerna bootstrap`安装依赖。（lerna 架构，不推荐使用 npm install）

> 那么根部装了`eslint`，即使`package-c`中没有装 eslint，也没有依赖 eslint。
> 执行`npx lerna run eslint`，package-c 也能正确连接到 eslint 的 CLI，**需要在根部执行命令**

根部 package.json

```json
{
  "devDependencies": {
    "lerna": "^4.0.0",
    "eslint": "^7.32.0"
  }
}
```

package-c/package.json

```json
{
  "dependencies": {
    "package-b": "1.0.0"
  }
}
```

## 探索工作流

## lerna version

下面我们从 lerna version 开始探索 lerna 的工作流

Make changes && Commit those changes

```bash
$ git add .
$ git commit -m "xxxx"
```

直接执行`lerna version`，如果没有关联远程仓库的情况下，会有如下报错：

```bash
$ npx lerna version

lerna notice cli v4.0.0
lerna info versioning independent
lerna ERR! ENOREMOTEBRANCH Branch 'master' doesn't exist in remote 'origin'.
lerna ERR! ENOREMOTEBRANCH If this is a new branch, please make sure you push it to the remote first.

```

由于`lerna version`会默认提交到远程仓库，如果我们不想让它自动`git push`,可以执行`npx lerna version --no-push`，之后让选择各个 package 的版本号：

```bash
$ npx lerna version --no-push
lerna notice cli v4.0.0
lerna info versioning independent
lerna info Assuming all packages changed
? Select a new version for package-a (currently 1.0.0) Prepatch (1.0.1-alpha.0)
? Select a new version for package-b (currently 1.0.0) Preminor (1.1.0-alpha.0)
? Select a new version for package-c (currently 1.0.0) (Use arrow keys)
❯ Patch (1.0.1)
  Minor (1.1.0)
  Major (2.0.0)
  Prepatch (1.0.1-alpha.0)
  Preminor (1.1.0-alpha.0)
  Premajor (2.0.0-alpha.0)
  Custom Prerelease
  Custom Version
```

选择完后确认版本，`y`确认：

```bash
lerna notice cli v4.0.0
lerna info versioning independent
lerna info Assuming all packages changed
? Select a new version for package-a (currently 1.0.0) Prepatch (1.0.1-alpha.0)
? Select a new version for package-b (currently 1.0.0) Preminor (1.1.0-alpha.0)
? Select a new version for package-c (currently 1.0.0) Patch (1.0.1)

Changes:
 - package-a: 1.0.0 => 1.0.1-alpha.0
 - package-b: 1.0.0 => 1.1.0-alpha.0
 - package-c: 1.0.0 => 1.0.1

? Are you sure you want to create these versions? (ynH)
```

然后，就会生成一个 release 相关的 commit，以及三个 git tag（三个包各一个 tag）

## 生成 changelog

如果不是显式的执行`lerna version --conventional-commits`，则不会生成`CHANGELOG.md`文件。

### [lerna-changelog](https://github.com/lerna/lerna-changelog)（失败）

我们尝试使用`lerna-changelog`来生成`CHANGELOG.md`。

它有以下特点：

- repo: Your "org/repo" on GitHub (automatically inferred from the package.json file)

- nextVersion: Title for unreleased commits (e.g. Unreleased)

- labels: GitHub PR labels mapped to changelog section headers

- ignoreCommitters: List of committers to ignore (exact or partial match). Useful for example to ignore commits from bots.

- cacheDir: Path to a GitHub API response cache to avoid throttling (e.g. .changelog)

**使用**

```json
# 根部 package.json
{
"scripts": {
    "postversion": "lerna-changelog"
  },
"changelog": {
    "labels": {
      "feature": "🎸 New Feature",
      "feat": "🎸 New Feature",
      "fix": "Bug Fix"
    }
  }
}
```

```bash
$ npm install --save-dev lerna-changelog
$ npx lerna version --no-push

# 选择完各个版本后，报如下错

> lerna-changelog

Could not infer "repo" from the "package.json" file.
lerna info lifecycle lerna-example@1.0.0~postversion: Failed to exec postversion script
lerna ERR! lifecycle "postversion" errored in "lerna-example", exiting 1
```

这是因为没有在`changelog`中配置`repo`导致的，添加上：

```json
{
  "changelog": {
    "repo": "https://github.com/xxxx/xxx"
  }
}
```

执行`npx lerna-changelog`，让提供`GITHUB_AUTH`，遂放弃之。

```bash
$ npx lerna-changelog
Must provide GITHUB_AUTH
```

**能不能结合`standard-version`，来生成`CHANGELOG.md`呢？**

### 结合[`standard-version`](https://github.com/conventional-changelog/standard-version)（失败）

**通过`standard-version`的工作流程:**

standard-version will then do the following:

1. Retrieve the current version of your repository by looking at packageFiles[1], falling back to the last git tag.
2. bump the version in bumpFiles[1] based on your commits.
   Generates a changelog based on your commits (uses conventional-changelog under the hood).
3. Creates a new commit including your bumpFiles[1] and updated CHANGELOG.
4. Creates a new tag with the new version number.

**以及[lerna version 的工作流程](https://github.com/lerna/lerna/tree/main/commands/version#usage)：**

When run, this command does the following:

1. Identifies packages that have been updated since the previous tagged release.
2. Prompts for a new version.
3. Modifies package metadata to reflect new release, running appropriate lifecycle scripts in root and per-package.
4. Commits those changes and tags the commit.
5. Pushes to the git remote.

**我想应该可以结合出以下流程：**

1. 只用`standard-version`生成`CHANGELOG.md`的功能，并将其他[生命周期跳过](https://github.com/conventional-changelog/standard-version#skipping-lifecycle-steps)

```js
// 根部 .versionrc.js
module.exports = {
  // ..,
  // 跳过的生命周期
  skip: {
    bump: true,
    commit: true,
    tag: true,
  },
};
```

2. 在根部`package.json`中增加 script

```json
{
  "scripts": {
    "version": "lerna run release && git add ."
  }
}
```

3. 在每个子 package 的`package.json`中增加 script

```json
{
  "scripts": {
    "release": "standard-version"
  }
}
```

最后在根部执行`npx lerna version --no-push`

#### 但是会有问题

CHANGELOG.md 内容会出现重复的现象，如下，「增加 standard-version」重复。

```
# Changelog
## 1.2.0-alpha.0 (2021-08-06)


### 🎸 Features

* 在package-a中加入构建流程 ([647b341](https://github.com/zqinmiao/lerna-example/commit/647b3414b76b7f766b7786f9c037eb7b3f858fbf))
* 增加standard-version ([93c7cf6](https://github.com/zqinmiao/lerna-example/commit/93c7cf623209dcdfaccb70fd818148dfcc0cad35))

## 1.1.0-alpha.0 (2021-08-06)

### 🎸 Features

- 增加 standard-version ([93c7cf6](https://github.com/zqinmiao/lerna-example/commit/93c7cf623209dcdfaccb70fd818148dfcc0cad35))

```

### 使用 lerna [--conventional-commits](https://github.com/lerna/lerna/tree/main/commands/version#--conventional-commits)（成功）

相关选项还有：

- [--conventional-graduate](https://github.com/lerna/lerna/tree/main/commands/version#--conventional-graduate)
- [--conventional-prerelease](https://github.com/lerna/lerna/tree/main/commands/version#--conventional-prerelease)

#### 使用

lerna.json 中增加如下配置

```json
{
	"version": {
     "changelogPreset": {
        "name": "conventionalcommits",
        "types": [
          { "type": "feat", "section": "🎸 Features" },
          { "type": "feature", "section": "🎸 Features" },
          { "type": "fix", "section": "🐛 Bug Fixes" },
          { "type": "perf", "section": "⚡️ Performance Improvements" },
          { "type": "revert", "section": ":rewind: Reverts" },
          { "type": "docs", "section": "Documentation", "hidden": true },
          { "type": "style", "section": "Styles", "hidden": true },
          {
            "type": "chore",
            "section": "Miscellaneous Chores",
            "hidden": true
          },
          {
            "type": "refactor",
            "section": "💡 Code Refactoring",
            "hidden": true
          },
          { "type": "test", "section": "Tests", "hidden": true },
          { "type": "build", "section": "Build System", "hidden": true },
          { "type": "ci", "section": "Continuous Integration", "hidden": true }
        ]
      }
    }
  }
}
```

```bash
# 根目录安装 conventional-changelog-conventionalcommits
$ npm install conventional-changelog-conventionalcommits -D

# 执行
$ lerna version --no-push --conventional-commits
```

使用`--conventional-commits`后就不能像上面给每个包自主选择版本号了，会变成如下形式：

```bash
lerna info versioning independent
lerna info Looking for changed packages since @buibis/package-a@1.0.2-alpha.0
lerna info ignoring diff in paths matching [ 'ignored-file', '*.md' ]

Changes:
 - package-a: 1.0.2-alpha.0 => 1.0.3-alpha.0
 - package-b: 1.2.0-alpha.0 => 1.2.1-alpha.0
 - package-c: 0.0.3-alpha.0 => 0.0.4-alpha.0

? Are you sure you want to create these versions? Yes
```

#### [semver bump](https://github.com/lerna/lerna/tree/main/commands/version#semver-bump)，可供选择：

```bash
lerna version [major | minor | patch | premajor | preminor | prepatch | prerelease]
# uses the next semantic version(s) value and this skips `Select a new version for...` prompt
```

比如，可以这样：

```json
{
  "scripts": {
    "r": "lerna version --no-push --conventional-commits"
  }
}
```

```bash
$ npm run r prepatch
```

## 加入 Lint 流程

Lint 步骤一般放在更新版本号之前，即`preversion`，在每个子包的 package.json 的 scripts 设置如下：

```json
{
  "scripts": {
    "preversion": "npm run codecheck",
    "codecheck": "echo \"开始codecheck\""
  }
}
```

## 加入测试流程

测试步骤也是放在更新版本号之前（如果有 Lint，可放在 Lint 之后），一般应为`preversion`，在每个子包的 package.json 的 scripts 设置如下：

```json
{
  "scripts": {
    "preversion": "npm run test",
    "test": "echo \"测试通过\""
  }
}
```

## 加入构建流程

构建步骤一般放在更新版本号之后，即`postversion`，在每个子包的 package.json 的 scripts 设置如下：

```json
{
  "scripts": {
    "postversion": "npm run build",
    "build": "echo \"开始build\""
  }
}
```

## 使用[`lerna publish`](https://github.com/lerna/lerna/tree/main/commands/publish#lernapublish)将包发布到 npm registry

有三个命令：

```bash
lerna publish              # publish packages that have changed since the last release
lerna publish from-git     # explicitly publish packages tagged in the current commit
lerna publish from-package # explicitly publish packages where the latest version is not present in the registry
```

我们使用`lerna publish from-package`，因为前两个还是会提示你更改版本号，我们现在的工作流并不需要。

### [per-package-configuration](https://github.com/lerna/lerna/tree/main/commands/publish#per-package-configuration)

子包可以使用特殊的 publishConfig 进行配置，会更改 lerna publish 的行为。

- [publishConfig.access](https://github.com/lerna/lerna/tree/main/commands/publish#publishconfigaccess)

  如果是`@scope`包，publishConfig.access 要设为`public`，不然会导致发包失败。

- [publishConfig.registry](https://github.com/lerna/lerna/tree/main/commands/publish#publishconfigregistry)

  如果有私有 npm registry，需要设置 publishConfig.registry

- [publishConfig.directory](https://github.com/lerna/lerna/tree/main/commands/publish#publishconfigdirectory)

  如果需要指定发包的文件夹，可设置 publishConfig.directory

## 添加 packages

### 新的 packages

在`packages`文件夹中为你的的 package 创建一个目录，然后正常运行 `npm init` 为你的的新包创建 package.json。

或者使用[`lerna create <name> [loc]`](https://github.com/lerna/lerna/tree/main/commands/create#readme)

### 已存在的 packages

您可以使用 [lerna import <package>](https://github.com/lerna/lerna/blob/main/commands/import/README.md) 将现有 package 传输到您的 Lerna 存储库中；此命令将保留提交历史记录。

[lerna import <package>](https://github.com/lerna/lerna/blob/main/commands/import/README.md) 采用本地路径而不是 URL。在这种情况下，你将需要在你的文件系统上拥有您希望链接到的存储库。

#### [--preserve-commit](https://github.com/lerna/lerna/tree/main/commands/import#--preserve-commit)

建议使用`--preserve-commit`，因为这样可以保留原始的 commit 人员的记录

```bash
$ cd ~/Product

# 查看路径
$ pwd

$ lerna import ~/Product --preserve-commit
```

## 包的依赖及更新

lerna 会分析包及包的依赖更新，假设：package-c 依赖 package-b，package-b 依赖 package-a。在一次更改中，package-a 被更改后，运行`lerna version --no-push --conventional-commits prepatch`，lerna 工作的流程如下：

- 先执行`package-c`及相关的 lifecycle
- 执行`package-a`及相关的 lifecycle
- 最后执行`package-b`及相关的 lifecycle

这样的工作流就确保了依赖和被依赖的构建及测试流程能够完全符合预期。

### CHANGELOG.md

依然接上面的场景，`package-a`被更改后的 git commit，在生成 changelog 时，只会出现在`package-a`的`CHANGELOG.md`中。`package-b`和`package-c`由于只是被动依赖触发的版本更新，所以更新的 changelog 内容如下：

```
### [1.2.4-alpha.0](https://github.com/zqinmiao/lerna-example/compare/@buibis/package-b@1.2.3-alpha.0...@buibis/package-b@1.2.4-alpha.0) (2021-08-09)

**Note:** Version bump only for package @buibis/package-b

```

### 依赖非 packages 中的包的版本

比如`package-b`中依赖的`package-a`的版本不是本地的版本`1.0.5-alpha.0`，而是线上的`^1.0.3-alpha.0`。那么在更新`package-a`时，`package-b`就不会受到联动更新了。

## 将本地代码 push 至远程

通常，在将各个包发布到远程 registry 后，应当第一时间将本地代码 push 至远程 git 仓库。所以应当在根目录`package.json`中的设置如下 script：

```bash
{
	"scripts": {
    "postpublish": "git push && git push origin --tags"
  },
}
```

## [Frequently asked questions](https://github.com/lerna/lerna/blob/main/FAQ.md)
