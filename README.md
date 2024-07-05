# npm-template-typescript

[![Build Status](https://github.com/myria-libs/airdrop-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/myria-libs/airdrop-js/actions/workflows/ci.yml?query=branch%3Amain)
[![Release Status](https://github.com/myria-libs/airdrop-js/actions/workflows/publish.yml/badge.svg)](https://github.com/myria-libs/airdrop-js/actions/workflows/publish.yml)
[![NPM Version](https://badgen.net/npm/v/@myria-libs/airdrop-js)](https://npmjs.org/package/@myria-libs/airdrop-js)
[![NPM Install Size](https://badgen.net/packagephobia/install/@myria-libs/airdrop-js)](https://packagephobia.com/result?p=@make-everything-simple%2Fnpm-template-typescript)
[![NPM Downloads](https://badgen.net/npm/dm/@myria-libs/airdrop-js)](https://npmcharts.com/compare/@myria-libs/airdrop-js?minimal=true)

`airdrop-js` supports transfer ERC20 tokens to a list of recipient addresses in L1 with claim based approach known as L1-Claim

## Prerequisites

The following tools need to be installed:

-   [Git](http://git-scm.com/)
-   [Node.js 18+](http://nodejs.org/)

## Capabilities and Frameworks

| Capability           | Module                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dependence Framework | [`@tsconfig/node18`](https://www.npmjs.com/package/@tsconfig/node18) extend ts config node18+, [typescript](https://www.npmjs.com/package/typescript) adds optional types to JavaScript that support tools for large-scale JavaScript applications, [thirdweb-dev](https://github.com/thirdweb-dev/js) performant & lightweight SDK to interact with any EVM chain from Node, React and React Native                                      |
| Build Tools          | [`tsup`](https://tsup.egoist.dev) Bundle your TypeScript library with no config, powered by esbuild                                                                                                                                                                                                                                                                                                                                       |
| Coding Standard      | [eslint](https://eslint.org/) statically analyzes your code to quickly find and fix problems based on opt-in [rules](https://eslint.org/docs/latest/rules/), [prettier](https://prettier.io/docs/en/) an opinionated code formatter to build and enforce a style guide on save, [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) to turns off all rules that are unnecessary or might conflict with Prettier. |
| Testing Framework    | [Jest](https://jestjs.io/) a delightful JavaScript Testing Framework with a focus on simplicity.                                                                                                                                                                                                                                                                                                                                          |
| Useful Links         | [npmtrends](https://npmtrends.com/) Compare package download counts over time, [act](https://nektosact.com/introduction.html) run your GitHub Actions locally, [Actionlint](https://marketplace.visualstudio.com/items?itemName=arahata.linter-actionlint) static checker for GitHub Actions workflow files                                                                                                                               |

## How to use

### Clone and run build

```bash
git clone git@github.com:myria-libs/airdrop-js.git
# install dependencies
npm install | yarn install
# run build
npm run build | yarn build
```

### Run lint

```bash
# check lint's rules
npm run lint | yarn lint
# check lint's rules and try to fix
npm run lint:fix | yarn lint:fix
# format your code
npm run prettier:format | yarn prettier:format
```

### Run test

```bash
npm test | yarn test
```

## Collaboration

1. We use the git rebase strategy to keep tracking meaningful commit message. Help to enable rebase when pull `$ git config --local pull.rebase true`
2. Follow TypeScript Style Guide [Google](https://google.github.io/styleguide/tsguide.html)
3. Follow Best-Practices in coding:
    1. [Clean code](https://github.com/labs42io/clean-code-typescript) make team happy
    2. [Return early](https://szymonkrajewski.pl/why-should-you-return-early/) make code safer and use resource Efficiency
    3. [Truthy & Falsy](https://frontend.turing.edu/lessons/module-1/js-truthy-falsy-expressions.html) make code shorter
    4. [SOLID Principles](https://javascript.plainenglish.io/solid-principles-with-type-script-d0f9a0589ec5) make clean code
    5. [DRY & KISS](https://dzone.com/articles/software-design-principles-dry-and-kiss) avoid redundancy and make your code as simple as possible
4. Make buildable commit and pull latest code from `main` branch frequently
5. Use readable commit message [karma](http://karma-runner.github.io/6.3/dev/git-commit-msg.html)

```bash
     /‾‾‾‾‾‾‾‾
🔔  <  Ring! Please use semantic commit messages
     \________


<type>(<scope>): ([issue number]) <subject>
    │      │        |             │
    |      |        |             └─> subject in present tense. Not capitalized. No period at the end.
    |      |        |
    │      │        └─> Issue number (optional): Jira Ticket or Issue number
    │      │
    │      └─> Scope (optional): eg. Articles, Profile, Core
    │
    └─> Type: chore, docs, feat, fix, refactor, style, ci, perf, build, or test.
```
