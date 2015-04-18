// Copyright 2002-2015, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var AnUnconventionalWeaponScreen = require( 'AN_UNCONVENTIONAL_WEAPON/an-unconventional-weapon/AnUnconventionalWeaponScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var simTitle = require( 'string!AN_UNCONVENTIONAL_WEAPON/an-unconventional-weapon.name' );

  var simOptions = {
    credits: {
      //TODO fill in proper credits, all of these fields are optional, see joist.AboutDialog
      leadDesign: 'Sam Reid',
      softwareDevelopment: 'Sam Reid',
      team: 'Sam Reid',
      qualityAssurance: 'Sam Reid',
      graphicArts: 'Sam Reid',
      thanks: 'Sam Reid'
    }
  };

  // Appending '?dev' to the URL will enable developer-only features.
  if ( phet.chipper.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
    }, simOptions );
  }

  SimLauncher.launch( function() {
    var sim = new Sim( simTitle, [ new AnUnconventionalWeaponScreen() ], simOptions );
    sim.start();
    sim.navigationBar.visible = false;
  } );
} );