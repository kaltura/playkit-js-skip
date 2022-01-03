// @flow
/**
 * @jsx h
 * @ignore
 */
import {ui} from 'kaltura-player-js';
import skipStyle from './skip.scss';
const {preact, Components, Event, Utils, redux, Reducers, preacti18n} = ui;
const {withEventManager} = Event;
const {bindActions} = Utils;
const {shell} = Reducers;
const {actions} = shell;
const {connect} = redux;
const {h, Component} = preact;
const {withText} = preacti18n;
const {withLogger, withPlayer} = Components;

const Mode = {
  INTRO: 'intro',
  OUTRO: 'outro',
  OFF: 'off'
};

const mapStateToProps = state => ({
  prePlayback: state.engine.prePlayback,
  currentTime: state.engine.currentTime
});

const COMPONENT_NAME = 'SkipIntroOutro';
// eslint-disable-next-line valid-jsdoc
/**
 * SkipIntroOutro component
 *
 * @class Skip
 * @extends {Component}
 */
@connect(mapStateToProps, bindActions(actions))
@withPlayer
@withEventManager
@withLogger(COMPONENT_NAME)
@withText({
  skipIntroTxt: 'skip.skipIntro',
  watchNextTxt: 'skip.watchNext'
})
class Skip extends Component {
  intro: SkipPoint;
  outro: SkipPoint;
  constructor(props: any) {
    super(props);
  }
  componentDidMount() {
    this.setState({currentMode: Mode.OFF});
    const {player} = this.props;
    this.props.eventManager.listen(player, player.Event.FIRST_PLAY, () => {
      this._setIntroOutroData();
    });
  }

  _setIntroOutroData = (): void => {
    const {player} = this.props;
    const {intro, outro} = this.props.player.sources.metadata;
    this._setIntroData(intro);
    this._setOutroData(outro);
    if (this.intro || this.outro) {
      this.props.eventManager.listen(player, player.Event.TIME_UPDATE, () => this._updateMode());
    } else {
      this.props.logger.warn('the plugin is disabled due to invalid skip points values', intro);
    }
  };

  _setIntroData = intro => {
    if (typeof intro?.startTime === 'number' && typeof intro?.endTime === 'number') {
      const duration: number = intro.endTime - intro.startTime;
      const timeout: number = Math.min(this.props.config.timeout, duration);
      this.intro = {...intro, timeout, mode: Mode.INTRO};
    } else {
      this.props.logger.warn('the intro metadata values must be set and type of number', intro);
    }
  };

  _setOutroData = outro => {
    if (typeof outro?.startTime === 'number') {
      if (typeof outro?.endTime !== 'number' || outro?.endTime === -1) {
        outro.endTime = this.props.player.duration;
      }
      const duration: number = outro.endTime - outro.startTime;
      const timeout: number = Math.min(this.props.config.timeout, duration);
      this.outro = {...outro, timeout, mode: Mode.OUTRO};
    } else {
      this.props.logger.warn('the outro startTime must be set and type of number', outro);
    }
  };

  _updateMode = (): void => {
    if (this.state.currentMode === Mode.OFF) {
      if (this._isOverlapping(this.intro)) {
        this._show(Mode.INTRO, this.intro.timeout);
      } else if (this._isOverlapping(this.outro)) {
        this._show(Mode.OUTRO, this.outro.timeout);
      }
    }
  };

  _isOverlapping(skipPoint: SkipPoint) {
    const {player} = this.props;
    return player.currentTime >= skipPoint.startTime && player.currentTime < skipPoint.startTime + skipPoint.timeout;
  }

  _show(mode: string, timeout: number) {
    this.props.logger.log(`enter ${mode} skip point`);
    this.setState({currentMode: mode});
    setTimeout(() => this._hide(), timeout * 1000);
  }

  _hide() {
    this.props.logger.log(`exit ${this.state.mode} skip point`);
    this.setState({currentMode: Mode.OFF});
  }

  _seek = (): void => {
    this.setState({currentMode: Mode.OFF});
    const seekTo = this.state.currentMode === Mode.INTRO ? this.intro.endTime : this.outro.endTime;
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
        onClick={this._seek}>
        {skipTxt}
      </div>
    );
  }
}

Skip.displayName = COMPONENT_NAME;
export {Skip};
