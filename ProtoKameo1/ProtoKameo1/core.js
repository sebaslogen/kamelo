
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

var findPos = function (obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
};


var setup = function () {
    // Canvas setup
    player_canvas = document.getElementById('PlayerCanvas');
    player_context = player_canvas.getContext('2d');
    player_canvas.focus();
    // Flies canvas
    canvas = document.getElementById('PlaygroundCanvas');
    context = canvas.getContext('2d');
    // Dynamic background canvas
    dynamic_background_canvas = document.getElementById('DynamicBackground');
    dynamic_background_context = dynamic_background_canvas.getContext('2d');
    // Static background canvas
    static_background_canvas = document.getElementById('StaticBackground');
    static_background_context = static_background_canvas.getContext('2d');

    // Load background image first
    background_image = new Image();
    background_image.onload = function () {
        background_loaded = true;
        // Paint blue sky
        static_background_context.beginPath();
        static_background_context.rect(0, 0, static_background_canvas.width, static_background_canvas.height);
        static_background_context.fillStyle = 'LightCyan';
        static_background_context.fill();
        // Paint mountains plus ground
        static_background_context.drawImage(background_image, 0, 0, static_background_canvas.width, static_background_canvas.height); // Draw background (not a sprite)
        // Create sun gradient background
        var grd = static_background_context.createRadialGradient(1420, 170, 150, 1420, 270, 400);
        grd.addColorStop(1, 'rgba(250,250,255,0)');
        grd.addColorStop(0, 'rgba(250,250,120,1)');
        static_background_context.fillStyle = grd;
        static_background_context.fillRect(0, 0, canvas.width, canvas.height);
        // Initialize dynamic background
        requestAnimationFrame(animateBackground); // Dynamic background drawn half times than foreground
    }
    background_image.src = 'resources/images/mountains.png';
    // Load each image URL from the assets array into the frames array in the correct order.
    var spriteSheet = new SpriteSheetClass();
    spriteSheet.load('resources/images/sprites.png');
    xhrGet('resources/images/sprites.json', spriteSheet.parseAtlasDefinition, spriteSheet, null);

    // Game setup
    gEngine.setup();
    // Create clouds with random position, speed and layer index
    var entityCloud = gEngine.spawnEntity("Cloud");
    entityCloud.spritename = 'nube-001';
    entityCloud.speed = Math.floor(Math.random() * 30) + 1;
    entityCloud.zindex = Math.floor(Math.random() * 10) + 1;
    entityCloud.pos.x += Math.floor(Math.random() * 1800);
    entityCloud.pos.y += Math.floor(Math.random() * 100);
    entityCloud = gEngine.spawnEntity("Cloud");
    entityCloud.spritename = 'nube-002';
    entityCloud.speed = Math.floor(Math.random() * 30) + 1;
    entityCloud.zindex = Math.floor(Math.random() * 10) + 1;
    entityCloud.pos.x += Math.floor(Math.random() * 1200) + 200;
    entityCloud.pos.y += Math.floor(Math.random() * 100);
    entityCloud = gEngine.spawnEntity("Cloud");
    entityCloud.spritename = 'nube-003';
    entityCloud.speed = Math.floor(Math.random() * 30) + 1;
    entityCloud.zindex = Math.floor(Math.random() * 10) + 1;
    entityCloud.pos.x += Math.floor(Math.random() * 800) + 100;
    entityCloud.pos.y += Math.floor(Math.random() * 100);
    entityCloud = gEngine.spawnEntity("Cloud");
    entityCloud.spritename = 'nube-004';
    entityCloud.speed = Math.floor(Math.random() * 30) + 1;
    entityCloud.zindex = Math.floor(Math.random() * 10) + 1;
    entityCloud.pos.x += Math.floor(Math.random() * 400);
    entityCloud.pos.y += Math.floor(Math.random() * 100);

    if (BrowserDetect.browser != "Chrome") {
        window.alert("Oops! The game is designed to run in Chrome web browser, playing in this browser may be slow and buggy :(");
    }
    if (BrowserDetect.OS != "Linux") { // Change font in Linux to a supported one
        game_font = 'Helvetica';
    }
    drawLoadingScreen();
    // Call setInterval to run at a framerate of XX frames per second, calling the animate function each time.
    requestAnimationFrame(animate);

    /// Asynchronous assets loader for physics (not used until the first fly is created) and other libraries ///
    var oHead = document.getElementsByTagName('head').item(0);
    var boxScript = document.createElement("script");
    boxScript.type = "text/javascript";
    boxScript.onload = function () { // Load second library only after the first one is loaded (dependencies)
        var pHead = document.getElementsByTagName('head').item(0);
        var pScript = document.createElement("script");
        pScript.type = "text/javascript";
        pScript.onload = function () { // Initalize pending physics
            // Create physics engine
            gPhysicsEngine.create();
            /* // Add contact listener
            gPhysicsEngine.addContactListener({
                PostSolve: function (bodyA, bodyB, impulse) {
                    var uA = bodyA ? bodyA.GetUserData() : null;
                    var uB = bodyB ? bodyB.GetUserData() : null;
    
                    if (uA !== null) {
                        if (uA.ent !== null && uA.ent.onTouch) {
                            uA.ent.onTouch(bodyB, null, impulse);
                        }
                    }
    
                    if (uB !== null) {
                        if (uB.ent !== null && uB.ent.onTouch) {
                            uB.ent.onTouch(bodyA, null, impulse);
                        }
                    }
                }
            });*/
            gEngine.player0.physBody = gPhysicsEngine.addBody(gEngine.player0.entityDef); // Initialize physic body of player to interact with flies
            gEngine.player0.physBody.SetLinearVelocity(new Vec2(0, 0));
            gEngine.player0.physBody.linearDamping = 0;
        };
        pScript.src = "pyshics.js";
        pHead.appendChild(pScript);
    };
    boxScript.src = "box2D-min.js";
    oHead.appendChild(boxScript);
    // Load firework library
    var fireworksScript = document.createElement("script");
    fireworksScript.type = "text/javascript";
    fireworksScript.onload = function () { // Setup fireworks library
        Canvas.canvas = document.getElementById('FireworksCanvas'); // Initialize fireworks Canvas
        Canvas.context = Canvas.canvas.getContext('2d');
    };
    fireworksScript.src = "fireworks.js";
    oHead.appendChild(fireworksScript);
};

requestAnimationFrame = window.requestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        setTimeout;

var player_canvas = null;
var player_context = null;
var canvas = null;
var context = null;
var dynamic_background_canvas = null;
var dynamic_background_context = null;
var static_background_canvas = null;
var static_background_context = null;
var evil_fly_halo_canvas = null;
var dead_fly_halo_canvas = null;
var background_image = null;
var FPS = 14;
var introFrame = 0;
var introSeconds = 6;
var play_game_intro = true;
var sun_angle = 0;
var background_loaded = false;
var game_music_active = false;
var sound_atmos_active = false;
var victory = false;
var end = false;
var end_of_game_points = 50;
var game_font = 'Verdana';
var loading_bars = 0;

// Debugging options
var disable_sound = false; // Debug option to disable any sound
var cheating = false; // Debug option to win the game in only one fly catch
