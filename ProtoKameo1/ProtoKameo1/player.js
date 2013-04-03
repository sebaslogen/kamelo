// Artwork size constants
var start_tongue_med_segment = 46; // Pixel where the middle part of the tongue starts in the image Minus the half of the picture pixels
var tong_med_size = 34; // Size of the middle of the tongue that will be repeated to extend tongue size
var tongue_offset = { x: 193, y: 16 }; // Offset of tongue start position from player body
var tongue_tilting_angle = 25; // This tilts the tongue to elevate the tip of the tongue to make it overlap the mouse
var max_tongue_frames = 3;
var max_tongue_size = 700;
var max_eye_sprites = 8;

PlayerClass = EntityClass.extend({
    id: "Player",
    points: 0,
    walkSpeed: 20,
    zindex: 50,
    currSpriteName: null,
    frame: 1,
    total_frames: 3,
    direction: true,
    moving: false,
    last_eye_changed: 0,
    current_eye: 1,
    tongue_frame: 0, // Number of frame drawn for the tongue
    miss_in_da_face: false, // When fire position is incorrect, just slap the tongue in the head
    tong_pos: { x: 0, y: 0 }, // Position of tongue start
    tong_fire_pos: { x: 0, y: 0 }, // Position of tongue end
    tong_offset: { x: tongue_offset.x, y: tongue_offset.y }, // Tongue start position offset from body
    tong_distance : 0,
    angle : 0,
    t_start : "kami-tongue-001.png",
    t_med : "kami-tongue-002.png",
    t_end: "kami-tongue-003.png",
    physBody: null, // This is hooking into the Box2D Physics library

    init: function (x, y) {
        this.parent(x, y);

        var startPos = {
            x: x,
            y: y
        };

        var entityDef = { // Create our physics body;
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

        this.physBody = gPhysicsEngine.addBody(entityDef);
        this.physBody.SetLinearVelocity(new Vec2(0, 0));
        this.physBody.linearDamping = 0;
    },

    update: function () {
        var move_dir = new Vec2(0, 0);
        move_dir.x = 0;
        move_dir.y = 0;
        if ((gInput.actions['move-left']) && (this.pos.x > 100)) { // adjust the move_dir by 1 in the x direction.
            move_dir.x -= 1;
            this.moving = true;
            console.log("Muevo Izq");
        }
        if ((gInput.actions['move-right']) && (this.pos.x < canvas.width - 150)) { // adjust the move_dir by 1 in the x direction.
            move_dir.x += 1;
            this.moving = true;
            console.log("Muevo Derch");
        }
        // Fake physics, simply move in x axis
        if (move_dir.LengthSquared()) {// After modifying the move_dir above, we check if the vector is non-zero. If it is, we adjust the vector length based on the player's walk speed.
            move_dir.Normalize(); // First set 'move_dir' to a unit vector in the same direction it's currently pointing.
            move_dir.Multiply(this.walkSpeed); // Next, multiply 'move_dir' by the player's set 'walkSpeed'. We do this in case we might want to change the player's walk speed due to a power-up, etc.
        }        
        this.pos.x += move_dir.x;
        this.pos.y += move_dir.y;

        /// Graphical tongue representation ///
        // Tongue fire distance and angle from mouth calculations
        // Step 1 record hit position //
        if (gInput.actions['fire-mouse']) { // Update tongue TARGET position only after shoot, not during player movement either mouse move
            this.tong_fire_pos.x = gInput.mouse.x;
            this.tong_fire_pos.y = gInput.mouse.y;
        }
        // Step 2 calculate distance and angle from player to hit position //
        if (gInput.actions['fire-mouse'] || (this.tongue_frame != 0)) {// Keep updating tongue position while the tongue is out
            this.tong_pos.x = this.pos.x + this.tong_offset.x;
            this.tong_pos.y = this.pos.y + this.tong_offset.y;
            var tong_size_x = this.tong_fire_pos.x - this.tong_pos.x;
            var tong_size_y = this.tong_fire_pos.y - this.tong_pos.y;
            this.tong_distance = Math.sqrt((tong_size_x * tong_size_x) + (tong_size_y * tong_size_y));
            if (this.tong_distance > max_tongue_size) {
                this.tong_distance = max_tongue_size;
            }
            var angle_tip_tongue_offset = Math.atan2(-tongue_tilting_angle, this.tong_distance); // This tilts the tongue to elevate the tip of the tongue to make it overlap the mouse
            this.angle = -Math.atan2(-tong_size_y, tong_size_x) 
            if (this.tong_distance == max_tongue_size) { // Undo all math calculations to return the position of the cursor(tongue tip) in a limited tongue
                this.tong_fire_pos.x = (Math.cos(this.angle) * max_tongue_size) + this.tong_pos.x;
                this.tong_fire_pos.y = (Math.sin(this.angle) * max_tongue_size) + this.tong_pos.y;
            }
            this.angle += angle_tip_tongue_offset;
        }
        // Step 3 Activate animations and sound //
        if (gInput.actions['fire-mouse']) { // launch the sound for the tongue and the animation
            gInput.actions['fire-mouse'] = false;
            this.tongue_frame = 1; // Activate tongue animation
            if ((this.angle < -1.9078242687063418) || (this.angle > 0.065) || this.tong_distance < 100) { // Behind, below or too close fire will slap in the face
                this.miss_in_da_face = true; // Not possible to hit target position
                launchSlapSound();
            } else {
                this.miss_in_da_face = false;
                launchTongueSound();
            }
            if (!gamer_active) { // Activate music when player gets active and starts hitting
                launchClip(game_music, 'music');
                gamer_active = true;
                sound_atmos.fadeOut(0.0, 5000, null);
            }
        }
        /* /// Physical tongue representation ///
            For now it's done without physics engine because I want to collide only the tip of the tongue on the mouse click coordinates */
        if (this.size.width == 0 && this.size.height == 0) {
            var sprite = getSprite(this.spritename + '1.png');
            this.size.width = sprite.w;
            this.size.height = sprite.h;
        }
    },

    //-----------------------------------------
    draw: function () {
        if (this.spritename) { // Draw character
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
            drawSprite(real_spritename, this.pos.x, this.pos.y, null, player_context);
            if (this.miss_in_da_face && (this.tongue_frame != 0)) { // Draw slap in da face!
                player_context.clearRect(this.pos.x + 123, this.pos.y - 25, 80, 62); // Clean up previous face
                player_context.clearRect(this.pos.x + 140, this.pos.y + 24, 80, 20); // Clean up previous face
                player_context.clearRect(this.pos.x + 112, this.pos.y - 96, 48, 48); // Clean up previous face
                drawSprite('kami-head-slap.png', this.pos.x + 163, this.pos.y - 25, null, player_context);
            } else { // Draw different face animations
                var now = (new Date()).getTime() / 10;
                if (now - this.last_eye_changed > 70) { // Every less than a second it's possible to change the eye
                    this.last_eye_changed = now;
                    this.current_eye = Math.floor(Math.random() * (max_eye_sprites + 1));
                }
                if (this.current_eye != 0) { // Draw a new eye on top of the default eye
                    drawSprite('kami-eye-00' + this.current_eye + '.png', this.pos.x + 162, this.pos.y - 37, null, player_context);
                }
            }
            this.change_color(real_spritename, this.pos.x, this.pos.y, this.angle, 8 * this.points, -2*this.points, -2*this.points, player_context); // Color player character
        }
        if (this.tongue_frame != 0) { // Draw tongue
            if (!this.miss_in_da_face) {
                drawSprite(this.t_start, this.tong_pos.x, this.tong_pos.y, this.angle, player_context);
                var current_tong_pos_x = this.tong_pos.x;
                var current_tong_pos_y = this.tong_pos.y;
                var distance = this.tong_distance / (max_tongue_frames - this.tongue_frame);
                if (this.tong_distance < 200) { // Too short distance to display animation
                    distance = this.tong_distance
                }
                while (distance - start_tongue_med_segment > tong_med_size) { // Continue adding "middle tongue chunks" after tongue start until the tongue-end covers the rest of the distance until the mouse pos.
                    drawSprite(this.t_med, current_tong_pos_x, current_tong_pos_y, this.angle, player_context);
                    distance -= tong_med_size;
                    current_tong_pos_x += Math.cos(this.angle) * tong_med_size;
                    current_tong_pos_y += Math.sin(this.angle) * tong_med_size;
                }
                current_tong_pos_x -= Math.cos(this.angle) * (tong_med_size * 2);// Put tip of the tongue over medium part
                current_tong_pos_y -= Math.sin(this.angle) * (tong_med_size * 2);
                current_tong_pos_x += Math.cos(this.angle) * (distance - start_tongue_med_segment);// Extend tip of tongue progressively with mouse movement
                current_tong_pos_y += Math.sin(this.angle) * (distance - start_tongue_med_segment);
                drawSprite(this.t_end, current_tong_pos_x, current_tong_pos_y, this.angle, player_context);
                this.tongue_frame = (this.tongue_frame + 1) % (max_tongue_frames); // Less than half second at current FPS (10)
            } else { // How long to draw slap in da face
                this.tongue_frame = (this.tongue_frame + 1) % (max_tongue_frames + (max_tongue_frames/2)); // A little bit longer than a tongue animation
            }
        }
    },

    change_color: function (spritename, posX, posY, angle, red, green, blue, draw_context) {
        var sprite = getSprite(spritename);
        var pos = { x: posX - (sprite.w / 2), y: posY - (sprite.h / 2) };
        var imageData = draw_context.getImageData(pos.x, pos.y, sprite.w+25, sprite.h);
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            data[i] = red + data[i]; // red
            data[i + 1] = green + data[i + 1]; // green
            data[i + 2] = blue + data[i + 2]; // blue
        }
        // overwrite original image
        draw_context.putImageData(imageData, pos.x, pos.y);
    }
});

gEngine.factory['Player'] = PlayerClass;
var gamer_active = false; // Used to enable and disable active music