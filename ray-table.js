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
