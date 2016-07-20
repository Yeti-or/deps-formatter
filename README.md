# DEPS-FORMATTER

Приведение `deps.js` файлов к единообразному виду.
## Установка

```sh
npm install --registry=http://npm.yandex-team.ru deps-formatter
```

## Подготовка

Добавьте в ваш проект файл `.bemrc` с информацией о уровнях ваших блоков.
Например для библиотеки [islands](https://github.yandex-team.ru/lego/islands)

```sh
$ cat .bemrc
{
    root: true,
    levels: {
         "common.blocks"      : {},
         "desktop.blocks"     : {},
         "touch.blocks"       : {},
         "touch-pad.blocks"   : {},
         "touch-phone.blocks" : {},
         "examples.blocks"    : {}
    }
}
```

Подробнее о конфигурационном файле можно прочитать в описании [bem-config](https://github.com/bem-sdk/bem-config)

## Запуск

Выполните в корне вашего проекта:
```sh
deps-formatter
```
