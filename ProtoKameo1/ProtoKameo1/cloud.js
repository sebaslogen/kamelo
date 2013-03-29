
CloudClass = EntityClass.extend({
    pos: { x: 0, y: 100 },
    speed: 0,

    update: function () {
        //Update positions
        if (Math.floor(Math.random() * 10) > 5) {
            this.pos.x -= (this.speed / 10);
            if (this.pos.x < -200) {
                this.pos.x = 2100;
            }
        }
    },

    //-----------------------------------------
    draw: function () {
        if (this.spritename) { // Draw cloud
            var real_spritename = this.spritename + '.png';
            drawSprite(real_spritename, this.pos.x, this.pos.y);
        }
    }
});

gEngine.factory['Cloud'] = CloudClass;