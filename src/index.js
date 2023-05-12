// @flow
import {registerPlugin} from '@playkit-js/kaltura-player-js';
import {Skip as Plugin, pluginName} from './skip';
declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {VERSION, NAME};
export {Plugin};

registerPlugin(pluginName, Plugin);
