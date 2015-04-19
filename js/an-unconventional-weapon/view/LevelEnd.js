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
  var Color = require( 'SCENERY/util/Color' );

  var smashSound = require( 'audio!AN_UNCONVENTIONAL_WEAPON/smash' );
  var crinkleSound = require( 'audio!AN_UNCONVENTIONAL_WEAPON/crinkle' );
  var wootSound = require( 'audio!AN_UNCONVENTIONAL_WEAPON/woot' );

  // constants
  var SMASH = new Sound( smashSound );
  var CRINKLE = new Sound( crinkleSound );
  var WOOT = new Sound( wootSound );

  var gravity = new Vector2( 0, 9.8 * 200 );

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
    this.addChild( new Rectangle( -5000, -5000, 10000, 10000, { fill: 'black' } ) );
    this.addChild( this.scene );

    this.ground = new Rectangle( 0, 0, 200000, 50 + 500, {
      fill: 'gray',
      stroke: 'white',
      lineWidth: 2,
      bottom: DEFAULT_LAYOUT_BOUNDS.bottom + 500
    } );
    this.scene.addChild( this.ground );

    this.frontLetterLayer = new Node();
    this.letterLayer = new Node();
    var previousLetter = function() {
      return self.letterLayer.getChildAt( self.letterLayer.getChildrenCount() - 1 );
    };
    var letters = 'abcdefghijklmnopqrstuvwxyz';
    var right = 0;
    for ( var i = 0; i < 400; i++ ) {
      var index = Math.floor( Math.random() * letters.length );
      var letter = new PhysicalText( letters[ index % letters.length ], {
        fontFamily: 'Lucida Console',
        fontSize: 128,
        fill: new Color( 255 - Math.random() * 100, 255 - Math.random() * 100, 255 - Math.random() * 100, 0.2 ),
        bottom: this.ground.top + 20,
        left: right + 10
      } );
      var rand = Math.random() < 0.5;
      if ( rand ) {
        this.letterLayer.addChild( letter );
      }
      else {
        this.frontLetterLayer.addChild( letter );
      }
      right = letter.right;

    }
    this.scene.addChild( this.letterLayer );
    this.scene.addChild( this.playerNode );
    this.scene.addChild( this.frontLetterLayer );

    this.animating = [];
    this.speed = 300;
  }

  return inherit( ScreenView, AnUnconventionalWeaponScreenView, {

    // Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {
      if ( this.speed > 3000 ) {
        this.speed = 3000;
      }
      if ( !inited ) {
        Input.focusedTrailProperty.value = this.getUniqueTrail();
        inited = true;
      }

      if ( Input.pressedKeys[ Input.KEY_LEFT_ARROW ] ) {
        this.playerNode.velocity.x = -this.speed;
      }
      else if ( Input.pressedKeys[ Input.KEY_RIGHT_ARROW ] ) {
        this.playerNode.velocity.x = +this.speed;
      }
      else {
        this.playerNode.velocity.x = this.playerNode.velocity.x * 0.9;// exponential decay for stopping.
      }

      if ( Input.pressedKeys[ Input.KEY_SPACE ] ) {
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
      this.playerNode.setTranslation( this.playerNode.position );

      // Scroll the scene with the player as the player moves to the right
      if ( this.playerNode.position.x > DEFAULT_LAYOUT_BOUNDS.centerX ) {
        this.scene.setTranslation( DEFAULT_LAYOUT_BOUNDS.centerX - this.playerNode.position.x, 0 );
      }

      for ( var i = 0; i < this.frontLetterLayer.getChildrenCount(); i++ ) {
        var letter = this.frontLetterLayer.getChildAt( i );
        if ( (letter.text === 't' ||
              letter.text === 'h' ||
              letter.text === 'e' ||
              letter.text === 'n' ||
              letter.text === 'd') && !letter.animating &&
             letter.bounds.intersectsBounds( this.playerNode.bounds ) ) {
          letter.animating = true;
          if ( letter.text === 'e' && Math.random() < 0.5 ) {
            letter.isRightE = true;
          }
          this.animating.push( letter );
          WOOT.play();
          this.speed = this.speed * 1.15;
        }
      }
      for ( var i = 0; i < this.letterLayer.getChildrenCount(); i++ ) {
        var letter = this.letterLayer.getChildAt( i );
        if ( (letter.text === 't' ||
              letter.text === 'h' ||
              letter.text === 'e' ||
              letter.text === 'n' ||
              letter.text === 'd') && !letter.animating &&
             letter.bounds.intersectsBounds( this.playerNode.bounds ) ) {
          letter.animating = true;
          if ( letter.text === 'e' && Math.random() < 0.5 ) {
            letter.isRightE = true;
          }
          this.animating.push( letter );
          WOOT.play();
          this.speed = this.speed * 1.15;
        }
      }

      var map = { t: -200, h: -120, e: -40, e2: 100, n: 180, d: 260 };
      for ( var i = 0; i < this.animating.length; i++ ) {

        var letter = this.animating[ i ];
        var target = map[ letter.text ];
        if ( letter.text === 'e' && letter.isRightE ) {
          target = map.e2;
        }
        var destination = this.playerNode.center.plusXY( target - 40, -200 );
        var center = letter.center;
        var delta = destination.minus( center );
        letter.center = center.plus( delta.timesScalar( 0.2 ) );
      }
    }
  } );
} );