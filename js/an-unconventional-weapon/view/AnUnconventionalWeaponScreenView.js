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
  var ScreenView = require( 'JOIST/ScreenView' );

  var levels = [ LevelGun, LevelSword ];
  var levelIndex = 0;

  /**
   *
   * @constructor
   */
  function AnUnconventionalWeaponScreenView( model ) {
    ScreenView.call( this );

    var level = levels[ levelIndex ];
    this.activeLevel = new level( this );
    this.addChild( this.activeLevel );
  }

  return inherit( ScreenView, AnUnconventionalWeaponScreenView, {
    step: function( dt ) {
      this.activeLevel.step( dt );
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