// @flow
/**
 * @jsx h
 * @ignore
 */
import {ui} from 'kaltura-player-js';
import skipStyle from './skip-intro-outro.scss';
const {preact, preacti18n, Components} = ui;
const {h, Component} = preact;
const {withText} = preacti18n;
const {withLogger, withPlayer} = Components;

const Mode = {
  INTRO: 'intro',
  OUTRO: 'outro',
  OFF: 'off'
};

const COMPONENT_NAME = 'SkipIntroOutro';
/**
 * SkipIntroOutro component
 *
 * @class SkipIntroOutro
 * @extends {Component}
 */

@withPlayer
@withLogger(COMPONENT_NAME)
@withText({
  skipIntroTxt: 'skip.skipIntro',
  watchNextTxt: 'skip.watchNext'
})
class SkipIntroOutro extends Component {
  introData: SkipData;
  outroData: SkipData;
  constructor(props: any) {
    super(props);
    this.state = {
      currentMode: Mode.OFF
    };
  }
  componentDidMount() {
    const {player, eventManager} = this.props;
    // 1) - prevent listening, 2) - duration unavailable
    eventManager.listen(player, player.Event.FIRST_PLAY, () => {
      this._setIntroOutroData();
    });
  }

  _setIntroOutroData = (): void => {
    const {player, eventManager} = this.props;
    const {intro, outro} = this.props.player.sources.metadata;
    this._setIntroData(intro);
    this._setOutroData(outro);
    if (this.introData || this.outroData) {
      eventManager.listen(player, player.Event.TIME_UPDATE, () => this._updateMode());
    }
  };

  _setIntroData = intro => {
    if (typeof intro?.startTime === 'number' && typeof intro?.endTime === 'number') {
      const duration: number = intro.endTime - intro.startTime;
      const timeout: number = Math.min(this.props.config.timeout, duration);
      this.introData = {...intro, timeout, mode: Mode.INTRO};
    }
  };

  _setOutroData = outro => {
    if (typeof outro?.startTime === 'number') {
      if (typeof outro?.endTime !== 'number' || outro?.endTime === -1) {
        outro.endTime = this.props.player.duration;
      }
      const duration: number = outro.endTime - outro.startTime;
      const timeout: number = Math.min(this.props.config.timeout, duration);
      this.outroData = {...outro, timeout, mode: Mode.OUTRO};
    }
  };

  _updateMode = (): void => {
    if (this.state.currentMode === Mode.OFF) {
      if (this._isOverlapping(this.introData)) {
        this._turnOn(Mode.INTRO, this.introData.timeout);
      } else if (this._isOverlapping(this.outroData)) {
        this._turnOn(Mode.OUTRO, this.outroData.timeout);
      }
    }
  };

  _isOverlapping(skipData: SkipData) {
    const {player} = this.props;
    return player.currentTime >= skipData.startTime && player.currentTime < skipData.startTime + skipData.timeout;
  }

  _turnOn(mode: string, timeout: number) {
    this.setState({currentMode: mode});
    setTimeout(() => this._turnOff(), timeout * 1000);
  }

  _turnOff() {
    return this.setState({currentMode: Mode.OFF});
  }

  _skip = (): void => {
    this.setState({currentMode: Mode.OFF});
    const seekTo = this.state.currentMode === Mode.INTRO ? this.introData : this.outroData.endTime;
    this.props.player.currentTime = seekTo;
  };

  /**
   * render element
   *
   * @returns {React$Element} component element
   * @memberof SkipIntroOutro
   */
  render(): React$Element<any> | void {
    if (this.state.currentMode === Mode.OFF) {
      return undefined;
    }
    const skipTxt = this.state.currentMode === Mode.INTRO ? this.props.skipIntroTxt : this.props.watchNextTxt;
    return (
      <div
        tabIndex="0"
        aria-label={this.state.currentMode === Mode.INTRO ? this.props.skipIntroTxt : this.props.watchNextTxt}
        className={skipStyle.btnSkip}
        onClick={this._skip}>
        {skipTxt}
      </div>
    );
  }
}

SkipIntroOutro.displayName = COMPONENT_NAME;
export {SkipIntroOutro};
