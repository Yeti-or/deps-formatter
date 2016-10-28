# DEPS-FORMATTER

[![NPM version](http://img.shields.io/npm/v/deps-formatter.svg?style=flat)](http://www.npmjs.org/package/deps-formatter)
[![Build Status](http://img.shields.io/travis/Yeti-or/deps-formatter/master.svg?style=flat&label=tests)](https://travis-ci.org/Yeti-or/deps-formatter)
[![Coverage Status](https://img.shields.io/coveralls/Yeti-or/deps-formatter.svg?branch=master&style=flat)](https://coveralls.io/r/Yeti-or/deps-formatter)
[![Dependency Status](http://img.shields.io/david/yeti-or/deps-formatter.svg?style=flat)](https://david-dm.org/yeti-or/deps-formatter)

Приведение `deps.js` файлов к единообразному виду.

## Установка

```sh
npm install --save-dev deps-formatter
```

## Подготовка

Добавьте в ваш проект файл `.bemrc` с информацией о уровнях ваших блоков.
Например:

```sh
$ cat .bemrc
{
    root: true,
    levels: {
         "common.blocks"      : {},
         "desktop.blocks"     : {}
    }
}
```

Подробнее о конфигурационном файле можно прочитать в описании [bem-config](https://github.com/bem-sdk/bem-config)

## Запуск

Выполните в корне вашего проекта:
```sh
deps-formatter
```
или

```sh
deps-formatter path/to/file.deps.js
```

All rules for formatting are described in .deps-formatterrc config file
.deps-formatterrc is plain JSON.

```sh
cat .deps-formatterrc
{
    "rules": {
        "format": "arrayexpression"
    }
}
```

## Rules:

### Format

Response for root format of deps.js file, could be different for one and many depObjects.

Values:

* "expression"  - `({...})` or `[{...}, {...}]`

* "arrayExpression" - `[{...}]` or `[{...}, {...}]`

* "objectExpression" - `({...})` or `([{...}, {...}])`

* "commonJS" - `module.exports = {...}` or `module.exports = [...]`

### depsObjIsArray

Response for type of mustDeps/shouldDeps value.
Works for value that could be recorded as arrays with one value.

Values:

* false - `mustDeps: [{...}] -> mustDeps: {...}`

* true  - `mustDeps: {...} -> mustDeps: [{...}]`

* "any" - whatever you want

### blockNameShortcut

Response for allowing {block: 'name'} -> 'name' shortcut

Values:

* false - `mustDeps: {block: 'name'} -> mustDeps: 'name'`

* true  - `mustDeps: 'name' -> mustDeps: {block: 'name'}`

* "any" - whatever you want
