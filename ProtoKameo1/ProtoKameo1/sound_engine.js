//sound_atmos contains the atmosphere sound
var sound_atmos = new Howl({
    urls: ['http://www.igolgol.com/music/kame_noise.mp3', // Backup server: 'http://dl.dropbox.com/u/70689459/kame_noise.mp3',
           'resources/sounds/kame_noise.ogg'],
    sprite: {
            atmos: [0, 24400]
            },
    autoplay: false,
    loop: true,
    volume: 0.1,
});

//kami_death contains music when Kami dies
var kami_death = new Howl({
    urls: ['http://www.igolgol.com/music/kami_death.mp3', // Backup server: 'http://dl.dropbox.com/u/70689459/kami_death.mp3',
           'resources/sounds/kami_death.ogg'],
    sprite: {
            death: [40, 7300]
            },
    autoplay: false,
    loop: true,
    volume: 0.6,
});

//game_music contains the music while playing
var game_music = new Howl({
    urls: ['http://www.igolgol.com/music/kameongame.mp3', // Backup server: 'http://dl.dropbox.com/u/70689459/kameongame.mp3',
           'resources/sounds/kameongame.ogg'],
    sprite: {
            music: [23, 59084]
            },
    autoplay: false,
    loop: true,
    volume: 0.6,
});



//sound_sprites contains all the sounds
var sound_sprites = new Howl({
    urls: ['http://www.igolgol.com/music/kame_hi.mp3', // Backup server: 'http://dl.dropbox.com/u/70689459/kame_hi.mp3',
           'resources/sounds/kame_hi.ogg'],
    sprite: {
            tong1: [31, 220],
            tong2: [279, 155],
            tong3: [438, 150],
            tong4: [606, 155],
            tong5: [778, 145],
            tong6: [926, 130],
            bubble: [1069, 58],
            burp1: [1141, 643],
            burp2: [1786, 644],
            burp3: [2452, 626],
            burp4: [3122, 125],
            cheer: [3257, 2798],
            fly1: [6184, 1863],
            fly2: [8094, 1770],
            slap: [9891, 465],
            tongmax: [10365, 465],
            dryslap: [10833, 305],
            fireworks: [11151, 2201]
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
    launch_sprite = "burp" + String(Math.floor(Math.random()*4) + 1);
    launchSound(launch_sprite);
}

function launchBubbleSound()
{
    launch_sprite = "bubble";
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
function fadeOutHowl(howlsound) {
    if (howlsound.volume() < 0.1)
    {
        howlsound.volume(0.0);
        return;
    }
    else
    {
        howlsound.volume(howlsound.volume() * 0.85);
        window.setTimeout(fadeOutHowl(howlsound),1000);
    }
}

function prepareSound(howlsound) {
    howlsound.stop();
    howlsound.volume(0.0);
}