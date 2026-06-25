import Phaser from '../node_modules/phaser/dist/phaser.min.js'

import Boot from './Boot';
import Engine from './Engine';
import UI from './UI';

import './style.css'
import './w3.css'

// TODO: move in conf?
var VIEW_WIDTH = 32;
var VIEW_HEIGHT = 18;
var TILE_WIDTH = 32;
var TILE_HEIGHT = 32;

var config = {
    //type: (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ? Phaser.CANVAS : Phaser.AUTO),
    type: Phaser.WEBGL,
    backgroundColor: '#c4d49b', // grass tone, so any not-yet-covered area blends instead of flashing black
    scale: {
        // Variable width/height: the canvas tracks the full size of its parent (#game,
        // which is 100vw x 100vh), so the game uses the entire browser window at native
        // resolution. The world (chunks) covers any size; entity culling (Engine.viewWidth/
        // viewHeight) and the boot backdrop are recomputed on resize to match.
        mode: Phaser.Scale.RESIZE,
        parent: 'game',
        width: '100%',
        height: '100%'
    },
    scene: [Boot, UI, Engine],
    dom: {
        createContainer: true
      }
};

var game = new Phaser.Game(config);

