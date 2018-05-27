# synapse-andtek-empire
The Thinking Machine 6 powered by SynapseGL backend


#What is happening?
The artwork is an artificial intelligence program, ready to play chess with the viewer. If the viewer confronts the program, the computer's thought process is sketched on screen as it plays. A map is created from the traces of literally thousands of possible futures as the program tries to decide its best move. Those traces become a key to the invisible lines of force in the game as well as a window into the spirit of a thinking machine.

#What do the images mean?
When it is your (White's) turn to move, the chess board will gently pulse to show the influence of the various pieces. Each white piece causes light ripples on the squares it attacks; black pieces, in turn, add darker ripples. When the machine (Black) is thinking, a network of curves is overlaid on the board. The curves show potential moves—often several turns in the future—considered by the computer. Orange curves are moves by black; green curves are ones by white. The brighter curves are thought by the program to be better for white.

#Why is the computer so [easy/hard] to beat?
The chess playing engine is designed to be at the same level as the average viewer of the piece. If you're a tournament chess player, you would clobber most casual players—and you'll clobber Thinking Machine 4 too. If you barely remember the rules of the game, the artwork may clobber you instead. The chess engine we built is simple and uses only basic algorithms from the 50s (alpha-beta pruning and quiescence search). The program's unconventional initial moves may raise eyebrows among experts: we did not give it an "opening book" of standard lines since we wanted it to think through every position.
The goal of the piece is not to make an expert chess playing program but to lay bare the complex thinking that underlies all strategic thought.

#What were Thinking Machines 1, 2, 3, 4, and 5?
No. 1, built in 2002, was an exploratory version that was similar in concept to this but was completely different graphically and technically. No. 2 was an installation that looks like this one; it was shown at the London ICA, 2003, as part of the work of MW2MW show. No. 3 was an improved installation shown at Ars Electronica, 2004, as part of the "Language of Networks" exhibit. A variation (3.1?) is in the permanent collection of the Museum of Modern Art, and appeared in the Design and the Elastic Mind exhibit in 2008. No. 4 was the first internet edition, which appeared on Turbulence in 2004. Very sadly, Turbulence has announced that it will no longer continue, and the technology of No. 4 has in any case become obsolete. No. 5 was intended to be a physical installation, but has not yet been built.

#What is the technology behind this?
The artwork is written in Javascript, and based on a port of Java code from 2004.
Who created this series?
Martin Wattenberg and Marek Walczak created the first versions. Johanna Kindvall and Fernanda Viégas contributed to later versions and Ian Andtek created this version using a SynapseGL framework to do the distributed computations. 