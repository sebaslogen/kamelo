
FlyClass = EntityClass.extend({
    id: "Fly",
    count_id: "Fly",
    speed: 1,
    angle: 0,
    zindex: 30,
    rotation_dir: 1,
    _killed: false,
    markForDeath: false,
    escaped: false,
    time_trapped: 0,
    evil: false,
    physBody: null, // This is hooking into the Box2D Physics library

    init: function (x, y) {
        this.parent(x, y);

        var startPos = {
            x: x,
            y: y
        };

        var entityDef = { // Create our physics body;
            id: "Fly",
            type: 'dynamic',
            x: startPos.x,
            y: startPos.y,
            halfHeight: 40, // Bounding collision box size for a fly
            halfWidth: 40,
            angle: 0,
            userData: {
                "id": "Fly",
                "ent": this
            }
        };

        this.physBody = gPhysicsEngine.addBody(entityDef);
        this.physBody.SetLinearVelocity(new Vec2(0, 0));
        this.physBody.linearDamping = 0;
    },

    //-----------------------------------------
    kill: function () {
        gPhysicsEngine.removeBody(this.physBody); // Remove my physics body
        this.physBody = null;
        this._killed = true; // Destroy me as an entity
    },

    //-----------------------------------------
    // Disabled to use manual engine with mouse coordinates
    /*onTouch: function (otherBody, point, impulse) {
        if (!this.physBody) return false;
        if (!otherBody.GetUserData()) return false;
        var physOwner = otherBody.GetUserData().ent;
        if (physOwner !== null) {
            if (physOwner._killed) return false;
            //launchSound('flyby');
            //console.log("Collision between flies detected!");            
            // Kill fly only when the tongue touches it
            if (otherBody.GetUserData() && (otherBody.GetUserData().id != "Fly")) { // Something collided with me that was not a Fly!
                this.markForDeath = true; // Kill when touched
                console.log("This fly has been captured and it's going to die!!!");
            }
        }
        return true;
    },*/

    update: function () { //Update positions
        if (this.markForDeath == true) {
            this.kill();
            return;
        }
        var angle_variation = Math.floor(Math.random() * 360);
        if ((this.pos.x > canvas.width + (this.size.width / 2)) || (this.pos.y > canvas.height - 200) ||
            (this.pos.x < -(this.size.width / 2)) || (this.pos.y < -(this.size.height / 2))) {
            if (this.escaped) { // Fly is still stuck in danger zone, let her recover continuing moving on the same direction as before
                if ((this.pos.x > canvas.width + 80) || (this.pos.y > canvas.height + 80) || (this.pos.x < -80) || (this.pos.y < -80) ||
                    (((new Date()).getTime() / 1000) - this.time_trapped > 5)) {
                    // Suicide when very far of the screen or trapped outside boundaries for long period
                    this.markForDeath = true;
                    console.log("Fly is out of screen and it's going to suicide!!! ID:" + this.count_id);
                }
                angle_variation = 0;
            } else {
                this.escaped = true;
                angle_variation = 180; // Go in the oppositte direction
                this.time_trapped = (new Date()).getTime() / 1000;
            }
        } else {
            this.escaped = false;
            if ((Math.floor(Math.random() * 100) % 97) != 0) { // High random chance of a very small angle change in the movement direction
                angle_variation = angle_variation / 30; // Constant minimum variance in angle direction
            } else if ((angle_variation % 7) == 0) {
                this.rotation_dir = -this.rotation_dir; // Every few random times change the rotation angle direction
            }
        }
        var radians = angle_variation * (Math.PI / 180);
        var new_radians = (this.rotation_dir * radians) + this.angle;
        var new_degrees = (new_radians * (180 / Math.PI)) % 360; // Reduce number to avoid unnecessary variable size increasing
        new_radians = new_degrees * (Math.PI / 180);
        this.physBody.SetAngle(new_radians);
        var move_dir = new Vec2(0, 0);
        move_dir.x = this.speed * Math.cos(this.physBody.GetAngle());
        move_dir.y = this.speed * Math.sin(this.physBody.GetAngle());

        // After modifying the move_dir above, we check if the vector is non-zero. If it is, we adjust the vector length based on the player's walk speed.
        if (move_dir.LengthSquared()) {
            move_dir.Normalize(); // First set 'move_dir' to a unit vector in the same direction it's currently pointing.
            move_dir.Multiply(this.speed); // Next, multiply 'move_dir' by the entity's set 'speed'
        }
        this.physBody.SetLinearVelocity(move_dir);
        if (this.size.width == 0 && this.size.height == 0) { // Set object width and high based on sprite size after loading image
            var sprite = getSprite(this.spritename + '.png');
            if ((typeof sprite !== 'undefined') && (sprite != null) && (sprite.w != null) && (sprite.h != null)) {
                this.size.width = sprite.w;
                this.size.height = sprite.h;
            }
        }
    },

    updateCatch: function (fire_x, fire_y) { // Update collisions with the tongue tip a.k.a. mouse position
        if (!this.markForDeath) {
            var fuzz = 30;
            var tongue = { left: fire_x - fuzz, right: fire_x + fuzz, top: fire_y - fuzz, bottom: fire_y + fuzz };
            var fly = { left: this.pos.x - fuzz, right: this.pos.x + fuzz, top: this.pos.y - fuzz, bottom: this.pos.y + fuzz };
            if (!(tongue.left > fly.right ||
                 tongue.right < fly.left ||
                 tongue.top > fly.bottom ||
                 tongue.bottom < fly.top)) {
                this.markForDeath = true; // Kill when touched
                console.log("This fly has been captured and it's going to die!!! ID:" + this.count_id);
                return true;
            }
        }
    },

    //-----------------------------------------
    draw: function () {
        if (this.spritename) {
            if (this.evil) { // Evil halo
                if (evil_fly_halo_canvas == null) { // Create the halo only once and paint it several times
                    evil_fly_halo_canvas = document.createElement("canvas");
                    evil_fly_halo_canvas.width = this.size.width * 2;
                    evil_fly_halo_canvas.height = this.size.height * 2;
                    var local_context = evil_fly_halo_canvas.getContext('2d');
                    var grd = local_context.createRadialGradient(this.size.width, this.size.height, 1, this.size.width, this.size.height, this.size.width);
                    grd.addColorStop(1, 'rgba(10,200,20,0)');
                    grd.addColorStop(0, 'rgba(0,0,0,1)');
                    local_context.fillStyle = grd;
                    local_context.fillRect(0, 0, this.size.width * 2, this.size.height * 2);
                }
                if (evil_fly_halo_canvas != null)
                    context.drawImage(evil_fly_halo_canvas, 0, 0, this.size.width * 2, this.size.height * 2, this.pos.x - this.size.width, this.pos.y - this.size.height, this.size.width * 2, this.size.height * 2);
            }
            if (this.markForDeath) {
                if (dead_fly_halo_canvas == null) { // Create the halo only once and paint it several times
                    dead_fly_halo_canvas = document.createElement("canvas");
                    dead_fly_halo_canvas.width = this.size.width * 2;
                    dead_fly_halo_canvas.height = this.size.height * 2;
                    var local_context = dead_fly_halo_canvas.getContext('2d');
                    var grd = local_context.createRadialGradient(this.size.width, this.size.height, 1, this.size.width, this.size.height, this.size.width);
                    grd.addColorStop(1, 'rgba(10,10,15,0)');
                    grd.addColorStop(0, 'rgba(0,0,0,1)');
                    local_context.fillStyle = grd;
                    local_context.fillRect(0, 0, this.size.width * 2, this.size.height * 2);
                }
                context.drawImage(dead_fly_halo_canvas, 0, 0, this.size.width * 2, this.size.height * 2, this.pos.x - this.size.width, this.pos.y - this.size.height, this.size.width * 2, this.size.height * 2);
                drawSprite('dead-fly.png', this.pos.x, this.pos.y, this.angle, context);
            } else {
                var real_spritename = this.spritename + '.png';
                drawSprite(real_spritename, this.pos.x, this.pos.y, this.angle, context);
            }
        }
    }
});

gEngine.factory['Fly'] = FlyClass;