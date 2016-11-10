# DEPS-FORMATTER

[![NPM version](http://img.shields.io/npm/v/deps-formatter.svg?style=flat)](http://www.npmjs.org/package/deps-formatter)
[![Build Status](http://img.shields.io/travis/Yeti-or/deps-formatter/master.svg?style=flat&label=tests)](https://travis-ci.org/Yeti-or/deps-formatter)
[![Coverage Status](https://img.shields.io/coveralls/Yeti-or/deps-formatter.svg?branch=master&style=flat)](https://coveralls.io/r/Yeti-or/deps-formatter)
[![Dependency Status](http://img.shields.io/david/yeti-or/deps-formatter.svg?style=flat)](https://david-dm.org/yeti-or/deps-formatter)

Formatting `deps.js` files, for maintain consistency.

## Install

```sh
npm install --save-dev deps-formatter
```

## Run

Run in your bem-project directory:
```sh
deps-formatter
```

Or to format only one file:

```sh
deps-formatter path/to/file.deps.js
```

## Config 

Initialization of config file:
```sh
deps-formatter --init
```
This option will create `.deps-formatterrc` config file.

`.deps-formatterrc` is plain JSON.

Example of config:
```sh
cat .deps-formatterrc
{
    "rules": {
        "format": "arrayexpression",
        "depsObjIsArray": true,
        "elemsIsArray": true,
        "blockNameShortcut": false
    },
    "levels": {
        "common.blocks": {},
        "desktop.blocks": {}
    }
}
```

Rules section is described below: [rules](https://github.com/Yeti-or/deps-formatter#rules)

## Levels

Levels section is directories that contain blocks with `deps.js` files.

To learn more about levels traversal check out: [bem-walk](https://github.com/bem-sdk/bem-walk#3-define-file-system-levels)

If you don't provide levels section deps-formatter will try to find [.bemrc](https://github.com/bem-sdk/bem-config)

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

* true  - `mustDeps: {...} -> mustDeps: [{...}]`

* false - `mustDeps: [{...}] -> mustDeps: {...}`

### elemsIsArray

Response for type of elems or elem value.
Values:

* true  - `elems: {...} -> elems: [{...}]`

* false - `elems: [{...}] -> elems: {...}`

### blockNameShortcut

Response for allowing {block: 'name'} -> 'name' shortcut

Values:

* true  - `mustDeps: 'name' -> mustDeps: {block: 'name'}`

* false - `mustDeps: {block: 'name'} -> mustDeps: 'name'`

## Reporters:

Different variants of reporter:

* `console` - default
* `checkstyle`
