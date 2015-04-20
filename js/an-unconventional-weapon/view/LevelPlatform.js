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
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var StarNode = require( 'SCENERY_PHET/StarNode' );
  var StarShape = require( 'SCENERY_PHET/StarShape' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Path = require( 'SCENERY/nodes/Path' );

  var smashSound = require( 'audio!AN_UNCONVENTIONAL_WEAPON/smash' );
  var crinkleSound = require( 'audio!AN_UNCONVENTIONAL_WEAPON/crinkle' );
  var wootSound = require( 'audio!AN_UNCONVENTIONAL_WEAPON/woot' );
  var popSound = require( 'audio!AN_UNCONVENTIONAL_WEAPON/pop' );

  // constants
  var SMASH = new Sound( smashSound );
  var CRINKLE = new Sound( crinkleSound );
  var WOOT = new Sound( wootSound );
  var POP = new Sound( popSound );

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

    this.platforms = new Node();
    this.collectedStars = [];

    var previousPlatform = function( i ) {
      if ( i === undefined ) {
        i = 0;
      }
      return self.platforms.getChildAt( self.platforms.getChildrenCount() - 1 - i );
    };
    this.platforms.addChild( new Rectangle( 0, 0, 500, 550, {
      fill: 'orange',
      bottom: DEFAULT_LAYOUT_BOUNDS.bottom + 500,
      stroke: 'black',
      lineWidth: 2
    } ) );

    this.platforms.addChild( new Rectangle( 600, 400, 500, 100, {
      fill: 'yellow',
      stroke: 'black',
      lineWidth: 2
    } ) );

    this.platforms.addChild( new Rectangle( previousPlatform().right, previousPlatform().top - 200, 500, 100, {
      fill: 'green',
      stroke: 'black',
      lineWidth: 2
    } ) );

    this.platforms.addChild( new Rectangle( previousPlatform().right, previousPlatform().top - 200, 500, 100, {
      fill: 'blue',
      stroke: 'black',
      lineWidth: 2
    } ) );

    var blackPlatform = new Rectangle( previousPlatform().right, previousPlatform().top + 200, 500, 100, {
      fill: 'violet',
      stroke: 'black',
      lineWidth: 2
    } );
    this.platforms.addChild( blackPlatform );

    this.springBoots = this.newSpringBoots();
    this.springBoots.centerBottom = previousPlatform( 1 ).centerTop;
    this.scene.addChild( this.springBoots );
    this.acquiredSpringBoots = false;

    for ( var i = 0; i < 5; i++ ) {
      this.platforms.addChild( new Rectangle( 0, 0, 1000 - i * 20, 100 - i * 2, {
        fill: 'black',
        centerX: Math.abs( Math.random() < 0.3 ? previousPlatform( 0 ).left - 100 : previousPlatform( 0 ).right + 100 ),
        bottom: previousPlatform( 0 ).top - 800
      } ) );
    }
    var gradient = new Rectangle( 0, 0, 8000, 1000 + 2000, {
      bottom: previousPlatform().top + 2000,
      fill: new LinearGradient( 0, 0, 0, 3000 ).addColorStop( 0, 'black' ).addColorStop( 1, 'white' )
    } );
    this.scene.addChild( gradient );

    gradient.moveToBack();

    //with stars
    var space = new Rectangle( 0, 0, 8000, 2000, {
      fill: 'black',
      centerBottom: gradient.centerTop.plusXY( 0, 2 )
    } );
    this.scene.addChild( space );
    var aboveSpace = new Rectangle( 0, 0, 8000, 8000, {
      fill: 'black',
      centerBottom: space.centerTop.plusXY( 0, 2 )
    } );
    this.scene.addChild( aboveSpace );

    for ( var i = 0; i < 5; i++ ) {
      this.platforms.addChild( new Rectangle( 0, 0, 1000 - i * 20, 100 - i * 2, {
        fill: 'gray',
        centerX: Math.abs( Math.random() < 0.3 ? previousPlatform( 0 ).left - 100 : previousPlatform( 0 ).right + 100 ),
        bottom: previousPlatform( 0 ).top - 800
      } ) );
    }

    var stars = [];
    for ( var i = 0; i < 150; i++ ) {
      var star = new Path( new StarShape(), {
        x: Math.random() * (space.width) + space.left,
        y: Math.random() * (space.height + 500) + space.top,
        fill: '#fcff03',
        lineJoin: 'round'
      } );
      stars.push( star );
    }
    this.scene.addChild( this.platforms );
    this.starLayer = new Node( { children: stars } );
    this.scene.addChild( this.starLayer );

    this.scene.addChild( this.playerNode );

    var randomWords = [ 'DOGS', 'CATS', 'BEES', 'BANANAS', 'MONKEYS', 'BIRDS', 'METEORS', 'HULA HOOPS', 'GAZEBOS',
      'PIRATES', 'ASTEROIDS', 'ELECTRONS', 'PHOTONS', 'RED SQUARES', 'BAD GUYS', 'AN UNCONVENTIONAL WEAPON', 'CURVED YELLOW FRUIT' ];

    function randomWord() {
      var index = Math.floor( Math.random() * randomWords.length );
      if ( index > randomWords.length - 1 ) {
        index = randomWord.length - 1;
      }
      if ( index < 0 ) {
        index = 0;
      }
      return randomWords[ index ];
    }

    this.fallingSquares = new Node();
    for ( var i = 0; i < 50; i++ ) {
      var fallingSquare = new Node( {
        x: Math.random() * 8000,
        y: -8000 + Math.random() * 4000,
        children: [
          new Text( randomWord(), {
            fontFamily: 'Lucida Console',
            fontSize: 40 + Math.random() * 40,
            fill: 'red',
            rotation: Math.PI / 2 + Math.PI
          } )
        ]
      } );
      fallingSquare.speed = Math.random() * 200 + 100;
      this.fallingSquares.addChild( fallingSquare );
    }
    var accumulated = 0;
    for ( var i = 0; i < 120; i++ ) {
      var dim = 50 + Math.random() * 50;
      accumulated = accumulated + dim;

      var fallingSquare = new Node( {
        x: 8000 + Math.random() * 200 - dim / 2,
        y: -accumulated,
        children: [ new Text( randomWord(), {
          fontFamily: 'Lucida Console',
          fontSize: 40 + Math.random() * 40,
          fill: 'red',
          rotation: Math.PI / 2 + Math.PI
        } ) ]
      } );
      fallingSquare.speed = Math.random() * 100 + 300;
      this.fallingSquares.addChild( fallingSquare );
    }
    this.damageCount = 0;
    this.scene.addChild( this.fallingSquares );

    this.platforms.addChild( new Rectangle( blackPlatform.right, blackPlatform.top + 200, 500, 100, {
      fill: 'black',
      stroke: 'black',
      lineWidth: 2
    } ) );
    this.platforms.addChild( new Rectangle( previousPlatform().right, previousPlatform().top + 200, 500, 100, {
      fill: 'red',
      stroke: 'black',
      lineWidth: 2
    } ) );
    this.platforms.addChild( new Rectangle( previousPlatform().right, previousPlatform().top, 500, 100, {
      fill: 'red',
      stroke: 'black',
      lineWidth: 2
    } ) );
    this.platforms.addChild( new Rectangle( previousPlatform().right, previousPlatform().top, 500, 100, {
      fill: 'red',
      stroke: 'black',
      lineWidth: 2
    } ) );
    this.platforms.addChild( new Rectangle( previousPlatform().right, previousPlatform().top, 500, 100, {
      fill: 'red',
      stroke: 'black',
      lineWidth: 2
    } ) );
    this.platforms.addChild( new Rectangle( previousPlatform().right, previousPlatform().top, 500, 100, {
      fill: 'red',
      stroke: 'black',
      lineWidth: 2
    } ) );
    this.platforms.addChild( new Rectangle( previousPlatform().right, previousPlatform().top, 500, 100, {
      fill: 'red',
      stroke: 'black',
      lineWidth: 2
    } ) );
    this.platforms.addChild( new Rectangle( previousPlatform().right, previousPlatform().top, 500, 100, {
      fill: 'red',
      stroke: 'black',
      lineWidth: 2
    } ) );
    this.platforms.addChild( new Rectangle( previousPlatform().right, previousPlatform().top, 500, 100, {
      fill: 'red',
      stroke: 'black',
      lineWidth: 2
    } ) );
    this.platforms.addChild( new Rectangle( previousPlatform().right, previousPlatform().top, 500, 100, {
      fill: 'red',
      stroke: 'black',
      lineWidth: 2
    } ) );
    this.platforms.addChild( new Rectangle( previousPlatform().right, previousPlatform().top, 8000, 100, {
      fill: 'red',
      stroke: 'black'
    } ) );

    this.scene.addChild( new Text( 'Level 4', {
      fontSize: 60,
      centerX: DEFAULT_LAYOUT_BOUNDS.centerX,
      centerY: 100
    } ) );
  }

  return inherit( ScreenView, AnUnconventionalWeaponScreenView, {
    newSpringBoots: function() {
      var springboots = new Node( {
        children: [
          new Text( 'Jumpy', {
            fontSize: 22,
            fill: 'blue',
            rotation: 3 * Math.PI / 2,
            fontFamily: 'Lucida Console',
            x: -11
          } ),
          new Text( 'Boots', {
            fontSize: 22,
            fill: 'blue',
            rotation: 3 * Math.PI / 2,
            fontFamily: 'Lucida Console',
            x: 11
          } )
        ]
      } );
      return springboots;
    },

    // Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {

      var speed = this.acquiredSpringBoots ? 500 : 300;
      if ( Input.pressedKeys[ Input.KEY_LEFT_ARROW ] ) {
        this.playerNode.velocity.x = -speed;
      }
      else if ( Input.pressedKeys[ Input.KEY_RIGHT_ARROW ] ) {
        this.playerNode.velocity.x = +speed;
      }
      else {
        this.playerNode.velocity.x = this.playerNode.velocity.x * 0.9;// exponential decay for stopping.
      }

      if ( Input.pressedKeys[ Input.KEY_SPACE ] ) {
        //swingingSword = true;
      }

      if ( Input.pressedKeys[ Input.KEY_UP_ARROW ] && this.playerNode.onGround ) {
        var v = -1000;
        if ( this.acquiredSpringBoots ) {
          v = -2000;
        }

        this.playerNode.velocity.y = v;
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
          this.playerNode.bottom = platform.top;
          this.playerNode.position.y = this.playerNode.y;
          this.playerNode.velocity.y = 0;
          if ( !this.playerNode.onGround ) {
            SMASH.play();
          }
          this.playerNode.onGround = true;
        }
      }

      if ( !this.acquiredSpringBoots && this.playerNode.bounds.intersectsBounds( this.springBoots.bounds ) ) {
        this.acquiredSpringBoots = true;
        var b = this.newSpringBoots();
        b.translate( 0, 70 );
        this.playerNode.addChild( b );
        this.scene.removeChild( this.springBoots );
      }

      for ( var i = 0; i < this.starLayer.getChildrenCount(); i++ ) {
        var star = this.starLayer.getChildAt( i );
        if ( !star.isCollected ) {
          if ( star.bounds.intersectsBounds( this.playerNode.bounds ) ) {
            star.isCollected = true;
            star.stroke = 'black';
            star.lineWidth = 2;
            WOOT.play();
            this.collectedStars.push( star );
          }
        }
      }

      var collectedCount = 0;
      for ( var i = 0; i < this.starLayer.getChildrenCount(); i++ ) {
        var star = this.starLayer.getChildAt( i );
        if ( star.isCollected ) {
          collectedCount++;
          var center = star.center;
          var target = this.playerNode.center.plus( Vector2.createPolar( 200 + collectedCount * 1.5, collectedCount * Math.PI / 8 + Date.now() / 1000 * Math.PI / 2 ) );
          star.rotate( Math.PI * dt );
          var delta = target.minus( center );
          var dx = delta.timesScalar( 0.2 );
          var newPosition = center.plus( dx );
          star.center = newPosition;
        }
      }

      // Player died
      if ( this.playerNode.position.y > 2000 ) {
        this.context.restartLevel();
      }

      if ( this.playerNode.position.x < 0 ) {
        this.playerNode.position.x = 0;
      }
      this.playerNode.setTranslation( this.playerNode.position );


      var tx = 0;
      // Scroll the scene with the player as the player moves to the right
      if ( this.playerNode.position.x > DEFAULT_LAYOUT_BOUNDS.centerX ) {
        tx = DEFAULT_LAYOUT_BOUNDS.centerX - this.playerNode.position.x;
      }

      if ( this.playerNode.position.x > 8500 ) {
        this.scene.opacity = Util.clamp( Util.linear( 8500, 9500, 1, 0, this.playerNode.position.x ), 0, 1 );
      }

      if ( this.playerNode.position.x > 9600 ) {
        this.context.levelComplete();
      }

      var ty = 0;
      if ( this.playerNode.position.y < DEFAULT_LAYOUT_BOUNDS.centerY ) {
        ty = DEFAULT_LAYOUT_BOUNDS.centerY - this.playerNode.position.y;
      }

      //linear: function( a1, a2, b1, b2, a3 ) {
      var scaling = Util.linear( 0, -5000, 1, 0.3, this.playerNode.position.y );
      scaling = Util.clamp( scaling, 0.5, 1 );
      this.scene.setMatrix( Matrix3.scaling( scaling, scaling ) );
      this.scene.setTranslation( tx * scaling, ty * scaling );

      var toRemove = [];
      var playerBounds = this.playerNode.bounds;
      for ( var i = 0; i < this.fallingSquares.getChildrenCount(); i++ ) {
        var fallingSquare = this.fallingSquares.getChildAt( i );
        fallingSquare.translate( 0, fallingSquare.speed * dt );
        if ( playerBounds.intersectsBounds( fallingSquare.bounds ) ) {
          CRINKLE.play();

          toRemove.push( fallingSquare );
          this.playerNode.circleGraphic.addChild( new Text( 'x', {
            fill: 'red',
            fontFamily: 'Lucida Console',
            fontSize: 32,
            centerX: Math.random() * 30 - 15,
            centerY: Math.random() * 30 - 15
          } ) );
          this.damageCount++;
          break;
        }
        if ( fallingSquare.top > DEFAULT_LAYOUT_BOUNDS.bottom + 500 ) {
          fallingSquare.top = -8000 + Math.random() * 4000;
        }

        for ( var j = 0; j < this.collectedStars.length; j++ ) {
          var star = this.collectedStars[ j ];
          if ( star.bounds.intersectsBounds( fallingSquare.bounds ) ) {
            if ( toRemove.indexOf( fallingSquare ) >= 0 ) {}
            else {
              toRemove.push( fallingSquare );
            }
          }
        }
      }
      for ( var i = 0; i < toRemove.length; i++ ) {
        var toR = toRemove[ i ];
        this.fallingSquares.removeChild( toR );
      }
      if ( toRemove.length > 0 ) {
        POP.play();
      }

      if ( this.damageCount >= 5 ) {
        // TODO: Comment back in after testing
        this.context.restartLevel();
      }
    }
  } );
} );