/**
 * Create a new [Mapbox GL JS plugin](https://www.mapbox.com/blog/build-mapbox-gl-js-plugins/) that
 * modifies the layers of the map style to use the 'text-field' that matches the browser language.
 * @constructor
 * @param {object} options - Options to configure the plugin.
 * @param {string[]} [options.supportedLanguages] - List of supported languages
 * @param {Function} [options.languageTransform] - Custom style transformation to apply
 * @param {RegExp} [options.languageField=/^name_/] - RegExp to match if a text-field is a language field
 * @param {Function} [options.getLanguageField] - Given a language choose the field in the vector tiles
 * @param {string} [options.languageSource] - Name of the source that contains the different languages.
 * @param {string} [options.defaultLanguage] - Name of the default language to initialize style after loading.
 * @param {string[]} [options.excludedLayerIds] - Name of the layers that should be excluded from translation.
 */
function MapboxLanguage(options) {
  options = Object.assign({}, options);
  if (!(this instanceof MapboxLanguage)) {
    throw new Error('MapboxLanguage needs to be called with the new keyword');
  }

  this.setLanguage = this.setLanguage.bind(this);
  this._initialStyleUpdate = this._initialStyleUpdate.bind(this);

  this._defaultLanguage = options.defaultLanguage;
  this._isLanguageField = options.languageField || /^name_/;
  this._getLanguageField = options.getLanguageField || function nameField(language) {
    return language === 'mul' ? 'name' : `name_${language}`;
  };
  this._languageSource = options.languageSource || null;
  this._languageTransform = options.languageTransform || function (style, language) {
    if (language === 'ar') {
      return noSpacing(style);
    } else {
      return standardSpacing(style);
    }
  };
  this._excludedLayerIds = options.excludedLayerIds || [];
  this.supportedLanguages = options.supportedLanguages || ['ar', 'de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'mul', 'pt', 'ru', 'zh-Hans', 'zh-Hant'];
}

function standardSpacing(style) {
  var changedLayers = style.layers.map(function (layer) {
    if (!(layer.layout || {})['text-field']) return layer;
    var spacing = 0;
    if (layer['source-layer'] === 'state_label') {
      spacing = 0.15;
    }
    if (layer['source-layer'] === 'marine_label') {
      if (/-lg/.test(layer.id)) {
        spacing = 0.25;
      }
      if (/-md/.test(layer.id)) {
        spacing = 0.15;
      }
      if (/-sm/.test(layer.id)) {
        spacing = 0.1;
      }
    }
    if (layer['source-layer'] === 'place_label') {
      if (/-suburb/.test(layer.id)) {
        spacing = 0.15;
      }
      if (/-neighbour/.test(layer.id)) {
        spacing = 0.1;
      }
      if (/-islet/.test(layer.id)) {
        spacing = 0.01;
      }
    }
    if (layer['source-layer'] === 'airport_label') {
      spacing = 0.01;
    }
    if (layer['source-layer'] === 'rail_station_label') {
      spacing = 0.01;
    }
    if (layer['source-layer'] === 'poi_label') {
      if (/-scalerank/.test(layer.id)) {
        spacing = 0.01;
      }
    }
    if (layer['source-layer'] === 'road_label') {
      if (/-label-/.test(layer.id)) {
        spacing = 0.01;
      }
      if (/-shields/.test(layer.id)) {
        spacing = 0.05;
      }
    }
    return Object.assign({}, layer, {
      layout: Object.assign({}, layer.layout, {
        'text-letter-spacing': spacing
      })
    });
  });

  return Object.assign({}, style, {
    layers: changedLayers
  });
}

function noSpacing(style) {
  var changedLayers = style.layers.map(function (layer) {
    if (!(layer.layout || {})['text-field']) return layer;
    var spacing = 0;
    return Object.assign({}, layer, {
      layout: Object.assign({}, layer.layout, {
        'text-letter-spacing': spacing
      })
    });
  });

  return Object.assign({}, style, {
    layers: changedLayers
  });
}

var isTokenField = /^\{name/;
function isFlatExpressionField(isLangField, property) {
  var isGetExpression = Array.isArray(property) && property[0] === 'get';
  if (isGetExpression && isTokenField.test(property[1])) {
    console.warn('This plugin no longer supports the use of token syntax (e.g. {name}). Please use a get expression. See https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/ for more details.');
  }

  return isGetExpression && isLangField.test(property[1]);
}

function adaptNestedExpressionField(isLangField, property, languageFieldName) {
  if (Array.isArray(property)) {
    for (let i = 1; i < property.length; i++) {
      if (Array.isArray(property[i])) {
        if (isFlatExpressionField(isLangField, property[i])) {
          property[i][1] = languageFieldName;
        }
        adaptNestedExpressionField(isLangField, property[i], languageFieldName);
      }
    }
  }
}

function adaptPropertyLanguage(isLangField, property, languageFieldName) {
  if (isFlatExpressionField(isLangField, property)) {
    property[1] = languageFieldName;
  }

  adaptNestedExpressionField(isLangField, property, languageFieldName);

  // handle special case of bare ['get', 'name'] expression by wrapping it in a coalesce statement
  if (property[0] === 'get' && property[1] === 'name') {
    var defaultProp = property.slice();
    var adaptedProp = ['get', languageFieldName];
    property = ['coalesce', adaptedProp, defaultProp];
  }

  return property;
}

function changeLayerTextProperty(isLangField, layer, languageFieldName, excludedLayerIds) {
  if (layer.layout && layer.layout['text-field'] && excludedLayerIds.indexOf(layer.id) === -1) {
    return Object.assign({}, layer, {
      layout: Object.assign({}, layer.layout, {
        'text-field': adaptPropertyLanguage(isLangField, layer.layout['text-field'], languageFieldName)
      })
    });
  }
  return layer;
}

function findStreetsSource(style) {
  var sources = Object.keys(style.sources).filter(function (sourceName) {
    var url = style.sources[sourceName].url;
    // the source URL can reference the source version or the style version
    // this check and the error forces users to migrate to styles using source version 8
    return url && url.indexOf('mapbox.mapbox-streets-v8') > -1 || /mapbox-streets-v[1-9][1-9]/.test(url);
  });
  if (!sources.length) throw new Error('If using MapboxLanguage with a Mapbox style, the style must be based on vector tile version 8, e.g. "streets-v11"');
  return sources[0];
}

/**
 * Explicitly change the language for a style.
 * @param {object} style - Mapbox GL style to modify
 * @param {string} language - The language iso code
 * @returns {object} the modified style
 */
MapboxLanguage.prototype.setLanguage = function (style, language) {
  if (this.supportedLanguages.indexOf(language) < 0) throw new Error('Language ' + language + ' is not supported');
  var streetsSource = this._languageSource || findStreetsSource(style);
  if (!streetsSource) return style;

  var field = this._getLanguageField(language);
  var isLangField = this._isLanguageField;
  var excludedLayerIds = this._excludedLayerIds;
  var changedLayers = style.layers.map(function (layer) {
    if (layer.source === streetsSource) return changeLayerTextProperty(isLangField, layer, field, excludedLayerIds);
    return layer;
  });

  var languageStyle = Object.assign({}, style, {
    layers: changedLayers
  });

  return this._languageTransform(languageStyle, language);
};

MapboxLanguage.prototype._initialStyleUpdate = function () {
  var style = this._map.getStyle();
  var language = this._defaultLanguage || browserLanguage(this.supportedLanguages);

  // We only update the style once
  this._map.off('styledata', this._initialStyleUpdate);
  this._map.setStyle(this.setLanguage(style, language));
};

function browserLanguage(supportedLanguages) {
  var language = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
  var parts = language.split('-');
  var languageCode = language;
  if (parts.length > 1) {
    languageCode = parts[0];
  }
  if (supportedLanguages.indexOf(languageCode) > -1) {
    return languageCode;
  }
  return null;
}

MapboxLanguage.prototype.onAdd = function (map) {
  this._map = map;
  this._map.on('styledata', this._initialStyleUpdate);
  this._container = document.createElement('div');
  return this._container;
};

MapboxLanguage.prototype.onRemove = function () {
  this._map.off('styledata', this._initialStyleUpdate);
  this._map = undefined;
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = MapboxLanguage;
} else {
  window.MapboxLanguage = MapboxLanguage;
}
