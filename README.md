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
