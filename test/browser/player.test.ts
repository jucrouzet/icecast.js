import {Player} from '../../src/Player';

import {expect} from 'chai';

const construct = (arg?: any): () => Player => () => {
  return new Player(arg);
};


describe('#construct()', () => {
  it('should not accept invalid/missing argument', () => {
    const err: string = 'Instantiating a Player needs a valid <audio> element';

    expect(construct()).to.throw(err);
    expect(construct('lol')).to.throw(err);
    expect(construct(window.document.createElement('video'))).to.throw(err);
    expect(construct(window.document.getElementById('notPlayer'))).to.throw(err);
  });

  it('should accept valid audio tag as argument', () => {
    const elem: HTMLAudioElement = window.document.createElement('audio');

    expect(construct(elem)).to.not.throw();
    expect(construct(window.document.getElementById('player1'))).to.not.throw();
  });

  it('should add a `icecastjs-player` class, if not present', () => {
    const elem1: HTMLElement | null = window.document.getElementById('player2');
    const elem2: HTMLElement | null = window.document.getElementById('player3');

    expect(elem1).to.not.be.equal(null);
    expect(elem2).to.not.be.equal(null);

    if ((elem1 === null) || (elem2 === null)) {
      throw new Error('Player2 or Player3 is missing');
    }

    expect(construct(elem1)).to.not.throw();

    // Ensure the class is added
    expect(elem1.className.indexOf('icecastjs-player')).to.not.equal(-1);

    // Ensure the we do not re-instantiate
    expect(construct(elem2)).to.throw();
  });
});

describe('#ensureNotPlaying()', () => {
  it('should not throw', () => {
    const elem: HTMLElement | null = window.document.getElementById('player4');

    if (elem === null) {
      throw new Error('"Player4 is missing');
    }

    const player: Player = construct(elem)();

    expect((<any>player).ensureNotPlaying.bind(player)).to.not.throw();
  });

  it('should pause an already playing player', function (done) {
    this.timeout(5000);
    // Give player time to start
    setTimeout(
      () => {
        try {
          const elem: HTMLElement | null = window.document.getElementById('player5');

          expect(elem).to.not.be.equal(null);

          if (elem === null) {
            throw new Error('"Player5 is missing');
          }

          if (!(<HTMLAudioElement>elem).paused) {

            const player: Player = construct(elem)();

            (<any>player).ensureNotPlaying();

            expect((<HTMLAudioElement>elem).paused).to.be.equal(true, 'did not paused player');
          }


          done();
        } catch (err) {
          done(err);
        }
      },
      2000,
    )
  });

  it('should unset the autoplay attribute but keep the status', () => {
    const elem: HTMLElement | null = window.document.getElementById('player6');

    expect(elem).to.not.be.equal(null);

    if (elem === null) {
      throw new Error('"Player6 is missing');
    }


    const player: Player = construct(elem)();

    (<any>player).ensureNotPlaying();

    expect((<HTMLAudioElement>elem).autoplay).to.be.equal(false, 'did not unset autoplay');
    expect((<any>player).autoplay).to.be.equal(true, 'did not saved autoplay status');
  });

  it('should set the preload attribute to "none"', () => {
    const elem: HTMLElement | null = window.document.getElementById('player7');

    expect(elem).to.not.be.equal(null);

    if (elem === null) {
      throw new Error('"Player7 is missing');
    }

    const player: Player = construct(elem)();

    (<any>player).ensureNotPlaying();

    expect((<HTMLAudioElement>elem).preload).to.be.equal('none', 'did not set preload');
  });
});

describe('#readIcecastAttributes()', () => {
  it('should not throw', () => {
    const elem: HTMLElement | null = window.document.getElementById('player8');

    if (elem === null) {
      throw new Error('"Player8 is missing');
    }

    const player: Player = construct(elem)();

    expect((<any>player).readIcecastAttributes.bind(player)).to.not.throw();
  });

  it('should detect the icecast-autoplay attribute correctly', () => {
    const elem1: HTMLElement | null = window.document.getElementById('player9');
    const elem2: HTMLElement | null = window.document.getElementById('player10');

    if ((elem1 === null) || (elem2 === null)) {
      throw new Error('"Player9 or Player10 is missing');
    }

    const player1: Player = construct(elem1)();
    const player2: Player = construct(elem2)();

    (<any>player1).readIcecastAttributes();
    (<any>player2).readIcecastAttributes();

    expect((<any>player1).autoplay).to.be.equal(true, 'did not detect icecast-autoplay');
    expect((<any>player2).autoplay).to.be.equal(false, 'wrongly detected icecast-autoplay');
  });
});

describe('#getSourcesFromElement()', () => {
  it('should not throw', () => {
    const elem: HTMLElement | null = window.document.getElementById('player11');

    if (elem === null) {
      throw new Error('"Player11 is missing');
    }

    const player: Player = construct(elem)();

    expect((<any>player).getSourcesFromElement.bind(player)).to.not.throw();
  });

  it('should remove the src attribute', () => {
    const elem: HTMLElement | null = window.document.getElementById('player12');

    if (elem === null) {
      throw new Error('"Player12 is missing');
    }

    const player: Player = construct(elem)();

    (<any>player).getSourcesFromElement();

    expect((<HTMLAudioElement>elem).src).to.be.equal('', 'did not removed src');
  });

  it('should remove the source elements', () => {
    const elem: HTMLElement | null = window.document.getElementById('player13');

    if (elem === null) {
      throw new Error('"Player13 is missing');
    }

    const player: Player = construct(elem)();

    (<any>player).getSourcesFromElement();

    expect((<HTMLAudioElement>elem).children.length).to.be.equal(0, 'did not removed source elements');
  });

  it('should store stream urls', () => {
    const elem: HTMLElement | null = window.document.getElementById('player14');

    if (elem === null) {
      throw new Error('"Player14 is missing');
    }

    const player: Player = construct(elem)();

    (<any>player).getSourcesFromElement();

    expect((<any>player).urls).to.be.deep.equal(
      ['http://example.com/1', 'http://example.com/2', 'http://example.com/3'],
      'did not removed source elements',
    );
  });
});

describe('#setError()', () => {
  it('should not throw', () => {
    const elem: HTMLElement | null = window.document.getElementById('player15');

    if (elem === null) {
      throw new Error('"Player15 is missing');
    }

    const player: Player = construct(elem)();

    expect(() => {
      (<any>player).setError('Error as text');
    }).to.not.throw();
    expect(() => {
      (<any>player).setError(new Error('Error as text'));
    }).to.not.throw();
  });

  it('should remove the src attribute and reset player', () => {
    const elem: HTMLElement | null = window.document.getElementById('player16');

    if (elem === null) {
      throw new Error('"Player16 is missing');
    }

    const player: Player = construct(elem)();

    (<any>player).setError(new Error('Error as text'));

    expect((<HTMLAudioElement>elem).src).to.be.equal('', 'did not removed src');
    expect((<HTMLAudioElement>elem).readyState).to.be.equal(0, 'did not reset player');
  });
});
