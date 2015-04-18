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
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   *
   * @constructor
   */
  function PlayerNode() {
    Node.call( this );
    this.addChild( new Circle( 10, { fill: 'blue' } ) );
  }

  return inherit( Node, PlayerNode );
} );