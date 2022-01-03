// @flow
import {registerPlugin} from 'kaltura-player-js';
import {Skip as Plugin, pluginName} from './skip';
import {Skip} from './components/skip/skip';
declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {VERSION, NAME};
export {Plugin};
export {Skip};

registerPlugin(pluginName, Plugin);
