
FlyClass = EntityClass.extend({
    id: "Fly",
    speed: 50,
    angle: 0,
    zindex: 30,
    _killed: false,
    markForDeath: false,
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
    },

    //-----------------------------------------
    kill: function () {
        gPhysicsEngine.removeBody(this.physBody); // Remove my physics body
        this.physBody = null;
        this._killed = true; // Destroy me as an entity
    },

    //-----------------------------------------
    onTouch: function (otherBody, point, impulse) {
        if(!this.physBody) return false;
        if(!otherBody.GetUserData()) return false;
        var physOwner = otherBody.GetUserData().ent;
        if (physOwner !== null) {
            if (physOwner._killed) return false;
            // Kill fly only when the tongue touches it
            if (otherBody.GetUserData() && (otherBody.GetUserData().id != "Fly")) { // TODO change != fly for == "Tongue"
                this.markForDeath = true; // Kill when touched
                console.log("This fly has been touched and it's going to die!");
            }
        }
        return true;
    },

    update: function () { //Update positions
        if (this.markForDeath == true) {
            this.kill();
            return;
        }
        var move_dir = new Vec2(0, 0);
        if (Math.floor(Math.random() * 10) > 5) {
            move_dir.x = this.speed / 100;
            move_dir.y = 0;
            /****if (this.pos.x > 1650) {
                //this.pos.x = 2100;
                console.log("Fly is resetting position in X for out of screen");
                this.physBody.SetPosition(-50, this.physBody.GetPosition().y);
            }*/
        }
        // After modifying the move_dir above, we check if the vector is non-zero. If it is, we adjust the vector length based on the player's walk speed.
        if (move_dir.LengthSquared()) {
            move_dir.Normalize(); // First set 'move_dir' to a unit vector in the same direction it's currently pointing.
            move_dir.Multiply(this.speed); // Next, multiply 'move_dir' by the entity's set 'speed'
        }
        
        this.physBody.SetLinearVelocity(move_dir);
        //////////////////////////console.log("Getting linear velocity:" + move_dir.x + "," + move_dir.y);
        //////////////////////////console.log("moved fly to position:" + this.pos.x + "," + this.pos.y);
    },

    //-----------------------------------------
    draw: function () {
        if (this.spritename) { // Draw cloud
            var real_spritename = this.spritename + '.png';
            drawSprite(real_spritename, this.pos.x, this.pos.y, this.angle, context);
        }
    }
});

gEngine.factory['Fly'] = FlyClass;