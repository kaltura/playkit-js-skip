// @flow
import {KalturaPlayer, BasePlugin} from 'kaltura-player-js';
import {SkipIntroOutro as SkipIntroOutroComponent} from './components/skipInroOutro/skipIntroOutro';

const pluginName: string = 'skipIntoOutro';
/**
 * The Share plugin.
 * @class SkipIntoOutro
 * @param {string} name - The plugin name.
 * @param {Object} config - The plugin config.
 * @extends BasePlugin
 */
class SkipIntoOutro extends BasePlugin {
  /**
   * The default configuration of the plugin.
   * @type {Object}
   * @static
   * @memberof Share
   */
  static defaultConfig: ShareConfig = {
    timeout: 50000
  };

  getUIComponents() {
    return [
      {
        label: 'shareButtonComponent',
        presets: ['Playback'],
        area: 'InteractiveArea',
        get: SkipIntroOutroComponent,
        props: {
          config: this.config
        }
      }
    ];
  }

  /**
   * Whether the Share plugin is valid.
   * @static
   * @override
   * @public
   * @memberof Share
   */
  static isValid() {
    return true;
  }

  constructor(name: string, player: KalturaPlayer, config: Object) {
    super(name, player, config);
  }
}

export {SkipIntoOutro, pluginName};
