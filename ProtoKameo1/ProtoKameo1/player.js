// Artwork size constants
var start_tongue_med_segment = 46; // Pixel where the middle part of the tongue starts in the image Minus the half of the picture pixels
var tong_med_size = 34; // Size of the middle of the tongue that will be extended/repeated to extend tongue size
var tongue_offset = { x: 193, y: 16 }; // Offset of tongue start position from player body
var tongue_tilting_angle = 25; // This tilts the tongue to elevate the tip of the tongue to make it overlap the mouse
var max_tongue_frames = 4;

PlayerClass = EntityClass.extend({
    id: "Player",
    walkSpeed: 20,
    zindex: 50,
    currSpriteName: null,
    frame: 1,
    total_frames: 3,
    direction: true,
    move: false,
    tongue_frame: 0, // Number of frame drawn for the tongue
    miss_in_da_face: false, // When fire position is incorrect, just slap the tongue in the head
    tong_pos: { x: 0, y: 0 }, // Position of tongue start
    tong_fire_pos: { x: 0, y: 0 }, // Position of tongue end
    tong_offset: { x: tongue_offset.x, y: tongue_offset.y }, // Tongue start position offset from body
    tong_distance : 0,
    angle : 0,
    t_start : "kami-tongue-001.png",
    t_med : "kami-tongue-002.png",
    t_end : "kami-tongue-003.png",
    physBody: null, // This is hooking into the Box2D Physics library

    init: function (x, y) {
        this.parent(x, y);
    },

    update: function () {
        var move_dir = new Vec2(0, 0);
        move_dir.x = 0;
        move_dir.y = 0;
        if (gInput.actions['move-left']) { // adjust the move_dir by 1 in the x direction.
            move_dir.x -= 1;
            this.move = true;
            console.log("Muevo Izq");
        }
        if (gInput.actions['move-right']) { // adjust the move_dir by 1 in the x direction.
            move_dir.x += 1;
            this.move = true;
            console.log("Muevo Derch");
        }

        // After modifying the move_dir above, we check if the vector is non-zero. If it is, we adjust the vector length based on the player's walk speed.
        if (move_dir.LengthSquared()) {
            // First set 'move_dir' to a unit vector in the same direction it's currently pointing.
            move_dir.Normalize();
            // Next, multiply 'move_dir' by the player's set 'walkSpeed'. We do this in case we might want to change the player's walk speed due to a power-up, etc.
            move_dir.Multiply(this.walkSpeed);
        }

        ////////////////        gEngine.gPlayer0.mpPhysBody.SetLinearVelocity(move_dir.x, move_dir.y);
        // Fake physics
        this.pos.x += move_dir.x;
        this.pos.y += move_dir.y;
        ///console.log("Muevo a " + this.pos.x + "," + this.pos.y);

        // Tongue fire distance and angle from mouth calculations
        if (gInput.actions['fire-mouse']) { // Update tongue target position only after shoot, not during player movement either mouse move
            this.tong_fire_pos.x = gInput.mouse.x;
            this.tong_fire_pos.y = gInput.mouse.y;
        }
        this.tong_pos.x = this.pos.x + this.tong_offset.x;
        this.tong_pos.y = this.pos.y + this.tong_offset.y;
        var tong_size_x = this.tong_fire_pos.x - this.tong_pos.x;
        var tong_size_y = this.tong_fire_pos.y - this.tong_pos.y;
        this.tong_distance = Math.sqrt((tong_size_x * tong_size_x) + (tong_size_y * tong_size_y));
        var angle_tip_tongue_offset = Math.atan2(-tongue_tilting_angle, this.tong_distance); // This tilts the tongue to elevate the tip of the tongue to make it overlap the mouse
        this.angle = -Math.atan2(-tong_size_y, tong_size_x) + angle_tip_tongue_offset;
        if (gInput.actions['fire-mouse']) { // launch the sound for the tongue and the animation
            gInput.actions['fire-mouse'] = false;
            this.tongue_frame = 1; // Activate tongue animation
            if ((this.angle < -1.9078242687063418) || (this.angle > 0.065) || this.tong_distance < 100) { // Behind, below or too close fire will slap in the face
                this.miss_in_da_face = true;
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
    },

    //-----------------------------------------
    draw: function () {
        if (this.spritename) { // Draw character
            if (this.move) {
                if (this.direction) {
                    this.frame++;
                } else {
                    this.frame--;
                }
                if ((this.frame == 1) || (this.frame == this.total_frames)) { // Change direction when reached last frame of animation
                    this.direction = !this.direction;
                }
                this.move = false;
            }
            var real_spritename = this.spritename + this.frame + '.png';
            drawSprite(real_spritename, this.pos.x, this.pos.y);
            if (this.miss_in_da_face && (this.tongue_frame != 0)) { // Draw slap in da face!
                context.clearRect(this.pos.x + 123, this.pos.y - 25, 80, 62); // Clean up previous face
                context.clearRect(this.pos.x + 140, this.pos.y + 24, 80, 20); // Clean up previous face
                context.clearRect(this.pos.x + 112, this.pos.y - 96, 48, 48); // Clean up previous face
                drawSprite('kami-head-slap.png', this.pos.x + 163, this.pos.y - 25);
            }
        }
        if (this.tongue_frame != 0) { // Draw tongue
            if (!this.miss_in_da_face) {
                drawSprite(this.t_start, this.tong_pos.x, this.tong_pos.y, this.angle);
                var current_tong_pos_x = this.tong_pos.x;
                var current_tong_pos_y = this.tong_pos.y;
                var distance = this.tong_distance / (max_tongue_frames - this.tongue_frame);
                if (this.tong_distance < 200) { // Too short distance to display animation
                    distance = this.tong_distance
                }
                while (distance - start_tongue_med_segment > tong_med_size) { // Continue adding "middle tongue chunks" after tongue start until the tongue-end covers the rest of the distance until the mouse pos.
                    drawSprite(this.t_med, current_tong_pos_x, current_tong_pos_y, this.angle);
                    distance -= tong_med_size;
                    current_tong_pos_x += Math.cos(this.angle) * tong_med_size;
                    current_tong_pos_y += Math.sin(this.angle) * tong_med_size;
                }
                current_tong_pos_x -= Math.cos(this.angle) * (tong_med_size * 2.5);// Put tip of the tongue over medium part
                current_tong_pos_y -= Math.sin(this.angle) * (tong_med_size * 2.5);
                current_tong_pos_x += Math.cos(this.angle) * (distance - start_tongue_med_segment);// Extend tip of tongue progressively with mouse movement
                current_tong_pos_y += Math.sin(this.angle) * (distance - start_tongue_med_segment);
                drawSprite(this.t_end, current_tong_pos_x, current_tong_pos_y, this.angle);
                this.tongue_frame = (this.tongue_frame + 1) % (max_tongue_frames); // Less than half second at current FPS (10)
            } else {
                this.tongue_frame = (this.tongue_frame + 1) % (max_tongue_frames + (max_tongue_frames/2)); // Less than half second at current FPS (10)
            }
        }
    }
});

gEngine.factory['Player'] = PlayerClass;
var gamer_active = false; // Used to enable and disable active music