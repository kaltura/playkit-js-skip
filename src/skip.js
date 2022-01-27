// @flow
import {KalturaPlayer, BasePlugin} from 'kaltura-player-js';
import {Skip as SkipComponent} from './components/skip/skip';

const pluginName: string = 'skip';

export const Mode = {
  INTRO: 'intro',
  OUTRO: 'outro',
  OFF: 'off'
};

/**
 * The Skip plugin.
 * @class Skip
 * @param {string} name - The plugin name.
 * @param {Object} config - The plugin config.
 * @extends BasePlugin
 */
class Skip extends BasePlugin {
  _intro: SkipPoint;
  _outro: SkipPoint;
  _currentMode: string;
  _removeComponent: Function;
  _translations: Map<string, string>;
  constructor(name: string, player: KalturaPlayer, config: SkipConfig) {
    super(name, player, config);
    this._currentMode = Mode.OFF;
    this._translations = new Map();
    this._initTranslations();
  }

  static defaultConfig: SkipConfig = {
    timeout: 5
  };

  static isValid(): boolean {
    return true;
  }

  _initTranslations() {
    this._translations.set(Mode.INTRO, 'skip.skipIntro');
    this._translations.set(Mode.OUTRO, 'skip.watchNext');
  }

  loadMedia(): void {
    this.eventManager.listen(this.player, this.player.Event.DURATION_CHANGE, () => this._setOutroData());
    this.eventManager.listenOnce(this.player, this.player.Event.FIRST_PLAYING, () => {
      this._setIntroData();
      this._initListeners();
    });
  }

  _initListeners() {
    if (!this._intro && !this._outro) {
      this.logger.warn('the plugin is disabled due to invalid skip points values', this.player.sources.metadata);
    } else {
      if (this._intro) this.eventManager.listen(this.player, this.player.Event.TIME_UPDATE, () => this._updateMode(Mode.INTRO, this._intro));
      if (this._outro) this.eventManager.listen(this.player, this.player.Event.TIME_UPDATE, () => this._updateMode(Mode.OUTRO, this._outro));
    }
  }

  _setIntroData(): void {
    const {intro} = this.player.sources.metadata;
    if (typeof intro?.endTime === 'number') {
      if (typeof intro?.startTime !== 'number') {
        intro.startTime = 0;
      }
      this._intro = {...intro};
    } else {
      this.logger.warn('the intro endTime must be set and type of number', intro);
    }
  }

  _setOutroData(): void {
    const {outro} = this.player.sources.metadata;
    if (typeof outro?.startTime === 'number') {
      if (typeof outro?.endTime !== 'number' || outro?.endTime === -1) {
        outro.endTime = this.player.duration - 1;
      }
      this._outro = {...outro};
    } else {
      this.logger.warn('the outro startTime must be set and type of number', outro);
    }
  }

  _updateMode(mode: string, skipPoint: SkipPoint): void {
    if (this._currentMode === Mode.OFF || this._currentMode === mode) {
      if (this._isInSkipPointRange(skipPoint)) {
        this._displayButton(mode);
      } else {
        this._removeButton();
      }
    }
  }

  _displayButton(mode) {
    if (this._currentMode === Mode.OFF) {
      this._addButton(mode, 'InteractiveArea');
      setTimeout(() => {
        this._addButton(mode, 'BottomBar');
      }, this.config.timeout * 1000);
    }
  }

  _isInSkipPointRange(skipPoint: SkipPoint): boolean {
    return this.player.currentTime >= skipPoint.startTime && this.player.currentTime < skipPoint.endTime;
  }

  _addButton(mode: string, area: string): void {
    if (this._removeComponent) this._removeComponent();
    this._currentMode = mode;
    this._removeComponent = this.player.ui.addComponent({
      label: 'SkipComponent',
      presets: ['Playback'],
      area: area,
      get: SkipComponent,
      props: {
        label: this._translations.get(mode),
        onClick: this.seek.bind(this),
        area: area
      }
    });
  }

  _removeButton(): void {
    if (this._currentMode !== Mode.OFF) {
      this._currentMode = Mode.OFF;
      this._removeComponent();
    }
  }

  seek(): void {
    const seekTo = this._currentMode === Mode.INTRO ? this._intro.endTime : this._outro.endTime;
    this.player.currentTime = seekTo;
    this._removeButton();
  }

  reset(): void {
    this._removeButton();
    this.eventManager.removeAll();
  }

  destroy(): void {
    this.reset();
    this.eventManager.destroy();
  }
}

export {Skip, pluginName};
