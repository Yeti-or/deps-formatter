# DEPS-FORMATTER

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
    "format": "arrayexpression"
}
```

## Rules:

### Format

Response for root format of deps.js file, could be different for one and many depObjects.

Values:

* "expression" [default] - `({...})` or `[{...}, {...}]`
* "arrayExpression" - `[{...}]` or `[{...}, {...}]`
* "objectExpression" - `({...})` or `([{...}, {...}])`
* "commonJS" - `module.exports = {...}` or `module.exports = [...]`
