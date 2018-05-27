// Simple static evaluation via a sack of heuristics.
// Evaluates this position for whoever's move it is.

function evaluate(p) {
	if (p.winner != 0) {
		return (p.winner > 0) == p.isWhiteTurn ? 
				50000 - p.numPlies : -50000 + p.numPlies;
	}
	var val = p.materialDiff;
	
	// Castling: white
	if (p.whiteHasCastled) {
		val += 120;
	} else {
		if (p.whiteCanCastleKing)
			val += 50;
		if (p.whiteCanCastleQueen)
			val += 40;
	}

	// Castling: black
	if (p.blackHasCastled) {
		val -= 120;
	} else {
		if (p.blackCanCastleKing)
			val -= 50;
		if (p.blackCanCastleQueen)
			val -= 40;
	}
		
	// Add up material differences.
	// Sometimes this depends on whether we're
	// in opening or ending.
	// TODO: check if this does what you think it does.
	var opening = p.numPlies < 24;
	var ending = p.numPlies > 80;

	// Tracking for doubled pawns.
	var whitePawns = [];
	var blackPawns = [];

	// Tracking for rooks
	var whiteRooks = [];
	var blackRooks = [];

  // Go through square by square, and see what we find.
	for (var i = 0; i < 64; i++) {
		var piece = p.board[i];
		val += evaluateSquare(piece, i);

		if (piece == chess.P) {
			var x = chess.x(i);
			whitePawns[x] = 1 + (whitePawns[x] || 0);
		} else if (piece == -chess.P) {
			var x = chess.x(i);
			blackPawns[x] = 1 + (blackPawns[x] || 0);
		} else if (piece == chess.R) {
			whiteRooks.push(chess.x(i));
		} else if (piece == -chess.R) {
			blackRooks.push(chess.x(i));
		}
	}

	// Doubled pawns.
	for (var i = 0; i < 8; i++) {
		if (whitePawns[i] > 1) {
			val -= 40;
		}
		if (blackPawns[i] > 1) {
			val += 40;
		}
	}

	// Rooks on open columns
	for (var i = 0; i < whiteRooks.length; i++) {
		if (whitePawns[whiteRooks[i]]) {
			val -= 30;
		}
	}
	for (var i = 0; i < blackRooks.length; i++) {
		if (blackPawns[blackRooks[i]]) {
			val += 30;
		}
	}

	// break ties, keep things interesting.
	val += (Math.random() - .5);
	return p.isWhiteTurn ? val : -val;

	function evaluateSquare(piece, i) {
		if (!piece) {
			return 0;
		}
		var color = Math.sign(piece);
		if (color == -1) {
			i = 63 - i;
		}
		piece = Math.abs(piece);
		
		var x = chess.x(i);
		var y = chess.y(i);
	  var val = 0;
		switch (piece) {
			case chess.P:
				var center = (x == 3 || x == 4);
			  if (y == 1 && center)
			    val -= 20;
				if (y == 6) val += 60;
				if (y == 5) val += 30;
				if (y == 4) val += 10;
				if (y == 3 && center) val += 10;
				break;
			case chess.B:
				if (y > 0) val += 10;
				break;
			case chess.N:
				if (x == 0 || x == 7)
					val -= 30;
				if (y == 0 || y == 7)
					val -= 30;
				else if (!opening && (x == 4 || x == 3) && (y == 4 || y == 3))
					val += 20;
				break;
			case chess.Q:
				if (y == 0) {
					val -= 5;
				}
				if (opening && y > 1)
					val -= 50;
				break;
			case chess.K:
				if (!ending && y > 0)
					val -= 50;
				break;
			case chess.R: 
				if (y >= 6) val += 20;
				break;
		}	
		return color * val;
	}
}
