// Wait till the browser is ready to render the game (avoids glitches)

var GM;		// make it public for easy debugging
window.requestAnimationFrame(function () {
  // Allow for different frameworks in terms of where the puzzle data comes from
  if (!xwd) if (xwdReader) xwd = xwdReader();
  // and go!
  GM = new GameManager(/*15, gridRows*/xwd, 96, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});
