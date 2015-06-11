// Copyright 2002-2015, University of Colorado Boulder

/**
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @constructor
   */
  function AnUnconventionalWeaponModel() {

    PropertySet.call( this, {} );
  }

  return inherit( PropertySet, AnUnconventionalWeaponModel );
} );