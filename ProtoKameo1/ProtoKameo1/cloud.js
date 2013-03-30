
CloudClass = EntityClass.extend({
    pos: { x: 0, y: 50 },
    speed: 0,

    update: function () {
        //Update positions
        if (Math.floor(Math.random() * 10) > 5) { // Randomly choose to move it or not
            this.pos.x -= (this.speed / 10);
            if (this.pos.x < -100) { // get out from left of the screen and reappear on the right
                this.pos.x = 1700;
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