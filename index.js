
/**
 * Create a new [Mapbox GL JS plugin](https://www.mapbox.com/blog/build-mapbox-gl-js-plugins/) that
 * modifies the layers of the map style to use the 'text-field' that matches the browser language.
 * @constructor
 * @param {object} options - Options to configure the plugin.
 * @param {string[]} [options.supportedLanguages] - List of supported languages
 * @param {string} [options.defaultLanguageField] - The default language field to use
 */
function MapboxBrowserLanguage(options) {
  if (!(this instanceof MapboxBrowserLanguage)) {
    throw new Error('MapboxBrowserLanguage needs to be called with the new keyword');
  }

  this.options = Object.assign({
    supportedLanguages: ['en', 'es', 'fr', 'de', 'ru', 'zh', 'ar', 'pt'],
    defaultLanguageField: null
  }, options);

  this.changeLanguage = this.changeLanguage.bind(this);
  this._browserLanguageField = this._browserLanguageField.bind(this);
}

function isNameField(field) {
  return typeof field === 'string' && field.startsWith('{name');
}

MapboxBrowserLanguage.prototype.changeLanguage = function () {
  var field = this.options.defaultLanguageField || this._browserLanguageField();
  var style = this._map.getStyle();

  var changedLayers = style.layers.map(function (layer) {
    if (layer.layout && layer.layout['text-field'] && isNameField(layer.layout['text-field'])) {
      return Object.assign({}, layer, {
        layout: Object.assign({}, layer.layout, {
          'text-field': field
        })
      });
    }
    return layer;
  });

  var newStyle = Object.assign({}, style, {
    layers: changedLayers
  });
  this._map.setStyle(newStyle);
};

MapboxBrowserLanguage.prototype._browserLanguageField = function () {
  var language = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
  var parts = language.split('-');
  var languageCode = language;
  if (parts.length > 1) {
    languageCode = parts[0];
  }
  if (this.options.supportedLanguages.indexOf(languageCode) > -1) {
    return '{name_' + languageCode + '}';
  }
  return '{name}';
};

MapboxBrowserLanguage.prototype.onAdd = function (map) {
  this._map = map;
  this._map.on('load', this.changeLanguage);
  this._container = document.createElement('div');
  return this._container;
};

MapboxBrowserLanguage.prototype.onRemove = function () {
  this._map.off('load', this.changeLanguage);
  this._map = undefined;
};

module.exports = MapboxBrowserLanguage;
