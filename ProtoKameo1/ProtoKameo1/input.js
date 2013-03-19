

InputClass = Class.extend({

    // A dictionary mapping ASCII key codes to string values describing the action we want to take when that key is pressed.
    bindings: {},

    // A dictionary mapping actions that might be taken in our game to a boolean value indicating whether that action is currently being performed.
    actions: {},

    mouse: {
        x: 0,
        y: 0
    },

    //-----------------------------
    setup: function () {
        // Setting up left, right key presses and mouse clicks as actions
        gInput.bind(gInput.KEY.LEFT_ARROW, 'move-left');
        gInput.bind(gInput.KEY.RIGHT_ARROW, 'move-right');
        gInput.bind(gInput.KEY.MOUSE1, 'fire-mouse');
        gInput.bind(gInput.KEY.MOUSE2, 'fire-mouse');
        gInput.bind(gInput.KEY.SPACE, 'fire-tongue');
        gInput.bind(gInput.KEY.S, 'stop-background');

        // Adding the event listeners for the appropriate DOM events.
        console.log(canvas);
        canvas.addEventListener('mousemove', gInput.onMouseMove);
        canvas.addEventListener('keydown', gInput.onKeyDown);
        canvas.addEventListener('keyup', gInput.onKeyUp);
    },

    //-----------------------------
    onMouseMove: function (event) {
        gInput.mouse.x = event.clientX;
        gInput.mouse.y = event.clientY;
    },

    //-----------------------------
    onKeyDown: function (event) {
        // Grab the keyID property of the event object parameter, then set the equivalent element in the 'actions' object to true.
        //
        // You'll need to use the bindings object you set in 'bind' in order to do this.
        var action = gInput.bindings[event.keyCode];

        if (action) {
            gInput.actions[action] = true;
        }
    },

    //-----------------------------
    onKeyUp: function (event) {
        // Grab the keyID property of the event object parameter, then set the equivalent element in the 'actions' object to false.
        //
        // You'll need to use the bindings object you set in 'bind' in order to do this.
        var action = gInput.bindings[event.keyCode];

        if (action) {
            gInput.actions[action] = false;
        }
    },

    // The bind function takes an ASCII keycode and a string representing the action to take when that key is pressed.
    bind: function (key, action) {
        gInput.bindings[key] = action;
    }

});

KEY = {
    'MOUSE1': -1,
    'MOUSE2': -3,
    'MWHEEL_UP': -4,
    'MWHEEL_DOWN': -5,

    'BACKSPACE': 8,
    'TAB': 9,
    'ENTER': 13,
    'PAUSE': 19,
    'CAPS': 20,
    'ESC': 27,
    'SPACE': 32,
    'PAGE_UP': 33,
    'PAGE_DOWN': 34,
    'END': 35,
    'HOME': 36,
    'LEFT_ARROW': 37,
    'UP_ARROW': 38,
    'RIGHT_ARROW': 39,
    'DOWN_ARROW': 40,
    'INSERT': 45,
    'DELETE': 46,
    '0': 48,
    '1': 49,
    '2': 50,
    '3': 51,
    '4': 52,
    '5': 53,
    '6': 54,
    '7': 55,
    '8': 56,
    '9': 57,
    'A': 65,
    'B': 66,
    'C': 67,
    'D': 68,
    'E': 69,
    'F': 70,
    'G': 71,
    'H': 72,
    'I': 73,
    'J': 74,
    'K': 75,
    'L': 76,
    'M': 77,
    'N': 78,
    'O': 79,
    'P': 80,
    'Q': 81,
    'R': 82,
    'S': 83,
    'T': 84,
    'U': 85,
    'V': 86,
    'W': 87,
    'X': 88,
    'Y': 89,
    'Z': 90,
    'NUMPAD_0': 96,
    'NUMPAD_1': 97,
    'NUMPAD_2': 98,
    'NUMPAD_3': 99,
    'NUMPAD_4': 100,
    'NUMPAD_5': 101,
    'NUMPAD_6': 102,
    'NUMPAD_7': 103,
    'NUMPAD_8': 104,
    'NUMPAD_9': 105,
    'MULTIPLY': 106,
    'ADD': 107,
    'SUBSTRACT': 109,
    'DECIMAL': 110,
    'DIVIDE': 111,
    'F1': 112,
    'F2': 113,
    'F3': 114,
    'F4': 115,
    'F5': 116,
    'F6': 117,
    'F7': 118,
    'F8': 119,
    'F9': 120,
    'F10': 121,
    'F11': 122,
    'F12': 123,
    'SHIFT': 16,
    'CTRL': 17,
    'ALT': 18,
    'PLUS': 187,
    'COMMA': 188,
    'MINUS': 189,
    'PERIOD': 190
};

gInput = new InputClass();
gInput.KEY = KEY;