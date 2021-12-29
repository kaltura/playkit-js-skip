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
  INTRO: 'into',
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
      this._init();
    });
  }

  _init = (): void => {
    const {player, eventManager} = this.props;
    const {intro, outro} = this.props.player.sources.metadata;
    this._setIntroData(intro);
    this._setOutroData(outro);
    if (this.introData || this.outroData) {
      eventManager.listen(player, player.Event.TIME_UPDATE, () => this._updateVisibilityState());
    }
  };

  _setIntroData = intro => {
    if (typeof intro?.startTime === 'number' && typeof intro?.endTime === 'number') {
      const duration: number = intro.endTime - intro.startTime;
      const timeout: number = Math.min(this.props.config.timeout, duration);
      this.introData = {...intro, timeout};
    }
  };

  _setOutroData = outro => {
    if (typeof outro?.startTime === 'number') {
      if (typeof outro?.endTime !== 'number') {
        outro.endTime = this.props.player.duration;
      }
      const duration: number = outro.endTime - outro.startTime;
      const timeout: number = Math.min(this.props.config.timeout, duration);
      this.outroData = {...outro, timeout};
    }
  };

  _updateVisibilityState = (): void => {
    const {player} = this.props;
    if (this.state.currentMode === Mode.OFF) {
      if (player.currentTime >= this.introData.startTime && player.currentTime < this.introData.startTime + this.introData.timeout) {
        this.setState({currentMode: Mode.INTRO});
        setTimeout(() => this.setState({currentMode: Mode.OFF}), this.introData.timeout * 1000);
      } else if (player.currentTime >= this.outroData.startTime && player.currentTime < this.outroData.startTime + this.outroData.timeout) {
        this.setState({currentMode: Mode.OUTRO});
        setTimeout(() => this.setState({currentMode: Mode.OFF}), this.outroData.timeout * 1000);
      }
    }
  };

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
