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
  var Matrix3 = require( 'DOT/Matrix3' );
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
  var firstSmash = true;
  var lettersTranslating = false;

  var sawReady = false;
  var inited = false;

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

    var sentence = new Node();
    this.scene.addChild( sentence );
    var letters = 'was it a rat i saw';
    for ( var i = 0; i < letters.length; i++ ) {
      var letter = letters[ i ];
      var delta = 48;
      var letterNode = new PhysicalText( letter, {
        fontSize: 64,
        fontFamily: 'Lucida Console',
        x: i * delta,
        y: 0
      } );
      var c = letterNode.centerX;
      letterNode.scale( -1, 1 );
      letterNode.sx = -1;
      letterNode.centerX = c;
      sentence.addChild( letterNode );
    }
    sentence.scale( -1, 1 );
    sentence.centerX = DEFAULT_LAYOUT_BOUNDS.centerX;
    sentence.centerY = DEFAULT_LAYOUT_BOUNDS.centerY;
    sentence.getChildAt( 11 ).translate( -delta, 0 );
    sentence.getChildAt( 11 ).targetX = sentence.getChildAt( 11 ).centerX - delta;
    sentence.getChildAt( 9 ).translate( delta, 0 );
    sentence.getChildAt( 9 ).targetX = sentence.getChildAt( 9 ).centerX + delta;
    sentence.getChildAt( 5 ).translate( -delta, 0 );
    sentence.getChildAt( 5 ).targetX = sentence.getChildAt( 5 ).centerX - delta;

    sentence.sx = -1;
    this.sentence = sentence;

    this.sentence.doneRotating = false;
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

      if ( Input.pressedKeys[ Input.KEY_SPACE ] && sawReady ) {
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

      if ( this.playerNode.bounds.intersectsBounds( this.sentence.bounds ) && !this.sentence.doneRotating ) {
        this.playerNode.velocity.y = Math.abs( this.playerNode.velocity.y );
        this.playerNode.top = this.sentence.bottom + 10;
        SMASH.play();

        if ( firstSmash ) {
          firstSmash = false;
          lettersTranslating = true;
        }
        else {
          var closest = null;
          var closestDist = 100000;
          for ( var i = 0; i < this.sentence.getChildrenCount(); i++ ) {
            var letter = this.sentence.getChildAt( i );
            var dist = letter.globalBounds.center.distance( this.playerNode.globalBounds.center );
            if ( dist < closestDist && letter.text !== ' ' ) {
              closestDist = dist;
              closest = letter;
            }
          }
          closest.bonked = true;
          closest.rotating = true;
        }
      }

      var count = 0;
      for ( var i = 0; i < this.sentence.getChildrenCount(); i++ ) {
        var letter = this.sentence.getChildAt( i );
        if ( letter.bonked ) {
          count++;
        }
      }
      if ( count === 13 ) {
        this.sentence.rotating = true;
      }

      if ( this.sentence.rotating && !this.sentence.doneRotating ) {
        var center = this.sentence.center;
        this.sentence.sx += 0.02;
        if ( this.sentence.sx > 1 ) {
          this.sentence.doneRotating = true;
          this.sentence.sx = 1;
          WOOT.play();

          //launch the rat
          //this.sentence.getChildAt( 9 ).velocity = new Vector2( 200, -200 );
          //this.sentence.getChildAt( 10 ).velocity = new Vector2( 200, -200 );
          //this.sentence.getChildAt( 11 ).velocity = new Vector2( 200, -200 );
        }
        this.sentence.setMatrix( Matrix3.scaling( this.sentence.sx, 1 ) );
        this.sentence.center = center;
      }
      for ( var i = 0; i < this.sentence.getChildrenCount(); i++ ) {
        var letter = this.sentence.getChildAt( i );
        if ( letter.rotating ) {
          var center = letter.center;
          letter.sx += 0.02;
          if ( letter.sx > 1 ) {
            letter.x = 1;
            letter.rotating = false;
            letter.finishedRotating = true;
          }
          letter.setMatrix( Matrix3.scaling( letter.sx, 1 ) );
          letter.center = center;
        }
        if ( lettersTranslating ) {
          if ( letter.targetX ) {

            // TODO: animate toward the target.
            var vectorTowardTarget = letter.targetX - letter.centerX;
            letter.centerX = (letter.centerX + vectorTowardTarget / 14);
          }
        }
      }

      //this.sentence.rotating = true;
      if ( this.sentence.doneRotating ) {

        var r = this.sentence.getChildAt( 9 );
        var a = this.sentence.getChildAt( 10 );
        var t = this.sentence.getChildAt( 11 );
        var rTarget = new Vector2( DEFAULT_LAYOUT_BOUNDS.width - 100 - this.sentence.x + 0, this.ground.top - r.height / 2 - this.sentence.y );
        var aTarget = new Vector2( DEFAULT_LAYOUT_BOUNDS.width - 100 - this.sentence.x + 40, this.ground.top - a.height / 2 - this.sentence.y );
        var tTarget = new Vector2( DEFAULT_LAYOUT_BOUNDS.width - 100 - this.sentence.x + 80, this.ground.top - t.height / 2 - this.sentence.y );

        var rDist = rTarget.minus( r.center );
        r.center = r.center.plus( rDist.timesScalar( 0.04 ) );
        var aDist = aTarget.minus( a.center );
        a.center = a.center.plus( aDist.timesScalar( 0.03 ) );
        var tDist = tTarget.minus( t.center );
        t.center = t.center.plus( tDist.timesScalar( 0.02 ) );
        if ( rDist.magnitude() < 2 ) {
          r.text = 'R';
          r.center = rTarget;
        }
        if ( aDist.magnitude() < 2 ) {
          a.text = 'A';
          a.center = aTarget;
        }
        if ( tDist.magnitude() < 2 ) {
          t.text = 'T';
          t.center = tTarget;
        }

        //this.sentence.getChildAt( 9 ).velocity = this.sentence.getChildAt( 9 ).velocity.plus( gravity.timesScalar( dt ) );
        //this.sentence.getChildAt( 10 ).velocity = this.sentence.getChildAt( 10 ).velocity.plus( gravity.timesScalar( dt ) );
        //this.sentence.getChildAt( 11 ).velocity = this.sentence.getChildAt( 11 ).velocity.plus( gravity.timesScalar( dt ) );
        //
        //this.sentence.getChildAt( 9 ).position = this.sentence.getChildAt( 9 ).position.plus( this.sentence.getChildAt( 9 ).velocity.timesScalar( dt ) );
        //this.sentence.getChildAt( 10 ).position = this.sentence.getChildAt( 10 ).position.plus( this.sentence.getChildAt( 10 ).velocity.timesScalar( dt ) );
        //this.sentence.getChildAt( 11 ).position = this.sentence.getChildAt( 11 ).position.plus( this.sentence.getChildAt( 11 ).velocity.timesScalar( dt ) );
        //
        //this.sentence.getChildAt( 9 ).center = this.sentence.getChildAt( 9 ).position;
      }

      if ( Math.abs( vectorTowardTarget ) < 0.001 ) {
        lettersTranslating = false;
      }

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