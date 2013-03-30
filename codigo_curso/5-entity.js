
EnergyCanisterClass = EntityClass.extend({
    physBody: null,
    _killed: false,

    init: function (x, y, settings) {
        this.parent(x, y, settings);
        
        var startPos = {
            x: x,
            y: y
        };

        // Create our physics body;
        var entityDef = {
            id: "EnergyCanister",
            type: 'static',
            x: startPos.x,
            y: startPos.y,
            halfHeight: 18 * 0.5,
            halfWidth: 19 * 0.5,
            damping: 0,
            angle: 0,
            categories: ['projectile'],
            collidesWith: ['player'],
            userData: {
                "id": "EnergyCanister",
                "ent": this
            }
        };

        this.physBody = gPhysicsEngine.addBody(entityDef);
        this.physBody.SetLinearVelocity(new Vec2(0, 0));
    },

    //-----------------------------------------
    kill: function () {
        // Remove my physics body
        gPhysicsEngine.removeBody(this.physBody);
        this.physBody = null;

        // Destroy me as an entity
        this._killed = true;
    },

    //-----------------------------------------
    onTouch: function (otherBody, point, impulse) {
        if(!this.physBody) return false;
        if(!otherBody.GetUserData()) return false;

        var physOwner = otherBody.GetUserData().ent;
        

        if(physOwner !== null) {
            if(physOwner._killed) return false;

            // Increase the 'energy' property of 'physOwner' by
            // 10 when it touches this EnergyCanister.
            //
            // YOUR CODE HERE
            physOwner.energy += 10;

            this.markForDeath = true;
        }

        return true;
    }

});

gGameEngine.factory['EnergyCanister'] = EnergyCanisterClass;

