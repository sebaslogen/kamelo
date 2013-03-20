
EngineClass = Class.extend({

    move_dir: new Vec2(0, 0),
    dirVec: new Vec2(0, 0),

    entities: [],
    factory: {},
    _deferredKill: [],

    gPlayer0: {  ///// Player0 is not used in this implementation /////
        pos: {
            x: 100,
            y: 100
        },
        walkSpeed: 1,
        // This is hooking into the Box2D Physics library. We'll be going over this in more detail later.
        mpPhysBody: new BodyDef()
    },

    //-----------------------------
    setup: function () {
        // Call our input setup method to bind our keys to actions and set the event listeners.
        gInput.setup();
        //////////gMap = new TILEDMapClass();
    },

    spawnEntity: function (typename) {
        var ent = new (gEngine.factory[typename])();

        gEngine.entities.push(ent);

        return ent;
    },

    removeEntity: function (removeEnt) {
        // We don't do anything with this right now.
        // We'll fill it in later this unit.
    },

    update: function () {
        // Update player position from previous unit.
        gEngine.updatePlayer();

        // Loop through the entities and call that entity's 'update' method, but only do it if that entity's '_killed' flag is set to true.
        for (var i = 0; i < gEngine.entities.length; i++) {
            var ent = gEngine.entities[i];
            if (!ent._killed) {
                ent.update();
            } else { // Otherwise, push that entity onto the '_deferredKill' list defined above.
                gEngine._deferredKill.push(ent);
            }
        }

        // Loop through the '_deferredKill' list and remove each entity in it from the 'entities' list.
        for (var j = 0; j < gEngine._deferredKill.length; j++) {
            gEngine.entities.erase(gEngine._deferredKill[j]);
        }
        gEngine._deferredKill = []; // Once you're done looping through '_deferredKill', set it back to the empty array, indicating all entities in it have been removed from the 'entities' list.

        // Update sound world
        // Atmos loop
        console.log(sound_atmos.pos());
        if (sound_atmos.pos() >= 20.0)
        {
            if (!sound_atmos_retriggered)
            {
                sound_atmos_retriggered = true;
                // Trigger atmos sound again
                launchclip(sound_atmos,'atmos');
            }
        }
        else
        {
            sound_atmos_retriggered = false;
        }
    },

    //-----------------------------
    draw: function () {
        // Draw map. Note that we're passing a canvas context of 'null' in. This would normally be our game context, but we don't need to grade this here.
        /////////////////////////////////////////////////////////gMap.draw(null);

        // Bucket entities by zIndex
        var fudgeVariance = 128;
        var zIndex_array = [];
        var entities_bucketed_by_zIndex = {};
        gEngine.entities.forEach(function (entity) {
            //don't draw entities that are off screen
            /*                          if (entity.pos.x >= gMap.viewRect.x - fudgeVariance &&
               entity.pos.x < gMap.viewRect.x + gMap.viewRect.w + fudgeVariance &&
               entity.pos.y >= gMap.viewRect.y - fudgeVariance &&
               entity.pos.y < gMap.viewRect.y + gMap.viewRect.h + fudgeVariance)*/ {
                // Bucket the entities in the entities list by their zindex property.
                if (!entities_bucketed_by_zIndex[entity.zindex]) {
                    entities_bucketed_by_zIndex[entity.zindex] = [];
                }
                entities_bucketed_by_zIndex[entity.zindex].push(entity);
                if (!zIndex_array[entity.zindex]) {
                    zIndex_array[entity.zindex] = entity.zindex;
                }
            }
        });

        // Draw entities sorted by zIndex
        zIndex_array.forEach(function (zindex) {
            entities_bucketed_by_zIndex[zindex].forEach(function (entity) {
                entity.draw();
            });
        });
    },

    updatePlayer: function () {

        // move_dir is a Vec2 object from the Box2d
        // physics library, which is of the form
        // {
        //     x: 0,
        //     y: 0
        // }
        //
        // We'll be going more into Box2D later in the course. The Vec2 constructor takes an initial x and y value to set the vector to.

        if (gInput.actions['move-left']) {
            // adjust the move_dir by 1 in the x direction.
            gEngine.move_dir.x -= 1;
            console.log("Muevo Izq");
        }
        if (gInput.actions['move-right']) {
            // adjust the move_dir by 1 in the x direction.
            gEngine.move_dir.x += 1;
            console.log("Muevo Derch");
        }

        // Added by Tapi March 19 2013 => triggering the sound when firing
        if (gInput.actions['fire-tongue']) {
            // launch the sound for the tongue
            console.log("Pulso Espacio");
            launchtongue();
        }

        if (gInput.actions['stop-background']) {
            // launch the sound for the tongue
            playing = false;
            sound_atmos.fadeOut(0.0,2500,null);
            console.log("Pulso 'S'");
        }

        // After modifying the move_dir above, we check if the vector is non-zero. If it is, we adjust the vector length based on the player's walk speed.
        if (gEngine.move_dir.LengthSquared()) {
            // First set 'move_dir' to a unit vector in the same direction it's currently pointing.
            gEngine.move_dir.Normalize();

            // Next, multiply 'move_dir' by the player's set 'walkSpeed'. We do this in case we might want to change the player's walk speed due to a power-up, etc.
            gEngine.move_dir.Multiply(gEngine.gPlayer0.walkSpeed);
        }

        ////////////////        gEngine.gPlayer0.mpPhysBody.SetLinearVelocity(gEngine.move_dir.x, gEngine.move_dir.y);
        // Fake physics
        this.gPlayer0.pos.x += gEngine.move_dir.x;
        this.gPlayer0.pos.y += gEngine.move_dir.y;

        // Keyboard based facing & firing direction
        /* No Render Engine Yet
        if (gInput.actions.fire) {

            // Grab the player's screen position in space.
            var playerInScreenSpace = {
                x: gRenderEngine.getScreenPosition(this.gPlayer0.pos).x,
                y: gRenderEngine.getScreenPosition(this.gPlayer0.pos).y
            };

            // Set the dirVec property to the difference between the current mouse position and the player's position in screen space.
            dirVec.x = gInput.mouse.x - playerInScreenSpace.x;
            dirVec.y = gInput.mouse.y - playerInScreenSpace.y;

            dirVec.normalize();
        }*/
    }

});

// Added by Tapi March 19 2013 => while playing equals true, I will trigger the atmosphere background sound
// Start atmosphere sound
launchclip(sound_atmos,'atmos');
// Added by Tapi March 19 2013 => while playing equals true, I will trigger the atmosphere background sound

launchclip(game_music,'music');

gEngine = new EngineClass();
console.log("Engine loaded!");