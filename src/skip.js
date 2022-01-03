// @flow
import {KalturaPlayer, BasePlugin} from 'kaltura-player-js';
import {Skip as SkipComponent} from './components/skip/skip';

const pluginName: string = 'skip';
/**
 * The Skip plugin.
 * @class Skip
 * @param {string} name - The plugin name.
 * @param {Object} config - The plugin config.
 * @extends BasePlugin
 */
class Skip extends BasePlugin {
  /**
   * The default configuration of the plugin.
   * @type {Object}
   * @static
   * @memberof SkipIntoOutro
   */
  static defaultConfig: SkipConfig = {
    timeout: 5
  };

  constructor(name: string, player: KalturaPlayer, config: SkipConfig) {
    super(name, player, config);
  }
  getUIComponents() {
    return [
      {
        label: 'SkipComponent',
        presets: ['Playback'],
        area: 'InteractiveArea',
        get: SkipComponent,
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
   * @memberof Skip
   */
  static isValid() {
    return true;
  }
}

export {Skip, pluginName};
