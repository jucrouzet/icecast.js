import Promise = require('bluebird');
import DomHelper = require('./Utils/DomHelper');
import Player = require('./Icecast/Player');
import Logger = require('./Utils/Logger');

Logger.level = Logger.TRACE;

require('mutationobserver-shim');

/**
 * Init present audio players.
 */
for (const audio of DomHelper.GetAudioElements()) {
  try { new Player(audio); } catch (err) { Logger.Error(err); }
}
DomHelper.WatchAudioElements().on('added', (audio: HTMLAudioElement) => {
  try { new Player(audio); } catch (err) { Logger.Error(err); }
});
