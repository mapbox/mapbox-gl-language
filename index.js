
/**
 * Create a new [Mapbox GL JS plugin](https://www.mapbox.com/blog/build-mapbox-gl-js-plugins/) that
 * modifies the layers of the map style to use the 'text-field' that matches the browser language.
 * @constructor
 * @param {object} options - Options to configure the plugin.
 * @param {string[]} [options.supportedLanguages] - List of supported languages
 * @param {string} [options.getLanguageField] - Function that returns the language field to use based on the browser language.
 */
function MapboxBrowserLanguage(options) {
  if (!(this instanceof MapboxBrowserLanguage)) {
    throw new Error('MapboxBrowserLanguage needs to be called with the new keyword');
  }

  this.changeLanguage = this.changeLanguage.bind(this);
  this._updateStyle = this._updateStyle.bind(this);

  this.options = Object.assign({
    getLanguageField: browserLanguageField.bind(null, options.supportedLanguages || ['en', 'es', 'fr', 'de', 'ru', 'zh', 'ar', 'pt'])
  }, options);
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
    const newStops = property.stops.map(function (stop) {
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

/**
 * Change the language field for a style.
 * @param {object} style - Mapbox GL style
 */
MapboxBrowserLanguage.prototype.changeLanguage = function (style) {
  var field = this.options.getLanguageField();

  var changedLayers = style.layers.map(function (layer) {
    return changeLayerTextProperty(layer, field);
  });

  var languageStyle = Object.assign({}, style, {
    layers: changedLayers
  });
  return languageStyle;
};

MapboxBrowserLanguage.prototype._updateStyle = function () {
  var style = this._map.getStyle();
  this._map.setStyle(this.changeLanguage(style));
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

MapboxBrowserLanguage.prototype.onAdd = function (map) {
  this._map = map;
  this._map.on('load', this._updateStyle);
  this._container = document.createElement('div');
  return this._container;
};

MapboxBrowserLanguage.prototype.onRemove = function () {
  this._map.off('load', this._updateStyle);
  this._map = undefined;
};

module.exports = MapboxBrowserLanguage;
