// @flow
/**
 * @jsx h
 * @ignore
 */
import {h, Component} from 'preact';
import {ui} from '@playkit-js/kaltura-player-js';
import skipStyle from './skip.scss';

const {Text, Localizer} = ui.preacti18n;
const {PLAYER_SIZE} = ui.Components;
const {bindActions} = ui.Utils;
const {actions} = ui.Reducers.shell;
const {connect} = ui.redux;
const {KeyMap} = ui.utils;

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
  /**
   * on key down handler
   *
   * @param {KeyboardEvent} e - keyboard event
   * @returns {void}
   * @memberof Skip
   */
  onKeyDown = (e: KeyboardEvent): void => {
    if (e.keyCode === KeyMap.ENTER || e.keyCode === KeyMap.SPACE) {
      e.preventDefault();
      this.props.onClick();
    }
  };

  render(): React$Element<any> | void {
    if (this.props.playerSize !== PLAYER_SIZE.TINY && !this.props.loading) {
      return (
        <Localizer>
          <div
            onClick={this.props.onClick}
            onKeyDown={this.onKeyDown}
            className={[
              skipStyle.btnSkip,
              this.props.parentComponent === 'InteractiveArea' ? skipStyle.interactiveAreaPosition : skipStyle.bottomBarPosition
            ].join(' ')}
            tabIndex="0"
            aria-label={<Text id={this.props.label} />}>
            <Text id={this.props.label} />
          </div>
        </Localizer>
      );
    }
  }
}

Skip.displayName = COMPONENT_NAME;
export {Skip};
