// @flow
/**
 * @jsx h
 * @ignore
 */
import {h, Component} from 'preact';
import {ui} from 'kaltura-player-js';
import skipStyle from './skip.scss';

const {Text} = ui.preacti18n;
const {PLAYER_SIZE} = ui.Components;
const {bindActions} = ui.Utils;
const {actions} = ui.Reducers.shell;
const {connect} = ui.redux;

/**
 * mapping state to props
 * @param {*} state - redux store state
 * @returns {Object} - mapped state to this component
 */
const mapStateToProps = state => ({
  playerSize: state.shell.playerSize,
  loading: state.loading.show
});

const COMPONENT_NAME = 'Skip';

/**
 * SkipIntroOutro component
 *
 * @class Skip
 * @extends {Component}
 */
@connect(mapStateToProps, bindActions(actions))
class Skip extends Component {
  render(): React$Element<any> | void {
    if (this.props.playerSize !== PLAYER_SIZE.TINY && !this.props.loading) {
      return (
        <div tabIndex="0" aria-label={this.props.label} className={skipStyle.btnSkip} onClick={this.props.onClick}>
          <Text id={this.props.label} />
        </div>
      );
    }
  }
}

Skip.displayName = COMPONENT_NAME;
export {Skip};
