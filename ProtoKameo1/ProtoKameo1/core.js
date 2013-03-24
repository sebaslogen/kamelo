

Array.prototype.erase = function (item) {
	for (var i = this.length; i--; i) {
		if (this[i] === item) this.splice(i, 1);
	}

	return this;
};

Function.prototype.bind = function (bind) {
	var self = this;
	return function () {
		var args = Array.prototype.slice.call(arguments);
		return self.apply(bind || null, args);
	};
};

merge = function (original, extended) {
	for (var key in extended) {
		var ext = extended[key];
		if (typeof (ext) != 'object' || ext instanceof Class) {
			original[key] = ext;
		} else {
			if (!original[key] || typeof (original[key]) != 'object') {
				original[key] = {};
			}
			merge(original[key], ext);
		}
	}
	return original;
};

function copy(object) {
	if (!object || typeof (object) != 'object' || object instanceof Class) {
		return object;
	} else if (object instanceof Array) {
		var c = [];
		for (var i = 0, l = object.length; i < l; i++) {
			c[i] = copy(object[i]);
		}
		return c;
	} else {
		var c = {};
		for (var i in object) {
			c[i] = copy(object[i]);
		}
		return c;
	}
}

function ksort(obj) {
	if (!obj || typeof (obj) != 'object') {
		return [];
	}

	var keys = [],
		values = [];
	for (var i in obj) {
		keys.push(i);
	}

	keys.sort();
	for (var i = 0; i < keys.length; i++) {
		values.push(obj[keys[i]]);
	}

	return values;
}

// -----------------------------------------------------------------------------
// Class object based on John Resigs code; inspired by base2 and Prototype
// http://ejohn.org/blog/simple-javascript-inheritance/
(function () {
	var initializing = false,
		fnTest = /xyz/.test(function () {
			xyz;
		}) ? /\bparent\b/ : /.*/;

	this.Class = function () {};
	var inject = function (prop) {
		var proto = this.prototype;
		var parent = {};
		for (var name in prop) {
			if (typeof (prop[name]) == "function" && typeof (proto[name]) == "function" && fnTest.test(prop[name])) {
				parent[name] = proto[name]; // save original function
				proto[name] = (function (name, fn) {
					return function () {
						var tmp = this.parent;
						this.parent = parent[name];
						var ret = fn.apply(this, arguments);
						this.parent = tmp;
						return ret;
					};
				})(name, prop[name]);
			} else {
				proto[name] = prop[name];
			}
		}
	};

	this.Class.extend = function (prop) {
		var parent = this.prototype;

		initializing = true;
		var prototype = new this();
		initializing = false;

		for (var name in prop) {
			if (typeof (prop[name]) == "function" && typeof (parent[name]) == "function" && fnTest.test(prop[name])) {
				prototype[name] = (function (name, fn) {
					return function () {
						var tmp = this.parent;
						this.parent = parent[name];
						var ret = fn.apply(this, arguments);
						this.parent = tmp;
						return ret;
					};
				})(name, prop[name]);
			} else {
				prototype[name] = prop[name];
			}
		}

		function Class() {
			if (!initializing) {

				// If this class has a staticInstantiate method, invoke it
				// and check if we got something back. If not, the normal
				// constructor (init) is called.
				if (this.staticInstantiate) {
					var obj = this.staticInstantiate.apply(this, arguments);
					if (obj) {
						return obj;
					}
				}

				for (var p in this) {
					if (typeof (this[p]) == 'object') {
						this[p] = copy(this[p]); // deep copy!
					}
				}

				if (this.init) {
					this.init.apply(this, arguments);
				}
			}

			return this;
		}

		Class.prototype = prototype;
		Class.constructor = Class;
		Class.extend = arguments.callee;
		Class.inject = inject;

		return Class;
	};

})();

newGuid_short = function () {
	var S4 = function () {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};
	return (S4()).toString();
};

var xhrGet = function (reqUri, callback, object, type) {
    var caller = xhrGet.caller;
    var myRequest = new XMLHttpRequest();
    myRequest.open("GET", reqUri, true);
    if (type) {
        myRequest.responseType = type;
    }
    myRequest.onload = function () {
        if (callback) {
            try {
                callback(myRequest, object);
            } catch (e) {
                throw 'xhrGet failed:\n' + reqUri + '\nException: ' + e + '\nresponseText: ' + myRequest.responseText + '\ncaller: ' + caller;
            }
        }
    };
    myRequest.send();
};


var setup = function () {

    // Canvas setup
    canvas = document.getElementById('CanvasPlayground');
    canvas.focus();
    context = canvas.getContext('2d');
    // Background canvas
    background_canvas = document.getElementById('background');
    background_context = background_canvas.getContext('2d');

    // Load each image URL from the assets array into the frames array in the correct order.
    var spriteSheet = new SpriteSheetClass();
    spriteSheet.load('resources/images/sprites.png');
    xhrGet('resources/images/sprites.json', spriteSheet.parseAtlasDefinition, spriteSheet, null);

    // Game setup
    gEngine.setup();
    var entityPlayer = gEngine.spawnEntity("Player");
    entityPlayer.spritename = 'kami-walk-00';
    gEngine.gPlayer0.mpPhysBody.type = Body.b2_dynamicBody;

    // Call setInterval to run at a framerate of 30 frames per second, calling the animate function each time.
    window.setInterval(animate, 1000 / FPS);
    /////////////////window.setTimeout(loadBackground, 2000)
};

var drawBackground = function () {
    var sprite = 'kami-walk-001.png';
    var posX = 250;
    var posY = 400;
    //background_context.clearRect(0, 0, bcanvas.width, bcanvas.height); // First clean up screen
    for (var sheetName in gSpriteSheets) {

        // Use the getStats method of the spritesheet to find if a sprite with name 'spritename' exists in that sheet...
        var sheet = gSpriteSheets[sheetName];
        var sprite = sheet.getStats(sprite);

        // If we find the appropriate sprite, call '__drawSpriteInternal' with parameters as described below. Otherwise, continue with the loop...
        if (sprite === null) {
            continue;
        }

        background_context.drawImage(sheet.img, sprite.x, sprite.y, sprite.w, sprite.h, posX + 250, posY + 116, sprite.w, sprite.h);
        // We assume there isn't another sprite of the given 'spritename' that we want to draw, so we return!
        return;
    }
}

var animate = function () {
    gEngine.update();
    gEngine.draw();
    drawBackground();
};

var Vec2 = Box2D.Common.Math.b2Vec2;
var BodyDef = Box2D.Dynamics.b2BodyDef;
var Body = Box2D.Dynamics.b2Body;
var FixtureDef = Box2D.Dynamics.b2FixtureDef;
var Fixture = Box2D.Dynamics.b2Fixture;
var World = Box2D.Dynamics.b2World;
var MassData = Box2D.Collision.Shapes.b2MassData;
var PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var DebugDraw = Box2D.Dynamics.b2DebugDraw;
var RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;

var canvas = null;
var context = null;
var background_canvas = null;
var background_context = null;
var FPS = 10;
