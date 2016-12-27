/**
 * Source class tests.
 */
import Source = require('./../../../../src/Icecast/Source');

window.runTest = (test: string, ...args: any[]) => {
  switch (test) {
    case 'constructor' :
      try {
        const instance = new Source(<string>args[0], <string>args[1]);
        return 'ok';
      } catch (err) {
        return err.message;
      }
    case 'guessMimetype' :
      try {
        const instance = new Source(<string>args[0]);
        return instance.mimeType;
      } catch (err) {
        return err.message;
      }
    case 'getPlaylistStreams' :
      try {
        const instance = new Source(<string>args[0]);
        return instance.getStreams();
      } catch (err) {
        return err.message;
      }
  }
};
