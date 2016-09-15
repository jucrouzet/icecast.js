import DomHelper = require('./Utils/DomHelper');
import Player = require('./Icecast/Player');
import Logger = require('./Utils/Logger');

Logger.level = Logger.TRACE;

/* tslint:disable: no-var-requires */
require('mutationobserver-shim');
/* tslint:enable: no-var-requires */

/**
 * Init present audio players.
 */
/* tslint:disable: no-unused-new */
for (const audio of DomHelper.GetAudioElements()) {
  try { new Player(audio); } catch (err) { Logger.Error(err); }
}
DomHelper.WatchAudioElements().on('added', (audio: HTMLAudioElement) => {
  try { new Player(audio); } catch (err) { Logger.Error(err); }
});
/* tslint:enable: no-unused-new */
