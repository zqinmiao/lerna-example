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

> 那么根部装了`eslint`，即使`package-c`中没有装 eslint，执行`npx lerna run eslint`，package-c 也能正确连接到 eslint 的 CLI

## lerna version
