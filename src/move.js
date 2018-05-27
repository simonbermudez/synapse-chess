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
