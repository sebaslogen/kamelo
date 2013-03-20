//sound_atmos contains the atmosphere sound
var sound_atmos = new Howl({
    urls: ['resources/sounds/kame_hi.mp3',
           'resources/sounds/kame_hi.ogg'],
    sprite: {
            atmos: [0, 24393]
            },
    autoplay: false,
    loop: false,
    volume: 0.5,
});

var sound_atmos_retriggered = false;


//sound_sprites contains all the sounds
var sound_sprites = new Howl({
    urls: ['resources/sounds/kame_hi.mp3',
           'resources/sounds/kame_hi.ogg'],
    sprite: {
            atmos: [0, 24393],
            tong1: [24393, 215],
            tong2: [24608, 200],
            tong3: [24808, 158],
            tong4: [24966, 162],
            tong5: [25128, 156],
            tong6: [25284, 147],
            bubble1: [25431, 157],
            bubble2: [25590, 168],
            click: [25758, 107],
            twist: [25865, 838],
            check: [26704, 104],
            check2: [26808, 99],
            check3: [26907, 133],
            crackle: [27040, 322],
            hit: [27363, 58],
            wow: [27421, 266],
            bubble3: [27686, 172],
            oops: [27858, 796],
            burp1: [28654, 642],
            burp2: [29296, 666],
            burp3: [29962, 673],
            burp4: [30636, 890],
            burp5: [31525, 116]
            }
});

// launch a sound (one-shot)
function launchclip(sound_object,clip)
{
    sound_object.play(clip);
}

function launchtongue()
{
    launch_sprite = "tong" + String(Math.floor(Math.random()*6) + 1);
    sound_sprites.play(launch_sprite);
}
