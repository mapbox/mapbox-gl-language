# Mapbox GL Language [![Build Status](https://travis-ci.org/mapbox/mapbox-gl-language.svg?branch=master)](https://travis-ci.org/mapbox/mapbox-gl-language) [![npm](https://img.shields.io/npm/v/@mapbox/mapbox-gl-language.svg)](https://www.npmjs.com/package/@mapbox/mapbox-gl-language)

Adds support for switching the language of your map style in [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js/) maps.

**Requires [mapbox-gl-js](https://github.com/mapbox/mapbox-gl-js).** For other platforms, such as Android and iOS, see [this help document](https://www.mapbox.com/help/change-language/).

![Multiple language supported with style transforms](https://cloud.githubusercontent.com/assets/1288339/26266912/89b1b6ba-3cb5-11e7-9964-49f51290d627.gif)

*Automatic style transformations for different languages*

![Switch language based on user agent](https://cloud.githubusercontent.com/assets/1288339/26269878/742cdb02-3cc5-11e7-8479-c6ab3f0f8a82.gif)

*Switch language based on user agent*

## Usage

**mapbox-gl-language** is a [Mapbox GL JS plugin](https://www.mapbox.com/blog/build-mapbox-gl-js-plugins/) that you can easily add on top of your map.

**When using a CDN**

        <script src='https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-language/v1.0.0/mapbox-gl-language.js'></script>

**When using modules**

Check [how to use Mapbox GL JS in a module bundler](https://www.mapbox.com/mapbox-gl-js/api/).

```bash
npm install --save mapbox-gl @mapbox/mapbox-gl-language
```

```javascript
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
```

**Example**

```javascript
mapboxgl.accessToken = 'YOUR_ACCESS_TOKEN';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v10',
    center: [-77.0259, 38.9010],
    zoom: 9
});

// Add RTL support if you want to support Arabic
// mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.10.1/mapbox-gl-rtl-text.js');

const language = new MapboxLanguage();
map.addControl(language);
```

Check `examples/` for more usage examples.

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

*   [MapboxLanguage](#mapboxlanguage)
    *   [Parameters](#parameters)
    *   [setLanguage](#setlanguage)
        *   [Parameters](#parameters-1)

### MapboxLanguage

Create a new [Mapbox GL JS plugin](https://www.mapbox.com/blog/build-mapbox-gl-js-plugins/) that
modifies the layers of the map style to use the `text-field` that matches the browser language.
As of Mapbox GL Language v1.0.0, this plugin no longer supports token values (e.g. `{name}`). v1.0+ expects the `text-field`
property of a style to use an [expression](https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/) of the form `['get', 'name_en']` or `['get', 'name']`; these expressions can be nested. Note that `get` expressions used as inputs to other expressions may not be handled by this plugin. For example:

    ["match",
      ["get", "name"],
      "California",
      "Golden State",
      ["coalesce",
        ["get", "name_en"],
        ["get", "name"]
      ]
    ]

Only styles based on [Mapbox v8 styles](https://docs.mapbox.com/help/troubleshooting/streets-v8-migration-guide/) are supported.

#### Parameters

*   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Options to configure the plugin.

    *   `options.supportedLanguages` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>?** List of supported languages
    *   `options.languageTransform` **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)?** Custom style transformation to apply
    *   `options.languageField` **[RegExp](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp)** RegExp to match if a text-field is a language field (optional, default `/^name_/`)
    *   `options.getLanguageField` **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)?** Given a language choose the field in the vector tiles
    *   `options.languageSource` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Name of the source that contains the different languages.
    *   `options.defaultLanguage` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Name of the default language to initialize style after loading.
    *   `options.excludedLayerIds` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>?** Name of the layers that should be excluded from translation.

#### setLanguage

Explicitly change the language for a style.

##### Parameters

*   `style` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Mapbox GL style to modify
*   `language` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The language iso code

Returns **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** the modified style

<!-- End generated code -->
## Develop

Run the linter and watch for changes to rebuild with browserify.

    npm install
    npm run test

## Languages

Showcasing the languages supported by Mapbox Streets.

*   [Your Browser language](https://mapbox.github.io/mapbox-gl-language/examples/browser.html)
*   [Arabic](https://mapbox.github.io/mapbox-gl-language/examples/ar.html)
*   [Chinese Simplified](https://mapbox.github.io/mapbox-gl-language/examples/zh-Hans.html)
*   [Chinese Traditional](https://mapbox.github.io/mapbox-gl-language/examples/zh-Hant.html)
*   [English](https://mapbox.github.io/mapbox-gl-language/examples/en.html)
*   [French](https://mapbox.github.io/mapbox-gl-language/examples/fr.html)
*   [German](https://mapbox.github.io/mapbox-gl-language/examples/de.html)
*   [Italian](https://mapbox.github.io/mapbox-gl-language/examples/it.html)
*   [Japanese](https://mapbox.github.io/mapbox-gl-language/examples/ja.html)
*   [Korean](https://mapbox.github.io/mapbox-gl-language/examples/ko.html)
*   [Multilingual](https://mapbox.github.io/mapbox-gl-language/examples/multilingual.html)
*   [Portuguese](https://mapbox.github.io/mapbox-gl-language/examples/pt.html)
*   [Russian](https://mapbox.github.io/mapbox-gl-language/examples/ru.html)
*   [Spanish](https://mapbox.github.io/mapbox-gl-language/examples/es.html)
*   [Vietnamese](https://mapbox.github.io/mapbox-gl-language/examples/vi.html)

## Supported Styles

You can configure the plugin to support your own custom style using style transforms and custom language fields.
By default, this plugin works best with official Mapbox styles or styles derived from official Mapbox styles.
The styles must be based on [Mapbox v8 styles](https://docs.mapbox.com/help/troubleshooting/streets-v8-migration-guide/):

*   `mapbox://styles/mapbox/streets-v11`
*   `mapbox://styles/mapbox/outdoors-v11`
*   `mapbox://styles/mapbox/dark-v10`
*   `mapbox://styles/mapbox/light-v10`
*   `mapbox://styles/mapbox/satellite-streets-v9`
*   `mapbox://styles/mapbox/traffic-day-v2`
*   `mapbox://styles/mapbox/traffic-night-v2`
