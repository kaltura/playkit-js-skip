// @flow
import {registerPlugin} from 'kaltura-player-js';
import {SkipIntoOutro as Plugin, pluginName} from './skip-into-outro';
import {SkipIntroOutro} from './components/skip-inro-outro/skip-intro-outro';
declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {VERSION, NAME};
export {Plugin};
export {SkipIntroOutro};

registerPlugin(pluginName, Plugin);
