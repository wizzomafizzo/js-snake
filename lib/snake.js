/*
 Snake

 - Snake plays on a two dimensional grid with a fixed width and height.
 - The player controls a "snake" comprised of a variable number of body
   segments, connected to each other in sequence.
 - The player chooses which direction the snake moves in until the next
   direction change.
 - As each game turn progresses, the snake's head will move one space in the
   current set direction, with all trailing body parts replacing the part in
   front of it in sequence, moving the snake.
 - A piece of food taking up one grid space is spawned at all times in a random
   position on the grid. When the food is eaten, the number of snake body
   segments increased by one and a new piece of food spawns.
 - If the snake's head moves into the grid border limits or its own tail, the
   game is over.
 - A score is kept tracking the total number of food eaten.
 */

"use strict";

function random_int(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function make_coords(x, y) {
	return [x, y];
}

function random_coords(game) {
	return make_coords(random_int(0, game.size[0]),
					   random_int(0, game.size[1]));
}

function coords_equal(a, b) {
	if (a[0] === b[0] && a[1] === b[1]) {
		return true;
	} else {
		return false;
	}
}

function make_snake(x, y) {
	return [make_coords(x, y), make_coords(x, y + 1)];
};

function make_game(width, height) {
	return {
		size: [width, height],
		score: 0,
		direction: null,
		snake: null,
		food: null
	};
};

function is_cell_empty(game, x, y) {
	// Checks if the requested cell is outside the game bounds or contains
	// a piece of the snake. Food is ignored.

	if (x < 0 || y < 0) {
		return false;
	}

	if (x >= game.size[0] || y >= game.size[1]) {
		return false;
	}

	for (var i = 0; i < game.snake.length; i++) {
		if (coords_equal(game.snake[i], [x, y])) {
			return false;
		}
	}

	return true;
}

function cell_has_food(game, x, y) {
	return coords_equal(game.food, [x, y]);
}

function empty_cell(game) {
	// Finds a random empty cell on the board and returns its coords. It has
	// a check to stop infinite loops.

	var coords = random_coords(game),
		tries_left = game.size[0] * game.size[1];

	while (!(is_cell_empty(game, coords[0], coords[1])) &&
		   tries_left > 0) {
		coords = random_coords(game);
		tries_left--;
	}

	if (tries_left === 0) {
		return false;
	} else {
		return coords;
	}
}

function next_coords(game) {
	// Given the current set direction, return the coords of the cell adjacent
	// to the snake's head.

	var head = game.snake[0],
		next = null;

	switch (game.direction) {
	case "up":
		next = make_coords(head[0], head[1] - 1);
		break;
	case "down":
		next = make_coords(head[0], head[1] + 1);
		break;
	case "left":
		next = make_coords(head[0] - 1, head[1]);
		break;
	case "right":
		next = make_coords(head[0] + 1, head[1]);
		break;
	default:
		return false;
	}

	return next;
}

function move_snake(game) {
	// Try to move the whole snake to the next cell, return false if there is
	// an obstacle.

	var next = next_coords(game);

	if (is_cell_empty(game, next[0], next[1])) {
		game.snake.unshift(next);
		game.snake.pop();
		return true;
	} else {
		return false;
	}
}

function grow_snake(game) {
	game.snake.unshift(next_coords(game));
}

function inc_score(game) {
	game.score += 1;
}

function spawn_food(game) {
	game.food = empty_cell(game);
}

function setup_game(game) {
	var center = make_coords(Math.floor(game.size[0] / 2),
							 Math.floor(game.size[1] / 2));

	game.direction = "up";
	game.snake = make_snake.apply(null, center);
	spawn_food(game);
}

function step_game(game) {
	// Try to process the next turn, return false if obstacle hit (game end).

	var next = next_coords(game);

	if (cell_has_food(game, next[0], next[1])) {
		grow_snake(game);
		spawn_food(game);
		inc_score(game);
		return true;
	} else {
		if (move_snake(game)) {
			return true;
		} else {
			return false;
		}
	}
}

var SnakeUI = function(width, height, cell_size, speed) {
	var canvas = document.getElementById("snake"),
		context = canvas.getContext("2d"),
		score = document.getElementById("score"),
		game_width = Math.floor(width / cell_size),
		game_height = Math.floor(height / cell_size),
		game = make_game(game_width, game_height),
		interval = 0,
		waiting_step = false;

	canvas.width = width;
	canvas.height = height;

	var draw_snake = function() {
		for (var i = 0; i < game.snake.length; i++) {
			if (i === 0) {
				context.fillStyle = "#5BA371";
				context.beginPath();
				context.arc(game.snake[i][0] * cell_size + cell_size / 2,
							game.snake[i][1] * cell_size + cell_size / 2,
							cell_size / 1.5,
							Math.PI * 2,
							0);
				context.closePath();
				context.fill();
			} else {
				if (i % 3 === 0) {
					context.fillStyle = "#ADD9C2";
				} else {
					context.fillStyle = "#5BA371";
				}

				context.fillRect(game.snake[i][0] * cell_size,
								 game.snake[i][1] * cell_size,
								 cell_size,
								 cell_size);
			}
		}
	};

	var draw_food = function() {
		context.fillStyle = "#FF004C";

		context.beginPath();
		context.arc(game.food[0] * cell_size + cell_size / 2,
					game.food[1] * cell_size + cell_size / 2,
					cell_size / 2,
					Math.PI * 2,
					0);
		context.closePath();
		context.fill();
	};

	var update = function() {
		if (interval > 0) {
			interval -= 1;
		} else {
			if (!(step_game(game))) {
				return false;
			}

			context.fillStyle = "#FFFFFF";
			context.fillRect(0, 0, width, height);

			draw_food();
			draw_snake();

			score.innerHTML = game.score + "";

			waiting_step = false;
			interval = speed;
		}

		window.requestAnimationFrame(update);
		return true;
	};

	var setup = function() {
		// This is all so you can't turn back into yourself.

		window.addEventListener("keydown", function(event) {
			if (waiting_step) {
				return;
			}

			switch (event.keyCode) {
			case 38:
				if (game.direction !== "down") {
					game.direction = "up";
					waiting_step = true;
				}
				break;
			case 40:
				if (game.direction !== "up") {
					game.direction = "down";
					waiting_step = true;
				}
				break;
			case 37:
				if (game.direction !== "right") {
					game.direction = "left";
					waiting_step = true;
				}
				break;
			case 39:
				if (game.direction !== "left") {
					game.direction = "right";
					waiting_step = true;
				}
				break;
			default:
				break;
			}
		});
	};

	var start = function() {
		setup_game(game);
		window.requestAnimationFrame(update);
	};

	return {
		setup: setup,
		update: update,
		start: start
	};
};
