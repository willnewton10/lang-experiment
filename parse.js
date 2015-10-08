
function removeComments(text) {
    return text.split("\n").map(function (line) {
		
		var inString = false;
		for (var i=1; i<line.length; i++) {
		    var prev = line[i-1];
			var curr = line[i];
			if (curr == '"') {
				inString = !inString;
			} else if (!inString && (curr+prev) == "//") {
				return line.substring(0, i - 1);
			}
		}
		return line;
	}).join("\n");
}

console.log("REMOVE COMMENTS: " + (
			removeComments("blah//somethin\nblahblah //\nb\nlahblahblah \"hello\" //morecomment") ==
						   "blah"+       "\nblahblah "+"\nb\nlahblahblah \"hello\" "));

function all(arr, f) {
	f = f || function (i) {return i;};
	
	for (var i=0; i<arr.length; i++) {
		if (! f(arr[i])) return false;
	}
	return true;
}		

console.log(  all([true, true, true]));
console.log(! all([true, true, false]));
console.log(  all([3,2,4], function (i) { return i > 1}));
console.log(! all([3,2,4], function (i) { return i > 2}));
	
function createValidator(printFunction) {
	
	printFunction = printFunction || function (i) {};
    
	return function isValid(tree, needFunction) {
        var needFunction = needFunction || false;
		if (tree.length == 0) { // allow functions defined with 0 args
			return !needFunction;
		}
        var first = tree[0];
        var firstIsOk;
        
        if (typeof first == 'string') {     
            firstIsOk = needFunction ? (first == "fun") : true;
            
            if (!firstIsOk) 
                printFunction("illegal anonymous operator found: '" + first + "'" + 
                      "\n\tdo you have extra parens somewhere? '(('");
            
        } else {
            firstIsOk = isValid(first, true);
        }
        
        return firstIsOk && all(tree.slice(1), isValid);
    }
}

function parse(raw) {
    raw = raw.replace(/[\n\t\r ]+/g, " ").trim();
    if (raw.indexOf("(") == -1) {
        // then its just a value, not a function call.
        return raw;
    }

    var parts = [];
    
	// console.log("raw: " + raw);
    // remove parens
    raw = raw.slice(1, raw.length - 1).trim();
    // console.log("raw: " + raw);
    while (raw.length > 0) {
     //   console.log("raw: {%s}", raw);
        
        if (raw[0] == "(") { // current operand is a function call
            var E = findEnd(raw, 0);
            var oprnd = raw.slice(0, E + 1).trim();
            raw = raw.slice(E + 2);
            parts.push(parse(oprnd));
            
        } else { // current operand is a primitive (or an operator, with no parens (x ...) not: ((x)...
            var S = raw.indexOf(" ");
			
			if (raw[0] == '"') {
			    var secondQuote = raw.indexOf('"', 1);
				S = raw.indexOf(" ", secondQuote);
			} 
			var part;
            
			if (S == -1) {
			    part = raw;
                raw = "";
            } else {
			    part = raw.slice(0, S).trim();
                raw = raw.slice(S + 1);
            }
			
			parts.push(part);
        }
        
        raw = raw.trim();
    }
    
    return parts;
}

function findEnd(str, beginAt) {
    var count = 1;
    for (var i=beginAt + 1; i<str.length; i++) {
        if (str[i] == "(") count++;
        if (str[i] == ")") count--;
        if (count == 0) return i;
    }
}