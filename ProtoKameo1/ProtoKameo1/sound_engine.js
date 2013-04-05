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
            tong1: [24418, 255],
            tong2: [24673, 175],
            tong3: [24847, 167],
            tong4: [25015, 175],
            tong5: [25190, 151],
            tong6: [25340, 143],
            bubble1: [25483, 151],
            bubble2: [25628, 165],
            click: [25793, 906],
            twist: [26699, 139],
            check: [26839, 106],
            check2: [26945, 110],
            check3: [27055, 322],
            crackle: [27378, 059],
            hit: [27437, 263],
            bubble3: [27700, 070],
            oops: [27770, 797],
            burp1: [28567, 644],
            burp2: [29210, 663],
            burp3: [29873, 675],
            burp4: [30549, 888],
            burp5: [31437, 130],
            cheer: [31674, 2929],
            fly1: [34210, 1860],
            fly2: [36130, 1814],
            slap: [37943, 496],
            tongmax: [38440, 487],
            flyby: [38927, 1906]
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

function launchFlySound()
{
    launch_sprite = "fly" + String(Math.floor(Math.random()*2) + 1);
    launchSound(launch_sprite);
}

function launchSlapSound()
{
    launchSound('slap');
}

function launchSound(sound) {
    if (!disable_sound) {
        sound_sprites.play(sound);
    }
}