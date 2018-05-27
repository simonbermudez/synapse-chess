/*
 This is a translation of Java code from earlier versions of
 Thinking Machine.

 (c) 2002-2016 Martin Wattenberg

 Trivia: about 3,200 lines of Java == 1,800 lines of Javascript.
 See demo/ directory for individual files.
*/

// Stylized pieces.

function drawPiece(g, type, x, y, side, opt_color) {
	if (type === undefined || type == chess.EMPTY) return;

	var s = .02 * side; // scale factor, remnant of Java code.
	g.fillStyle = opt_color ||
			chess.colors[type > 0 ? 'whitePiece' : 'blackPiece'];
	var cx = x + side / 2;
	var cy = y + side / 2;

	switch (Math.abs(type)) {
		case chess.P: drawPawn(); break;
		case chess.N: drawKnight(); break;
		case chess.K: drawKing(); break;
		case chess.Q: drawQueen(); break;
		case chess.B: drawBishop(); break;
		case chess.R: drawRook(); break;
		default: console.log('weird piece!', type);
	}

	function circle(x, y, r) {
		g.beginPath();
		g.moveTo(x, y);
		g.arc(x, y, r, 0, 2 * Math.PI, false);
		g.fill();
	}
	
	function drawPawn() {
		var r = 5 * s; // was 6 in java
		circle(cx, cy, r);
	}
	
	function drawRook() {
		var r = 7 * s;
		g.fillRect(cx - r, cy - r, 2 * r + 1, 2 * r + 1);
	}
	
	function drawKing() {
		var a = 3 * s;
		var b = 8 * s;
		g.fillRect(cx - a, cy - b, 2 * a, 2 * b);
		g.fillRect(cx - b, cy - a, 2 * b, 2 * a);
	}
	
	function drawBishop() {
		g.beginPath();
		var a = 7 * s;
		g.moveTo(cx - a, cy + a);
		g.lineTo(cx + a, cy + a);
		g.lineTo(cx, cy - a);
		g.fill();
	}
	
	function drawQueen() {
		g.beginPath();
		var a = 6 * s;
		var b = 10 * s;
		g.moveTo(cx + b * r, cy);
		for (var i = 0; i < 16; i++) {
			var r = i % 2 == 0 ? b : a;
			var theta = Math.PI * i / 8.0;
			g.lineTo(cx + r * Math.cos(theta),cy + r * Math.sin(theta));
		}
		g.fill();
	}
	
	function drawKnight() {
		var b = 13 * s;
		g.beginPath();
		cx -= b / 2;
		cy += b / 2;
		g.moveTo(cx, cy);
		g.arc(cx, cy, b, 0, 3 * Math.PI / 2, 2 * Math.PI);
		g.fill();
	}
}
// Visualizes a sequence of positions using swoopy curves.
function moveGraphics(g, w, h) {
	var scale = 1.5;
	var alpha = .1;
	var ribbonWidth = 64;

	return drawPositions;

	function drawPositions(positionList, value) {
		var q = Math.round(128 + 2 * value);
		if (q < 0) q = 0;
		if (q > 255) q = 255;
		var positions = positionList.slice();
		var n = positions.length;
		function setColor(r, gr, b) {
			var c = 'rgba(' + r + ',' + gr + ',' + b + ',' + alpha + ')';
			g.strokeStyle = c;
		}
		for (var i = 0; i < n; i++) {
			if (!positions[i]) {
				// This happens if we've already drawn this position,
				// and so removed it from the list of positions.
				continue;
			}
			if (i % 2 == 1) {
				q = 255 - q;
				if (q < 128)
					setColor(q, 128, 128);
				else
					setColor(128, q, 128);
				
			} else {
				if (q < 128)
					setColor(255, 128, q);
				else
					setColor(255, q, 128);
			}

			// Get list of successive moves from a single piece, and then
			// draw them. Remove the corresponding positions from the
			// position list.
			var list = [];
			list.push(positions[i]);
			var last = positions[i];
			for (var j = i + 1; j < n; j++) {
				var p = positions[j];
				if (!p)
					continue;
				if (p.lastMove.from == last.lastMove.to) {
					list.push(p);
					positions[j] = null;
				} else if (p.lastMove.to == last.lastMove.to)
					break; // I guess there was a capture and the piece died?
			}

			drawSuccessiveMovesFromOnePiece(list, value);
		}
	}

	// list of positions
	function drawSuccessiveMovesFromOnePiece(list, value) {
		var n = list.length;
		if (n == 1) {
			drawOnePosition(list[0], value);
			return;
		}
		var x = [];
		var y = [];
		var move;
		for (var i = 0; i < n; i++) {
			move = list[i].lastMove;
			x[i] = (w / 2) *
					(center(move.fromX()) * scale + 1) + rnd(ribbonWidth);
			y[i] = (h / 2) *
					(-center(move.fromY()) * scale + 1) + rnd(ribbonWidth);
		}
		x[n] = (w / 2) * (center(move.toX()) * scale + 1);
		y[n] = (h / 2) * (-center(move.toY()) * scale + 1);
		drawCurveFromArrays(x, y);
	}
	
	function drawOnePosition(position, value) {
		var move = position.lastMove;
		drawCurve(center(move.fromX()), -center(move.fromY()),
				center(move.toX()), -center(move.toY()));
	}
	
	function center(s) {
		return (s - 3.5) / 6 ;
	}
	
	function drawCurveFromArrays(x, y) {
		g.beginPath();
		g.moveTo(x[0], y[0]);
		for (var i = 1; i < x.length; i++) {
			if (i < x.length - 1)
				g.quadraticCurveTo(x[i], y[i],
						(x[i] + x[i + 1]) / 2, (y[i] + y[i + 1]) / 2);
			else
				g.lineTo(x[i], y[i]);
		}
		g.stroke();		
	}
	
	function drawCurve(u, v, x, y) {
		var d = 1;
		var a = (w / 2) * (scale * x + d);
		var b = (h / 2) * (scale * y + d);
		var a2 = (w / 2) * (scale * u + d);
		var b2 = (h / 2) * (scale * v + d);
		g.beginPath();
		g.moveTo(a,b);
		var dx = a2 - a;
		var dy = b2 - b;
		var cx = (a + a2) / 2 - dy / 10 + rnd(ribbonWidth);
		var cy = (b + b2) / 2 + dx / 10 + rnd(ribbonWidth);
		g.quadraticCurveTo(cx, cy, a2, b2);
		g.stroke();
	}

	// i am too lazy to write gaussian generator so
	// thanks, central limit theorem!
	function rnd(n) {
		var s = Math.random() + Math.random() + Math.random() +
				Math.random() + Math.random() + Math.random() +
				Math.random() + Math.random() + Math.random();
		return n * (s / 9 - .5);
	}
		
	function drawLine(u, v, x, y) {
		var d = 1;
		var a = (w / 2) * (scale * x + d);
		var b = (h / 2) * (scale * y + d);
		var a2 = (w / 2) * (scale * u + d);
		var b2 = (h / 2) * (scale * v + d);
		g.beginPath();
		g.moveTo(a, b);
		g.lineTo(a2, b2);
		g.stroke();
	}
}
// Create object to draw pulsing waves of influence over a chessboard.

function waveGraphics(output, actualSize, scale, dx, dy) {
	var size = actualSize / scale;
	if (~~(size / 8) != size / 8) {
		window.console.log(
				'oops! needed actual size divisible by 8 * scale');
	}
	var image = document.createElement('canvas');
	image.width = size;
	image.height = size;
	var g = image.getContext('2d');
	var createTime = Date.now();
	var field = [];
	clear();

	var side = ~~(size / 8);
	var frequency = size / 1200; // Try varying this for different scales...
	var imageData = g.createImageData(side * 8, side * 8);
	var numPix = side * side * 8 * 8;
	var pix = [];
	var position;

	var self = {
		render: render,
		setPosition: setPosition,
		time: 0
	};

	var frames = 0;
	var totalTime = 0;
	return self;

	function clear() {
		for (var i = 0; i < 8; i++) {
			field[i] = [];
			for (var j = 0; j < 8; j++) {
				field[i][j] = [];
		  }
		}
	}

	function setPosition(newPosition) {
		position = newPosition;
		clear();

		function add(strength, source, target) {
			if (target < 0 || target > 63) {
				return;
			}
			var influence = {
					x: chess.x(source),
					y: 7 - chess.y(source), // put white at bottom
					strength: strength
			};
			field[chess.x(target)][7 - chess.y(target)].push(influence);
		}

		for (var source = 0; source < 64; source++) {
			var piece = position.board[source];
			if (!piece) {
				continue;
			}
			var strength = piece > 0 ? 30 * piece : 16 * piece;
			var x = chess.x(source);
			var y = chess.y(source);		

			// Get piece moves using rays.
			if (Math.abs(piece) > 1) {	
				var rays = rayTable[Math.abs(piece)][source];
				for (var k = 0; k < rays.length; k++) {
					for (var j = 0; j < rays[k].length; j++) {
						var target = rays[k][j];
						add(strength, source, target);
						if (position.board[target]) {
							break;
						}
					}
				}
			}
			// Get white normal pawn moves.
			else if (piece == chess.P) {
				if (x > 0) add(strength, source, source + 7); // Left capture
				if (x < 7) add(strength, source, source + 9); // Right capture
			}
			// Get black normal pawn moves.
			else if (piece == -chess.P) {
				if (x < 7) add(strength, source, source - 7); // Right capture
				if (x > 0) add(strength, source, source - 9); // Left capture
			}
		}
	}

	
	function render(opt_boardOnly) {
		var start = Date.now();
		var bigSide = side * scale;
		var t = (Date.now() - createTime) / 1000;
		for (var i = 0; i < numPix; i++) {
			pix[i] = 0;
		}
		for (var gx = 0; gx < 8; gx++) {
			for (var gy = 0; gy < 8; gy++) {
				output.fillStyle = (gx + gy) % 2 ?
						chess.colors.blackSquare : chess.colors.whiteSquare;
				output.fillRect(gx * bigSide, gy * bigSide, bigSide, bigSide);
				field[gx][gy].forEach(function(influence) {
					renderOneInfluence(influence, gx, gy, t);
				});
			}
		}
		if (opt_boardOnly) {
			return;
		}

		var p = 0;
		var alpha = 0;
		var q;
		for (var i = 0; i < numPix; i++) {
			q = ~~(pix[i] * 2);
			alpha = 0;
			if (q > 0) {
				if (q > 255) {
					q = 255;
				}
				alpha = q;
				q = 255;
			} else if (q < 0) {
				q *= 2;
				if (q < -255) {
					q = -255;
				}
				alpha = -q;
				q = 0;
			}
			imageData.data[p++] = q;
			imageData.data[p++] = q;
			imageData.data[p++] = q;
			imageData.data[p++] = alpha;
		}
		g.putImageData(imageData, 0, 0);
		output.drawImage(image, dx, dy, size * scale, size * scale);
		totalTime += Date.now() - start;
		frames++;
		self.time = totalTime / frames;
	}

	function renderBackground(gx, gy, bg) {
		var scan = side * 8;
		var base = gx * side + gy * scan * side;
		for (var y = 0; y < side; y++) {
			var by = y * scan + base;
			for (var x = 0; x < side; x++) {			
				pix[by++] = bg;
			}
		}
	}

	function renderOneInfluence(influence, gx, gy, t) {
		var scan = side * 8;
		var base = gx * side + gy * scan * side;
		var s2 = ~~(side / 6);
		var ix = side * (influence.x - gx) + side / 2;
		var iy = side * (influence.y - gy) + side / 2;
		var s3 = frequency * s2 * s2;
		var rt = t / 2;
		var m = .15 * influence.strength;
		for (var y = 0; y < side; y++) {
			var dy = y - iy;
			var by = y * scan + base;
			var p = by;
			for (var x = 0; x < side; x++) {			
				var dx = x - ix;
				var q = Math.sqrt(dx * dx + dy * dy) / s3 - rt;
				var f = 2 * (q - Math.floor(q));
				if (f > 1) f = 2 - f;
				pix[p++] += m * f;		
			}
		}
	}
}
// Draws a set of captured pieces.

var CapturedPieces = function(canvas, side) {
	this.w = canvas.width;
	this.h = canvas.height;
	this.g = canvas.getContext('2d');
	this.side = side;
	this.clearPieces();
};

CapturedPieces.prototype.clearPieces = function() {
	this.blackPieces = [];
	this.whitePieces = [];
	this.draw();
};

CapturedPieces.prototype.addPiece = function(piece) {
	if (!piece) return;
	(piece > 0 ? this.whitePieces : this.blackPieces).push(piece);
	this.draw();
};

CapturedPieces.prototype.draw = function() {
	var midY = ~~(this.h / 2);
	var side = this.side;
	var g = this.g;
	g.fillStyle = chess.colors.background;
	g.fillRect(0, 0, this.w, this.h);
	for (var i = 0; i < this.whitePieces.length; i++) {
		var x = (i % 8) * side / 2;
		var y = midY - side * (~~(i / 8) / 2 + 3 / 4);
		drawPiece(g, this.whitePieces[i], x, y, side);
	}
	for (var i = 0; i < this.blackPieces.length; i++) {
		var x = (i % 8) * side / 2;
		var y = midY + side * (~~(i / 8) / 2 - 1 / 4);
		drawPiece(g, this.blackPieces[i], x, y, side);
	}
};
// Entry point for Thinking Machine 6.

function main() {

	// Are we in test mode, with #testing at end of URL?
	var testing = window.location.hash.match(/testing/);
	if (testing) {
		window.console.log('in test mode.');
	}

	// Set up dimensions and graphics.
	var canvas = document.getElementById('board');
	var g = canvas.getContext('2d');
	var side = Math.min(canvas.width, canvas.height);
	side = 32 * (~~(side / 32));
  var board = {
  	x: 0,
    y: 0,
    side: side
  };
  var squareSide = side / 8;
  function squareLocation(a, b) {
  	return {
  		x: a * board.side / 8 + board.x,
  		y: b * board.side / 8 + board.y
  	};
  }

  // Define game states.
	var WAITING = 0;
	var USER_MOVING = 4;
	var AI_THINKING = 1;
	var AI_MOVING = 2;
	var GAME_OVER = 3;

  // Handle new message for status display.
  function announceStatus(message) {
  	document.getElementById('game-status').innerHTML = message;
  }

  // Set up display of captured pieces.
  var captureCanvas = document.getElementById('captured');
  var captureDisplay = new CapturedPieces(
  		captureCanvas, squareSide / 2);

	// Set up game.
  var gameId = 0;
	var state = WAITING;
	var position;
	var waves = waveGraphics(g, board.side, 4, board.x, board.y);
	var waitStartTime;
	var pieces;
	var selectedPiece;
	var startX, startY;

	// Flag for instantaneous movement during testing.
	var testing = window.location.hash.indexOf('debug') != -1;

	// Flag for mobile. We set true on first touch event.
	var isMobile = false;

	// Handle a move.
	function makeMove(move) {
		position.makeMove(move);
		captureDisplay.addPiece(move.targetPiece);
	}

	// Set up visualization and timing info.
	var visualization = moveGraphics(g, board.side, board.side);
	var lastDraw = Date.now();

	// Set up AI.
	var thinker;
	function resetAI() {
		if (thinker) {
			thinker.terminate();
		}
		thinker = new Worker('ai-worker.js');
		thinker.addEventListener('message', function(e) {
			// AI reports examination of a new branch with 'branch' event.
		  if (e.data.type == 'branch') {
				if (Date.now() - lastDraw < 10) {
					return;
				}
				lastDraw = Date.now();
		  	var positions = e.data.branch.map(function(p) {
		  		var pos = new Position(p);
		  		pos.lastMove = Move.copy(p.lastMove);
		  		return pos;
		  	});
		  	visualization(positions, e.data.value);
		  } else {
		  	// AI reports a new move with 'move' event.
		  	if (e.data.type == 'move') {
		  		var move = Move.copy(e.data.move);
		  		findPieces(move);
		  		animateMove(move, function() {
		  			makeMove(move);
		  			startWaitingForUser();
		  		}, 0);
		  	} else if (e.data.type == 'stop-ack') {
		  		//window.console.log('stopped!');
		  	} else {
		  		window.console.log('weird message', e.data);
		  	}
		  }
		}, false);
	}

	// Set up state for new game. (Animation loop handled elsewhere.)
	function startNewGame() {
	  position = new Position();
	  captureDisplay.clearPieces();
	  // Stop any on-going thinking, otherwise we get spurious
	  // events later!
	  resetAI();
	  thinker.postMessage({type: 'stop'});
		startWaitingForUser(true);
	}
	document.getElementById('play-button').onclick = startNewGame;

	// Animate computer's move.
	function animateMove(move, actionWhenDone, t) {
		t = t || 0;
		// If done animating, perform final action and leave.
		if (t > 1.001) {
			actionWhenDone();
			return;
		}

		// Draw an animation frame:
		// First, the board background.
		waves.render(true);

		// Draw all pieces *except* the one moving.
		pieces.forEach(function(p) {
			if (!p.inMotion) {
			  drawPiece(g, p.piece, p.x, p.y, squareSide);
			}
		});

		// Draw a piece using linear interpolation, for animation.
		function lerp(a, b) {
			return t * b + (1 - t) * a;
		}
		function draw(piece, from, to) {
			var fromLoc = squareLocation(chess.x(from), 7 - chess.y(from));
			var toLoc = squareLocation(chess.x(to), 7 - chess.y(to));
			var x = lerp(fromLoc.x, toLoc.x);
			var y = lerp(fromLoc.y, toLoc.y);
			drawPiece(g, piece, x, y, squareSide, chess.colors.blackMove);
		}
		
		// Draw pieces that are moving.
		draw(move.piece, move.from, move.to);
		if (move.isCastle()) {
			draw(position.board[move.castleRoomFrom],
					move.castleRoomFrom, move.castleRoomTo);
		}
		
		// Do another frame, since not done.
		requestAnimationFrame(function() {
			animateMove(move, actionWhenDone, t + .05);
		});
	}

	// Get pointer position for event.
	function mouse(e) {
		//if (e.touches) {
		//	e = e.touches[0];
		//}
		if (e.changedTouches) {
			e = e.changedTouches[0];
		}
		var canvasRect = canvas.getBoundingClientRect();
		var x = e.clientX - canvasRect.left;
		var y = e.clientY - canvasRect.top;
		// Canvas is double-sized for retina displays.
		return {x: 2 * x, y: 2 * y};
	}

	function screenIndex(x, y) {
		var boardX = ~~(x / squareSide);
		var boardY = 7 - ~~(y / squareSide);
		return chess.index(boardX, boardY);
	}

	// Try to pick up a piece at event location.
	var startIndex;
	function pickUpPiece(e) {
		if (state != WAITING) {
			return;
		}
		var m = mouse(e);
    startIndex = screenIndex(m.x, m.y);

		pieces.forEach(function(p) {
			if (p.index == startIndex && p.piece > 0) {
				selectedPiece = p;
			}
		});
		if (selectedPiece) {
			startX = m.x;
			startY = m.y;
			state = USER_MOVING;
			drawBoard(true);
		}
	}

	// Try to put down a piece at event location.
	function putDownPiece(e) {
		if (state != USER_MOVING) {
			return;
		}
		// Translate the result into a legal move--if it exists!
		var m = mouse(e);
		var index = screenIndex(m.x, m.y);
		var move = position.findLegalMove(selectedPiece.index, index);

		// If this was not a legal move, go back to waiting.
    if (!move) {
    	state = WAITING;
    	selectedPiece.x = selectedPiece.originalX;
    	selectedPiece.y = selectedPiece.originalY;
    	selectedPiece = null;
    	return;
    }

		// If so, put the piece there and update the position.
		makeMove(move);
		findPieces();
		selectedPiece = null;
		drawBoard(true);

		// Start thinking...
		startMachineThinking();		
	}

	// Mobile: drag and drop via touches.
	canvas.addEventListener('touchstart', function(e) {
		isMobile = true;
		pickUpPiece(e);
		drawBoard(true);
		e.preventDefault();
	});

	canvas.addEventListener('touchmove', function(e) {
		e.preventDefault();
		if (state != USER_MOVING) {
			return;
		}
		var m = mouse(e);
		selectedPiece.x = m.x - startX + selectedPiece.originalX;
		selectedPiece.y = m.y - startY + selectedPiece.originalY;
	});

	canvas.addEventListener('touchend', function(e) {
		putDownPiece(e);
		e.preventDefault();
	});


	// Desktop: do a traditional drag and drop.
	canvas.addEventListener('mousedown', function(e) {
		if (!isMobile) {
			pickUpPiece(e);
		}
	});

	canvas.addEventListener('mouseup', function(e) {
		if (!isMobile) {
			putDownPiece(e);
		}
	});

	canvas.addEventListener('mousemove', function(e) {
		if (state != USER_MOVING || isMobile) {
			return;
		}
		var m = mouse(e);
		selectedPiece.x = m.x - startX + selectedPiece.originalX;
		selectedPiece.y = m.y - startY + selectedPiece.originalY;
	});

	// Utility functions:
	// Sets up the "pieces" array for the current move, adding
	// location, motion info.
  function findPieces(move) {
  	pieces = [];
    position.board.forEach(function(p, i) {
    	if (!p) {
    		return;
    	}
    	var location = squareLocation(chess.x(i), 7 - chess.y(i));
    	pieces.push({
    		piece: p,
    		index: i,
    		x: location.x,
    		y: location.y,
    		originalX: location.x,
    		originalY: location.y,
    		inMotion: move && move.inMotion(i)
    	});
    });
  }
 
  // Check if game is over, and if so, say appropriate status message.
  function isGameOver() {
  	var gameStatus = position.getGameStatus();
  	if (gameStatus == chess.GAME_ALIVE) {
  		return false;
  	}
  	var message = 'The game is over. ';
  	if (gameStatus == chess.DRAW) {
  		message += 'It was a draw.';
  	}
  	if (gameStatus == chess.BLACK_WIN) {
  		message += 'The computer won.';
  	}
  	if (gameStatus == chess.WHITE_WIN) {
  		message += 'You won.';
  	}
  	announceStatus(message);
  	state = GAME_OVER;
  	return true;
  }

  // Begin phase where we wait for use to make move.
	function startWaitingForUser(isFirstMove) {
		if (isGameOver()) {
			return;
		}
		state = WAITING;
		announceStatus(isFirstMove ? 'You are white. It is your move.' :
			'Your move.');
		canvas.style.cursor = 'hand';

		// Make a list of pieces on the board, to be used
		// in drawing pulsing waves.
    findPieces();

		// Set up waves.
		waves.setPosition(position);

		// Reset waiting time counter.
		waitStartTime = Date.now();
	}

	// Begin phase where we let the machine make a move.
  function startMachineThinking() {
  	if (isGameOver()) {
  		return;
  	}
  	canvas.style.cursor = 'arrow';
  	state = AI_THINKING;
  	announceStatus('The computer is thinking.');
  	thinker.postMessage({
			type: 'start',
			position: position,
			depth: testing ?  0 : 2,
			minTime: testing ? 0 : 1000
		});
  }

  // Draw board, pieces, waves of influence.
  // If opt_boardOnly, don't show waves.
	function drawBoard(opt_boardOnly) {
		waves.render(opt_boardOnly);
		pieces.forEach(function(p) {
			if (p != selectedPiece) {
			  drawPiece(g, p.piece, p.x, p.y, squareSide);
			}
		});
		// Draw selected piece last so it's on top.
		if (selectedPiece) {
			var x = selectedPiece.x;
			var y = selectedPiece.y;
			if (isMobile) {
				// Highlight rows and columns of selected piece;
				// this is helpful on touch screens where fingers
				// are big compared to squares on the board.
				g.fillStyle = 'rgba(200,255,220,.1)';
				g.fillRect(0, ~~((y + squareSide / 2) / squareSide) *
						squareSide, 8 * squareSide, squareSide);
				g.fillRect(~~((x + squareSide / 2) / squareSide) *
						squareSide, 0, squareSide, 8 * squareSide);
			}
			drawPiece(g, selectedPiece.piece, x, y,
					squareSide, chess.colors.whiteMove);
		}
	}

	// Main loop for wave animation.
	function animationLoop() {
		if (state == USER_MOVING || state == WAITING) {
		  drawBoard(state == USER_MOVING);
		}
		requestAnimationFrame(animationLoop);
	}

	// Let's go!
	startNewGame();
	animationLoop();
}
