var test = require('tape');
var MapboxLanguage = require('../index');

function makeStyle(layer) {
  return {
    sources: {
      composite: {
        type: 'vector',
        url: 'mapbox://mapbox-streets-v7'
      }
    },
    layers: [layer]
  };


}

test('setLanguage for different text fields', (assert) => {
  var language = new MapboxLanguage();
  var style = makeStyle({
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
  });

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
  }, 'switch style to spanish name field');

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
  }, 'switch style to spanish arabic field');

  assert.end();
});
