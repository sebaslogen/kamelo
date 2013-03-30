
EngineClass = Class.extend({

    /************move_dir: new Vec2(0, 0),
    dirVec: new Vec2(0, 0),*/

    entities: [],
    factory: {},
    _deferredKill: [],

    flyes_alive: 0,
    max_flyes_alive: 20,
    last_fly_created: 0,

    //-----------------------------
    setup: function () {
        // Call our input setup method to bind our keys to actions and set the event listeners.
        gInput.setup();
        // Create physics engine
        gPhysicsEngine.create();
        // Add contact listener
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
        });
    },

    spawnEntity: function (typename, x, y) {
        var entityClass = gEngine.factory[typename];
        var ent = new (entityClass)(x, y);
        console.log("SPAWNING " + typename + " WITH ID " + ent.id);
        gEngine.entities.push(ent);
        return ent;
    },

/****************    removeEntity: function (removeEnt) {
        // We don't do anything with this right now.
        // We'll fill it in later this unit.
    }, */

    updateBackground: function () {
        sun_angle += 0.001; // Sun rotation speed
    },

    drawBackground: function () {
        //background_context.clearRect(0, 0, background_canvas.width, background_canvas.height); // Clear background
        background_context.beginPath();
        background_context.rect(0, 0, background_canvas.width, background_canvas.height);
        background_context.fillStyle = 'LightCyan';
        background_context.fill();
        // Draw sun plus back circular glow
        var grd = background_context.createRadialGradient(1420, 170, 100, 1420, 270, 400);
        grd.addColorStop(1, 'rgba(250,250,255,0.5)');
        grd.addColorStop(0, 'rgba(250,250,120,0.8)');
        background_context.fillStyle = grd;
        background_context.fillRect(0, 0, canvas.width, canvas.height);
        drawSprite('sol.png', 1420, 170, sun_angle, background_context); // Draw sun

        background_context.drawImage(background_image, 0, 0, background_canvas.width, background_canvas.height); // Draw background
    },

    update: function () { // Update player position of player and flies, create and delete flies as the born and die

        if (this.flyes_alive < this.max_flyes_alive) { // Create flies until the maximum is reached
            var flyID = Math.floor(Math.random() * 3);
            var seconds = (new Date()).getTime() / 1000;
            if ((flyID > 0) && (seconds - this.last_fly_created > 2)) { // Choose randomly to create fly model 1 or 2 or none only after a few seconds
                var entFly = gEngine.spawnEntity("Fly");
                entFly.spritename = 'fly-00' + flyID;
                entFly.speed = Math.floor(Math.random() * 100) + 1;
                entFly.zindex += Math.floor(Math.random() * 20);
                entFly.init(Math.floor(Math.random() * 1600), Math.floor(Math.random() * 700));
                this.last_fly_created = seconds;
                this.flyes_alive++;
            }
        }

        // Loop through the entities and call that entity's 'update' method, but only do it if that entity's '_killed' flag is set to true.
        for (var i = 0; i < gEngine.entities.length; i++) {
            var ent = gEngine.entities[i];
            if (!ent._killed) {
                ent.update();
            } else { // Otherwise, push that entity onto the '_deferredKill' list defined above.
                gEngine._deferredKill.push(ent);
                if (ent.id == "Fly") {
                    this.flyes_alive--;
                }
            }
        }

        // Loop through the '_deferredKill' list and remove each entity in it from the 'entities' list.
        for (var j = 0; j < gEngine._deferredKill.length; j++) {
            gEngine.entities.erase(gEngine._deferredKill[j]);
        }
        gEngine._deferredKill = []; // Once you're done looping through '_deferredKill', set it back to the empty array, indicating all entities in it have been removed from the 'entities' list.

        /// Update sound world ///
        if (sound_atmos.pos() >= 20.0) // Atmos loop
        {
            if (!sound_atmos_retriggered)
            {
                sound_atmos_retriggered = true;
                // Trigger atmos sound again
                launchClip(sound_atmos,'atmos');
            }
        }
        else
        {
            sound_atmos_retriggered = false;
        }
    },

    updatePhysics: function () {
        gPhysicsEngine.update(); // Update physics
        for (var i = 0; i < gEngine.entities.length; i++) { // Update entities with physics calculations
            var ent = gEngine.entities[i];
            if (ent.physBody) {
                ent.pos = ent.physBody.GetPosition();
            }
        }
    },

    //----- Draw all entities in the game engine
    draw: function () {
        context.clearRect(0, 0, canvas.width, canvas.height); // First clean up screen

        // Bucket entities by zIndex
        var fudgeVariance = 128;
        var zIndex_array = [];
        var entities_bucketed_by_zIndex = {};
        gEngine.entities.forEach(function (entity) {
            //don't draw entities that are off screen
            /*                          if (entity.pos.x >= gMap.viewRect.x - fudgeVariance &&
               entity.pos.x < gMap.viewRect.x + gMap.viewRect.w + fudgeVariance &&
               entity.pos.y >= gMap.viewRect.y - fudgeVariance &&
               entity.pos.y < gMap.viewRect.y + gMap.viewRect.h + fudgeVariance)*/ {
                // Bucket the entities in the entities list by their zindex property.
                if (!entities_bucketed_by_zIndex[entity.zindex]) {
                    entities_bucketed_by_zIndex[entity.zindex] = [];
                }
                entities_bucketed_by_zIndex[entity.zindex].push(entity);
                if (!zIndex_array[entity.zindex]) {
                    zIndex_array[entity.zindex] = entity.zindex;
                }
            }
        });

        // Draw entities sorted by zIndex
        zIndex_array.forEach(function (zindex) {
            entities_bucketed_by_zIndex[zindex].forEach(function (entity) {
                entity.draw();
            });
        });
    },

});


//-----------------------------------------
// External-facing function to get sprite based on the sprite name (ie. "kami-001.png")
var getSprite = function (spritename) {
    // Walk through all our spritesheets defined in 'gSpriteSheets' and for each sheet...
    for (var sheetName in gSpriteSheets) {
        // Use the getStats method of the spritesheet to find if a sprite with name 'spritename' exists in that sheet...
        var sheet = gSpriteSheets[sheetName];
        var sprite = sheet.getStats(spritename);
        if (sprite === null) {
            continue;
        }
        // We assume there isn't another sprite of the given 'spritename' that we want to draw, so we return!
        return sprite;
    }
    return null;
};

//-----------------------------------------
// External-facing function for drawing sprites based on the sprite name (ie. "kami-001.png", and the position on the canvas to draw to.
var drawSprite = function (spritename, posX, posY, angle, draw_context, flipped) {
    // Walk through all our spritesheets defined in 'gSpriteSheets' and for each sheet...
    for (var sheetName in gSpriteSheets) {
        // Use the getStats method of the spritesheet to find if a sprite with name 'spritename' exists in that sheet...
        var sheet = gSpriteSheets[sheetName];
        var sprite = sheet.getStats(spritename);
        // If we find the appropriate sprite, call '__drawSpriteInternal' with parameters as described below. Otherwise, continue with the loop...
        if (sprite === null) {
            continue;
        }
        __drawSpriteInternal(sprite, sheet, posX, posY, angle, draw_context, flipped);
        // We assume there isn't another sprite of the given 'spritename' that we want to draw, so we return!
        return;
    }
};

//-----------------------------------------
// External-facing function for drawing sprites based on the sprite object stored in the 'sprites Array, the 'SpriteSheetClass' object stored in the 'gSpriteSheets' dictionary, and the position on canvas to draw to.
var __drawSpriteInternal = function (spt, sheet, posX, posY, angle, draw_context) {
    if (spt === null || sheet === null) {
        return;
    }
    // Call the drawImage method of our canvas context using the full drawImage API. drawImage takes, in order:
    //
    // 1) the Image object to draw, this is our entire spritesheet.
    // 2) (From:) the x-coordinate we are drawing from in the spritesheet.
    // 3) (From:) the y-coordinate we are drawing from in the spritesheet.
    // 4) (From:) the width of the sprite we are drawing from our spritesheet.
    // 5) (From:) the height of the sprite we are drawing from our spritesheet.
    // 6) (To:) the x-coordinate we are drawing to in our canvas.
    // 7) (To:) the y-coordinate we are drawing to in our canvas.
    // 8) (To:) the width we are drawing in our canvas. This is in case we want to scale the image we are drawing to the canvas. In our case, we don't.
    // 9) (To:) the height we are drawing in our canvas. This is in case we want to scale the image we are drawing to the canvas. In our case, we don't.

    var hlf = {
        x: spt.cx,
        y: spt.cy
    };
    if ((typeof draw_context === 'undefined') || (draw_context == null)) {
        draw_context = context; // Use default drawing canvas if no other is defined
    }
    if ((typeof flipped === 'undefined') || (flipped == null)) {
        flipped = false; // By default don't mirror
    }
    if ((typeof angle !== 'undefined') && (angle != null)) { // Paint tongue
        draw_context.translate(posX, posY);
        draw_context.rotate(angle);
        draw_context.drawImage(sheet.img, spt.x, spt.y, spt.w, spt.h, hlf.x, hlf.y, spt.w, spt.h);
        draw_context.rotate(-angle);
        draw_context.translate(-posX, -posY);
        
        /////////////////////////////console.log("Painting in " + spt.x + " " + spt.y + " " + spt.w + " " + spt.h + " " + (0 + hlf.y) + " " + (0 + hlf.y) + " " + spt.w + " " + spt.h + " angle:" + angle);
    } else {
        draw_context.drawImage(sheet.img, spt.x, spt.y, spt.w, spt.h, posX + hlf.x, posY + hlf.y, spt.w, spt.h);
    }
};



// Start atmosphere sound => while playing equals true, I will trigger the atmosphere background sound
launchClip(sound_atmos, 'atmos');
var gEngine = new EngineClass();
console.log("Engine loaded!");