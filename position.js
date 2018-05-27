// Represents a position, along with the logic
// to find subsequent moves.

// Note that the argument can be a simple JSON object or an
// actual position.
var Position = function(position) {
	this.board = position ? position.board.slice() : Position.startBoard();
	this.materialDiff = position ? position.materialDiff : 0;
	this.blackCanCastleKing = !position || position.blackCanCastleKing;
	this.blackCanCastleQueen = !position || position.blackCanCastleQueen;
	this.whiteCanCastleKing = !position || position.whiteCanCastleKing;
	this.whiteCanCastleQueen = !position || position.whiteCanCastleQueen;
	this.blackHasCastled = position && position.blackHasCastled;
	this.whiteHasCastled = position && position.whiteHasCastled;
	this.numPlies = position ? position.numPlies : 0;
	this.isWhiteTurn = !position || position.isWhiteTurn;
	this.enPassantMove = position ? position.enPassantMove : -1;
	this.enPassantCapture = position ? position.enPassantCapture : -1;
	this.whiteKingPosition = position ? position.whiteKingPosition : 4;
	this.blackKingPosition = position ? position.blackKingPosition : 60;
	this.lastMove = position && position.lastMove;
	this.staticValue = 0;
	this.winner = position ? position.winner : 0;
};


Position.prototype.setBoard = function(board) {
	this.board = board;
	for (var i = 0; i < 64; i++) {
		if (board[i] == chess.K) {
			this.whiteKingPosition = i;
		}
		if (board[i] == -chess.K) {
			this.blackKingPosition = i;
		}
	}
};


Position.prototype.totalPieces = function() {
	var t = 0;
	this.board.forEach(function(b) {
		if (b) t++;
	});
	return t;
};

// Normal beginning
Position.startBoard = function() {
	var R = chess.R, N = chess.N, B = chess.B;
	var K = chess.K, Q = chess.Q, P = chess.P;
	return [
		R, N, B, Q, K, B, N, R,
		P, P, P, P, P, P, P, P,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		-P, -P, -P, -P, -P, -P, -P, -P,
		-R, -N, -B, -Q, -K, -B, -N, -R,
	];
};


// Expensive! Also doesn't take draws by threefold repetition
// into account. Alas!
Position.prototype.getGameStatus = function() {
	// Are there any legal moves? Get next ply of pseudomoves
	// and check!
	var candidates = this.getNextPly();
	for (var i = 0; i < candidates.length; i++)
		if (this.doesNotExposeKing(candidates[i]))
			return chess.GAME_ALIVE;
			
	// No legal moves, so game is over...
  return this.reasonForNoMoves();
};

// Why did the game end?
Position.prototype.reasonForNoMoves = function() {
	if (this.isWhiteTurn) {
		if (this.isThreatened(this.whiteKingPosition, false))
			return chess.BLACK_WIN;
	} else {
		if (this.isThreatened(this.blackKingPosition, true))
			return chess.WHITE_WIN;
	}
	return chess.DRAW;
};

// Helpful for manual tests.
Position.prototype.getRandomMove = function() {
	var candidates = this.getNextPly();
	var legal = [];
	for (var i = 0; i < candidates.length; i++)
		if (this.doesNotExposeKing(candidates[i]))
			legal.push(candidates[i]);
	var n = legal.length;
	return legal[~~(n * Math.random())];
}

// Check if a move exposes king.
Position.prototype.doesNotExposeKing = function(move) {
	var position = new Position(this);
	position.makeMove(move);
	return !position.isThreatened(this.isWhiteTurn ? 
		position.whiteKingPosition : position.blackKingPosition,
		!this.isWhiteTurn);
}

// Finds whether there's a legal move from the given spot,
// to the given spot. If so, return it.
Position.prototype.findLegalMove = function(from, to) {	
	var candidates = this.getNextPly();
	for (var i = 0; i < candidates.length; i++) {
		var move = candidates[i];
		if (move.to == to && move.from == from) {
			return this.doesNotExposeKing(move) ? move : null;
		}
	}
	return null;
};

Position.prototype.totalPieces = function() {
	var t = 0;
	for (var i = 0; i < 64; i++)
		if (this.board[i] != 0)
			t++;
	return t;
};

Position.prototype.makeMove = function(move) {	
	// Recompute material difference from a capture.
	var capture = this.board[move.to];
	this.materialDiff += 
			capture > 0 ? -chess.pieceVals[capture] : chess.pieceVals[-capture];
	
	// Compute new board.
	this.board[move.from] = 0;
	this.board[move.to] = move.promotionPiece || move.piece;
	if (move.castleRookFrom != move.castleRookTo) {
		this.board[move.castleRookTo] = this.board[move.castleRookFrom];
		this.board[move.castleRookFrom] = chess.EMPTY;
		if (move.piece > 0)
			this.whiteHasCastled = true;
		else
			this.blackHasCastled = true;
	}
	if (move.enPassantCapture > 0)
		this.board[move.enPassantCapture] = chess.EMPTY;

	// Handle "winner".
	if (this.winner == chess.NONE) {
		if (move.targetPiece == chess.K)
			this.winner = chess.BLACK;
		else if (move.targetPiece == -chess.K)
			this.winner = chess.WHITE;
	}
			
	// Handle promotion.
	if (move.promotionPiece) {
		var mp = move.promotionPiece;
		this.board[move.to] = mp;
		this.materialDiff += 
				mp>0 ? chess.pieceVals[mp] - chess.pieceVals[chess.P] :
			         -chess.pieceVals[-mp] + chess.pieceVals[chess.P];
	}
	
	// Figure out king stuff.
	if (move.piece == chess.K)
		this.whiteKingPosition = move.to;
	else if (move.piece == -chess.K)
		this.blackKingPosition = move.to;
	
	// Deal with en passant.
	if (Math.abs(move.piece) == 1 && Math.abs(move.to - move.from) == 16) {
		this.enPassantMove = (move.to + move.from) / 2;
		this.enPassantCapture = move.to;
	} else {
		this.enPassantMove = -1;
	}
	
	// Note the move we just made as the last move.
	this.lastMove = move;
	
	// Figure out castling stuff.
	if (move.isWhiteMove()) {
		if ((this.whiteCanCastleKing || this.whiteCanCastleQueen)) {
			// King move
			if (move.piece == chess.K) {
				this.whiteCanCastleKing = false;
				this.whiteCanCastleQueen = false;
			} else if (move.piece == chess.R) {
				if (move.from == 0)
					this.whiteCanCastleQueen = false;
				if (move.from == 7)
					this.whiteCanCastleKing=false;
			}
		}
		// Moves that indicate black's rook is out of commission for castling.
		if (move.to == 63)
			this.blackCanCastleKing = false;
		if (move.to == 56)
			this.blackCanCastleQueen = false;
	} else // castling stuff for black's move.
	{
		if (this.blackCanCastleKing || this.blackCanCastleQueen) {
			if (move.piece == -chess.K) {
				this.blackCanCastleKing = false;
				this.blackCanCastleQueen = false;
			} else if (move.piece == -chess.R) {
				if (move.from == 56)
					this.blackCanCastleQueen = false;
				if (move.from == 63)
					this.blackCanCastleKing = false;
			}
		}
	  // Moves that indicate white's rook is out of commission for castling.
		if (move.to == 7)
			this.whiteCanCastleKing = false;
		if (move.to == 0)
			this.whiteCanCastleQueen = false;
	}
	
	this.advanceTurn();
};

Position.prototype.advanceTurn = function() {
	this.isWhiteTurn = !this.isWhiteTurn;
	this.numPlies++;		
};

// Includes threats by other king that would put it at risk,
// since this is used for move legality.
Position.prototype.isThreatened = function(square, threatenedByWhite) {
	if (square == this.enPassantMove)
		return true;

	// This code depends on moves being symmetric: if there's a move
	// from A to B, then there's a move from B to A.
	for (var piece = 2; piece < 7; piece++) {
		var r = rayTable[piece][square];
		for (var j = 0; j < r.length; j++) {
			for (var k = 0; k < r[j].length; k++) {
				var b = this.board[r[j][k]];
				if (b == 0) continue;
				if (b > 0 == threatenedByWhite) { // ends in opposite color piece
					if (Math.abs(b) == piece) // if it is piece for this ray, threatened!
						return true;
				}
				break; // stop loop, ended in friendly or non-capturing piece
			}
		}
	}
	
	// Check for pawn threats.
	var x = chess.x(square);
	var y = chess.y(square);
	if (this.threatenedByWhite) {
		if (x > 0 && this.board[square - 9] == chess.P ||
		    x < 7 && this.board[square - 7] == chess.P)
		    return true;
	} else {
		if (x > 0 && this.board[square + 7] == -chess.P ||
			  x < 7 && this.board[square + 9] == -chess.P)
			return true;			
	}
	return false;
};

// Convenience function to make a nicer interface.
// Really, who can remember what boolean argument mean?
Position.prototype.getNextCapturePly = function() {
	return this.getNextPly(true);
};

// Returns next ply of legal moves.
Position.prototype.getNextPly = function(captureOnly) {
	var moves = [];
	if (this.winner != 0) return moves;

	for (var source = 0; source < 64; source++) {
		var b = this.board[source];
		if (b == 0 || b < 0 == this.isWhiteTurn)
			continue;
		var piece = Math.abs(b);
		// Get piece moves using rays.
		if (piece > 1) {
			if (!rayTable[piece]) {
				console.log('UNKNOWN RAY TABLE');
				console.log('position', this);
				console.log('source', source);
				console.log('piece', piece);
			}
			var pieceRays = rayTable[piece][source];
			for (var k = 0; k < pieceRays.length; k++) {
				for (var j = 0; j < pieceRays[k].length; j++) {
					var target = pieceRays[k][j];
					var b2 = this.board[target];
					if (b2 == 0) {
						if (!captureOnly) {
						  moves.push(new Move(b, b2, source, target));
						}
					} else {
						if (b * b2 < 0) {
							moves.push(new Move(b, b2, source, target));
						}
						break;
					}
				}
			}
		}
		// Get white pawn moves.
		else if (b == 1) {
			var x = chess.x(source);
			var y = chess.y(source);
			
			// Non-capturing pawn moves.
			if (!captureOnly) {
				if (y == 1) { // 2nd rank
					if (this.board[source + 8] == 0) {
						moves.push(new Move(b, chess.EMPTY, source, source + 8));
						if (this.board[source + 16] == 0) {
							moves.push(new Move(b, chess.EMPTY, source, source + 16));
						}
					}
				} else {
					if (this.board[source + 8] == 0) {
						var m = new Move(b, chess.EMPTY, source, source + 8);
						if (y == 6)
							m.promotionPiece = chess.Q; // sorry, all we allow!
						moves.push(m);
					}						
				}
			}
			
			// Left-capturing pawn moves.
			var left = source + 7;
			if (x > 0 && (this.board[left] < 0 || left == this.enPassantMove)) {
				var m = new Move(b, this.board[left], source, left);
				if (y == 6)
					m.promotionPiece = chess.Q;
				if (left == this.enPassantMove)
					m.enPassantCapture = this.enPassantCapture;
				moves.push(m);
			}
			
			// Right-capturing pawn moves.
			var right = source + 9;
			if (x < 7 && (this.board[right] < 0 || right == this.enPassantMove)) {
				var m = new Move(b, this.board[right], source, right);
				if (y==6)
					m.promotionPiece = chess.Q;
				if (right == this.enPassantMove)
					m.enPassantCapture = this.enPassantCapture;
				moves.push(m);
			}
		}
		// Get black pawn moves.
		// Quite redundant with white pawn moves. C'est la guerre!
		else if (b == -1) {
			var x = chess.x(source);
			var y = chess.y(source);
		  // Non-capturing pawn moves.
			if (!captureOnly) {
				if (y == 6) { // 7th rank
					if (this.board[source - 8] == 0) {
						moves.push(new Move(b, chess.EMPTY, source, source - 8));
						if (this.board[source - 16] == 0) {
							moves.push(new Move(b, chess.EMPTY, source, source - 16));
						}
					}
				} else {
					if (this.board[source - 8] == 0) {
						var m = new Move(b, chess.EMPTY, source, source - 8);
						if (y == 1)
							m.promotionPiece = -chess.Q;
						moves.push(m);
					}						
				}
			}
			
			// Left-capturing pawn moves.
			var left = source - 9;
			if (x > 0 && (this.board[left] > 0 || left == this.enPassantMove)) {
				var m = new Move(b, this.board[left], source, left);
				if (y == 1)
					m.promotionPiece = -chess.Q;
				moves.push(m);
			}
			
			// Right-capturing pawn moves.
			var right = source - 7;
			if (x < 7 && (this.board[right] > 0 || right == this.enPassantMove)) {
				var m = new Move(b, this.board[right], source, right);
				if (y == 1)
					m.promotionPiece = -chess.Q;
				moves.push(m);
			}
		}
	}

	// No need to go through castling rigamarole if only looking
	// at capturing moves.
	if (!captureOnly) {

		// Is the given square empty and free of threats?
		// Used to think about king moves, including castling.
		var self = this;
	  function clear(square, threatenedByWhite) {
		  return self.board[square] == chess.EMPTY && 
			   !self.isThreatened(square, threatenedByWhite);
	  };
	
		// Include castling, if it is possible.
		if (this.isWhiteTurn) {
			// Spaces clear && free of checks, queenside.
			if (this.whiteCanCastleQueen) {
				if (clear(1, false) && clear(2, false) && clear(3, false))
					moves.push(Move.castle(chess.K, 4, 2, 0, 3));
			}
			// Spaces clear && free of checks, kingside.
			if (this.whiteCanCastleKing) {
				if (clear(5, false) && clear(6, false))
					moves.push(Move.castle(chess.K, 4, 6, 7, 5));
			}
		} else {
			// Spaces clear && free of checks, queenside.
			if (this.blackCanCastleQueen) {
				if (clear(59, true) && clear(58, true) && clear(57, true))
					moves.push(Move.castle(-chess.K, 60, 58, 56, 59));
			}
			// Spaces clear && free of checks, kingside.
			if (this.blackCanCastleKing) {
				if (clear(62, true) && clear(61, true))
					moves.push(Move.castle(-chess.K, 60, 62, 63, 61));
			}
		}
	}
  var realMoves = [];
  for (var i = 0; i < moves.length; i++) {
  	if (this.doesNotExposeKing(moves[i])) {
  		realMoves.push(moves[i]);
  	}
  }
  return realMoves;
};
