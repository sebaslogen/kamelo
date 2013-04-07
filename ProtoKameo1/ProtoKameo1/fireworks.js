// forked from norahiko's "花火 - fireworks" http://jsdo.it/norahiko/ls6x
// Customized and tuned for Kamelo
// =================================
// Const
// =================================
var PI = Math.PI;
var PI_2 = PI * 2;

// =================================
// Config
// =================================
var defaultConfig = {
    duration: 2000,         // ms
    delay: 0,               // ms
    radius: 5,              // px
    amount: 100,            // particle number
    speed: 12,
    gravity: 0.1,
    friction: 0.96,
    reduction: 0.98,
    left: 0.2,
    top: 0.3,
    color: "#ff0000"
};

// Main caller
function createFirework() {
    for (var i = 0; i < 15; i++) {
        var firework = new Firework({
            duration: 1000,
            left: Math.random() * 0.5 + 0.25,
            top: Math.random() * 0.5 + 0.25,
            amount: 80,
            delay: 250 * i,
            radius: 4,
            reduction: 1,
            friction: 0.95,
            speed: Math.random() * 30 + 15,
            color: "hsl(" + Math.random() * 360 + ", 100%, 50%)"
        });
        Canvas.add(firework);
    }

    Canvas.start();
}

// =================================
// Firework
// =================================
function Firework(config) {
    this.setConfig(config || {});
    this.particleImage = createParticleImage(this.radius, this.color);
    this.diameter = this.radius * 2;
    this.isActive = true;
    this.fadeoutOpacity = 1;
}

Firework.prototype = {
    setConfig: function (config) {
        for (var key in defaultConfig) {
            if (config[key] === undefined) {
                this[key] = defaultConfig[key];
            } else {
                this[key] = config[key];
            }
        }
    },

    initParticles: function () {
        this.particles = [];
        var x = this.canvas.width * this.left;
        var y = (this.canvas.height - 100) * this.top;
        var maxSpeed = (this.speed / 2) * (this.speed / 2);

        while (this.particles.length < this.amount) {
            var vx = (Math.random() - 0.5) * this.speed;
            var vy = (Math.random() - 0.5) * this.speed;
            if (vx * vx + vy * vy <= maxSpeed) {
                this.particles.push(new Particle(x, y, vx, vy));
            }
        }
    },

    update: function (passed) {
        if (this.isActive === false ||
           this.started(passed) === false) return;

        if (this.ended(passed)) {
            this.fadeout();
            return;
        }
        this.move();
        this.render();
    },

    move: function () {
        var particles = this.particles;
        var particle;
        for (var i = 0, len = particles.length; i < len; i++) {
            particle = particles[i];
            particle.vx *= this.friction;
            particle.vy = particle.vy * this.friction + this.gravity;
            particle.x += particle.vx;
            particle.y += particle.vy;
        }
        this.gravity += 0.01 + (this.gravity * this.gravity * this.gravity / 30); // Increase gravity towards the end of the animation
    },

    render: function () {
        this.context.globalAlpha = 1;
        this.renderParticles();
    },

    renderParticles: function () {
        var diameter = this.diameter *= this.reduction;
        var context = this.context;
        var particles = this.particles;
        var particleImage = this.particleImage;
        var p;
        for (var i = 0, len = particles.length; i < len; i++) {
            p = particles[i];
            context.drawImage(particleImage, p.x, p.y, diameter, diameter);
        }
    },

    started: function (passed) {
        return this.delay < passed;
    },

    ended: function (passed) {
        return this.duration + this.delay < passed;
    },

    fadeout: function () {
        this.fadeoutOpacity -= 0.1;
        if (this.fadeoutOpacity <= 0) {
            this.isActive = false;
            return;
        }
        this.move();
        this.context.globalAlpha = this.fadeoutOpacity;
        this.renderParticles();
    }
};



// =================================
// Particle
// =================================
function Particle(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
}

// =================================
// Canvas
// =================================
var Canvas = {
    fireworks: [],

    add: function (firework) {
        firework.canvas = this.canvas;
        firework.context = this.context;
        firework.initParticles();
        this.fireworks.push(firework);
    },

    start: function () {
        this.startTime = Number(new Date());
        this.update();
    },

    clear: function () {
        this.context.globalAlpha = 1;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    // main loop
    update: function () {
        this.clear();
        var passed = new Date() - this.startTime;
        var activeFireworkCount = 0;
        this.fireworks.forEach(function (firework) {
            if (firework.isActive) {
                firework.update(passed);
                activeFireworkCount++;
            }
        }.bind(this));

        if (0 < activeFireworkCount) {
            requestAnimationFrame(this.update.bind(this));
        } else {
            victory = false;
            end = true;
        }
    }
};


// =================================
// Utils
// =================================
if (Function.prototype.bind === undefined) {
    Function.prototype.bind = function (obj) {
        var slice = [].slice,
            args = slice.call(arguments, 1),
            self = this,
            bound = function () {
                return self.apply(obj || window, args.concat(slice.call(arguments)));
            };
        bound.prototype = this.prototype;
        return bound;
    };
}

function createParticleImage(radius, color) {
    var size = radius * 2;
    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    var context = canvas.getContext("2d");

    var gradient = context.createRadialGradient(radius, radius, 0, radius, radius, size);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.1, "white");
    gradient.addColorStop(0.3, color);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(radius, radius, radius, 0, PI_2, true);
    context.fill();
    //return canvas

    var particle = new Image();
    particle.src = canvas.toDataURL();
    return particle;
}