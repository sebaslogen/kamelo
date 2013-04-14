
EngineClass = Class.extend({

    player0: null,

    entities: [],
    factory: {},
    _deferredKill: [],
    sprites_loaded: 0, // 0 means not loaded, 1 and 2 loaded

    flyes_alive: 0,
    max_flyes_alive: 15,
    last_fly_created: 0,
    total_fly_counter: 0,

    cheer_up_goal: 4,
    scrore_frames: 0,

    instructions_canvas: null,
    bar_canvas: null,

    //-----------------------------
    setup: function () {
        // Prepare game instructions once to render later multiple times
        this.instructions_canvas = document.createElement("canvas");
        this.instructions_canvas.width = canvas.width;
        this.instructions_canvas.height = canvas.height;
        var instructions_context = this.instructions_canvas.getContext('2d');
        var zoom_inst_offset = 0;
        instructions_context.textAlign = 'left';
        if (screen.width < 1920) { // Show zooming instructions when game canvases do not fit in screen
            var percent_res = screen.width / 1920;
            zoom_inst_offset = 120;
            var font_size = 38 * percent_res;
            instructions_context.font = 'bold '+ font_size +'pt ' + game_font;
            instructions_context.fillStyle = 'rgba(255, 0, 0, 1)'; // red
            instructions_context.fillText('           Warning! Adjust ZOOM of the game with:', 10, font_size * 4);
            instructions_context.fillStyle = 'rgba(0, 0, 200, 1)'; // green
            instructions_context.fillText('"Ctrl" key  &  mouse wheel   OR   "Ctrl" key  &  "-" key', 10, font_size * 7);
            ////////////////////resolution_size = 0.50;
            //resolution_size = 0.75;
            //if (screen.width < 1600) {
            //    resolution_size = 0.5;
            //}
            //if (screen.width < 960) {
            //    resolution_size = 0.25;
            //}
            //document.getElementById('gameDiv').style.zoom = resolution_size;
        }
        instructions_context.textAlign = 'center';
        instructions_context.font = 'bold 70pt ' + game_font;
        instructions_context.fillStyle = 'rgba(0, 155, 0, 1)'; // green
        instructions_context.fillText('Move with ← left and right →', canvas.width / 2, (canvas.height / 2) - 140 + zoom_inst_offset);
        instructions_context.fillStyle = 'rgba(235, 135, 0, 1)'; // orange
        instructions_context.fillText('Mouse click to catch flies', canvas.width / 2, (canvas.height / 2) + zoom_inst_offset);
        instructions_context.fillStyle = 'rgba(255, 40, 40, 1)'; // red
        instructions_context.fillText('Prevent Kame from starving', canvas.width / 2, (canvas.height / 2) + 140 + zoom_inst_offset);
        instructions_context.fillStyle = 'rgba(200, 0, 0, 1)'; // dark red
        instructions_context.font = 'bold 15pt ' + game_font;
        instructions_context.fillText('Made with Love By Sebastian Lobato Genco & Jose Carlos Tapiador Carretero', canvas.width / 2, (canvas.height / 2) + 420);
        // Create a loading bar
        this.bar_canvas = document.createElement("canvas");
        var ctx = this.bar_canvas.getContext("2d");
        ctx.fillStyle = "#EE0000";
        ctx.fillRect(0, 0, 100, 20);
        // Start atmosphere sound => while playing equals true, I will trigger the atmosphere background sound
        sound_atmos.play('atmos');
        sound_atmos_active = true;
        // Call our input setup method to bind our keys to actions and set the event listeners.
        gInput.setup();
        // Create game entities
        this.player0 = gEngine.spawnEntity("Player", 250, 680); // Create player with initial position in canvas
        this.player0.spritename = 'kami-walk-00';
    },

    spawnEntity: function (typename, x, y) {
        var entityClass = gEngine.factory[typename];
        var ent = new (entityClass)(x, y);
        gEngine.entities.push(ent);
        return ent;
    },

    endGame: function () {
        end = true;
        game_music.fadeOut(0.0, 5000, null); // Disable any background music
        sound_atmos.fadeOut(0.0, 5000, null); // Disable any background music
        kami_death.fadeOut(0.0, 5000, null); // Disable any background music
    },

    activateMusic: function () { // Activate action music and disable background music
        sound_atmos.fadeOut(0.0, 4000, function () { sound_atmos_active = false; });
        game_music.stop();
        game_music.fadeIn(0.6, 0, function () { game_music_active = true; });
    },

    activateAtmosMusic: function () { // Activate background music and disable action music
        game_music.fadeOut(0.0, 4000, function () { game_music_active = false; });
        sound_atmos.stop();
        sound_atmos.fadeIn(0.1, 2000, function () { sound_atmos_active = true; }); // Fade in
    },
    
    updateBackground: function () {
        sun_angle += 0.002; // Sun rotation speed
    },

    drawBackground: function () { // Draw background with moving sun and score
        if (this.sprites_loaded == 1) { // Draw only when images are loaded
            this.sprites_loaded = 2; // Never draw it again
            var tree_context = document.getElementById('TreeCanvas').getContext('2d');
            drawSprite('tree.png', 1100, 420, 0, tree_context); // Draw tree on top of future score text
        }
        dynamic_background_context.clearRect(0, 0, dynamic_background_canvas.width, dynamic_background_canvas.height); // Clear background
        // Draw sun on top of circular glow
        drawSprite('sol.png', 1420, 170, sun_angle, dynamic_background_context); // Draw sun
        // Draw Score
        if (this.scrore_frames > 0) {
            dynamic_background_context.font = 'bold 500pt ' + game_font;
            var points_color = Math.round(this.player0.points * 255 / end_of_game_points);
            dynamic_background_context.fillStyle = 'rgba(' + points_color + ',0,' + (255 - points_color) + ',1)';
            dynamic_background_context.textAlign = 'center';
            dynamic_background_context.fillText(this.player0.points, canvas.width / 2, canvas.height / 2 + 200);
            this.scrore_frames = (this.scrore_frames + 1) % (FPS + 2); // Show for one second
            if (victory) {
                this.scrore_frames = (FPS + 1);
            }
        }
    },

    update: function () { // Update player position of player and flies, create and delete flies as the born and die
        /// Control game intro ///
        if ((introFrame >= introSeconds * FPS) && play_game_intro) {
            play_game_intro = false;
        }
        if (game_instructions) { // Stop showing initial instructions
            if (gInput.actions['fire-mouse'] || gInput.actions['move-left'] || gInput.actions['move-right']) {
                game_instructions = false;
            }
        }
        /// This clousure is full of SHIT to generate the flies ;-) ///
        if ((this.flyes_alive < this.max_flyes_alive) && // Create flies until the maximum is reached
            !play_game_intro){ // only after game intro finishes
            var flyID = Math.floor(Math.random() * 3);
            var seconds = (new Date()).getTime() / 1000;
            // Choose randomly to not create a fly or create fly model 1 or 2 but only after a few seconds (periodically)
            if ((flyID > 0) && (seconds - this.last_fly_created > 2)) {
                var new_pos = { x: Math.floor(Math.random() * 1600), y: Math.floor(Math.random() * 700)};
                var entFly = gEngine.spawnEntity("Fly", new_pos.x, new_pos.y);
                entFly.spritename = 'fly-00' + flyID;
                entFly.count_id = ++this.total_fly_counter;
                if (this.total_fly_counter > 100000) { // Reset ID counter to avoid problems
                    this.total_fly_counter = 0;
                }
                entFly.speed = Math.floor(Math.random() * 500) + 50;
                entFly.zindex += Math.floor(Math.random() * 20);
                if (new_pos.x % 11 == 0) { // Turn the fly into an evil monster!
                    entFly.evil = true;
                }
                this.last_fly_created = seconds;
                this.flyes_alive++;
                // Play soft bubble sound
                launchBubbleSound();
                // Play fly sound
                launchFlySound();
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

        gEngine.updatePhysics(); /// Physics engine plus manual collision detections take place here ///

        // Loop through the '_deferredKill' list and remove each entity in it from the 'entities' list.
        for (var j = 0; j < gEngine._deferredKill.length; j++) {
            gEngine.entities.erase(gEngine._deferredKill[j]);
        }
        gEngine._deferredKill = []; // Once you're done looping through '_deferredKill', set it back to the empty array, indicating all entities in it have been removed from the 'entities' list.
    },

    updatePhysics: function () {
        if (typeof gPhysicsEngine !== 'undefined') {
            gPhysicsEngine.update(); // Update physics
        }
        for (var i = 0; i < gEngine.entities.length; i++) { // Update entities with physics calculations
            var ent = gEngine.entities[i];
            if (ent.physBody) {
                if (ent.id == "Fly") { // Only flies follow the physics system
                    ent.pos = ent.physBody.GetPosition(); // Update position
                    if ((ent.angle != 'undetermined') && (ent.angle != null)) {
                        ent.angle = ent.physBody.GetAngle(); // Update angle
                    }
                } else if (ent.id == "Player") { // Update physical body position from manual movement
                    ent.physBody.SetPosition(new Vec2(ent.pos.x, ent.pos.y));
                }
            }

            /// Fly hunting method when tongue animation reaches target ///

            if ((ent.id == "Fly") && (!this.player0.miss_in_da_face) && !victory &&
                (this.player0.tongue_frame == max_tongue_frames - 1) && !this.player0.dead) {
                if (ent.updateCatch(this.player0.tong_fire_pos.x, this.player0.tong_fire_pos.y)) { // Points for death
                    if (ent.evil) { // Eat an evil poisoned fly!
                        launchBurpSound(); // Kami burps when catching an evil fly
                        console.log("Ate a posioned fly!!!");
                        if (this.player0.health > 190) {
                            this.player0.health -= 100;
                        } else if (this.player0.health > 130) {
                            this.player0.health -= 50;
                        } else {
                            this.player0.health = 80;
                        }
                        this.player0.yellow_filter.intensity = 1.0; // Turn yellow
                    } else {
                        launchDrySlapSound(); // Catch sound
                        this.player0.points++;
                        if (cheating) { // Cheating option to complete the game in one catch
                            this.player0.points += end_of_game_points;
                        }
                        this.player0.volatile_points++;
                        if (this.player0.health < 255) {
                            this.player0.health += 30;
                            if (this.player0.health < 130) {
                                this.player0.yellow_filter.intensity = 0.0; // Remove poison
                            } else {
                                this.player0.yellow_filter.intensity -= 0.2;
                            }
                        }
                        console.log("Points:" + this.player0.points);
                        if ((this.player0.points >= this.cheer_up_goal) || (this.player0.points >= end_of_game_points)) {
                            launchSound('cheer'); // Cheer up the user
                            this.cheer_up_goal += Math.round(this.cheer_up_goal * 0.4); // Adjust next target to a little bit more difficult
                            this.scrore_frames = 1; // Enable drawing score
                            if (this.player0.points >= end_of_game_points) { // Victory trigger
                                victory = true;
                                createFirework(); // Player has win, show victory animation
                            }
                        }
                    }
                }
            }
        }
    },

    //----- Draw all entities in the game engine
    draw: function () {
        context.clearRect(0, 0, canvas.width, canvas.height); // First clean up screen
        if (!(!game_instructions && !background_loaded)) { // Only while loading then use fast canvas copy operations
            player_context.clearRect(0, 0, canvas.width, canvas.height); // First clean up screen
        }

        // Bucket entities by zIndex
        var fudgeVariance = 128;
        var zIndex_array = [];
        var entities_bucketed_by_zIndex = {};
        gEngine.entities.forEach(function (entity) {
            //only draw entities that are in the screen
            if (entity.pos.x <= canvas.width + (entity.size.width / 2) &&
               entity.pos.x >= -(entity.size.width / 2) &&
               entity.pos.y >= -(entity.size.height / 2) &&
               entity.pos.y <= canvas.height + (entity.size.height / 2)) {
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
        if (victory || end) {
            context.fillStyle = "rgba(0, 0, 0, 0.4)"; // Dark everything behind player when winning or game ends
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
    },

});


/// External facing functions ///

var animateBackground = function () {
    setTimeout(function() {
        if (!end) {
            gEngine.updateBackground();
            gEngine.drawBackground();
        }
        requestAnimationFrame(animateBackground);
    }, 1000 / (FPS / 2)); // Dynamic background drawn half times than foreground
};

var animate = function () {
    setTimeout(function () {
        if (!end) {
            if (background_loaded) { /// Main game update loop /// - This is where all the shit happens to attract the flies
                gEngine.update();
                gEngine.draw();
                // Create Intro radial gradient in foreground while everything loads in the background
                if (play_game_intro) {
                    introFrame++; // Start fading out loading screen
                    drawLoadingScreen(); // Still draw instructions for a few seconds while gradient is disolving
                }
                if (game_instructions) { // Show gameplay instructions until the user presses any of the game keys 
                    player_context.drawImage(gEngine.instructions_canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
                }
            }
        
        } else {
            dynamic_background_context.font = 'bold 250pt ' + game_font;
            dynamic_background_context.fillStyle = 'rgba(0, 50, 255, 1)';
            dynamic_background_context.textAlign = 'center';
            dynamic_background_context.fillText('The End', canvas.width / 2, canvas.height / 2);
        }
        requestAnimationFrame(animate); // Call again on next possible frame
    }, 1000 / FPS);
};

var drawLoadingScreen = function () {
    var external_r = 20000 - (introFrame * introFrame * 2);
    var grd = player_context.createRadialGradient(1420, 170, 200 - introFrame, 1420, 170, external_r); // Shrinking radius
    var opacity = 1.05 - (introFrame / (introSeconds * FPS)); // Disolve slowly
    grd.addColorStop(1, 'transparent');
    grd.addColorStop(0, 'rgba(250,250,120,' + opacity + ')');
    player_context.fillStyle = grd;
    player_context.fillRect(0, 0, canvas.width, canvas.height);
    if (game_instructions || !background_loaded) { // Show gameplay instructions until the user presses any of the game keys and the background loads
        player_context.drawImage(gEngine.instructions_canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    }
    if (!background_loaded) {
        for (var i = 0; i < loading_bars; i++) { // Draw loading bar only while background image has not been loaded
            player_context.drawImage(gEngine.bar_canvas, 0, 0, 100, 20, canvas.width / 2 - 300 + (200 * i), (canvas.height / 2) + 300, 100, 20);
        }
        window.setTimeout(function(){
            if (!background_loaded) { // Keep drawing instructions plus loading bars only until background is loaded
                loading_bars++;
                drawLoadingScreen();
            }
        }, 500);
    }    
};

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
var drawSprite = function (spritename, posX, posY, angle, draw_context) {
    // Walk through all our spritesheets defined in 'gSpriteSheets' and for each sheet...
    for (var sheetName in gSpriteSheets) {
        // Use the getStats method of the spritesheet to find if a sprite with name 'spritename' exists in that sheet...
        var sheet = gSpriteSheets[sheetName];
        var sprite = sheet.getStats(spritename);
        // If we find the appropriate sprite, call '__drawSpriteInternal' with parameters as described below. Otherwise, continue with the loop...
        if (sprite === null) {
            continue;
        }
        __drawSpriteInternal(sprite, sheet, posX, posY, angle, draw_context);
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
    if ((typeof angle !== 'undefined') && (angle != null)) { // Paint rotated object
        draw_context.translate(posX, posY);
        draw_context.rotate(angle);
        if (spt.canvasCache != null) { // Rendering precalculated canvas
            draw_context.drawImage(spt.canvasCache, 0, 0, spt.w, spt.h, hlf.x, hlf.y, spt.w, spt.h);
        } else {
            draw_context.drawImage(sheet.img, spt.x, spt.y, spt.w, spt.h, hlf.x, hlf.y, spt.w, spt.h);
        }
        draw_context.rotate(-angle);
        draw_context.translate(-posX, -posY);
    } else {
        if (spt.canvasCache != null) { // Rendering precalculated canvas
            draw_context.drawImage(spt.canvasCache, 0, 0, spt.w, spt.h, posX + hlf.x, posY + hlf.y, spt.w, spt.h);
        } else {
            draw_context.drawImage(sheet.img, spt.x, spt.y, spt.w, spt.h, posX + hlf.x, posY + hlf.y, spt.w, spt.h);
        }
    }
};



var gEngine = new EngineClass();
console.log("Engine loaded!");
