// parsing
var cases = [
    {
        'case' : 'add a difference',
        'input': "(+ (- 7 3) 8)",
        'expected': ["+",["-","7","3"],"8"]
    }
];

// validation
var validationCases = [
	{
        'case' : 'valid-1',
        'input': [["fun", '1', '2', '3'], ["mut", "a", "b", "c"], ["def", "s"]],
        'expected': true
    },{
        'case' : 'valid-2',
        'input': [[["fun", '2', '3', '4'], "arg"], "arg"],
        'expected': true
    },{
        'case' : 'invalid-1',
        'input': [["def", '1', '2', '3' ]],
        'expected': false
    },{
        'case' : 'invalid-2',
        'input': ["something", [["inv"], '1', '2', '3' ]],
        'expected': false
    },
]

// execution
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