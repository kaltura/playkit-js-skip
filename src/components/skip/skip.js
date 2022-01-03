// @flow
/**
 * @jsx h
 * @ignore
 */
import {ui} from 'kaltura-player-js';
import skipStyle from './skip.scss';
const {preact, preacti18n} = ui;
const {h, Component} = preact;
const {withText} = preacti18n;

export const Mode = {
  INTRO: 'intro',
  OUTRO: 'outro',
  OFF: 'off'
};

const COMPONENT_NAME = 'SkipIntroOutro';

/**
 * SkipIntroOutro component
 *
 * @class Skip
 * @extends {Component}
 */

@withText({
  skipIntroTxt: 'skip.skipIntro',
  watchNextTxt: 'skip.watchNext'
})
class Skip extends Component {
  /**
   * render element
   *
   * @returns {React$Element} component element
   * @memberof SkipIntroOutro
   */
  render(): React$Element<any> | void {
    const skipTxt = this.props.mode === Mode.INTRO ? this.props.skipIntroTxt : this.props.watchNextTxt;
    return (
      <div
        tabIndex="0"
        aria-label={this.state.currentMode === Mode.INTRO ? this.props.skipIntroTxt : this.props.watchNextTxt}
        className={skipStyle.btnSkip}
        onClick={this.props.seek}>
        {skipTxt}
      </div>
    );
  }
}

Skip.displayName = COMPONENT_NAME;
export {Skip};
