// Copyright 2002-2015, University of Colorado Boulder

/**
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var AnUnconventionalWeaponModel = require( 'AN_UNCONVENTIONAL_WEAPON/an-unconventional-weapon/model/AnUnconventionalWeaponModel' );
  var AnUnconventionalWeaponScreenView = require( 'AN_UNCONVENTIONAL_WEAPON/an-unconventional-weapon/view/AnUnconventionalWeaponScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var anUnconventionalWeaponSimString = require( 'string!AN_UNCONVENTIONAL_WEAPON/an-unconventional-weapon.name' );

  /**
   * @constructor
   */
  function AnUnconventionalWeaponScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = null;

    Screen.call( this, anUnconventionalWeaponSimString, icon,
      function() { return new AnUnconventionalWeaponModel(); },
      function( model ) { return new AnUnconventionalWeaponScreenView( model ); },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, AnUnconventionalWeaponScreen );
} );