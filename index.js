
/**
 * Create a new [Mapbox GL JS plugin](https://www.mapbox.com/blog/build-mapbox-gl-js-plugins/) that
 * modifies the layers of the map style to use the 'text-field' that matches the browser language.
 * @constructor
 * @param {object} options - Options to configure the plugin.
 * @param {string[]} [options.supportedLanguages] - List of supported languages
 * @param {Function} [options.languageTransform] - Custom style transformation to apply
 */
function MapboxLanguage(options) {
  options = Object.assign({}, options);
  if (!(this instanceof MapboxLanguage)) {
    throw new Error('MapboxLanguage needs to be called with the new keyword');
  }

  this.setLanguage = this.setLanguage.bind(this);
  this._updateStyle = this._updateStyle.bind(this);
  this._languageTransform = options.languageTransform || function (style, language) {
    if (language === 'ar') {
      return noSpacing(style);
    } else {
      return standardSpacing(style);
    }
  };
  this.supportedLanguages = options.supportedLanguages || ['en', 'es', 'fr', 'de', 'ru', 'zh', 'ar', 'pt'];
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

function isNameStringField(property) {
  return typeof property === 'string' && property.startsWith('{name');
}

function isNameFunctionField(property) {
  return property.stops && property.stops.filter(function (stop) {
    return stop[1].startsWith('{name');
  }).length > 0;
}

function adaptPropertyLanguage(property, languageFieldName) {
  if (isNameStringField(property)) return languageFieldName;
  if (isNameFunctionField(property)) {
    var newStops = property.stops.map(function (stop) {
      if (stop[1].startsWith('{name')) {
        return [stop[0], languageFieldName];
      }
      return stop;
    });
    return Object.assign({}, property, {
      stops: newStops
    });
  }
  return property;
}

function changeLayerTextProperty(layer, languageFieldName) {
  if (layer.layout && layer.layout['text-field']) {
    return Object.assign({}, layer, {
      layout: Object.assign({}, layer.layout, {
        'text-field': adaptPropertyLanguage(layer.layout['text-field'], languageFieldName)
      })
    });
  }
  return layer;
}

function findStreetsSource(style) {
  var sources = Object.keys(style.sources).filter(function (sourceName) {
    var source = style.sources[sourceName];
    return /mapbox-streets-v\d/.test(source.url);
  });
  return sources[0];
}

/**
 * Explicitly change the language for a style.
 * @param {object} style - Mapbox GL style to modify
 * @param {string} language - The language iso code
 */
MapboxLanguage.prototype.setLanguage = function (style, language) {
  if (this.supportedLanguages.indexOf(language) < 0) throw new Error('Language ' + language + ' is not supported');
  var streetsSource = findStreetsSource(style);
  if (!streetsSource) return style;

  var field = '{name_' + language + '}';
  var changedLayers = style.layers.map(function (layer) {
    if (layer.source === streetsSource) return changeLayerTextProperty(layer, field);
    return layer;
  });

  var languageStyle = Object.assign({}, style, {
    layers: changedLayers
  });

  return this._languageTransform(languageStyle, language);
};

MapboxLanguage.prototype._updateStyle = function () {
  var style = this._map.getStyle();
  this._map.setStyle(this.setLanguage(style, browserLanguageField(this.supportedLanguages)));
};

function browserLanguageField(supportedLanguages) {
  var language = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
  var parts = language.split('-');
  var languageCode = language;
  if (parts.length > 1) {
    languageCode = parts[0];
  }
  if (supportedLanguages.indexOf(languageCode) > -1) {
    return '{name_' + languageCode + '}';
  }
  return '{name}';
}

MapboxLanguage.prototype.onAdd = function (map) {
  this._map = map;
  this._map.on('load', this._updateStyle);
  this._container = document.createElement('div');
  return this._container;
};

MapboxLanguage.prototype.onRemove = function () {
  this._map.off('load', this._updateStyle);
  this._map = undefined;
};

module.exports = MapboxLanguage;
