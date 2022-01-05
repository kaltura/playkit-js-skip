// @flow
/**
 * @jsx h
 * @ignore
 */
import {ui} from 'kaltura-player-js';
import skipStyle from './skip.scss';
const {preact, preacti18n} = ui;
const {h, Component} = preact;
const {Text} = preacti18n;

const COMPONENT_NAME = 'Skip';

/**
 * SkipIntroOutro component
 *
 * @class Skip
 * @extends {Component}
 */
class Skip extends Component {
  render(): React$Element<any> | void {
    return (
      <div tabIndex="0" aria-label={this.props.label} className={skipStyle.btnSkip} onClick={this.props.seek}>
        <Text id={this.props.label} />
      </div>
    );
  }
}

Skip.displayName = COMPONENT_NAME;
export {Skip};
