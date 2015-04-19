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

  /**
   * @param {AnUnconventionalWeaponModel} anUnconventionalWeaponModel
   * @constructor
   */
  function AnUnconventionalWeaponScreenView( context ) {
    this.context = context;

    ScreenView.call( this );

    var self = this;
    this.playerNode = new PlayerNode();
    this.scene = new Node();
    this.addChild( this.scene );

    this.scene.addChild( this.playerNode );

    this.platforms = new Node();
    this.scene.addChild( this.platforms );

    var previousPlatform = function( i ) {
      if ( i === undefined ) {
        i = 0;
      }
      return self.platforms.getChildAt( self.platforms.getChildrenCount() - 1 - i );
    };
    this.platforms.addChild( new Rectangle( 0, 0, 500, 550, {
      fill: 'yellow',
      bottom: DEFAULT_LAYOUT_BOUNDS.bottom + 500,
      stroke: 'black'
    } ) );

    this.platforms.addChild( new Rectangle( 600, 400, 500, 100, {
      fill: 'orange',
      stroke: 'black'
    } ) );

    this.platforms.addChild( new Rectangle( previousPlatform().right, previousPlatform().top - 200, 500, 100, {
      fill: 'green',
      stroke: 'black'
    } ) );

    this.platforms.addChild( new Rectangle( previousPlatform().right, previousPlatform().top - 200, 500, 100, {
      fill: 'black',
      stroke: 'blue'
    } ) );

    this.platforms.addChild( new Rectangle( previousPlatform().right, previousPlatform().top + 200, 500, 100, {
      fill: 'black',
      stroke: 'blue'
    } ) );
  }

  return inherit( ScreenView, AnUnconventionalWeaponScreenView, {

    // Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {

      if ( Input.pressedKeys[ Input.KEY_LEFT_ARROW ] ) {
        this.playerNode.velocity.x = -300;
      }
      else if ( Input.pressedKeys[ Input.KEY_RIGHT_ARROW ] ) {
        this.playerNode.velocity.x = +300;
      }
      else {
        this.playerNode.velocity.x = this.playerNode.velocity.x * 0.9;// exponential decay for stopping.
      }

      if ( Input.pressedKeys[ Input.KEY_SPACE ] ) {
        //swingingSword = true;
      }

      if ( Input.pressedKeys[ Input.KEY_UP_ARROW ] && this.playerNode.onGround ) {
        this.playerNode.velocity.y = -1000;
        // Prevent detecting collision right away
        this.playerNode.translate( 0, -1 );
        if ( this.playerNode.onGround ) {
          WOOT.play();
        }
        this.playerNode.onGround = false;
      }

      // Handle view animation here.
      this.playerNode.velocity = this.playerNode.velocity.plus( gravity.timesScalar( dt ) );
      this.playerNode.position = this.playerNode.position.plus( this.playerNode.velocity.timesScalar( dt ) );

      //Don't let the player pass through a platform
      for ( var i = 0; i < this.platforms.getChildrenCount(); i++ ) {
        var platform = this.platforms.getChildAt( i );
        if ( platform.bounds.intersectsBounds( this.playerNode.bounds ) ) {
          this.playerNode.position.y = platform.top;
          this.playerNode.velocity.y = 0;
          if ( !this.playerNode.onGround ) {
            SMASH.play();
          }
          this.playerNode.onGround = true;
        }
      }

      // Player died
      if ( this.playerNode.position.y > 2000 ) {
        this.context.restartLevel();
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

      var tx = 0;
      // Scroll the scene with the player as the player moves to the right
      if ( this.playerNode.position.x > DEFAULT_LAYOUT_BOUNDS.centerX ) {
        tx = DEFAULT_LAYOUT_BOUNDS.centerX - this.playerNode.position.x;
      }

      var ty = 0;
      if ( this.playerNode.position.y < DEFAULT_LAYOUT_BOUNDS.centerY ) {
        ty = DEFAULT_LAYOUT_BOUNDS.centerY - this.playerNode.position.y;
      }

      this.scene.setTranslation( tx, ty );
    }
  } );
} );