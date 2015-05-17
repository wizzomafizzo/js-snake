function array_equal(array1, array2) {
	var i = 0;

	if (array1.length != array2.length) {
		return false;
	}

	for (i = 0; i < array1.length; i++) {
		if (array1[i] != array2[i]) {
			return false;
		}
	}

	return true;
}

QUnit.test("Snake", function(assert) {
	var game;

	assert.ok(array_equal(make_coords(0, 10), [0, 10]));
	assert.ok(array_equal(make_coords(10, 0), [10, 0]));
	assert.ok(coords_equal([0, 0], [0, 0]));
	assert.notOk(coords_equal([0, 0], [1, 1]));
	assert.ok(array_equal(make_snake(0, 10)[0], [0, 10]));

	game = make_game(10, 20);

	assert.ok(game.size[0] === 10);
	assert.ok(game.size[1] === 20);
	assert.ok(game.score === 0);
	assert.ok(game.direction === null);
	assert.ok(game.snake === null);
	assert.ok(game.food === null);

	game.snake = make_snake(0, 5);
	game.food = make_coords(5, 10);

	assert.ok(is_cell_empty(game, 0, 0));
	assert.ok(is_cell_empty(game, 9, 19));
	assert.notOk(is_cell_empty(game, 0, 5));
	assert.ok(is_cell_empty(game, 5, 10));
	assert.notOk(is_cell_empty(game, -1, 5));
	assert.notOk(is_cell_empty(game, 0, 20));

	assert.ok(cell_has_food(game, 5, 10));
	assert.notOk(cell_has_food(game, 5, 5));

	game.snake = make_snake(5, 5);

	game.direction = "up";
	assert.ok(coords_equal(next_coords(game), [5, 4]));
	game.direction = "down";
	assert.ok(coords_equal(next_coords(game), [5, 6]));
	game.direction = "left";
	assert.ok(coords_equal(next_coords(game), [4, 5]));
	game.direction = "right";
	assert.ok(coords_equal(next_coords(game), [6, 5]));

	move_snake(game);
	assert.ok(coords_equal(game.snake[0], [6, 5]));
	assert.ok(game.snake.length === 1);

	grow_snake(game);
	assert.ok(coords_equal(game.snake[0], [7, 5]));
	assert.ok(game.snake.length === 2);

	move_snake(game);
	assert.ok(coords_equal(game.snake[0], [8, 5]));
	assert.ok(game.snake.length === 2);

	grow_snake(game);
	assert.ok(coords_equal(game.snake[0], [9, 5]));
	assert.ok(game.snake.length === 3);

	assert.notOk(move_snake(game));
	assert.notOk(grow_snake(game));
	assert.ok(coords_equal(game.snake[0], [9, 5]));
	assert.ok(game.snake.length === 3);

	inc_score(game);
	assert.ok(game.score);
});
