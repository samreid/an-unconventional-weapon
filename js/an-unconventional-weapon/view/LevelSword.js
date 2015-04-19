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

  var playedCrinkle = false;
  var inited = false;
  var gravity = new Vector2( 0, 9.8 * 200 );
  var swordReady = false;
  var swingingSword = false;
  var swordAngle = Math.PI / 4;

  var barrierExists = true;

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

    this.words = new PhysicalText( 'words', {
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

    this.ground = new Rectangle( 0, 0, 10000, 50 + 500, {
      fill: 'yellow',
      bottom: DEFAULT_LAYOUT_BOUNDS.bottom + 500
    } );
    this.scene.addChild( this.ground );
    this.scene.addChild( this.playerNode );

    this.barrier = new Rectangle( 0, 0, 2000, 2000, { bottom: this.ground.top, x: 2500, fill: 'red' } );
    this.scene.addChild( this.barrier );

    //this.addInputListener( {
    //  // mousedown or touchstart (pointer pressed down over the node)
    //  down: function( event ) {
    //    if ( !event.pointer.isMouse ) {
    //      count++;
    //      updatePointers();
    //    }
    //  },
    //
    //  // mouseup or touchend (pointer lifted from over the node)
    //  up: function( event ) {
    //    if ( !event.pointer.isMouse ) {
    //      count--;
    //      updatePointers();
    //    }
    //  },
    //
    //  // triggered from mousemove or touchmove (pointer moved over the node from outside)
    //  enter: function( event ) {
    //    count++;
    //    updatePointers();
    //  },
    //
    //  // triggered from mousemove or touchmove (pointer moved outside the node from inside)
    //  exit: function( event ) {
    //    count--;
    //    updatePointers();
    //  },
    //
    //  // platform-specific trigger.
    //  // on iPad Safari, cancel can by triggered by putting 4 pointers down and then dragging with all 4
    //  cancel: function( event ) {
    //    count--;
    //    updatePointers();
    //  },
    //
    //  // mousemove (fired AFTER enter/exit events if applicable)
    //  move: function( event ) {
    //    // do nothing
    //  }
    //} );
    // Touch controls
    //var moveLeftButton = new Rectangle( 0, 0, 100, DEFAULT_LAYOUT_BOUNDS.height, { fill: 'green', opacity: 0.2 } );
    //moveLeftButton.addInputListener( new DownUpListener( {
    //  down: function() {
    //    Input.pressedKeys[ Input.KEY_LEFT_ARROW ] = true;
    //  }, up: function() {
    //    Input.pressedKeys[ Input.KEY_LEFT_ARROW ] = undefined;
    //  }
    //} ) );
    //this.addChild( moveLeftButton );
    //
    //// Touch controls
    //var moveRightButton = new Rectangle( 100, 0, 100, DEFAULT_LAYOUT_BOUNDS.height, { fill: 'green', opacity: 0.2 } );
    //moveRightButton.addInputListener( new DownUpListener( {
    //  down: function() {
    //    Input.pressedKeys[ Input.KEY_RIGHT_ARROW ] = true;
    //  }, up: function() {
    //    Input.pressedKeys[ Input.KEY_RIGHT_ARROW ] = undefined;
    //  }
    //} ) );
    //this.addChild( moveRightButton );
  }

  return inherit( ScreenView, AnUnconventionalWeaponScreenView, {

    // Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {
      if ( !inited ) {
        Input.focusedTrailProperty.value = this.getUniqueTrail();
        inited = true;
      }

      if ( TouchPower.left ) {
        this.playerNode.velocity.x = -300;
      }
      else if ( TouchPower.right ) {
        this.playerNode.velocity.x = +300;
      }
      else {
        this.playerNode.velocity.x = this.playerNode.velocity.x * 0.9;// exponential decay for stopping.
      }

      if ( TouchPower.spacebar && swordReady ) {
        swingingSword = true;
      }

      if ( TouchPower.up && this.playerNode.onGround ) {
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

      if ( this.words.falling && !this.words.doneFalling ) {
        this.words.velocity = this.words.velocity.plus( gravity.timesScalar( dt ) );
        this.words.position = this.words.position.plus( this.words.velocity.timesScalar( dt ) );
        this.words.setTranslation( this.words.position );
        if ( this.words.bottom > this.ground.top + 16 ) {
          this.words.bottom = this.ground.top + 16;
          this.words.falling = false;
          this.words.doneFalling = true;
          SMASH.play();

          this.scene.removeChild( this.words );
          var letters = [ 'w', 'o', 'r', 'd', 's' ];
          this.letterNodes = [];
          for ( var i = 0; i < letters.length; i++ ) {
            var letter = letters[ i ];
            this.letterNodes[ i ] = new PhysicalText( letter, {
              fontSize: this.words.fontSize,
              x: this.words.getTranslation().x + i * 30,
              y: this.words.getTranslation().y
            } );
            this.scene.addChild( this.letterNodes[ i ] );
          }
        }
      }

      if ( this.playerNode.position.x < 0 ) {
        this.playerNode.position.x = 0;
      }
      if ( this.playerNode.position.x > 2310 && barrierExists ) {
        this.playerNode.position.x = 2310;
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

      //linear: function( a1, a2, b1, b2, a3 ) {
      this.ludumDareEntry.opacity = Util.clamp( Util.linear( 20, 200, 1, 0, this.playerNode.position.x ), 0, 1 );
      this.bySamReid.opacity = Util.clamp( Util.linear( 20, 200, 1, 0, this.playerNode.position.x ), 0, 1 );
      this.mayBreakMyBones.opacity = Util.clamp( Util.linear( 600, 800, 0, 1, this.playerNode.position.x ), 0, 1 );
      this.but.opacity = Util.clamp( Util.linear( 600, 800, 0, 1, this.playerNode.position.x ), 0, 1 );
      this.words.opacity = Util.clamp( Util.linear( 600, 800, 0, 1, this.playerNode.position.x ), 0, 1 );
      this.willNeverHurtMe.opacity = Util.clamp( Util.linear( 600, 800, 0, 1, this.playerNode.position.x ), 0, 1 );

      if ( this.playerNode.centerX > this.words.centerX + 20 ) {
        this.words.falling = true;
        if ( !playedCrinkle ) {
          CRINKLE.play();
          playedCrinkle = true;
        }
      }

      if ( this.letterNodes && this.playerNode.centerX < this.letterNodes[ 2 ].centerX ) {
        //animate the letters
        for ( var i = 0; i < this.letterNodes.length - 1; i++ ) {
          this.updateLetterNode( this.letterNodes[ i ], i, dt, swordAngle );
        }

        this.updateLetterNode( this.letterNodes[ this.letterNodes.length - 1 ], -1, dt, swordAngle );
      }
      // Scroll with the player as the player moves to the right
      //if ( this.playerNode.position.y < DEFAULT_LAYOUT_BOUNDS.centerY ) {
      //  this.scene.setTranslation( 0, DEFAULT_LAYOUT_BOUNDS.centerY - this.playerNode.position.y, 0 );
      //}

      // If the player is getting out of the bounds of the scene, translate the scene itself.

      if ( swingingSword ) {
        swordAngle = swordAngle - Math.PI / 32 * 1.5;
        if ( swordAngle < 0 ) {
          swordAngle = Math.PI / 4;
          swingingSword = false;
          swordReady = false;
        }
        //animate the letters
        for ( var i = 0; i < this.letterNodes.length - 1; i++ ) {
          this.updateLetterNode( this.letterNodes[ i ], i, dt, swordAngle );
        }

        this.updateLetterNode( this.letterNodes[ this.letterNodes.length - 1 ], -1, dt, swordAngle );
        if ( this.playerNode.position.x === 2310 ) {
          barrierExists = false;
          this.scene.removeChild( this.barrier );
          SMASH.play();
        }
      }
    },
    updateLetterNode: function( letterNode, i, dt, angle ) {

      var targetX = this.playerNode.position.x + (i + 3) * 37 * Math.cos( angle );
      var targetY = this.playerNode.position.y - (i + 3) * 37 * Math.sin( angle );
      var delta = new Vector2( targetX - letterNode.position.x, targetY - letterNode.position.y );
      if ( delta.magnitude() > 30 ) {
        letterNode.velocity = delta.normalized().times( 400 );
        letterNode.position = letterNode.position.plus( letterNode.velocity.timesScalar( dt ) );
      }
      else {
        letterNode.position.x = targetX;
        letterNode.position.y = targetY;
        swordReady = true;
      }
      letterNode.setTranslation( letterNode.position );
    }
  } );
} );