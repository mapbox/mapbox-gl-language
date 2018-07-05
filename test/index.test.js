var test = require('tape');
var MapboxLanguage = require('../index');

function makeStyle(layers) {
  return {
    sources: {
      composite: {
        type: 'vector',
        url: 'mapbox://mapbox-streets-v7'
      }
    },
    layers: layers
  };
}

test('setLanguage for different text fields', (assert) => {
  var language = new MapboxLanguage();
  var style = makeStyle([{
    'id': 'state-label-sm',
    'source': 'composite',
    'source-layer': 'state_label',
    'layout': {
      'text-letter-spacing': 0.15,
      'text-field': {
        'base': 1,
        'stops': [
          [0, '{abbr}'],
          [6, '{name}']
        ]
      }
    }
  }]);

  var enStyle = language.setLanguage(style, 'es');
  assert.deepEqual(enStyle.layers[0].layout, {
    'text-letter-spacing': 0.15,
    'text-field': {
      'base': 1,
      'stops': [
        [0, '{abbr}'],
        [6, '{name_es}']
      ]
    }
  }, 'switch style to english name field');

  var arStyle = language.setLanguage(style, 'ar');
  assert.deepEqual(arStyle.layers[0].layout, {
    'text-letter-spacing': 0,
    'text-field': {
      'base': 1,
      'stops': [
        [0, '{abbr}'],
        [6, '{name_ar}']
      ]
    }
  }, 'switch style to arabic name field');

  var mulStyle = language.setLanguage(style, 'mul');
  assert.deepEqual(mulStyle.layers[0].layout, {
    'text-letter-spacing': 0.15,
    'text-field': {
      'base': 1,
      'stops': [
        [0, '{abbr}'],
        [6, '{name}']
      ]
    }
  }, 'switch style to multilingual name field');

  assert.end();
});

test('setLanguage with excluded layers', (assert) => {
  var language = new MapboxLanguage({excludedLayerIds: ['state-label-lg']});
  var style = makeStyle([{
    'id': 'state-label-sm',
    'source': 'composite',
    'source-layer': 'state_label',
    'layout': {
      'text-letter-spacing': 0.15,
      'text-field': {
        'base': 1,
        'stops': [
          [0, '{abbr}'],
          [6, '{name}']
        ]
      }
    }
  }, {
    'id': 'state-label-lg',
    'source': 'composite',
    'source-layer': 'state_label',
    'layout': {
      'text-letter-spacing': 0.15,
      'text-field': {
        'base': 1,
        'stops': [
          [0, '{abbr}'],
          [6, '{name}']
        ]
      }
    }
  }]);

  var esStyle = language.setLanguage(style, 'es');
  assert.deepEqual(esStyle.layers[0].layout, {
    'text-letter-spacing': 0.15,
    'text-field': {
      'base': 1,
      'stops': [
        [0, '{abbr}'],
        [6, '{name_es}']
      ]
    }
  }, 'switch style to on regular field');

  assert.deepEqual(esStyle.layers[1].layout, {
    'text-letter-spacing': 0.15,
    'text-field': {
      'base': 1,
      'stops': [
        [0, '{abbr}'],
        [6, '{name}']
      ]
    }
  }, 'do not switch style on excluded field');
  assert.end();
});
