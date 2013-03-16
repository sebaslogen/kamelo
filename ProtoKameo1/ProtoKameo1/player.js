
PlayerClass = EntityClass.extend({
    pos: { x: 250, y: 500 },
    walkSpeed: 20,
    zindex: 50,
    // This is hooking into the Box2D Physics library. We'll be going over this in more detail later.
    mpPhysBody: new BodyDef()
});

gEngine.factory['Player'] = PlayerClass;