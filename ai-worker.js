// Web worker for calculating moves asynchronously.

//importScripts('chess-bundle.js');
importScripts('chess.js', 'ray-table.js', 'move.js',
		'position.js', 'evaluation.js', 'ai.js');


var ai = AI();

// Set up dispatch system.
self.addEventListener('message', function(e) {
	var message = e.data;
	if (message.type == 'stop') {
		// Honestly I'm not even sure if this stopping logic
		// is really necessary.
		ai.stop();
		self.postMessage({type: 'stop-ack'});
	} else if (message.type == 'start') {
		// message.position is just json, so we need to
		// construct an honest-to-god Position object from it.
		var position = new Position(message.position);
		var depth = message.depth;
		var minTime = message.minTime || 0;
		var start = Date.now();
		var move;
		for (;;) {
		  move = ai.calculateMove(branchReporter, position, depth);
		  if (Date.now() - start >= minTime) {
		  	break;
		  }
		  depth++;
		}
		if (!ai.isStopped()) {
			self.postMessage({type: 'move', move: move});
		}
	}
});

// Send a message about the current branch the AI is thinking about.
function branchReporter(branch, value) {
	self.postMessage({
		type: 'branch',
		branch: branch,
		value: value
	});
}
