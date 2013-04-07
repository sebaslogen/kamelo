//sound_atmos contains the atmosphere sound
var sound_atmos = new Howl({
    urls: ['resources/sounds/kame_hi.mp3',
           'resources/sounds/kame_hi.ogg'],
    sprite: {
            atmos: [0, 24400]
            },
    autoplay: false,
    loop: false,
    volume: 0.1,
});

//kami_death contains music when Kami dies
var kami_death = new Howl({
    urls: ['resources/sounds/kame_death.mp3',
           'resources/sounds/kame_death.ogg'],
    sprite: {
            death: [25, 7503]
            },
    autoplay: false,
    loop: true,
    volume: 0.5,
});

var sound_atmos_retriggered = false;

//game_music contains the music while playing
var game_music = new Howl({
    urls: ['resources/sounds/kameongame.mp3',
           'resources/sounds/kameongame.ogg'],
    sprite: {
            music: [23, 59084]
            },
    autoplay: false,
    loop: true,
    volume: 0.7,
});


//sound_sprites contains all the sounds
var sound_sprites = new Howl({
    urls: ['resources/sounds/kame_hi.mp3',
           'resources/sounds/kame_hi.ogg'],
    sprite: {
            atmos: [0, 24440],
            tong1: [24410, 240],
            tong2: [24673, 155],
            tong3: [24830, 140],
            tong4: [25000, 145],
            tong5: [25150, 145],
            tong6: [25298, 130],
            bubble1: [25470, 125],
            bubble2: [25628, 150],
            click: [25793, 900],
            twist: [26699, 139],
            check: [26839, 95],
            check2: [26945, 90],
            check3: [27055, 305],
            crackle: [27378, 45],
            hit: [27445, 250],
            bubble3: [27705, 55],
            oops: [27795, 850],
            burp1: [28690, 630],
            burp2: [29380, 560],
            burp3: [29930, 665],
            burp4: [30630, 875],
            burp5: [31548, 115],
            cheer: [31690, 2626],
            fly1: [34600, 1860],
            fly2: [38420, 1814],
            slap: [42085, 496],
            tongmax: [42550, 375],
            flyby: [43050, 1835],
            dryslap: [44900, 250],
            fireworks: [45265, 3000]
            }
});

// launch a sound (one-shot)
function launchClip(sound_object,clip)
{
    if (!disable_sound) {
        sound_object.play(clip);
    }
}

function launchTongueSound()
{
    launch_sprite = "tong" + String(Math.floor(Math.random()*6) + 1);
    launchSound(launch_sprite);
}

function launchBurpSound()
{
    launch_sprite = "burp" + String(Math.floor(Math.random()*5) + 1);
    launchSound(launch_sprite);
}

function launchBubbleSound()
{
    launch_sprite = "bubble" + String(Math.floor(Math.random()*3) + 1);
    launchSound(launch_sprite);
}

function launchFlySound()
{
    launch_sprite = "fly" + String(Math.floor(Math.random()*2) + 1);
    launchSound(launch_sprite);
}

function launchSlapSound()
{
    launchSound('slap');
}

function launchDrySlapSound()
{
    launchSound('dryslap');
}

function launchSound(sound) {
    if (!disable_sound) {
        sound_sprites.play(sound);
    }
}