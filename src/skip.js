// @flow
import {KalturaPlayer, BasePlugin, ui} from '@playkit-js/kaltura-player-js';
import {Skip as SkipComponent} from './components/skip/skip';
import {SkipEvents} from './events';

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
    const relativeTime = this.config?.intro?.relativeTime;
    if (typeof intro?.endTime === 'number') {
      if (typeof intro?.startTime !== 'number') {
        intro.startTime = 0;
      }
      this._intro = {...intro};
    } else if (this._isValidRelativeTime(relativeTime)) {
      this._intro = {
        startTime: 0,
        endTime: relativeTime
      };
    } else {
      this.logger.warn('the intro endTime must be set with type of number and be less than the video duration', intro);
    }
  }

  _setOutroData(): void {
    const {outro} = this.player.sources.metadata;
    const relativeTime = this.config?.outro?.relativeTime;
    if (typeof outro?.startTime === 'number') {
      if (typeof outro?.endTime !== 'number' || outro?.endTime === -1) {
        outro.endTime = this.player.duration - 1;
      }
      this._outro = {...outro};
    } else if (this._isValidRelativeTime(relativeTime)) {
      this._outro = {
        startTime: this.player.duration - relativeTime,
        endTime: this.player.duration - 1
      };
    } else {
      this.logger.warn('the outro startTime must be set with type of number and be less than the video duration', outro);
    }
  }

  _isValidRelativeTime(relativeTime): boolean {
    return typeof relativeTime === 'number' && relativeTime < this.player.duration;
  }

  _updateMode(mode: string, skipPoint: SkipPoint): void {
    if (this._currentMode === Mode.OFF || this._currentMode === mode) {
      if (this._isInSkipPointRange(skipPoint)) {
        this._displayButton(mode, skipPoint);
      } else {
        this._removeButton();
      }
    }
  }

  _displayButton(mode) {
    if (this._currentMode === Mode.OFF) {
      this._addButton(mode);
      this.dispatchEvent(SkipEvents.SKIP_BUTTON_DISPLAYED, {mode});
    }
  }

  _isInSkipPointRange(skipPoint: SkipPoint): boolean {
    return (
      this.player.currentTime >= skipPoint.startTime &&
      this.player.currentTime < Math.min(skipPoint.endTime, skipPoint.startTime + this.config.timeout)
    );
  }

  _addButton(mode: string): void {
    this._currentMode = mode;
    this._removeComponent = this.player.ui.addComponent({
      label: 'SkipComponent',
      presets: ['Playback'],
      area: ui.ReservedPresetAreas.InteractiveArea,
      get: SkipComponent,
      props: {
        label: this._translations.get(mode),
        onClick: this.seek.bind(this),
        parentComponent: ui.ReservedPresetAreas.InteractiveArea
      }
    });
  }
  _removeButton(): void {
    if (this._currentMode !== Mode.OFF) {
      this._currentMode = Mode.OFF;
    }
    this._removeComponent && this._removeComponent();
  }

  seek(): void {
    const seekTo = this._currentMode === Mode.INTRO ? this._intro.endTime : this._outro.endTime;
    this.player.currentTime = seekTo;
    this.dispatchEvent(SkipEvents.SKIP_BUTTON_CLICK, {mode: this._currentMode});
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
