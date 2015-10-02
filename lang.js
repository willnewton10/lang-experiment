var printDo = false;

function eq(a, b) {
    return JSON.stringify(a) == JSON.stringify(b);   
}

var cases = [
    {
        'case' : 'add a difference',
        'input': "(+ (- 7 3) 8)",
        'expected': ["+",["-","7","3"],"8"]
    }
];

var cases2 = [
    {
        'case': '1',
        'input': "(+ (- 7 3) 8)",
        'expected': 12
    }, {
        "case": '2',
        input: '   (    +   1 (       +        1       1    ) )',
        expected: 3
        
    }, {
        'case': '3',
        input: "(> 1 0)",
        expected: true
    }, {
        'case': '4',
        input: '(> 1 2)',
        expected: false
    }, {
        'case': '5',
        input: '(and true true)',
        expected: true
    }, {
        'case': '6',
        input: '(and true false)',
        expected: false
    }, {
        'case': '7',
        input: '(and false true)',
        expected: false
    }, {
        'case': '8',
        input: '(and false false)',
        expected: false
    }, {
        'case' : '9',
        input: '(not true)',
        expected: false
    }, {
        'case' : '10',
        input: '(not false)',
        expected: true
    }, {
        'case' : '11',
        input: '(+ 0 (if (< 1 2) 1 2))',
        expected: 1
    }, {
        'case' : '12',
        input: '(+ 0 (if (> 1 2) 1 2))',
        expected: 2
    }, {
        'case' : '13',
        input: '(do 1 (> 1 0) (if (not false) 1 2) true)',
        expected: true
    }, {
        'case': '14',
        input: '(do (def a 3) (+ a a))',
        expected: 6
    }, {
        'case' : '15',
        input: '(do (def plus (fun (a b) (+ a b))) (plus 3 5))',
        expected: 8
    }, {
        'case' : '16',
        input: '(do (def countdown (fun (a) (if (= a 0) 0 (do (print a) (countdown (- a 1)))))) (countdown 10))',
        expected: 0
    }, {
		'case': '17',
		input: '(empty @)',
		expected: true
	}, {
	    'case': '18',
		input: '(empty (cons 1 @))',
		expected: false
	}, {
		'case': '19',
		input: '(car (cons 1 @))',
		expected: 1
	}, 
	{
	    'case': '20',
		input: '(do '+
					'(def red '+
						'(fun (L f agg) '+
							'(if (empty L) agg '+
								'(red (cdr L) f (f (car L) agg))))) '+
					'(def a (cons 1 (cons 2 (cons 3 (cons 4 @))))) '+
					'(def sum (fun (a b) (+ a b))) '+
					'(red a sum 0))',
		expected: 10
	}, {
		'case': '21',
		input: '(do '+
					'(def a (cons 1 (cons 2 (cons 3 (cons 4 @))))) '+
					'(def size '+
						'(fun (L) '+
							'(do '+
								'(def _size (fun (_L i) '+
									'(if (empty _L) i '+
										'(_size (cdr _L) (+ 1 i))))) '+
								'(_size L 0)))) ' +
					'(size a))',
		expected: 4
	}, {
		'case': '22',
		input: '(do '+
					'(def a (cons 1 (cons 2 (cons 3 (cons 4 @))))) '+
					'(def print-list (fun (L) '+
						'(if (empty L) 0 '+
							'(do (print (car L)) (print-list (cdr L)))))) ' +
					'(print-list a))',
		expected: 0
	}, {
		'case': '23',
		input: '(do '+
					'(def hello "hello") ' +
					'(print hello) '+
					'(def red '+
						'(fun (L f agg) '+
							'(if (empty L) agg '+
								'(red (cdr L) f (f (car L) agg))))) '+
					'(def a (cons 1 (cons 2 (cons 3 (cons 4 @))))) '+
					'(def size '+
						'(fun (L) '+
							'(red L (fun (current agg) (+ 1 agg)) 0))) ' +
					'(def size-a (size a)) '+
					'size-a)',
		expected: 4
	},{
		'case': '24',
		input: '(do '+
					'(def f (fun (x) '+
						'(do '+
							'(def y (* x 10)) '+
							'(fun (a) '+
								 '(+ a y)) '+
							'))) '+
					'(def g (f 10)) '+
					'(def y 99999) '+
					'(g 3) ' +
				")",
		expected: 103
	},{
		'case': '25',
		input: '(do (def apply (fun (f a) (f a))) (apply (fun (b) (+ 2 b)) 3))',
		expected: 5
	},{
		'case': '26',
		input: '(do ' +
					'(def red '+
						'(fun (L f agg) '+
							'(if (empty L) agg '+
								'(red (cdr L) f (f (car L) agg))))) '+
					'(def a (list 1 2 3 4)) '+
					'(def size '+
						'(fun (K) '+
							'(red K (fun (current agg) (+ 1 agg)) 0))) ' +
					'(size a))',
		expected: 4
	}
];
	//macro brainstorming:
	/*				'(fn f a b (+ a b)) '+
					'(def f (fun (a b) (+ a b)) '+
					'(macro (fn #0 #* #L) ' +
						   '(def #0 (fun (#*) #L))) ' +
					
					'(list 1 2 3) ' +
					'(cons 1 (cons 2 (cons 3 @))) ' +
					'(macro (list #0 #*) '+
						   '(#*=0 (cons #0 @)) '+
						   '(#*>0 (cons #0 (list #*)))) ' +
					*/
function findEnd(str, beginAt) {
    var count = 1;
    for (var i=beginAt + 1; i<str.length; i++) {
        if (str[i] == "(") count++;
        if (str[i] == ")") count--;
        if (count == 0) return i;
    }
}

var lazyOperators = null;
lazyOperators = {
    "and": function (operands, scopes) {
        for (var i=0; i<operands.length; i++) {
            if (! evaluate(operands[i], scopes)) {
                return false;
            }
        }
        return true;
    },
    "or": function (operands, scopes) {
        for (var i=0; i<operands.length; i++) {
            if (evaluate(operands[i], scopes)) {
                return true;
            }
        }
        return false;
    },
    "if": function (operands, scopes) {
        var b = evaluate(operands[0], scopes);
        return b ? evaluate(operands[1], scopes) : evaluate(operands[2], scopes);
    },
    "do": function (operands, scopes) {
        var result = null;
        operands.forEach(function doEval(operand) {
            result = evaluate(operand, scopes);
            if (printDo) console.log(result);
        });
        return result;
    },
    "def" : function (operands, scopes) {
        var name = operands[0];
        var value = evaluate(operands[1], scopes);
        var already = scopes.get(name) != undefined;
        //if (already) console.log("value with name %s already exists in this scope", already);
        scopes.set(name, value);
    },
	"mut": function (operands, scope) {
		var name = operands[0];
        var value = evaluate(operands[1], scope);
		var definedScope = scope.find(name);
		if (definedScope != undefined) {
			definedScope.set(name, value);
		} else {
		    console.log("trying to 'mut' %s but it does not exist in scopes.", name);
		}
		return value;
	},
    "fun": function (operands, scopes) {                  
        return {
			type: "fun",
            params: operands[0],
            body: operands[1],
			scopes: scopes
        };
    },
	"list": function (operands, scopes) {
		if (operands.length == 0) {
			console.log("warning! empty list");
		}
	    var expanded = (operands.length == 1) ? 
			["cons", operands[0], "@"] :
			["cons", operands[0], ["list"].concat(operands.slice(1))];
		// console.log('expanded', expanded);
		return evaluate(expanded, scopes);
	}
};

var operators = {
    ">": function (a, b) { return a > b; },
    "<": function (a, b) { 
		// console.log("comparing %s with %s", a, b);
		return a < b; 
	},
    "=": function (a, b) { 
		// console.log("comparing %s with %s", a, b);
		return a === b; 
	},
    "not": function (a) { return ! a; },
    "+": function (a, b) { 
	    var c = a + b;
		if (typeof c == "string") {
		    c = "\"" + c.replace(/\"/g, "") + "\"";
		}
	    return c; 
    },
    "-": function (a, b) { return a - b; },
    "*": function (a, b) { return a * b; },
    "/": function (a, b) { return a / b; },
	"cons": function (a, b) {
	    return {
			head: a,
			tail: b
		};
	},
	"car": function (a) {
		return a.head;
	},
	"cdr": function (a) {
		return a.tail;
	},
	"empty": function (a) { 
		return a.empty == true;
	},
    "print": function () {
	    var operands = Array.prototype.slice.call(arguments, 0);
		var scopes = this;
		scopes.out(operands.join(", ")); 
    },
};

var reInteger = /^\d+$/;
var reBoolean = /^(?:true|false)$/;
var reString = /^"[^"]*"$/;

//console.log(reBoolean.test("false"));

function evaluate(tree, scopes) {
   
    // console.log(JSON.stringify(tree));
    if (typeof tree == 'string') {
        
        if (reInteger.test(tree)) {
            return parseInt(tree);
        } else if (reBoolean.test(tree)) {
            return tree == "true";
        } else if (reString.test(tree)) {
            return tree;
        } else if (tree == "@") {
		    return { empty : true };
		} else {
            return scopes.get(tree);
        }
    }	
	var operator = undefined;
	
	if (typeof tree[0] == 'string') {
        operator = lazyOperators[tree[0]];
		if (operator != undefined) {
			return operator.call(null, tree.slice(1), scopes);   
		}
	}
	
	var operands = tree.slice(1).map(function (operand) {
        return evaluate(operand, scopes);
    });
    
	if (operators[tree[0]] != undefined) {
		return operators[tree[0]].apply(scopes, operands);
	}

	var func, funcName;
	
	if (tree[0].type == 'fun') {
		// function has already been evaluated and is being returned
		func = tree[0];
		funcName = "?";
	} else if (typeof tree[0] == 'string') {
		// we are evaluating a name pointing to a function
		funcName = tree[0];
		func = scopes.get(funcName);
	} else if (tree[0][0] == 'fun') {
		func = evaluate(tree[0], scopes);
		funcName = "?";
	}
    // console.log(JSON.stringify(tree[0]));
	
	var shadowingScope = new ShadowScope(funcName, func.params, operands, func.scopes);
	
    return evaluate(func.body, shadowingScope);
}

function ShadowScope(scopeName, params, args, parentScope) {
	this.scopeName = scopeName;
	this.parentScope = parentScope;
	this.scope = {};
	this.out = parentScope.out;
	
	for (var i=0; i<params.length; i++) {
		// console.log("in scope [%s], setting %s to %s", scopeName, params[i], JSON.stringify(args[i]));
		this.scope[ params[i] ] = args[i];   
    }
	if (params.length != args.length) {
	   // console.log("wrong number of args: %s, %s %s", name, params, operands);
	}        
}
ShadowScope.prototype.has = function (name) {
	return this.scope.hasOwnProperty(name);
};
ShadowScope.prototype.get = function (name) {
	if (this.has(name)) {
		return this.scope[name];
	} 
	//console.log("shadowing scope %s cannot find value %s", scopeName, name);
	return this.parentScope.get(name);
};
ShadowScope.prototype.set = function (name, val) {
	// console.log("in scope %s, setting %s to %s", this.scopeName, name, JSON.stringify(val));
	this.scope[name] = val;
};
ShadowScope.prototype.find = function (name) {
    if (this.has(name)) {
		return this;
	}
	return this.parentScope.find(name);
};

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

var verbose = true;
var failsOnly = false;

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

function test(msg, expected, actual, eq) {
    var passed = eq(expected, actual);
    
    var extra = !verbose ? "" : 
        ": \n\texpected: " + JSON.stringify(expected) + 
        "\n\tactual:   " + JSON.stringify(actual);
    
    if (!failsOnly || !passed) {
        console.log("Test: ["+msg+"] " + (passed ? "passed" : ("failed"+ extra)));
    }
};

function testCases(cases, f, eq) {
    cases.forEach(function (c) {
		try {
			test(c['case'], c.expected, f(c.input), eq);
		} catch (e) {
			console.log("Exception for case: %s", c['case'], e);
			throw e;
		}
    });
}
   
testCases(cases, parse, eq);

function Scope(printFunction) {
 
    var scope = {};
    
    return {
        set: function (name, val) {
			if (Object.keys(scope).indexOf(name) == -1) {
				// console.log("bottom scope does not contain item: %s", name);
			}
            scope[name] = val;
        },
        get: function (name) {
            return scope[name];   
        },
		out: printFunction || function () { console.log.bind(console); },
		find: function (name) {
			if (Object.keys(scope).indexOf(name) == -1) {
				return undefined;
			}
			return this;
		}
    };
}
if (false) { cases2 = cases2.slice(cases2.length - 1); }

testCases(cases2, 
          function(code) { return evaluate(parse(code), Scope()); }, 
          function(a, b) { return a === b; });
		  
