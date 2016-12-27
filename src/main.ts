import { Player } from './Icecast/Player';
import * as DomHelper from './Utils/DomHelper';
import { Logger } from './Utils/Logger';

Logger.level = Logger.DEBUG;

/* tslint:disable */
require('mutationobserver-shim');
require('core-js');
/* tslint:enable */

/**
 * Init present audio players.
 */
/* tslint:disable: no-unused-new */
for (const audio of DomHelper.getAudioElements()) {
  try { new Player(audio); } catch (err) { Logger.send.error(err); }
}
DomHelper.watchAudioElements().on('added', (audio: HTMLAudioElement) => {
  try { new Player(audio); } catch (err) { Logger.send.error(err); }
});
/* tslint:enable: no-unused-new */
