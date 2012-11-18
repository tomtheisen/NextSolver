(function() {
	var startTextArea = $("#startState")[0];
	startTextArea.value = startTextArea.value.replace(/^\s+/,"")
	startTextArea.value = startTextArea.value.replace(/\n[\t ]+/g,"\n")

	$("#instructionsButton").click(function() {
		$("#instructions").slideToggle();
	});

	$("#instructions .close").click(function() {
		$("#instructions").slideUp();
	});

	var serialize = function(state) {
		return "state: " + state.join("\n")
	}

	var isSolved = function(state) {
		return _.all(state, function(x) { return !x.match(/[a-z]/); });
	}

	var outputState = function(state) {
		var output = _.map(state, function(x) {
			return "<div class='solutionRow'>" + x + "</div>";
		}).join("\n");

		output = "<div class='solutionState'>" + output + "</div>";

		$("#outputWindow").append(output);
	}

	var outputMessage = function(msg) {
		$("#outputWindow").html(msg);
	}

	var clearOutput = function() {
		$("#outputWindow").html("");
	}

	// get all legal moves from this state
	// state: array of string representing board
	var moves = function(state) {
		var result = [];

		for (var r = 1; r < state.length - 1; r++) {
			var row = state[r];
			for (var c = 1; c < row.length - 1; c++) {
				if (row[c] < "a" || row[c] > "z") continue;
				for (var d = -1; d <= 1; d += 2) {
					if (row[c + d] !== " ") continue;
					result.push(move(state, r, c, d))
				}
			}
		}

	// state: array of string representing board
		return result;
	}

	// generate new state for specified move
	// state: array of string representing board
	// r: row index of tile to move
	// c: col index of tile to move
	// d: direction to move tile, -1 is left, 1 is right
	var move = function (state, r, c, d) {
		state = state.slice(0);
		var row = state[r];
		var tile = row[c];

		// move tile
		var destCol = c + d;
		state[r] = row.substring(0,c) + " " + row.substring(c + 1);
		state[r] = state[r].substring(0, destCol) + tile + state[r].substring(destCol + 1);

		// do drop and match
		return dropAndMatch(state, r, destCol);
	}

	// perform a gravity drop and match
	// state: array of string representing board
	// r: row index of tile to move
	// c: col index of tile to move
	var dropAndMatch = function(state, r, c) {
		state = state.slice(0);
		var row = state[r];
		var tile = row[c];

		row = state[r] = row.substring(0, c) + " " + row.substring(c + 1)

		// calculate fall
		var landingRow;
		for(landingRow = r; state[landingRow + 1][c] === " "; landingRow++) ; // <- semicolon! beware!

		// calculate match
		var matches = false;
		var leftMatch = false;
		var rightMatch = false;

		if (state[landingRow][c - 1] === tile) {
			leftMatch = matches = true;
			state[landingRow] = state[landingRow].substring(0, c - 1) + " " + state[landingRow].substring(c);
		}

		if (state[landingRow][c + 1] === tile) {
			rightMatch = matches = true;
			state[landingRow] = state[landingRow].substring(0, c + 1) + " " + state[landingRow].substring(c + 2);
		}

		if (state[landingRow + 1][c] === tile) {
			matches = true;
			state[landingRow + 1] = state[landingRow + 1].substring(0, c) + " " + state[landingRow].substring(c + 1);
		}

		if (matches) {
			state[landingRow] = state[landingRow].substring(0, c) + " " + state[landingRow].substring(c + 1);
		} else {
			state[landingRow] = state[landingRow].substring(0, c) + tile + state[landingRow].substring(c + 1);
		}

		if (leftMatch && state[landingRow - 1][c - 1].match(/[a-z]/))
			state = dropAndMatch(state, landingRow - 1, c - 1);

		if (rightMatch && state[landingRow - 1][c + 1].match(/[a-z]/))
			state = dropAndMatch(state, landingRow - 1, c + 1);

		return state;
	}

	$("#solveButton").click(function() {
		var initialState = _.filter(startTextArea.value.split("\n"), function(x) { return x.trim() !== ""});
		var unexploredStates = [{ state: initialState, history: [] }];
		var seen = {};

		while (unexploredStates.length > 0) {
			var element = unexploredStates.shift();
			var state = element.state;
			var history = element.history;
			var serialized = serialize(state);

			if (seen[serialized]) continue;
			seen[serialized] = true;

			var newHistory = history.concat([state]);
			var newMoves = moves(state);
			unexploredStates = unexploredStates.concat(_.map(newMoves, function(x){ 
				return { state: x, history: newHistory };
			}));

			if (isSolved(state)) {
				clearOutput();
				for (var i = 0; i < history.length; i++) outputState(history[i]);
				outputState(state);
				return;
			}
		}

		outputMessage("<strong>No solution found.</strong>")
	});
})();