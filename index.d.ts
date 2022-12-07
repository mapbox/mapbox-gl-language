import { IControl, Map, Style } from "mapbox-gl";

/** Options to configure the Mapbox GL Language plugin. */
export declare interface MapboxLanguageOptions {
  /** List of supported languages */
  supportedLanguages?: string[];
  /** Custom style transformation to apply */
  languageTransform?: (style: Style, language: string) => Style;
  /**
   * RegExp to match if a text-field is a language field
   * @default /^name_/
   */
  languageField?: RegExp;
  /** Given a language choose the field in the vector tiles */
  getLanguageField?: (language: string) => string;
  /** Name of the source that contains the different languages. */
  languageSource?: string;
  /** Name of the default language to initialize style after loading. */
  defaultLanguage?: string;
  /** Name of the layers that should be excluded from translation. */
  excludedLayerIds?: string[];
}

declare class MapboxLanguage implements IControl {
  /**
   * Create a new [Mapbox GL JS plugin](https://www.mapbox.com/blog/build-mapbox-gl-js-plugins/) that
   * modifies the layers of the map style to use the `text-field` that matches the browser language.
   * As of Mapbox GL Language v1.0.0, this plugin no longer supports token values (e.g. `{name}`). v1.0+ expects the `text-field`
   * property of a style to use an [expression](https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/) of the form `['get', 'name_en']` or `['get', 'name']`; these expressions can be nested. Note that `get` expressions used as inputs to other expressions may not be handled by this plugin. For example:
   * ```
   * ["match",
   *   ["get", "name"],
   *   "California",
   *   "Golden State",
   *   ["coalesce",
   *     ["get", "name_en"],
   *     ["get", "name"]
   *   ]
   * ]
   * ```
   * Only styles based on [Mapbox v8 styles](https://docs.mapbox.com/help/troubleshooting/streets-v8-migration-guide/) are supported.
   *
   * @constructor
   * @param options Options to configure the plugin.
   */
  constructor(options?: MapboxLanguageOptions);

  onAdd(map: Map): HTMLElement;
  onRemove(map: Map): void;

  /**
   * Explicitly change the language for a style.
   * @param style Mapbox GL style to modify
   * @param language The language iso code
   */
  setLanguage(style: Style, language: string): Style;
}

export default MapboxLanguage;
