// @flow
import {KalturaPlayer, BasePlugin} from 'kaltura-player-js';
import {SkipIntroOutro as SkipIntroOutroComponent} from './components/skip-inro-outro/skip-intro-outro';

const pluginName: string = 'skipIntroOutro';
/**
 * The Skip plugin.
 * @class SkipInrtoOutro
 * @param {string} name - The plugin name.
 * @param {Object} config - The plugin config.
 * @extends BasePlugin
 */
class SkipInrtoOutro extends BasePlugin {
  /**
   * The default configuration of the plugin.
   * @type {Object}
   * @static
   * @memberof SkipIntoOutro
   */
  static defaultConfig: SkipConfig = {
    timeout: 5
  };

  constructor(name: string, player: KalturaPlayer, config: Object) {
    super(name, player, config);
  }
  getUIComponents() {
    return [
      {
        label: 'SkipIntroOutroComponent',
        presets: ['Playback'],
        area: 'InteractiveArea',
        get: SkipIntroOutroComponent,
        props: {
          config: this.config,
          eventManager: this.eventManager
        }
      }
    ];
  }

  /**
   * Whether the Skip plugin is valid.
   * @static
   * @override
   * @public
   * @memberof SkipIntroOutro
   */
  static isValid() {
    return true;
  }
}

export {SkipInrtoOutro, pluginName};
