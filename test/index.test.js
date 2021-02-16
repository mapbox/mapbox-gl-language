var test = require('tape');
var MapboxLanguage = require('../index');

function makeStyle(layers, version) {
  if (!version) version = 'v11';
  return {
    sources: {
      composite: {
        type: 'vector',
        url: `mapbox://mapbox-streets-${version}`
      }
    },
    layers
  };
}

test('MapboxLanguage', (t) => {

  test('non-v8-based styles', (t) => {
    var language = new MapboxLanguage();
    var layers = [{
      'id': 'state-label-sm',
      'source': 'composite',
      'source-layer': 'state_label',
      'layout': {
        'text-letter-spacing': 0.15,
        'text-field': [
          'coalesce',
          ['get', 'name_en'],
          ['get', 'name']
        ]
      }
    }];
    var style = makeStyle(layers, 'v10');
    var err = new Error('If using MapboxLanguage with a Mapbox style, the style must be based on vector tile version 8, e.g. "streets-v11"');
    t.throws(() => {
      language.setLanguage(style, 'es');
    }, err.toString());
    t.end();
  });

  test('unwrapped get expression styles', (t) => {
    var language = new MapboxLanguage();
    var layers = [{
      'id': 'state-label-sm',
      'source': 'composite',
      'source-layer': 'state_label',
      'layout': {
        'text-letter-spacing': 0.15,
        'text-field': ['get', 'name']
      }
    }];
    var style = makeStyle(layers);

    var esStyle = language.setLanguage(style, 'es');
    console.log('esStyle: ', esStyle);
    t.deepEqual(esStyle.layers[0].layout, {
      'text-letter-spacing': 0.15,
      'text-field': [
        'coalesce',
        ['get', 'name_es'],
        ['get', 'name']
      ]
    }, 'wrap unwrapped get expression in coalesce');
    t.end();
  });

  test('setLanguage for different text fields', (t) => {
    var language = new MapboxLanguage();
    var layers = [{
      'id': 'state-label-sm',
      'source': 'composite',
      'source-layer': 'state_label',
      'layout': {
        'text-letter-spacing': 0.15,
        'text-field': [
          'coalesce',
          ['get', 'name_en'],
          ['get', 'name']
        ]
      }
    }];
    var style = makeStyle(layers);

    var esStyle = language.setLanguage(style, 'es');
    t.deepEqual(esStyle.layers[0].layout, {
      'text-letter-spacing': 0.15,
      'text-field': [
        'coalesce',
        ['get', 'name_es'],
        ['get', 'name']
      ]
    }, 'switch style to spanish name field');

    var arStyle = language.setLanguage(style, 'ar');
    t.deepEqual(arStyle.layers[0].layout, {
      'text-letter-spacing': 0,
      'text-field': [
        'coalesce',
        ['get', 'name_ar'],
        ['get', 'name']
      ]
    }, 'switch style to arabic name field');

    var mulStyle = language.setLanguage(style, 'mul');
    t.deepEqual(mulStyle.layers[0].layout, {
      'text-letter-spacing': 0.15,
      'text-field': [
        'coalesce',
        ['get', 'name'],
        ['get', 'name']
      ]
    }, 'switch style to multilingual name field');

    t.end();
  });

  test('setLanguage with excluded layers', (t) => {
    var language = new MapboxLanguage({excludedLayerIds: ['state-label-lg']});
    var layers = [{
      'id': 'state-label-sm',
      'source': 'composite',
      'source-layer': 'state_label',
      'layout': {
        'text-letter-spacing': 0.15,
        'text-field': [
          'coalesce',
          ['get', 'name_en'],
          ['get', 'name']
        ]
      }
    }, {
      'id': 'state-label-lg',
      'source': 'composite',
      'source-layer': 'state_label',
      'layout': {
        'text-letter-spacing': 0.15,
        'text-field': [
          'coalesce',
          ['get', 'name_en'],
          ['get', 'name']
        ]
      }
    }];

    var style = makeStyle(layers);

    var esStyle = language.setLanguage(style, 'es');
    t.deepEqual(esStyle.layers[0].layout, {
      'text-letter-spacing': 0.15,
      'text-field': [
        'coalesce',
        ['get', 'name_es'],
        ['get', 'name']
      ]
    }, 'switch style on regular field');

    t.deepEqual(esStyle.layers[1].layout, {
      'text-letter-spacing': 0.15,
      'text-field': [
        'coalesce',
        ['get', 'name_en'],
        ['get', 'name']
      ]
    }, 'do not switch style on excluded field');
    t.end();
  });

  t.end();
});
