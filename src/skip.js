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

  loadMedia(): void {
    this.eventManager.listenOnce(this.player, this.player.Event.FIRST_PLAYING, () => {
      this._setIntroOutroData();
      this._initListeners();
    });
  }

  _setIntroOutroData(): void {
    const {intro, outro} = this.player.sources.metadata;
    this._setIntroData(intro);
    this._setOutroData(outro);
  }

  _initListeners() {
    if (!this.intro && !this.outro) {
      this.logger.warn('the plugin is disabled due to invalid skip points values', this.player.sources.metadata);
    } else {
      if (this.intro) this.eventManager.listen(this.player, this.player.Event.TIME_UPDATE, () => this._updateMode(Mode.INTRO, this.intro));
      if (this.outro) this.eventManager.listen(this.player, this.player.Event.TIME_UPDATE, () => this._updateMode(Mode.OUTRO, this.outro));
    }
  }

  _setIntroData(intro: SkipPoint): void {
    if (typeof intro?.startTime === 'number' && typeof intro?.endTime === 'number') {
      this.intro = {...intro};
    } else {
      this.logger.warn('the intro metadata values must be set and type of number', intro);
    }
  }

  _setOutroData(outro: SkipPoint): void {
    if (typeof outro?.startTime === 'number') {
      if (typeof outro?.endTime !== 'number' || outro?.endTime === -1) {
        outro.endTime = this.player.duration;
      }
      this.outro = {...outro};
    } else {
      this.logger.warn('the outro startTime must be set and type of number', outro);
    }
  }

  _updateMode(mode: string, skipPoint: SkipPoint): void {
    if (this.currentMode === Mode.OFF || this.currentMode === mode) {
      if (this._isInSkipPointRange(skipPoint)) {
        this._displayButton(mode);
      } else {
        this._removeButton();
      }
    }
  }

  _isInSkipPointRange(skipPoint: SkipPoint): boolean {
    return this.player.currentTime >= skipPoint.startTime && this.player.currentTime < skipPoint.endTime;
  }

  _displayButton(mode: string): void {
    if (this.currentMode === Mode.OFF) {
      this.currentMode = mode;
      this.removeComponent = this.player.ui.addComponent({
        label: 'SkipComponent',
        presets: ['Playback'],
        area: 'BottomBar',
        get: SkipComponent,
        props: {mode, seek: this.seek.bind(this)}
      });
    }
  }

  _removeButton(): void {
    if (this.currentMode !== Mode.OFF) {
      this.currentMode = Mode.OFF;
      this.removeComponent();
    }
  }

  seek(): void {
    const seekTo = this.currentMode === Mode.INTRO ? this.intro.endTime : this.outro.endTime;
    this.player.currentTime = seekTo;
    this._removeButton();
  }

  static isValid(): boolean {
    return true;
  }
}

export {Skip, pluginName};
