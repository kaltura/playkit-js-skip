// @flow
import {KalturaPlayer, BasePlugin, ui} from 'kaltura-player-js';
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
  constructor(name: string, player: KalturaPlayer, config: SkipConfig) {
    super(name, player, config);
  }
  getUIComponents() {
    return [
      {
        label: 'SkipComponent',
        presets: ['Playback'],
        area: 'InteractiveArea',
        get: SkipComponent
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

  loadMedia() {
    console.log('212', this.player.sources);
    console.log('212', this.player.sources.metadata.intro);
  }
}

export {Skip, pluginName};
