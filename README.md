# PacMan with Blind and Heuristic Search

This repo contains a modified codebase for performing research on the domain of Pacman, with a focus on applying Blind and Heuristic search to attempt to produce solutions to levels in realtime.

Results indicate that BFS with sufficient depth performs well at solving single levels with 3 lives. Also strong indication that heuristics that prioritize distancing from ghosts greatly increase surviviability (as to be expected).

This paper looks into generating some compound heuristics that combine individual heuristics to attempt to compensate for shortcomings of indvidual heursitic approaches. Also of interest was adding in heuristics into a compound mix that prioritize better positioning throughout the game, such as by avoiding the far edges of the map or maintaining close distance to the average center of all capsules remaining in the maze.

Findings can be found in [this course paper](https://github.com/montymxb/pacman/blob/master/final_project_ben_friedman_531.pdf).

Based on [Lucio Panepinto's Pacman in HTML5](https://github.com/luciopanepinto/pacman).
