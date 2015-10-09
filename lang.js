//macro brainstorming:
/*	'(fn f a b (+ a b)) '+
	'(def f (fun (a b) (+ a b)) '+
	'(macro (fn #0 #* #L) ' +
		   '(def #0 (fun (#*) #L))) ' +
	
	'(list 1 2 3) ' +
	'(cons 1 (cons 2 (cons 3 @))) ' +
	'(macro (list #0 #*) '+
		   '(#*=0 (cons #0 @)) '+
		   '(#*>0 (cons #0 (list #*)))) ' +
	*/

var lazyOperators = null;
lazyOperators = {
    "and": function (operands, scopes, isReturnVal) {
        for (var i=0; i<operands.length; i++) {
            if (! evaluate(operands[i], scopes, false)) {
                return false;
            }
        }
        return true;
    },
    "or": function (operands, scopes,isReturnVal) {
        for (var i=0; i<operands.length; i++) {
            if (evaluate(operands[i], scopes, false)) {
                return true;
            }
        }
        return false;
    },
    "if": function (operands, scopes, isReturnVal) {
        var b = evaluate(operands[0], scopes, false);
		var toEval = b ? 1 : 2;
        return evaluate(operands[toEval], scopes, isReturnVal);
	},
    "do": function (operands, scopes, isReturnVal) {
        operands.slice(0, operands.length -1).forEach(function (operand) {
            result = evaluate(operand, scopes, false);
        });
		return evaluate(operands[operands.length - 1], scopes, isReturnVal);
    },
    "def" : function (operands, scopes, isReturnVal) {
        var name = operands[0];
        var value = evaluate(operands[1], scopes, false);
        var already = scopes.get(name) != undefined;
        //if (already) console.log("value with name %s already exists in this scope", already);
        scopes.set(name, value);
    },
	"mut": function (operands, scope, isReturnVal) {
		var name = operands[0];
        var value = evaluate(operands[1], scope, false);
		var definedScope = scope.find(name);
		if (definedScope != undefined) {
			definedScope.set(name, value);
		} else {
		    console.log("trying to 'mut' %s but it does not exist in scopes.", name);
		}
		return value;
	},
    "fun": function (operands, scopes, isReturnVal) {                  
        return {
			type: "fun",
            params: operands[0],
            body: operands[1],
			scopes: scopes
        };
    },
	"list": function (operands, scopes, isReturnVal) {
		if (operands.length == 0) {
			console.log("warning! empty list");
		}
	    var expanded = (operands.length == 1) ? 
			["cons", operands[0], "@"] :
			["cons", operands[0], ["list"].concat(operands.slice(1))];
		// console.log('expanded', expanded);
		return evaluate(expanded, scopes, false);
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

function evaluate(tree, scopes, isReturnVal) {
    isReturnVal = isReturnVal || false;
	
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
			return operator.call(null, tree.slice(1), scopes, isReturnVal);   
		}
	}
	
	var operands = tree.slice(1).map(function (operand) {
        return evaluate(operand, scopes, false);
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
		// function is anonymous
		func = evaluate(tree[0], scopes, false);
		funcName = "?";
	}
	
	var funcScope = (func == scopes.func && isReturnVal) ? 
		scopes.initBindings(operands, true) : 
		new ShadowScope(func, funcName, operands);
	
    return evaluate(func.body, funcScope, true);
}

function ShadowScope(func, funcName, args) {
	this.name = funcName;
	this.func = func;
	this.parentScope = func.scopes;
	this.out = func.scopes.out;
	this.initBindings(args);
	//console.log("scope created: " + this.name);
}
ShadowScope.prototype.initBindings = function (args, tail) {
    if (tail) {
		console.log("tail recursion occurred: " + this.name);
	}
	this.scope = {};
	var params = this.func.params;
	for (var i=0; i<params.length; i++) {
		// console.log("in scope [%s], setting %s to %s", this.name, params[i], JSON.stringify(args[i]));
		this.scope[ params[i] ] = args[i];   
    }
	if (params.length != args.length) {
	   // console.log("wrong number of args: %s, %s %s", this.name, params, args);
	}    
	return this;
}
ShadowScope.prototype.has = function (name) {
	return this.scope.hasOwnProperty(name);
};
ShadowScope.prototype.get = function (name) {
	if (this.has(name)) {
		return this.scope[name];
	} 
	//console.log("shadowing scope %s cannot find value %s", this.name, name);
	return this.parentScope.get(name);
};
ShadowScope.prototype.set = function (name, val) {
	// console.log("in scope %s, setting %s to %s", this.name, name, JSON.stringify(val));
	this.scope[name] = val;
};
ShadowScope.prototype.find = function (name) {
    if (this.has(name)) {
		return this;
	}
	return this.parentScope.find(name);
};




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

