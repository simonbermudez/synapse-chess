/*
 This is a translation of Java code from earlier versions of
 Thinking Machine.

 (c) 2002-2016 Martin Wattenberg

 Trivia: about 3,200 lines of Java == 1,800 lines of Javascript.
 See demo/ directory for individual files.
*/

// Global constants and basic chess info.

var styles = {
	"classic": {
		blackSquare: 'rgb(70,70,70)',
		whiteSquare: 'rgb(110,110,110)',
		blackPiece: 'rgb(30,5,5)',
		whitePiece: '#fff',
		blackMove: 'rgb(255,128,0)',
		whiteMove: 'rgb(0,255,128)',
		table: 'rgb(128,128,128)',
		text: '#fff',
		background: '#808080'
	},
	"tron": {
		blackSquare: 'rgb(70,70,70)',
		whiteSquare: 'rgb(110,110,110)',
		blackPiece: 'rgb(30,5,5)',
		whitePiece: '#fff',
		blackMove: 'rgb(255,128,0)',
		whiteMove: 'rgb(0,255,128)',
		table: 'rgb(128,128,128)',
		text: '#fff',
		background: '#808080'
	},
	"andtek": {
		blackSquare: 'rgb(70,70,70)',
		whiteSquare: 'rgb(110,110,110)',
		blackPiece: 'rgb(30,5,5)',
		whitePiece: '#fff',
		blackMove: 'rgb(255,128,0)',
		whiteMove: 'rgb(0,255,128)',
		table: '#374356',
		text: '#fff',
		background: '#808080'
	},
}

var chess = {
  GAME_ALIVE: 0,
  WHITE_WIN: 1,
  DRAW: 2,
  BLACK_WIN: 3,
  WHITE: 1,
  BLACK: -1,
  NONE: 0,

  EMPTY: 0,
  P: 1,
  N: 2,
  B: 3,
  R: 4,
  Q: 5,
  K: 6,
  
  colors: styles.andtek,


	inBounds: function(x, y) {
		return x >= 0 && x < 8 && y >= 0 && y < 8;
	},

	index: function(x, y) {
		return x + y * 8;
	},

	x: function(i) {
		return (~~i) % 8;
	},

	y: function(i) {
		return ~~(i / 8);
	},

  pieceVals: [0, 100, 300, 325, 500, 900, 100000],
  pieceNames: ["-", "P","N","B","R","Q","K"],
  isWhitePiece: function(piece) {
	  return piece > 0;
  }
}
// Table of possible moves for various pieces.

var rayTable = (function() {

	var rays = [];

	rays[chess.B] = bishopRay();
	rays[chess.N] = knightRay();
	rays[chess.K] = kingRay();
	rays[chess.Q] = queenRay();
	rays[chess.R] = rookRay();

	return rays;
	
	function rookRay() {
		var ray = [];
		for (var i = 0; i < 64; i++) {
			ray[i] = [];
			ray[i][0] = makeRay(i, 0, 1);
			ray[i][1] = makeRay(i, 0, -1);
			ray[i][2] = makeRay(i, 1, 0);
			ray[i][3] = makeRay(i, -1, 0);
		}
		return ray;
	}

	function queenRay() {
		var ray = [];
		var rook = rookRay();
		var bishop = bishopRay();
		for (var j = 0; j < 64; j++) {
			ray[j] = [];
			for (var i = 0; i < 4; i++) {
				ray[j][i] = rook[j][i];
				ray[j][4 + i] = bishop[j][i];
			}
		}
		return ray;
	}

	function kingRay() {
		var ray = [];
		for (var i = 0; i < 64; i++) {
			ray[i] = [];
			ray[i][0] = makeSingle(i, 1, 0);
			ray[i][1] = makeSingle(i, 1, 1);
			ray[i][2] = makeSingle(i, 0, 1);
			ray[i][3] = makeSingle(i, -1, 1);
			ray[i][4] = makeSingle(i, -1, 0);
			ray[i][5] = makeSingle(i, -1, -1);
			ray[i][6] = makeSingle(i, 0, -1);
			ray[i][7] = makeSingle(i, 1, -1);
		}
		return ray;
	}

	function knightRay() {
		var ray = [];
		for (var i = 0; i < 64; i++) {
			ray[i] = [];
			ray[i][0] = makeSingle(i, 1, 2);
			ray[i][1] = makeSingle(i, 2, 1);
			ray[i][2] = makeSingle(i, -1, 2);
			ray[i][3] = makeSingle(i, -2, 1);
			ray[i][4] = makeSingle(i, -1, -2);
			ray[i][5] = makeSingle(i, -2, -1);
			ray[i][6] = makeSingle(i, 1, -2);
			ray[i][7] = makeSingle(i, 2, -1);
		}
		return ray;
	}

	function bishopRay() {
		var ray = [];
		for (var i = 0; i < 64; i++) {
			ray[i] = [];
			ray[i][0] = makeRay(i, 1, 1);
			ray[i][1] = makeRay(i, -1, -1);
			ray[i][2] = makeRay(i, 1, -1);
			ray[i][3] = makeRay(i, -1, 1);
		}
		return ray;
	}

	function makeSingle(i, dx, dy) {
		var x = chess.x(i) + dx;
		var y = chess.y(i) + dy;
		return chess.inBounds(x,y) ? [chess.index(x, y)] : [];
	}

	function makeRay(i, dx, dy) {
		var x = chess.x(i) + dx;
		var y = chess.y(i) + dy;
		var list = [];
		while (chess.inBounds(x,y)) {
			list.push(chess.index(x, y));
			x += dx;
			y += dy;
		}
		return list;
	}

})();
// Represents a chess move.

var Move = function(piece, targetPiece, from, to, promotionPiece,
		opt_castleRookFrom, opt_castleRookTo) {
	this.to = to;
	this.from = from;
	this.piece = piece;
	this.targetPiece = targetPiece;
	this.enPassantCapture = -1;
	this.promotionPiece = promotionPiece;
	this.castleRookFrom = opt_castleRookFrom;
	this.castleRookTo = opt_castleRookTo;
};

Move.copy = function(m) {
	return new Move(m.piece, m.targetPiece, m.from,
			m.to, m.promotionPiece, m.castleRookFrom, m.castleRookTo);
};

Move.castle = function(piece, kingFrom, kingTo, rookFrom, rookTo) {
	return new Move(piece, chess.EMPTY, kingFrom, kingTo,
			undefined, rookFrom, rookTo);
};

Move.prototype.isCastle = function() {
	return this.castleRookTo !== undefined;
};

Move.prototype.inMotion = function(i) {
	return i == this.from || i === this.castleRookFrom;
};

Move.prototype.isWhiteMove = function() {
	return this.piece > 0;
};

Move.prototype.isCapture = function() {
	return this.targetPiece != 0;
};

Move.prototype.fromX = function() {
	return chess.x(this.from);
};

Move.prototype.fromY = function() {
	return chess.y(this.from);
};

Move.prototype.toX = function() {
	return chess.x(this.to);
};

Move.prototype.toY = function() {
	return chess.y(this.to);
};

Move.prototype.toString = function() {
	function squareName(s) {
		return 'abcdefgh'[chess.x(s)] + (1 + chess.y(s));
	}
	function pieceName(p) {
		p = Math.abs(p);
		if (p == 1) {
			return '';
		}
		return 'NBRQK'[p - 2];
	}
	var result = pieceName(this.piece) + squareName(this.from);
	if (this.targetPiece) {
		result += 'x' + pieceName(this.targetPiece);
	} else {
		result += '-';
	}
	result += squareName(this.to);
	return result;
};
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
