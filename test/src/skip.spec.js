import '../../src/index';
import {setup} from 'kaltura-player-js';
import * as TestUtils from './utils/test-utils';
import {Mode} from '../../src/skip';

const targetId = 'player-placeholder-skip.spec';

const mediaData = {
  progressive: [
    {
      mimetype: 'video/mp4',
      url: 'https://cfvod.kaltura.com/pd/p/1726172/sp/172617200/serveFlavor/entryId/1_po3v31zx/v/1/ev/7/flavorId/1_67zt1djx/fileName/BBB_(Basic_Small_-_WEB_MBL_(H264_400)).mp4/name/a.mp4'
    }
  ]
};

const config = {
  targetId,
  provider: {},
  plugins: {
    skip: {}
  },
  // translations - for local environment
  ui: {
    translations: {
      en: {
        skip: {
          skipIntro: 'Skip Intro',
          watchNext: 'Watch Next'
        }
      }
    }
  }
};

describe('Skip Plugin', function () {
  let player;
  let skipPlugin;
  before(function () {
    TestUtils.createElement('DIV', targetId);
  });

  beforeEach(() => {
    player = setup(config);
    skipPlugin = player.plugins.skip;
  });

  afterEach(function () {
    player.destroy();
    TestUtils.removeVideoElementsFromTestPage();
  });

  after(function () {
    TestUtils.removeElement(targetId);
  });

  it('current mode should be on the right mode - intro', done => {
    player.setMedia({
      sources: {
        ...mediaData,
        metadata: {
          intro: {startTime: 1, endTime: 2}
        }
      }
    });
    player.addEventListener(player.Event.FIRST_PLAYING, () => {
      player.addEventListener(player.Event.TIME_UPDATE, () => {
        try {
          if (player.currentTime < 1) {
            skipPlugin._currentMode.should.equal(Mode.OFF);
          }
          if (player.currentTime >= 1 && player.currentTime < 2) {
            skipPlugin._currentMode.should.equal(Mode.INTRO);
          }
          if (player.currentTime >= 2) {
            skipPlugin._currentMode.should.equal(Mode.OFF);
            done();
          }
        } catch (e) {
          done(e);
        }
      });
    });
    player.play();
  });

  it('current mode should be on the right mode - outro', done => {
    player.setMedia({
      sources: {
        ...mediaData,
        metadata: {
          outro: {startTime: 1, endTime: 2}
        }
      }
    });
    player.addEventListener(player.Event.FIRST_PLAYING, () => {
      player.addEventListener(player.Event.TIME_UPDATE, () => {
        try {
          if (player.currentTime < 1) {
            skipPlugin._currentMode.should.equal(Mode.OFF);
          }
          if (player.currentTime >= 1 && player.currentTime < 2) {
            skipPlugin._currentMode.should.equal(Mode.OUTRO);
          }
          if (player.currentTime >= 2) {
            skipPlugin._currentMode.should.equal(Mode.OFF);
            done();
          }
        } catch (e) {
          done(e);
        }
      });
    });
    player.play();
  });

  it('current mode should be on the right mode - change media', done => {
    player.setMedia({
      sources: {
        ...mediaData,
        metadata: {
          intro: {startTime: 1, endTime: 2}
        }
      }
    });
    player.addEventListener(player.Event.SEEKED, () => {
      player.reset();
      player.setMedia({
        sources: {
          ...mediaData,
          metadata: {
            intro: {startTime: 2, endTime: 3}
          }
        }
      });
      player.currentTime = 2;
      player.addEventListener(player.Event.FIRST_PLAYING, () => {
        player.addEventListener(player.Event.TIME_UPDATE, () => {
          try {
            if (player.currentTime >= 1 && player.currentTime < 2) {
              skipPlugin._currentMode.should.equal(Mode.OFF);
            }
            if (player.currentTime >= 2 && player.currentTime < 3) {
              skipPlugin._currentMode.should.equal(Mode.INTRO);
              done();
            }
          } catch (e) {
            done(e);
          }
        });
      });
      player.play();
    });
    player.play();
    player.currentTime = 3;
  });
});
