## 1.0.0

### ⚠️ Breaking changes

- Adds support for Mapbox Streets v8 vector tileset and all styles based on this tileset, such as `streets-v11` and `dark-v10` while removing support for Mapbox Streets v7 vector tileset-based styles. ([#39](https://github.com/mapbox/mapbox-gl-language/pull/39))
- Removes support for Internet Explorer 11. ([#39](https://github.com/mapbox/mapbox-gl-language/pull/39))
- Support for Streets v7 Chinese `zh` is replaced with Traditional Chinese `zh-Hant` and Simplified Chinese `zh-Hans`. ([#39](https://github.com/mapbox/mapbox-gl-language/pull/39))
- Support for token values (e.g. `{name}`) has been removed. The plugin now expects the `text-field` property of a style to use an [expression](https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/) of the form `['get', 'name_en']` or `['get', 'name']`; these expressions can be nested. Note that `get` expressions used as inputs to other expressions may not be handled by this plugin. For example:
```
["match", 
  ["get", "name"], 
  "California", 
  "Golden State", 
  ["coalesce", 
    ["get", "name_en"], 
    ["get", "name"]
  ]
]
```
([#39](https://github.com/mapbox/mapbox-gl-language/pull/39))

### Features and improvements

- Add support for Mapbox GL JS v2.0.0+. ([#42](https://github.com/mapbox/mapbox-gl-language/pull/42))
- Add support for Vietnamese `vi`. ([#43](https://github.com/mapbox/mapbox-gl-language/pull/43))

### Bug fixes

- Remove unnecessary letter spacing transformations for Arabic. ([#44](https://github.com/mapbox/mapbox-gl-language/pull/44))
- Prevent potential `undefined` errors when language input is `null`. ([#45](https://github.com/mapbox/mapbox-gl-language/pull/45))
- Ensure that the selected language is retained when switching map styles. ([#46](https://github.com/mapbox/mapbox-gl-language/pull/46))