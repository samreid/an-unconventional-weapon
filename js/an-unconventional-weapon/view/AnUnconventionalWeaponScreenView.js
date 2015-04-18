// Copyright 2002-2015, University of Colorado Boulder

/**
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var PlayerNode = require( 'AN_UNCONVENTIONAL_WEAPON/an-unconventional-weapon/view/PlayerNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var DEFAULT_LAYOUT_BOUNDS = new Bounds2( 0, 0, 1024, 618 );
  var Input = require( 'SCENERY/input/Input' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Vector2 = require( 'DOT/Vector2' );
  var Util = require( 'DOT/Util' );

  var inited = false;
  var gravity = new Vector2( 0, 9.8 * 200 );

  /**
   * @param {AnUnconventionalWeaponModel} anUnconventionalWeaponModel
   * @constructor
   */
  function AnUnconventionalWeaponScreenView( anUnconventionalWeaponModel ) {

    ScreenView.call( this );

    var self = this;
    this.playerNode = new PlayerNode();
    this.scene = new Node();
    this.addChild( this.scene );
    this.sticksAndStones = new Text( 'Sticks and Stones', {
      fontSize: 60,
      centerX: DEFAULT_LAYOUT_BOUNDS.centerX,
      centerY: 100
    } );
    this.scene.addChild( this.sticksAndStones );
    this.ludumDareEntry = new Text( 'a Ludum Dare 32 Entry', {
      fontSize: 30,
      left: this.sticksAndStones.left,
      top: this.sticksAndStones.bottom + 10
    } );
    this.scene.addChild( this.ludumDareEntry );
    this.bySamReid = new Text( 'by Sam Reid', {
      fontSize: 30,
      left: this.sticksAndStones.left,
      top: this.ludumDareEntry.bottom + 10
    } );
    this.scene.addChild( this.bySamReid );

    this.mayBreakMyBones = new Text( 'may break my bones', {
      fontSize: 60,
      left: this.sticksAndStones.right + 20,
      top: this.sticksAndStones.bottom,
      opacity: 0
    } );
    this.scene.addChild( this.mayBreakMyBones );

    this.but = new Text( 'but', {
      fontSize: 60,
      left: this.mayBreakMyBones.right + 20,
      top: this.mayBreakMyBones.bottom,
      opacity: 0
    } );
    this.scene.addChild( this.but );

    this.words = new Text( 'words', {
      fontSize: 60,
      left: this.but.right + 20,
      bottom: this.but.bottom,
      opacity: 0
    } );
    this.scene.addChild( this.words );

    this.willNeverHurtMe = new Text( 'will never hurt me', {
      fontSize: 60,
      left: this.words.right + 20,
      bottom: this.words.bottom,
      opacity: 0
    } );
    this.scene.addChild( this.willNeverHurtMe );

    this.ground = new Rectangle( 0, 0, 10000, 50, { fill: 'yellow', bottom: DEFAULT_LAYOUT_BOUNDS.bottom } );
    this.scene.addChild( this.ground );
    this.scene.addChild( this.playerNode );
  }

  return inherit( ScreenView, AnUnconventionalWeaponScreenView, {

    // Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {
      if ( !inited ) {
        Input.focusedTrailProperty.value = this.getUniqueTrail();
        inited = true;
      }

      if ( Input.pressedKeys[ Input.KEY_LEFT_ARROW ] ) {
        this.playerNode.velocity.x = -300;
      }
      else if ( Input.pressedKeys[ Input.KEY_RIGHT_ARROW ] ) {
        this.playerNode.velocity.x = +300;
      }
      else {
        this.playerNode.velocity.x = this.playerNode.velocity.x * 0.9;// exponential decay for stopping.
      }

      if ( Input.pressedKeys[ Input.KEY_UP_ARROW ] && this.playerNode.onGround ) {
        this.playerNode.velocity.y = -1000;
        this.playerNode.onGround = false;
      }

      // Handle view animation here.
      this.playerNode.velocity = this.playerNode.velocity.plus( gravity.timesScalar( dt ) );
      this.playerNode.position = this.playerNode.position.plus( this.playerNode.velocity.timesScalar( dt ) );
      if ( this.playerNode.position.y > DEFAULT_LAYOUT_BOUNDS.bottom - 50 ) {
        this.playerNode.position.y = DEFAULT_LAYOUT_BOUNDS.bottom - 50;
        this.playerNode.onGround = true;
      }

      if ( this.words.falling ) {
        this.words.translate( 0, 5 );
        if ( this.words.bottom > this.ground.top + 16 ) {
          this.words.bottom = this.ground.top + 16;
        }
      }

      if ( this.playerNode.position.x < 0 ) {
        this.playerNode.position.x = 0;
      }
      this.playerNode.setTranslation( this.playerNode.position );

      // Scroll with the player as the player moves to the right
      if ( this.playerNode.position.x > DEFAULT_LAYOUT_BOUNDS.centerX ) {
        this.scene.setTranslation( DEFAULT_LAYOUT_BOUNDS.centerX - this.playerNode.position.x, 0 );
      }

      //linear: function( a1, a2, b1, b2, a3 ) {
      this.ludumDareEntry.opacity = Util.clamp( Util.linear( 20, 200, 1, 0, this.playerNode.position.x ), 0, 1 );
      this.bySamReid.opacity = Util.clamp( Util.linear( 20, 200, 1, 0, this.playerNode.position.x ), 0, 1 );
      this.mayBreakMyBones.opacity = Util.clamp( Util.linear( 600, 800, 0, 1, this.playerNode.position.x ), 0, 1 );
      this.but.opacity = Util.clamp( Util.linear( 600, 800, 0, 1, this.playerNode.position.x ), 0, 1 );
      this.words.opacity = Util.clamp( Util.linear( 600, 800, 0, 1, this.playerNode.position.x ), 0, 1 );
      this.willNeverHurtMe.opacity = Util.clamp( Util.linear( 600, 800, 0, 1, this.playerNode.position.x ), 0, 1 );

      if ( this.playerNode.centerX > this.words.centerX ) {
        this.words.falling = true;
      }
      // Scroll with the player as the player moves to the right
      //if ( this.playerNode.position.y < DEFAULT_LAYOUT_BOUNDS.centerY ) {
      //  this.scene.setTranslation( 0, DEFAULT_LAYOUT_BOUNDS.centerY - this.playerNode.position.y, 0 );
      //}

      // If the player is getting out of the bounds of the scene, translate the scene itself.
    }
  } );
} );