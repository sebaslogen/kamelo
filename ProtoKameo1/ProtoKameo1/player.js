
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
            console.log("Lengüetazo!!!");
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
            //////console.log("Move is " + this.move + " " + real_spritename);
            drawSprite(real_spritename, this.pos.x, this.pos.y);
        }
        if (this.tongue_frame != 0) {
            var offset_x = 475 - 250;
            var offset_y = 116 - 116;
            var tong_pos_x = this.pos.x + offset_x;
            var tong_pos_y = this.pos.y + offset_y;
            var dist_x = gInput.mouse.x - tong_pos_x;
            var dist_y = gInput.mouse.y - tong_pos_y;
            this.angle = -Math.atan2(-dist_y, dist_x) - 0.25;
            console.log("Distance of click " + dist_x + "," + dist_y + " and angle:" + this.angle);
            drawSprite(this.t_med, tong_pos_x, tong_pos_y, this.angle);
            drawSprite(this.t_start, tong_pos_x, tong_pos_y, this.angle);
            drawSprite(this.t_end, tong_pos_x, tong_pos_y, this.angle);
            this.tongue_frame = (this.tongue_frame + 1) % 6; // Half second at 10 FPS
        }
    }
});

gEngine.factory['Player'] = PlayerClass;
var gamer_active = false; // Used to enable and disable active music