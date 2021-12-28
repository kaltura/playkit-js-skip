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
  /**
   * render element
   *
   * @returns {React$Element} component element
   * @memberof Share
   */
  render(): React$Element<any> | void {
    return (
      <div
        tabIndex="0"
        // aria-label={this.props.isInFullscreen ? this.props.fullscreenExitText : this.props.fullscreenText}
        className={skipStyle.btnSkip}
        onClick={this.toggleFullscreen}>
        Skip Intro
      </div>
    );
  }
}

SkipIntroOutro.displayName = COMPONENT_NAME;
export {SkipIntroOutro};
