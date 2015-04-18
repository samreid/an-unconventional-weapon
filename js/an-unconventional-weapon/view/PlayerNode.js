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
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @constructor
   */
  function PlayerNode() {
    Node.call( this );
    this.addChild( new Circle( 30, { fill: 'blue', y: -30 } ) );
    this.velocity = new Vector2( 0, 0 );
    this.position = new Vector2( 20, 100 );
    this.onGround = false;
  }

  return inherit( Node, PlayerNode );
} );