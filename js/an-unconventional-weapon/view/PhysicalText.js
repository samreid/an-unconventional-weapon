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
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @constructor
   */
  function PhysicalText( text, options ) {
    Text.call( this, text, options );
    this.velocity = new Vector2( 0, 0 );
    this.position = this.getTranslation();
    this.falling = false;
    this.doneFalling = false;
  }

  return inherit( Text, PhysicalText );
} );