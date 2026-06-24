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
    scale: {
        // Keep the game's internal resolution at its designed 1024x576 (16:9) so all the
        // viewport-dependent logic (chunk culling, panel positions) still works, but scale
        // the canvas up to fill the browser window. 16:9 fills a widescreen with no bars.
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game',
        width: VIEW_WIDTH*TILE_WIDTH,
        height: VIEW_HEIGHT*TILE_HEIGHT
    },
    scene: [Boot, UI, Engine],
    dom: {
        createContainer: true
      }
};

var game = new Phaser.Game(config);

