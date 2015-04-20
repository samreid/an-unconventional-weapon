//  Copyright 2002-2014, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var LevelSword = require( 'AN_UNCONVENTIONAL_WEAPON/an-unconventional-weapon/view/LevelSword' );
  var LevelGun = require( 'AN_UNCONVENTIONAL_WEAPON/an-unconventional-weapon/view/LevelGun' );
  var LevelRat = require( 'AN_UNCONVENTIONAL_WEAPON/an-unconventional-weapon/view/LevelRat' );
  var LevelPlatform = require( 'AN_UNCONVENTIONAL_WEAPON/an-unconventional-weapon/view/LevelPlatform' );
  var LevelEnd = require( 'AN_UNCONVENTIONAL_WEAPON/an-unconventional-weapon/view/LevelEnd' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Input = require( 'SCENERY/input/Input' );

  var levels = [ LevelSword, LevelGun, LevelRat, LevelPlatform, LevelEnd ];
  var levelIndex = 0;

  window.TouchPower = {
    leftTouch: false, rightTouch: false, upTouch: false, spacebarTouch: false,
    get left() {
      return Input.pressedKeys[ Input.KEY_LEFT_ARROW ] || this.leftTouch;
    },
    get right() {
      return Input.pressedKeys[ Input.KEY_RIGHT_ARROW ] || this.rightTouch;
    },
    get spacebar() {
      return Input.pressedKeys[ Input.KEY_SPACE ] || this.spacebarTouch;
    },
    get up() {
      return Input.pressedKeys[ Input.KEY_UP_ARROW ] || this.upTouch;
    }
  };

  /**
   *
   * @constructor
   */
  function AnUnconventionalWeaponScreenView( model ) {
    ScreenView.call( this );

    var level = levels[ levelIndex ];
    this.activeLevel = new level( this );
    this.addChild( this.activeLevel );

    var updateTouches = function( event ) {
      var touches = event.touches;
      TouchPower.leftTouch = false;
      TouchPower.rightTouch = false;
      TouchPower.upTouch = false;
      TouchPower.spacebarTouch = false;
      for ( var i = 0; i < touches.length; i++ ) {
        var touch = touches[ i ];
        if ( touch.pageX < window.innerWidth / 2 && touch.pageY > window.innerHeight / 2 ) {
          TouchPower.leftTouch = true;
        }
        if ( touch.pageX < window.innerWidth / 2 && touch.pageY <= window.innerHeight / 2 ) {
          TouchPower.spacebarTouch = true;
        }
        if ( touch.pageX > window.innerWidth / 2 && touch.pageY > window.innerHeight / 2 ) {
          TouchPower.rightTouch = true;
        }
        if ( touch.pageX > window.innerWidth / 2 && touch.pageY <= window.innerHeight / 2 ) {
          TouchPower.upTouch = true;
        }
      }
    };
    document.body.addEventListener( 'touchstart', updateTouches, false );
    document.body.addEventListener( 'touchmove', updateTouches, false );
    document.body.addEventListener( 'touchend', updateTouches, false );
  }

  return inherit( ScreenView, AnUnconventionalWeaponScreenView, {
    step: function( dt ) {
      this.activeLevel.step( dt );
    },
    restartLevel: function() {
      this.removeChild( this.activeLevel );
      var level = levels[ levelIndex ];
      this.activeLevel = new level( this );
      this.addChild( this.activeLevel );
    },
    levelComplete: function() {
      this.removeChild( this.activeLevel );
      levelIndex++;
      var level = levels[ levelIndex ];
      this.activeLevel = new level( this );
      this.addChild( this.activeLevel );
    }
  } );
} );