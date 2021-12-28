// @flow
/**
 * @jsx h
 * @ignore
 */
import {ui} from 'kaltura-player-js';
const {preact, preacti18n, Components} = ui;
const {h, Component} = preact;
const {withText} = preacti18n;
const {withLogger, withPlayer} = Components;

import skipStyle from './skip.scss';

const COMPONENT_NAME = 'Share';
// eslint-disable-next-line valid-jsdoc
/**
 * Share component
 *
 * @class Share
 * @example <Share />
 * @extends {Component}
 */
@withPlayer
@withLogger(COMPONENT_NAME)
@withText({shareTxt: 'controls.share'})
class SkipIntroOutro extends Component {
  introData;
  outroData;
  constructor(props) {
    super(props);
    this.state = {
      skipMode: 'off'
    };
  }
  componentDidMount() {
    const {player, eventManager} = this.props;
    // 1) - prevent listening, 2) - duration unavailable
    eventManager.listen(player, player.Event.FIRST_PLAY, () => {
      this._extractMediaMetadata();
    });
  }

  _extractMediaMetadata = (): void => {
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
      const duration = intro.endTime - intro.startTime;
      const timeout = Math.min(this.props.config.timeout, duration * 1000);
      this.introData = {...intro, timeout};
    }
  };

  _setOutroData = outro => {
    if (typeof outro?.startTime === 'number') {
      if (typeof outro?.endTime !== 'number') {
        outro.endTime = this.props.player.duration;
      }
      const duration = outro.endTime - outro.startTime;
      const timeout = Math.min(this.props.config.timeout, duration * 1000);
      this.outroData = {...outro, timeout};
    }
  };

  _updateVisibilityState = (): void => {
    // Can be generic by object iteration
    const {player} = this.props;
    if (this.state.skipMode === 'off') {
      if (player.currentTime >= this.introData.startTime && player.currentTime < this.introData.startTime + this.introData.timeout / 1000) {
        this.setState({skipMode: 'intro'});
        setTimeout(() => this.setState({skipMode: 'off'}), this.introData.timeout);
      } else if (player.currentTime >= this.outroData.startTime && player.currentTime < this.outroData.startTime + this.outroData.timeout / 1000) {
        this.setState({skipMode: 'outro'});
        setTimeout(() => this.setState({skipMode: 'off'}), this.outroData.timeout);
      }
    }
  };

  _skip = (): void => {
    this.setState({skipMode: 'off'});
    const seekTo = this.state.skipMode === 'intro' ? this.introData.endTime : this.outroData.endTime;
    this.props.player.currentTime = seekTo;
  };

  /**
   * render element
   *
   * @returns {React$Element} component element
   * @memberof SkipIntroOutro
   */
  render(): React$Element<any> | void {
    if (this.state.skipMode === 'off') {
      return undefined;
    }
    return (
      <div
        tabIndex="0"
        // aria-label={this.props.isInFullscreen ? this.props.fullscreenExitText : this.props.fullscreenText}
        className={skipStyle.btnSkip}
        onClick={this._skip}>
        Skip Intro
      </div>
    );
  }
}

SkipIntroOutro.displayName = COMPONENT_NAME;
export {SkipIntroOutro};
