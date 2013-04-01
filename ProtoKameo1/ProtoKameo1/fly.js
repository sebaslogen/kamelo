
FlyClass = EntityClass.extend({
    id: "Fly",
    speed: 1,
    angle: 0,
    zindex: 30,
    rotation_dir: 1,
    _killed: false,
    markForDeath: false,
    escaped: false,
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
    onTouch: function (otherBody, point, impulse) {
        if (!this.physBody) return false;
        if (!otherBody.GetUserData()) return false;
        var physOwner = otherBody.GetUserData().ent;
        if (physOwner !== null) {
            if (physOwner._killed) return false;
            /////////////////////////////////////////////////////console.log("Collision between flies detected!");
            /* Disabled to use manual engine with mouse coordinates
            // Kill fly only when the tongue touches it
            if (otherBody.GetUserData() && (otherBody.GetUserData().id != "Fly")) { // Something collided with me that was not a Fly!
                this.markForDeath = true; // Kill when touched
                console.log("This fly has been captured and it's going to die!!!");
            }*/
        }
        return true;
    },

    update: function () { //Update positions
        if (this.markForDeath == true) {
            this.kill();
            return;
        }
        var angle_variation = Math.floor(Math.random() * 360);
        if ((this.pos.x > canvas.width + (this.size.width / 2)) || (this.pos.y > canvas.height - 200) ||
            (this.pos.x < -(this.size.width / 2)) || (this.pos.y < -(this.size.height / 2))) {
            if (this.escaped) { // Fly is still stuck in danger zone, let her recover continuing moving on the same direction as before
                angle_variation = 0;
                if ((this.pos.x > canvas.width + 80) || (this.pos.y > canvas.height + 80) || (this.pos.x < -80) || (this.pos.y < -80)) {
                    this.markForDeath = true;
                    console.log("Fly is out of screen and it's going to suicide!!!");
                }
            } else {
                this.escaped = true;
                angle_variation = 180; // Go in the oppositte direction
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
        var new_degress = (new_radians * (180 / Math.PI)) % 360; // Reduce number to avoid unnecessary variable size increasing
        new_radians = new_degress * (Math.PI / 180);
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
            this.size.width = sprite.w;
            this.size.height = sprite.h;
        }
    },

    updateCatch: function (fire_x, fire_y) { // Update collisions with the tongue tip a.k.a. mouse position
        var tongue = { left: fire_x - 20, right: fire_x + 20, top: fire_y - 20, bottom: fire_y + 20 };
        var fly = { left: this.pos.x - 20, right: this.pos.x + 20, top: this.pos.y - 20, bottom: this.pos.y + 20 };
        if (!(tongue.left > fly.right ||
             tongue.right < fly.left ||
             tongue.top > fly.bottom ||
             tongue.bottom < fly.top)) {
            this.markForDeath = true; // Kill when touched
            console.log("This fly has been captured and it's going to die!!!");
            launchSlapSound();
            return true;
        }
    },

    //-----------------------------------------
    draw: function () {
        if (this.spritename) { // Draw cloud
            if (this.markForDeath) {
                drawSprite('dead-fly.png', this.pos.x, this.pos.y, this.angle, context);
            } else {
                var real_spritename = this.spritename + '.png';
                drawSprite(real_spritename, this.pos.x, this.pos.y, this.angle, context);
            }
        }
    }
});

gEngine.factory['Fly'] = FlyClass;