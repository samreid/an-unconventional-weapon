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
  var PhysicalText = require( 'AN_UNCONVENTIONAL_WEAPON/an-unconventional-weapon/view/PhysicalText' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var DEFAULT_LAYOUT_BOUNDS = new Bounds2( 0, 0, 1024, 618 );
  var Input = require( 'SCENERY/input/Input' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Vector2 = require( 'DOT/Vector2' );
  var Util = require( 'DOT/Util' );
  var DownUpListener = require( 'SCENERY/input/DownUpListener' );
  var Sound = require( 'VIBE/Sound' );

  var smashSound = require( 'audio!AN_UNCONVENTIONAL_WEAPON/smash' );
  var crinkleSound = require( 'audio!AN_UNCONVENTIONAL_WEAPON/crinkle' );
  var wootSound = require( 'audio!AN_UNCONVENTIONAL_WEAPON/woot' );

  // constants
  var SMASH = new Sound( smashSound );
  var CRINKLE = new Sound( crinkleSound );
  var WOOT = new Sound( wootSound );

  var gravity = new Vector2( 0, 9.8 * 200 );

  var inited = false;
  var fallingLetters = [];

  var startTime = Date.now();
  var lastLetterTime = Date.now();

  /**
   * @param {AnUnconventionalWeaponModel} anUnconventionalWeaponModel
   * @constructor
   */
  function AnUnconventionalWeaponScreenView( parent ) {
    this.parent = parent;

    ScreenView.call( this );

    var self = this;
    this.playerNode = new PlayerNode();
    this.scene = new Node();
    this.addChild( this.scene );

    this.ground = new Rectangle( 0, 0, 10000, 50 + 500, {
      fill: 'yellow',
      bottom: DEFAULT_LAYOUT_BOUNDS.bottom + 500
    } );
    this.scene.addChild( this.ground );
    this.scene.addChild( this.playerNode );

    this.barrier = new Rectangle( 0, 0, 2000, 2000, { bottom: this.ground.top, x: 2500, fill: 'red' } );
    this.scene.addChild( this.barrier );

    for ( var i = 0; i < 1; i++ ) {
      this.addLetter();
      lastLetterTime = Date.now();
    }
    startTime = Date.now();
  }

  return inherit( ScreenView, AnUnconventionalWeaponScreenView, {

    addLetter: function() {
      var letters = [ 'G', 'U', 'N' ];
      for ( var k = 0; k < letters.length; k++ ) {
        var letter = letters[ k ];
        var physicalText = new PhysicalText( letter, {
          centerX: Math.random() * 1000 - 500 + this.playerNode.x,
          centerY: Math.random() * 3000 - 4000,
          fontSize: 60
        } );
        this.scene.addChild( physicalText );
        fallingLetters.push( physicalText );
      }
      lastLetterTime = Date.now();
    },
    // Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {
      if ( !inited ) {
        Input.focusedTrailProperty.value = this.getUniqueTrail();
        inited = true;
      }
      if ( Date.now() - lastLetterTime > 3000 ) {
        this.addLetter();
      }
      for ( var i = 0; i < fallingLetters.length; i++ ) {
        var fallingLetter = fallingLetters[ i ];
        fallingLetter.velocity.y = fallingLetter.velocity.y + gravity.y * dt / 2;
        fallingLetter.position.x += fallingLetter.velocity.x * dt;
        fallingLetter.position.y += fallingLetter.velocity.y * dt;

        if ( fallingLetter.position.y > DEFAULT_LAYOUT_BOUNDS.bottom - 50 ) {
          fallingLetter.position.y = DEFAULT_LAYOUT_BOUNDS.bottom - 50;

          //if ( !this.playerNode.onGround ) {
          //  SMASH.play();
          //}
          //this.playerNode.onGround = true;
        }
        fallingLetter.setTranslation( fallingLetter.position.x, fallingLetter.position.y );

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

      if ( Input.pressedKeys[ Input.KEY_SPACE ] && swordReady ) {
        //swingingSword = true;
      }

      if ( Input.pressedKeys[ Input.KEY_UP_ARROW ] && this.playerNode.onGround ) {
        this.playerNode.velocity.y = -1000;
        if ( this.playerNode.onGround ) {
          WOOT.play();
        }
        this.playerNode.onGround = false;
      }

      // Handle view animation here.
      this.playerNode.velocity = this.playerNode.velocity.plus( gravity.timesScalar( dt ) );
      this.playerNode.position = this.playerNode.position.plus( this.playerNode.velocity.timesScalar( dt ) );
      if ( this.playerNode.position.y > DEFAULT_LAYOUT_BOUNDS.bottom - 50 ) {
        this.playerNode.position.y = DEFAULT_LAYOUT_BOUNDS.bottom - 50;

        if ( !this.playerNode.onGround ) {
          SMASH.play();
        }
        this.playerNode.onGround = true;
      }

      if ( this.playerNode.position.x < 0 ) {
        this.playerNode.position.x = 0;
      }
      if ( this.playerNode.position.x > 2900 ) {
        //new Level
        //linear: function( a1, a2, b1, b2, a3 ) {
        //this.ludumDareEntry.opacity = Util.clamp( Util.linear( 20, 200, 1, 0, this.playerNode.position.x ), 0, 1 );
        this.scene.opacity = Util.clamp( Util.linear( 2900, 3000, 1, 0, this.playerNode.position.x ), 0, 1 );
        if ( this.playerNode.position.x > 3000 ) {
          this.parent.levelComplete();
        }
      }
      this.playerNode.setTranslation( this.playerNode.position );

      // Scroll the scene with the player as the player moves to the right
      if ( this.playerNode.position.x > DEFAULT_LAYOUT_BOUNDS.centerX && this.playerNode.position.x < 2300 ) {
        this.scene.setTranslation( DEFAULT_LAYOUT_BOUNDS.centerX - this.playerNode.position.x, 0 );
      }
    }
  } );
} );