var out = document.getElementById('out');
var input = document.getElementById('in');

input.focus();

function print(a) {
	out.value += a + "\n";
	out.scrollTop = out.scrollHeight;
}
function clear() {
	out.value = "";
}
function clearInput() {
	input.value = "";
}
function printInput(code) {
	input.value += code;
	// input.scrollTop = input.scrollHeight;
}

var validate = createValidator(print);

function runScript(what) {
	clear();
	var command = input.value; 
	var parsed = parse(removeComments(command));
	
	if (what == "run") {				
		var scope = Scope(print);	
		var valid = validate(parsed);
		if (valid) {
			var result = evaluate(parsed, scope);
		}
	}
	else if (what == "parse") {
		print(JSON.stringify(parsed));
	} else if (what == "runTests") {
		print("Running tests...");	
		runTests(print);
		print("Running tests complete.");
	} else if (what == "openCodeInNewTab") {
		var myWindow = window.open("data:text," + encodeURIComponent(command),
			"_blank");
		myWindow.focus();
	}
}


var openFile = function(event) {
	var fileInput = event.target;

	var reader = new FileReader();
	reader.onload = function() {
		var code = reader.result;
		clearInput();
		printInput(code);
	};
	
	reader.readAsText(fileInput.files[0]);
};
