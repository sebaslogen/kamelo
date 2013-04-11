// We keep a global dictionary of loaded sprite-sheets,
// This dictionary is indexed by the URL path that the
var gSpriteSheets = {};
///var frame = 0;

//-----------------------------------------
SpriteSheetClass = Class.extend({
    // We store in the SpriteSheetClass:
    //
    // The Image object that we created for our atlas.
	img: null,

    // The URL path that we grabbed our atlas from.
	url: "",

    // An array of all the sprites in our atlas.
	sprites: [],

	//-----------------------------------------
	init: function () {},

	//-----------------------------------------
    // Load the atlas at the path 'imgName' into memory.
	load: function (imgName) {
		// Store the URL of the spritesheet we want.
        this.url = imgName;
        
        // Create a new image whose source is at 'imgName'.
        var img = new Image();
        img.onload = function () {
            gEngine.sprites_loaded = 1;
        }
		img.src = imgName;

        // Store the Image object in the img parameter.
		this.img = img;

        // Store this SpriteSheetClass in our global dictionary gSpriteSheets defined above.
		gSpriteSheets[imgName] = this;
	},

	//-----------------------------------------
	// Define a sprite for this atlas
	defSprite: function (name, x, y, w, h, cx, cy) {
        // We create a new object with:
        //
        // The name of the sprite as a string
        // The x and y coordinates of the sprite in the atlas.
        // The width and height of the sprite in the atlas.
        // The x and y coordinates of the center of the sprite in the atlas. This is so we don't have to do the calculations each time we need this. This might seem minimal, but it adds up!
		var spt = {
			"id": name,
			"x": x,
			"y": y,
			"w": w,
			"h": h,
			"cx": cx === null ? 0 : cx,
			"cy": cy === null ? 0 : cy
		};
		this.sprites.push(spt); // We push this new object into our array of sprite objects, at the end of the array.
	},

	//-----------------------------------------
    // Parse the JSON file passed in as 'atlasJSON' that is associated to this atlas.
	parseAtlasDefinition: function (atlasJSON, self) {
        // Parse the input 'atlasJSON' using the JSON.parse method and store it in a variable.
        var parsed = JSON.parse(atlasJSON.responseText);

        // For each sprite in the parsed JSON,
		for (var key in parsed.frames) {
            // Grab the sprite from the parsed JSON...
			var sprite = parsed.frames[key];

			// Define the center of the sprite as an offset (hence the negative).
            // We don't want to have to calculate these values every single time we want to draw a sprite! It adds up!
			var cx = -sprite.frame.w * 0.5;
			var cy = -sprite.frame.h * 0.5;

            // Check if the sprite is trimmed, then we need to update the center offset based upon how much data has been trimmed off of it.
            if (sprite.trimmed) {
                cx = -((sprite.sourceSize.w * 0.5) - sprite.spriteSourceSize.x);
                cy = -((sprite.sourceSize.h * 0.5) - sprite.spriteSourceSize.y);
            }
            
			// Define the sprite for this sheet by calling defSprite to store it into the 'sprites' Array.
            self.defSprite(key, sprite.frame.x, sprite.frame.y, sprite.frame.w, sprite.frame.h, cx, cy);
		}
	},

	//-----------------------------------------
	// Walk through all the sprite definitions for this atlas, and find which one matches the name.
	getStats: function (name) {
		for (var i = 0; i < this.sprites.length; i++) {
            if(this.sprites[i].id === name) {
                return this.sprites[i];
            }
		}
		return null; // If we don't find the sprite, return null.
	}

});

