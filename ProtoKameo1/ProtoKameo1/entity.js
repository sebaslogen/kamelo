
EntityClass = Class.extend({
    // can all be referenced by child classes
    pos: { x: 0, y: 0 },
    size: { x: 0, y: 0 },
    last: { x: 0, y: 0 },
    currSpriteName: null,
    zindex: 0,
    frame: 1,
    total_frames: 3,
    direction: true,
    move: false,

    // can all be overloaded by child classes
    update: function () {
        gEngine.move_dir.x = 0;
        gEngine.move_dir.y = 0;
        if (gInput.actions['move-left']) {
            // adjust the move_dir by 1 in the x direction.
            gEngine.move_dir.x -= 1;
            this.move = true;
            console.log("Muevo Izq");
        }
        if (gInput.actions['move-right']) {
            // adjust the move_dir by 1 in the x direction.
            gEngine.move_dir.x += 1;
            this.move = true;
            console.log("Muevo Derch");
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
            /// drawSprite(this.spritename, this.pos.x.round() - this.hsize.x, this.pos.y.round() - this.hsize.y);
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
            console.log("Move is " + this.move + " " + real_spritename);
            context.clearRect(0, 0, canvas.width, canvas.height); // Clean up screen
            drawSprite(real_spritename, this.pos.x, this.pos.y);
        }
    }
});
