
PlayerClass = EntityClass.extend({
    pos: { x: 250, y: 500 },
    walkSpeed: 20,
    zindex: 50,
    currSpriteName: null,
    frame: 1,
    total_frames: 3,
    direction: true,
    move: false,
    tongue_frame: 0,
    tong_fire_pos : {x: 0, y: 0},
    tong_offset : {x : 475 - 250, y : 116 - 116},
    tong_center: { x: 15, y: 20 },
    angle : 0,
    t_start : "kami-tongue-001.png",
    t_med : "kami-tongue-002.png",
    t_end : "kami-tongue-003.png",
    // This is hooking into the Box2D Physics library
    mpPhysBody: new BodyDef(),

    // can all be overloaded by child classes
    update: function () {
        gEngine.move_dir.x = 0;
        gEngine.move_dir.y = 0;
        if (gInput.actions['move-left']) { // adjust the move_dir by 1 in the x direction.
            gEngine.move_dir.x -= 1;
            this.move = true;
            console.log("Muevo Izq");
        }
        if (gInput.actions['move-right']) { // adjust the move_dir by 1 in the x direction.
            gEngine.move_dir.x += 1;
            this.move = true;
            console.log("Muevo Derch");
        }
        //if (gInput.actions['fire-tongue']) { // launch the sound for the tongue
        if (gInput.actions['fire-mouse']) {
            gInput.actions['fire-mouse'] = false;
            ///////////////////////////// console.log("Lengüetazo!!!");
            this.tong_fire_pos.x = gInput.mouse.x;
            this.tong_fire_pos.y = gInput.mouse.y;
            this.tongue_frame = 1; // Activate tongue animation
            launchTongueSound();
            if (!gamer_active) {
                launchClip(game_music, 'music');
                gamer_active = true;
                sound_atmos.fadeOut(0.0, 5000, null);
            }
        }

        // After modifying the move_dir above, we check if the vector is non-zero. If it is, we adjust the vector length based on the player's walk speed.
        if (gEngine.move_dir.LengthSquared()) {
            // First set 'move_dir' to a unit vector in the same direction it's currently pointing.
            gEngine.move_dir.Normalize();
            // Next, multiply 'move_dir' by the player's set 'walkSpeed'. We do this in case we might want to change the player's walk speed due to a power-up, etc.
            gEngine.move_dir.Multiply(this.walkSpeed);
        }

        ////////////////        gEngine.gPlayer0.mpPhysBody.SetLinearVelocity(gEngine.move_dir.x, gEngine.move_dir.y);
        // Fake physics
        this.pos.x += gEngine.move_dir.x;
        this.pos.y += gEngine.move_dir.y;
        ///console.log("Muevo a " + this.pos.x + "," + this.pos.y);
    },

    //-----------------------------------------
    draw: function () {
        // Tongue fire distance and angle from mouth calculations
        var miss_in_da_face = false;
        var tong_pos_x = this.pos.x + this.tong_offset.x;
        var tong_pos_y = this.pos.y + this.tong_offset.y;
        var tong_size_x = this.tong_fire_pos.x - tong_pos_x;
        var tong_size_y = this.tong_fire_pos.y - tong_pos_y;
        this.angle = -Math.atan2(-tong_size_y, tong_size_x);
        if ((this.angle < -1.9078242687063418) || (this.angle > 0.29715340521870326)) {
            miss_in_da_face = true;
        }
        if (this.spritename) {
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
            if (miss_in_da_face && (this.tongue_frame != 0)) {
                /////////////////////////////   real_spritename = '.png';
                console.log("Painting new face");
            }
            //////console.log("Move is " + this.move + " " + real_spritename);
            drawSprite(real_spritename, this.pos.x, this.pos.y);
        }
        if (this.tongue_frame != 0) {
            /////////////////////////////console.log("Distance of click " + tong_size_x + "," + tong_size_y + " and angle:" + this.angle);
            if (!miss_in_da_face) {
                var distance = Math.sqrt((tong_size_x * tong_size_x) + (tong_size_y * tong_size_y));
                var start_med = 66;
                var tong_med_size = 45;
                var current_tong_pos_x = tong_pos_x;// - start_med;
                var current_tong_pos_y = tong_pos_y;
                console.log("Distance " + distance);
                while (distance - start_med > tong_med_size) { // Continue adding "middle tongue chunks" after tongue start until the tongue-end covers the rest of the distance until the mouse pos.
                    drawSprite(this.t_med, current_tong_pos_x, current_tong_pos_y, this.tong_center.x, this.tong_center.y, this.angle);
                    distance -= tong_med_size;
                    current_tong_pos_x += Math.cos(this.angle) * tong_med_size;
                    current_tong_pos_y += Math.sin(this.angle) * tong_med_size;
                }
                current_tong_pos_x -= Math.cos(this.angle) * tong_med_size;
                current_tong_pos_y -= Math.sin(this.angle) * tong_med_size;
                console.log("Distance leftover " + distance);
                drawSprite(this.t_end, current_tong_pos_x, current_tong_pos_y, this.tong_center.x, this.tong_center.y, this.angle);
                drawSprite(this.t_start, tong_pos_x, tong_pos_y, this.tong_center.x, this.tong_center.y, this.angle);
            }
            this.tongue_frame = (this.tongue_frame + 1) % ((FPS/2) + 1); // Half second at current FPS (10)
        }
    }
});

gEngine.factory['Player'] = PlayerClass;
var gamer_active = false; // Used to enable and disable active music