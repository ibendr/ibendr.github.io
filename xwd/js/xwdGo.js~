// Was in application.js...

// Wait till the browser is ready to render the game (avoids glitches)

var it;		// make it public for easy debugging
    window.requestAnimationFrame(function () {
	// Allow for different frameworks in terms of where the puzzle data comes from
	if ( !xwd ) if ( xwdReader ) xwd = xwdReader();
	// and go!
	it = new xwdInterface( xwd , KeyboardInputManager , HTMLActuator , LocalStorageManager );
    });