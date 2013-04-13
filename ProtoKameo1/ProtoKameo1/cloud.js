
CloudClass = EntityClass.extend({
    pos: { x: 0, y: 50 },
    speed: 0,

    update: function () {
        //Update positions
        var random_speed = Math.floor(Math.random() * 10);
        if (random_speed > 5) { // Randomly choose to move it or not
            this.pos.x -= (this.speed / 10);
        } else if (random_speed > 1) {
            this.pos.x -= (this.speed / 20); // Small movement to prevent stop
        } else {
            this.pos.x -= (this.speed / 100); // Small movement to prevent stop
        }
        if (this.pos.x < -(this.size.width / 2)) { // get out from left of the screen and reappear on the right
            this.pos.x = canvas.width + (this.size.width / 2);
        }
        if (this.size.width == 0 && this.size.height == 0) {
            var sprite = getSprite(this.spritename + '.png');
            if ((typeof sprite !== 'undefined') && (sprite != null) && (sprite.w != null) && (sprite.h != null)) {
                this.size.width = sprite.w;
                this.size.height = sprite.h;
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