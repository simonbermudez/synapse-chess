// Global constants and basic chess info.

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
  
  colors: {
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
