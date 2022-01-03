// @flow
import {KalturaPlayer, BasePlugin} from 'kaltura-player-js';
import {Mode, Skip as SkipComponent} from './components/skip/skip';

const pluginName: string = 'skip';
/**
 * The Skip plugin.
 * @class Skip
 * @param {string} name - The plugin name.
 * @param {Object} config - The plugin config.
 * @extends BasePlugin
 */
class Skip extends BasePlugin {
  intro: SkipPoint;
  outro: SkipPoint;
  currentMode: string;
  removeComponent: Function;
  constructor(name: string, player: KalturaPlayer, config: SkipConfig) {
    super(name, player, config);
    this.currentMode = Mode.OFF;
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
    this.eventManager.listenOnce(this.player, this.player.Event.FIRST_PLAYING, () => {
      this._setIntroOutroData();
    });
  }

  _setIntroOutroData = (): void => {
    const {intro, outro} = this.player.sources.metadata;
    this._setIntroData(intro);
    this._setOutroData(outro);
    if (this.intro || this.outro) {
      this.eventManager.listen(this.player, this.player.Event.TIME_UPDATE, () => this._updateMode());
    } else {
      this.logger.warn('the plugin is disabled due to invalid skip points values', intro);
    }
  };

  _setIntroData(intro) {
    if (typeof intro?.startTime === 'number' && typeof intro?.endTime === 'number') {
      this.intro = {...intro};
    } else {
      this.logger.warn('the intro metadata values must be set and type of number', intro);
    }
  }

  _setOutroData(outro) {
    if (typeof outro?.startTime === 'number') {
      if (typeof outro?.endTime !== 'number' || outro?.endTime === -1) {
        outro.endTime = this.player.duration;
      }
      this.outro = {...outro};
    } else {
      this.logger.warn('the outro startTime must be set and type of number', outro);
    }
  }

  _updateMode = (): void => {
    if (this._isOverlapping(this.intro)) {
      this._show(Mode.INTRO);
    } else if (this._isOverlapping(this.outro)) {
      this._show(Mode.OUTRO);
    } else {
      this._hide();
    }
  };

  _isOverlapping(skipPoint: SkipPoint) {
    return this.player.currentTime >= skipPoint.startTime && this.player.currentTime < skipPoint.endTime;
  }

  _show(mode: string) {
    if (this.currentMode === Mode.OFF) {
      this.currentMode = mode;
      console.log('###', 'on', this.player.currentTime);
      this.removeComponent = this.player.ui.addComponent({
        label: 'SkipComponent',
        presets: ['Playback'],
        area: 'InteractiveArea',
        get: SkipComponent,
        props: {mode, seek: this._seek}
      });
    }
  }

  _hide() {
    if (this.currentMode !== Mode.OFF) {
      this.currentMode = Mode.OFF;
      console.log('###', 'off', this.player.currentTime);
      this.removeComponent();
    }
  }

  _seek = (): void => {
    const seekTo = this.currentMode === Mode.INTRO ? this.intro.endTime : this.outro.endTime;
    this.player.currentTime = seekTo;
    this._hide();
  };
}

export {Skip, pluginName};
