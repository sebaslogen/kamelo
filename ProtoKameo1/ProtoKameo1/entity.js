
EntityClass = Class.extend({
    // can all be referenced by child classes
    pos: { x: 0, y: 0 },
    currSpriteName: null,
    zindex: 0,

    //-----------------------------------------
    init: function (x, y) {
        if (x && y) {
            this.pos.x = x;
            this.pos.y = y;
        }        
    },

    // can all be overloaded by child classes
    update: function () {
    },

    //-----------------------------------------
    draw: function () {
        /*if (this.spritename) {
            drawSprite(this.spritename, this.pos.x, this.pos.y);
        }*/
    }
});
