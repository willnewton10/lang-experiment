var verbose = true;
var failsOnly = true;


function test(printFunction, msg, expected, actual, eq) {
    var passed = eq(expected, actual);
    
    var extra = !verbose ? "" : 
        ": \n\texpected: " + JSON.stringify(expected) + 
        "\n\tactual:   " + JSON.stringify(actual);
    
    if (!failsOnly || !passed) {
        printFunction("Test: ["+msg+"] " + (passed ? "passed" : ("failed"+ extra)));
    }
};

function testCases(printFunction, cases, f, eq) {
    cases.forEach(function (c) {
		try {
			test(printFunction, c['case'], c.expected, f(c.input), eq);
		} catch (e) {
			printFunction("Exception for case: " + c['case'] + ": " + e);
			throw e;
		}
    });
}
  
function runTests(printFunction) {
	
	function eq(a, b) {
		return JSON.stringify(a) == JSON.stringify(b);   
	}

	testCases(printFunction, cases, parse, eq);

	testCases(printFunction,
			  cases2, 
			  function(code) { return evaluate(parse(code), Scope()); }, 
			  function(a, b) { return a === b; });
			  
	testCases(printFunction,
			  validationCases,
			  function(tree) { 
				var validate = createValidator(function (i) { 
					// console.log(i); // ignore the  
				});
				return validate(tree);
			  },
			  function(a, b) { return a === b; });
}