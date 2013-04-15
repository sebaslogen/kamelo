// Artwork size constants
var start_tongue_med_segment = 46; // Pixel where the middle part of the tongue starts in the image Minus the half of the picture pixels
var tong_med_size = 34; // Size of the middle of the tongue that will be repeated to extend tongue size
var tongue_offset = { x: 193, y: 16 }; // Offset of tongue start position from player body
var tongue_tilting_angle = 25; // This tilts the tongue to elevate the tip of the tongue to make it overlap the mouse
var max_tongue_frames = 3;
var max_tongue_size = 700;
var max_eye_sprites = 8;
var max_tail_sprites = 3;
var inactive_time = 5;

PlayerClass = EntityClass.extend({
    id: "Player",
    points: 0,
    volatile_points: 0,
    volatile_points_timer: 0,
    health: 255,
    dead: false,
    dizzy: false,
    walkSpeed: 20,
    zindex: 50,
    currSpriteName: null,
    health_timer: 0,
    last_fire_timer: 0,
    local_player_canvas: null,
    local_player_context: null,
    frame: 1, // Player current frame for walking animation
    total_frames: 3,
    direction: true,
    moving: false,
    direct_eyes: false,
    last_eye_changed: 0,
    current_eye: 1,
    last_tail_changed: 0,
    current_tail: 0,
    alpha: 0,
    yellow_filter: { canvas: null, context: null, intensity: 0.0 },
    red_filter: { canvas: null , context: null, intensity: 0.0 },
    dead_altitud: 0,
    miss_in_da_face: false, // When fire position is incorrect, just slap the tongue in the head
    tongue_frame: 0, // Number of frame drawn for the tongue
    tong_pos: { x: 0, y: 0 }, // Position of tongue start
    tong_fire_pos: { x: 0, y: 0 }, // Position of tongue end
    tong_offset: { x: tongue_offset.x, y: tongue_offset.y }, // Tongue start position offset from body
    tong_distance : 0,
    angle : 0,
    t_start : "kami-tongue-001.png",
    t_med : "kami-tongue-002.png",
    t_end: "kami-tongue-003.png",
    entityDef: null,
    physBody: null, // This is hooking into the Box2D Physics library

    init: function (x, y) {
        this.parent(x, y);
        this.dead_altitud = y - 10;
        var startPos = {
            x: x,
            y: y
        };
        this.entityDef = { // Create our physics body;
            id: "Player",
            type: 'static',
            x: startPos.x,
            y: startPos.y,
            halfHeight: 80, // Bounding collision box size for the player
            halfWidth: 200,
            angle: 0,
            userData: {
                "id": "Player",
                "ent": this
            }
        };
        this.physBody = null;/*gPhysicsEngine.addBody(entityDef);
        this.physBody.SetLinearVelocity(new Vec2(0, 0));
        this.physBody.linearDamping = 0;*/
        this.local_player_canvas = document.createElement("canvas");
        this.local_player_canvas.width = canvas.width;
        this.local_player_canvas.height = canvas.height;
        this.local_player_context = this.local_player_canvas.getContext('2d');
    },

    update: function () {
        if (!this.dead) { // Update positions only when player is alive
            var now = (new Date()).getTime();

            /// Calculate horizontal movement ///
            var move_dir = { x: 0, y: 0 };
            if ((gInput.actions['move-left']) && (this.pos.x > 100)) { // adjust the move_dir by 1 in the x direction
                move_dir.x -= this.walkSpeed;
                this.moving = true;
                console.log("Muevo Izq");
            }
            if ((gInput.actions['move-right']) && (this.pos.x < canvas.width - 150)) { // adjust the move_dir by 1 in the x direction
                if (this.moving) { // Dizzy moving both ways
                    this.current_eye = Math.floor(Math.random() * (max_eye_sprites + 1));
                    this.current_tail = Math.floor(Math.random() * (max_tail_sprites + 1));
                    if (!this.dizzy && (this.current_tail % 5 == 0)) { // Dizzy sound at some random dizzy point
                        launchBurpSound();
                        this.dizzy = true;
                    }
                    this.moving = this.current_tail % 5 == 0;// This stops from moving in the same spot constantly (now randomly)
                } else {
                    this.dizzy = false;
                    this.moving = true;
                }
                move_dir.x += this.walkSpeed;
                console.log("Muevo Derch");
            }
            /*
            // Fake physics, simply move in x axis
            if (move_dir.LengthSquared()) {// After modifying the move_dir above, we check if the vector is non-zero. If it is, we adjust the vector length based on the player's walk speed.
                move_dir.Normalize(); // First set 'move_dir' to a unit vector in the same direction it's currently pointing.
                move_dir.Multiply(this.walkSpeed); // Next, multiply 'move_dir' by the player's set 'walkSpeed'. We do this in case we might want to change the player's walk speed due to a power-up, etc.
            }*/
            this.pos.x += move_dir.x;
            
            /// Body animations ///
            if ((now / 10) - this.last_eye_changed > 100) { // Every less than a second it's possible to change the eye
                this.last_eye_changed = now / 10;
                this.current_eye = Math.floor(Math.random() * (max_eye_sprites + 1));
            }
            if (this.alpha != 0) { // Only change tails when not dying
                this.current_tail = 0;
            } else {
                if (this.current_tail == 2) { // When showing long tail
                    this.last_tail_changed -= 20; // Very short long tail show
                }
                if ((now / 10) - this.last_tail_changed > 150) { // Every less than a second it's possible to change the eye
                    this.last_tail_changed = now / 10;
                    this.current_tail = Math.floor(Math.random() * (max_tail_sprites + 1));
                }
            }
            var angle_calculated = false;

            /// Graphical tongue representation /// - Tongue fire distance and angle from mouth calculations
            // Step 1 record hit position //
            if (gInput.actions['fire-mouse']) { // Update tongue TARGET position only after shoot, not during player movement either mouse move
                this.tong_fire_pos.x = gInput.mouse.x;
                this.tong_fire_pos.y = gInput.mouse.y;
                this.last_fire_timer = now / 1000; // Record time in seconds of last fire
            }
            // Step 2 calculate distance and angle from player to hit position //
            if ((gInput.actions['fire-mouse'] || (this.tongue_frame != 0)) && !angle_calculated) {// Keep updating tongue position while the tongue is out
                this.calculatePointerAngle(false);
                angle_calculated = true;
            }
            // Step 3 Activate animations and sound //
            if (gInput.actions['fire-mouse']) { // launch the sound for the tongue and the animation
                gInput.actions['fire-mouse'] = false;
                this.tongue_frame = 1; // Activate tongue animation
                this.current_tail = 2;
                if ((this.angle < -1.9078242687063418) || (this.angle > 0.065) || this.tong_distance < 100) { // Behind, below or too close fire will slap in the face
                    this.miss_in_da_face = true; // Not possible to hit target position
                    launchSlapSound();
                } else {
                    this.miss_in_da_face = false;
                    launchTongueSound();
                }
                if (!gamer_active && !play_game_intro) { // Activate music when player gets active for the first time and starts hitting after the intro
                    if (sound_atmos_active && !game_music_active) { // Avoid fade in and out simultaneously
                        gamer_active = true;
                        gEngine.activateMusic();
                    }
                }
            } else if ((this.last_fire_timer != 0) && gamer_active && ((now / 1000) - this.last_fire_timer > inactive_time)) { // When player is not firing for a long period
                if (game_music_active && !sound_atmos_active) { // Avoid fade in and out simultaneously
                    gamer_active = false;
                    gEngine.activateAtmosMusic();
                }
            }

            /// Eyes looking towards mouse movement position ///
            if (this.direct_eyes) {
                this.direct_eyes = false;
                if (!angle_calculated) {
                    this.calculatePointerAngle(true);
                }
                angle_calculated = true;
                var degrees = -(this.angle * (180 / Math.PI)) % 360; // Calculate direction of eyes towards mouse pointer
                if (degrees >= -15 && degrees < 30) {
                    if (this.tong_distance >= max_tongue_size * 0.8) { //Looking very far
                        this.current_eye = 5;
                    } else {
                        this.current_eye = 1;
                    }
                } else if (degrees >= 30 && degrees < 60) {
                    this.current_eye = 2;
                } else if (degrees >= 60 && degrees < 100) {
                    this.current_eye = 4;
                }
            }

            /// Life management ///
            if (this.health_timer != 0) { // Lifetime clock
                if ((now - this.health_timer >= 200) && (!this.dead) && (!victory)) { // Every few milliseconds life decreases
                    this.health -= 1;
                    if (this.points > 30) { // Increase dificulty
                        this.health -= Math.floor(this.points / 30);
                    }
                    this.health_timer = now;
                }
                if (now - this.volatile_points_timer >= 4000) { // Every few seconds red color from eating decreases
                    if (this.volatile_points > 0) {
                        if ((this.health > 150) || (this.volatile_points == 1)) {
                            this.volatile_points--; //Slower decrease
                        } else if (this.volatile_points > 1) {
                            this.volatile_points -= 2; //Fast decrease
                        }
                    }
                    this.volatile_points_timer = now;
                }
            } else if (!play_game_intro && !game_instructions) { // Intro finished and user read the game instructions, life starts ticking away
                this.health_timer = (new Date()).getTime();
            }

            /// Determine color (body pigmentation) ///
            this.red_filter.intensity = this.volatile_points / 10;
            if (this.health <= 150) { // Activate transparency when player is dying
                this.alpha = (this.health + 20) / 255;
            } else {
                this.alpha = 1.0;
            }

            /// Set image size after being loaded ///
            if (this.size.width == 0 && this.size.height == 0) {
                var sprite = getSprite(this.spritename + '1.png');
                if ((typeof sprite !== 'undefined') && (sprite != null) && (sprite.w != null) && (sprite.h != null)) {
                    this.size.width = sprite.w;
                    this.size.height = sprite.h;
                }
            }
            if (this.health <= 70) { // Vanished to death -> Show dead animation and change music
                this.dead = true;
                game_music.fadeOut(0.0, 3000, null); // Disable any background music
                sound_atmos.fadeOut(0.0, 3000, null); // Disable any background music
                kami_death.play("death").fadeIn(0.5, 5000);
                this.tongue_frame = 1;
                this.angle = 0.1;
            }
        } else { // Elevate to death
            this.dead_altitud -= (1.8 + (this.angle*2));
            if (this.angle < 1) {
                this.angle += 0.008;
            }
            if (this.dead_altitud <= 10) { // End of game
                gEngine.endGame();
            }
        }
    },

    /// Calculate distance to cursor and angle, both for tongue and eyes ///
    calculatePointerAngle: function (use_current_mouse_position) {
        this.tong_pos.x = this.pos.x + this.tong_offset.x;
        this.tong_pos.y = this.pos.y + this.tong_offset.y;
        var tong_size_x = this.tong_fire_pos.x - this.tong_pos.x;
        var tong_size_y = this.tong_fire_pos.y - this.tong_pos.y;
        if (use_current_mouse_position) {
            tong_size_x = gInput.mouse.x - this.tong_pos.x;
            tong_size_y = gInput.mouse.y - this.tong_pos.y;
        }
        this.tong_distance = Math.sqrt((tong_size_x * tong_size_x) + (tong_size_y * tong_size_y));
        if (this.tong_distance > max_tongue_size) {
            this.tong_distance = max_tongue_size;
            if (gInput.actions['fire-mouse']) {
                launchSound('tongmax');
            }
        }
        var angle_tip_tongue_offset = Math.atan2(-tongue_tilting_angle, this.tong_distance); // This tilts the tongue to elevate the tip of the tongue to make it overlap the mouse
        this.angle = -Math.atan2(-tong_size_y, tong_size_x)
        if (this.tong_distance == max_tongue_size) { // Undo all math calculations to return the position of the cursor(tongue tip) in a limited tongue
            this.tong_fire_pos.x = (Math.cos(this.angle) * max_tongue_size) + this.tong_pos.x;
            this.tong_fire_pos.y = (Math.sin(this.angle) * max_tongue_size) + this.tong_pos.y;
        }
        this.angle += angle_tip_tongue_offset;
    },

    //-----------------------------------------
    draw: function () {
        if (this.spritename) { // Draw character
            player_context.globalAlpha = this.alpha; // Set destination canvas transparency when player is alive
            this.local_player_context.clearRect(0, 0, this.local_player_canvas.width, this.local_player_canvas.height);
            if (!this.dead) {
                if (this.moving) {
                    if (this.direction) {
                        this.frame++;
                    } else {
                        this.frame--;
                    }
                    if ((this.frame == 1) || (this.frame == this.total_frames)) { // Change direction when reached last frame of tongue animation
                        this.direction = !this.direction;
                    }
                    this.moving = false;
                }
                var real_spritename = this.spritename + this.frame + '.png';
                drawSprite(real_spritename, this.pos.x, this.pos.y, null, this.local_player_context);
                if (this.miss_in_da_face && (this.tongue_frame != 0)) { // Draw slap in da face!
                    this.local_player_context.clearRect(this.pos.x + 123, this.pos.y - 25, 80, 62); // Clean up previous face
                    this.local_player_context.clearRect(this.pos.x + 140, this.pos.y + 24, 80, 20); // Clean up previous face
                    this.local_player_context.clearRect(this.pos.x + 112, this.pos.y - 96, 48, 48); // Clean up previous face
                    drawSprite('kami-head-slap.png', this.pos.x + 163, this.pos.y - 25, null, this.local_player_context);
                } else { // Draw different face animations
                    if (this.current_eye != 0) { // Draw a new eye on top of the default eye
                        drawSprite('kami-eye-00' + this.current_eye + '.png', this.pos.x + 162, this.pos.y - 37, null, this.local_player_context);
                    }
                }
                if (this.current_tail != 0) { // Paint alternative tails
                    this.local_player_context.clearRect(this.pos.x - (this.size.width / 2) + 60, this.pos.y + 5, 70, 40); // Delete beginning of tail
                    this.local_player_context.clearRect(this.pos.x - (this.size.width / 2), this.pos.y - 30, 120, 100); // Delete end of tail
                    drawSprite('kami-tail-00' + this.current_tail + '.png', this.pos.x - 132, this.pos.y + 33, null, this.local_player_context);
                }
                this.change_color(real_spritename, this.pos.x, this.pos.y, this.angle, this.local_player_context); // Color player character

                /// Tongue drawing ///
                if (this.tongue_frame != 0) { // Draw tongue
                    if (!this.miss_in_da_face) {
                        drawSprite(this.t_start, this.tong_pos.x, this.tong_pos.y, this.angle, this.local_player_context);
                        var current_tong_pos_x = this.tong_pos.x;
                        var current_tong_pos_y = this.tong_pos.y;
                        var distance = this.tong_distance / (max_tongue_frames - this.tongue_frame);
                        if (this.tong_distance < 200) { // Too short distance to display animation
                            distance = this.tong_distance
                        }
                        while (distance - start_tongue_med_segment > tong_med_size) { // Continue adding "middle tongue chunks" after tongue start until the tongue-end covers the rest of the distance until the mouse pos.
                            drawSprite(this.t_med, current_tong_pos_x, current_tong_pos_y, this.angle, this.local_player_context);
                            distance -= tong_med_size;
                            current_tong_pos_x += Math.cos(this.angle) * tong_med_size;
                            current_tong_pos_y += Math.sin(this.angle) * tong_med_size;
                        }
                        current_tong_pos_x -= Math.cos(this.angle) * (tong_med_size * 2);// Put tip of the tongue over medium part
                        current_tong_pos_y -= Math.sin(this.angle) * (tong_med_size * 2);
                        current_tong_pos_x += Math.cos(this.angle) * (distance - start_tongue_med_segment);// Extend tip of tongue progressively with mouse movement
                        current_tong_pos_y += Math.sin(this.angle) * (distance - start_tongue_med_segment);
                        drawSprite(this.t_end, current_tong_pos_x, current_tong_pos_y, this.angle, this.local_player_context);
                        this.tongue_frame = (this.tongue_frame + 1) % (max_tongue_frames); // Less than half second at current FPS (10)
                    } else { // How long to draw slap in da face
                        this.tongue_frame = (this.tongue_frame + 1) % (max_tongue_frames + (max_tongue_frames / 2)); // A little bit longer than a tongue animation
                    }
                }
            } else { // Dead, show pass to death
                player_context.globalAlpha = 1.0; // Do not use global transparency on destination canvas for death
                this.local_player_context.globalAlpha = 0.27;
                if (this.dead_altitud < this.pos.y - 30) {
                    this.tongue_frame = 2;
                    var real_spritename = this.spritename + this.frame + '.png'; // Draw phantom first
                    drawSprite(real_spritename, this.pos.x, this.dead_altitud, this.angle, this.local_player_context);
                    this.change_color(real_spritename, this.pos.x, this.dead_altitud, this.angle, this.local_player_context); // Color player character
                }
                this.local_player_context.globalAlpha = 1.0;
                drawSprite('kami-dead-00' + this.tongue_frame + '.png', this.pos.x, this.pos.y, null, this.local_player_context); // Draw dead body
            }

            /// Draw to final canvas ///
            player_context.globalCompositeOperation = 'copy'; // Copy canvas applying transparency to composed image
            player_context.drawImage(this.local_player_canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        }
    },

    change_color: function (spritename, posX, posY, angle, draw_context) {
        if (this.red_filter.intensity > 0) { // Do not use filter when it's invisible
            if (this.red_filter.canvas == null) { // Create filter on first use
                this.red_filter.canvas = document.createElement("canvas");
                this.red_filter.canvas.width = canvas.width;
                this.red_filter.canvas.height = canvas.height;
                this.red_filter.context = this.red_filter.canvas.getContext('2d');
                this.red_filter.context.fillStyle = 'rgba(255, 0, 0, 0.55)'; // maximal red
                this.red_filter.context.fillRect(0, 0, canvas.width, canvas.height);
            }
            var saved_alpha = draw_context.globalAlpha;
            draw_context.globalAlpha = this.red_filter.intensity; // Set intensity
            draw_context.globalCompositeOperation = 'source-atop'; // set composite mode
            draw_context.drawImage(this.red_filter.canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
            draw_context.globalCompositeOperation = 'source-over'; // restore composite mode
            draw_context.globalAlpha = saved_alpha;
        }
        if (this.yellow_filter.intensity > 0) { // Do not use filter when it's invisible
            if (this.yellow_filter.canvas == null) { // Create filter on first use
                this.yellow_filter.canvas = document.createElement("canvas");
                this.yellow_filter.canvas.width = canvas.width;
                this.yellow_filter.canvas.height = canvas.height;
                this.yellow_filter.context = this.yellow_filter.canvas.getContext('2d');
                this.yellow_filter.context.fillStyle = 'rgba(225, 255, 0, 0.55)'; // yellow
                this.yellow_filter.context.fillRect(0, 0, canvas.width, canvas.height);
            }
            var saved_alpha = draw_context.globalAlpha;
            draw_context.globalAlpha = this.yellow_filter.intensity; // Set intensity
            draw_context.globalCompositeOperation = 'source-atop'; // set composite mode
            draw_context.drawImage(this.yellow_filter.canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
            draw_context.globalCompositeOperation = 'source-over'; // restore composite mode
            draw_context.globalAlpha = saved_alpha;
        }
    }
});

gEngine.factory['Player'] = PlayerClass;
var gamer_active = false; // Used to enable and disable active music