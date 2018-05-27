// Basic chess engine, using alpha-beta pruning and
// quiescence search.

function AI() {
	var count = 0;
	var lastVal = 0;
	var branch = [];
	var initialDepth = 0;
	var stopThinking = false;

	return {
		stop: function() {stopThinking = true;},
		isStopped: function() {return stopThinking;},
		calculateMove: calculateMove
	};

	// I've always found the implementation of alpha-beta pruning
	// confusing. Quite likely there's a sign error or something much worse
	// in the following code. If you find the problem(s) and
	// let me know, I'll buy you the drink of your choice.
	function calculateMove(theListener, position, depth) {
		stopThinking = false;
		listener = theListener;
		var ply = nextPly(position);

		if (ply.length == 0)
			return null;

		if (ply.length == 1)
			return ply[0].lastMove;
			
		var max = -Infinity;
		var move = null;
		count = 0;
		initialDepth = depth;
		branch = [];
		for (var i = 0; i < ply.length; i++) {
			var x = -value(ply[i], depth - 1, -Infinity, Infinity);
			if (x > max) {
				max = x;
				move = ply[i].lastMove;
			} 
		}
		return move;
	}

	function value(position, depth, alpha, beta) {
		if (stopThinking) {
			return position.staticValue;
		}
		var wasCapture = position.lastMove.isCapture();
		branch.push(position);
		alpha = alpha || -Infinity;
		beta = beta || Infinity;
		// This is kind of a dumb quiescence search since it
		// doesn't take check into account, but so it goes.
		if (depth <= -6 || depth <= 0 && !wasCapture) {
			listener(branch, position.staticValue);
			branch.pop();
			return position.staticValue;
		}

		var ply = nextPly(position);
		if (ply.length == 0) {
			// indicates win, lose, or draw.
			listener(branch, position.staticValue);
			branch.pop();
			return position.staticValue;
		}

		var v = -Infinity;
		for (var i = 0; i < ply.length; i++) {
			var x = -value(ply[i], depth - 1, -beta, -alpha);
			if (x > v) {
				v = x;
			}
			if (x > alpha) {
				alpha = x;
			}
			if (x >= beta) {
				break;
			}
		}
		listener(branch, v, true);
		branch.pop();
	  return v;		
	}

	// Get next ply.
	function nextPly(p, captureOnly) {
		var moves = p.getNextPly(!!captureOnly);
		var ply = [];
		for (var i = 0; i < moves.length; i++) {
			var copy = new Position(p);
			ply[i] = copy;
			copy.makeMove(moves[i]);
			copy.staticValue = evaluate(copy);
		}
		ply.sort(function(p1, p2) {
		  return p1.staticValue - p2.staticValue;
	  });
		return ply;
	}
}
