var printDo = false;

function eq(a, b) {
    return JSON.stringify(a) == JSON.stringify(b);   
}

var cases = [
    {
        'case' : 'add a difference',
        'input': "(+ (- 7 3) 8)",
        'expected': { operator: "+", operands: [{ operator: "-", operands: ["7", "3"]}, "8"] }
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
// for-loop
/*
(do 
  (def for 
     (fun (i f)
      (do 
         (def _for (fun (j) 
           (if (= j 10) 
               "done" 
               (do (f j) (_for (+ 1 j))))))
         (_for 0)
      )
     )
  )

  (for 10 (fun (i) (print (+ "hello" i))))
  (def x 0)
  (def ++ (fun (x) (mut x (+ x 1))))
  (print (++ (++ (++ (++ x)))))
  (mut ++ (fun (x) (mut x (- x 1))))
  (def y 0)
  (for 10 (fun (i) (mut y (++ y))))
  (print y)
)*/

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
// closure object
/*
(do
  (def x (fun (a b c) (do
    (def y a)
    (def z b)
    (def u c)
    (fun (a)
      (if (= a "y") y 
      (if (= a "z") z
      (if (= a "yB") (mut y (+ y "B"))
      (if (= a "x") (u b)
       "unknown"))))
    )
  )))

  (def z (x "3" "4" (fun (a) (print (+ a "m")))))
  (print (z "y"))
  (print (z "z"))
  (z "yB")
  (print (z "y"))
  (z "x")
)
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
        // console.log("setting value [%s] set to [%s]", name, JSON.stringify(value));
    },
	"mut": function (operands, scope) {
		var name = operands[0];
        var value = evaluate(operands[1], scope);
		var definedScope = scope.find(name);
		if (definedScope != undefined) {
			definedScope.set(name, value);
		}
		console.log("trying to 'mut' %s but it does not exist in scopes.", name);
		return value;
	},
    "fun": function (operands, scopes) {
                    
        return {
			type: "fun",
            params: operands[0],
            body: operands[1],
			shadowScope: scopes
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
    "<": function (a, b) { return a < b; },
    "=": function (a, b) { return a === b; },
    "not": function (a) { return ! a; },
    "+": function (a, b) { return a + b; },
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
		    return { 
				empty : true, 
			};
		} else {
            //console.log("look up var: " + tree);
            var val = scopes.get(tree);
            // console.log("value for %s is %s", JSON.stringify(tree), JSON.stringify(val));
            return val;
        }
    }	
	// console.log(tree[0]);
    //console.log(JSON.stringify(tree));
    var operator = lazyOperators[tree[0]];
	// console.log("operator: "+ operator);
	
    if (operator != undefined) {
		//console.log("operator is defined")
		var result = operator.call(null, tree.slice(1), scopes);   
		// console.log("result: " + JSON.stringify(result));
		return result;
    }
	//console.log("operator is not defined");
    
    var operands = tree.slice(1).map(function (operand) {
        return evaluate(operand, scopes);
    });
    //console.log('hello');
    operator = operators[tree[0]];
    if (operator != undefined) {
        return operator.apply(scopes, operands);
    }
    
	var func = null;
	if (tree[0].type != 'fun') {
		// console.log("tree-0", tree[0]);
		var funcName = tree[0];
		var func = scopes.get(funcName);
		// console.log("400 ", func);
	} else {
		//console.log("TYPE:", func.type);
		func = tree[0];
		// console.log("404", func);
	}
    //console.log("func: " + JSON.stringify(func));
    var params = func.params;
    var body = func.body;
    var functionShadowScope = func.shadowScope;
    // console.log("params", params);
	// console.log("operands", operands);
    var shadowingScope = (function shadowingScope() {
        var scope = {};
        var scopeName = funcName;
        
        if (params.length != operands.length) {
            console.log("wrong number of args: %s, %s %s", name, params, args);
        }
        
        for (var i=0; i<params.length; i++) {
			// console.log("setting %s to %s", params[i], operands[i]);
            scope[ params[i] ] = operands[i];   
        }
        
        return {
            get: function (name) {
                if (Object.keys(scope).indexOf(name) != -1) {
                    return scope[name];
                } 
                //console.log("shadowing scope %s cannot find value %s", scopeName, name);
                return functionShadowScope.get(name);
            },
            set: function (name, val) {
                // console.log("setting %s to %s", name, val);
				scope[name] = val;
            },
			out: functionShadowScope.out,
			find: function (name) {
				if (Object.keys(scope).indexOf(name) == -1) {
					return functionShadowScope.find(name);
				}
				return this;
			}
        }
    })();
    
    return evaluate(body, shadowingScope);
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
            S = raw.indexOf(" ");
            if (S == -1) {
                parts.push(raw);
                raw = "";
            } else {
                parts.push(raw.slice(0, S).trim());
                raw = raw.slice(S + 1);
            }
        }
        
        raw = raw.trim();
    }
    
    return parts;
}

var verbose = true;
var failsOnly = false;


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
		  
