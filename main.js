var out = document.getElementById('out');
var input = document.getElementById('in');

input.focus();

function print(a) {
	out.innerHTML += a + "\n";
	out.scrollTop = out.scrollHeight;
}
function clear() {
	out.innerHTML = "";
}

var validate = createValidator(print);
	
function runScript(what) {
	clear()
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