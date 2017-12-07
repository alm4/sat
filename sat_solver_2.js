/**
 * This file should be placed at the node_modules sub-directory of the directory where you're
 * executing it.
 *
 * Written by Arthur Magno in December/2017.
 */

exports.solve = function(fileName) {

    function runProgress(start, total = 0, part = 0) {

        if (start) {

            if (typeof runProgress.current_second == 'undefined') {

                runProgress.intialTime = Date.now();

                runProgress.P = ["\\", "|", "/", "-"];

                runProgress.x = 0;

                runProgress.current_second = (new Date()).getSeconds();

                process.stdout.write(
                    "\r"
                    + runProgress.P[(runProgress.x)++]
                    + " 00.00%"
                    + " " + (Date.now() - runProgress.intialTime) + "ms"
                );
            }

            if ((new Date()).getSeconds() != runProgress.current_second) {

                runProgress.current_second = (new Date()).getSeconds();

                process.stdout.write(
                    "\r"
                    + runProgress.P[(runProgress.x)++]
                    + " " + ((part / total) * 100).toFixed(2) + "%"
                    + " " + (Date.now() - runProgress.intialTime) + "ms"
                );

                runProgress.x &= 3;
            }
        }

        if (start
            && (total == 0 && part == 0)
            && (runProgress.intialTime > 0)) {

            process.stdout.write("\r" + "                           ");
            process.stdout.write("\r");
        }

        if (!start) {

            let time = Date.now() - runProgress.intialTime;

            console.log("time " + (time / 1000).toFixed(0) + "s");
        }
    }

    function nextAssignment(currentAssignment) {

        let newAssignment = [];

        let textNewAssignment = "";

        let decimal = 0;

        for (let i = currentAssignment.length - 1; i >= 0; i--) {

            decimal += Math.pow(2, ((currentAssignment.length - 1) - i)) * currentAssignment[i];
        }

        decimal++;

        let numberConvert = decimal;

        let quotient, remainder;

        let binary = "";

        do {

            quotient = Math.floor(numberConvert / 2);

            remainder = numberConvert % 2;

            numberConvert = quotient;

            binary = remainder.toString() + binary;

        } while (numberConvert > 1)

        binary = quotient.toString() + binary;

        textNewAssignment = binary;

        //textNewAssignment = decimal.toString(2);

        textNewAssignment = "0".repeat(currentAssignment.length) + textNewAssignment.replace(/\D/g,'');
        textNewAssignment = textNewAssignment.slice((currentAssignment.length * -1), -1) + textNewAssignment.slice(-1);

        newAssignment = textNewAssignment.split("");

        for (let i = 0; i < newAssignment.length; i++) {

            newAssignment[i] = parseInt(newAssignment[i]);
        }

        return newAssignment;
    }

    function assemblyChainClauses(clauses) {

        let clausesChain = "";

        let clausesVariableChain = "";

        let clauseElement;

        let variableInd = -1;

        let notChar = "";

        for (let i = 0; i < clauses.length; i++) {

            for (let j = 0; j < clauses[i].length; j++) {

                clauseElement = clauses[i][j];

                variableInd = Math.abs(clauseElement) - 1;

                if (j > 0) {

                    clausesVariableChain += " || ";
                }

                notChar = (clauseElement < 0) ? "!" : "";

                clausesVariableChain += notChar + "(assignment[" + variableInd + "] != 0)";

            }

            if (i > 0) {

                clausesChain += " && ";
            }

            clausesChain += "(" + clausesVariableChain + ")";

            clausesVariableChain = "";
        }

        clausesChain = "isSat = (" + clausesChain + ")";

        return clausesChain;
    }

    function doSolve(clauses, assignment) {

        let isSat = false;

        if (clauses.length > 0 && assignment.length > 0) {

            let possibilities = Math.pow(2, assignment.length);

            //console.log("assignment.length " + assignment.length);

            //console.log("possibilities " + possibilities);

            let clausesChain = assemblyChainClauses(clauses);

            //console.log("clausesChain " + clausesChain);

            let testCount = 1;

            while ((!isSat) && (testCount <= possibilities)) {

                //console.log("assignment test " + testCount);
                //console.log(assignment);

                runProgress(true, possibilities, testCount);

                eval(clausesChain);

                if ((!isSat) && (testCount < possibilities)) {

                    assignment = nextAssignment(assignment);
                }

                testCount++;
            }

            runProgress(true);

            console.log("tests: " + (testCount - 1));

        }

        let result = {'isSat': isSat, satisfyingAssignment: null};

        if (isSat) {

            result.satisfyingAssignment = assignment;
        }

        return result;
    }

    function readClauses(text) {

        let clauses = [];

        let textoLinhas = "";
        let linha = "";

        for (let i = 0; i < text.length; i++) {

            linha = text[i];

            if (!(linha.indexOf("c") == 0 || linha.indexOf("C") == 0)) {

                if (!(linha.indexOf("p") == 0	|| linha.indexOf("P") == 0)) {

                    if (linha.length > 0) {

                        textoLinhas += linha;
                    }
                }
            }
        }

        textoLinhas = textoLinhas.replace(/(\r\n|\n|\r)/gm,"");

        textoLinhas = textoLinhas.replace(/\s+/g, " ");

        clauses = textoLinhas.split(" 0");

        clauses.splice(-1,1);

        for (let i = 0; i < clauses.length; i++) {

            clauses[i] = clauses[i].split(" ");

            if (clauses[i][0] == "") {

                clauses[i].splice(0, 1);
            }
        }

        return clauses;
    }

    function readVariables(clauses) {

        let variables = [];

        let index = -1;

        for (let i = 0; i < clauses.length; i++) {

            for (let j = 0; j < clauses[i].length; j++) {

                index = Math.abs(clauses[i][j]) - 1;

                if (typeof variables[index] === 'undefined') {

                    variables[index] = 0;
                }
            }
        }

        return variables;
    }

    function checkProblemSpecification(text, clauses, variables) {

        let specOk = false;

        let parametros = [];

        let problem = "";

        let linha = "";

        for (let i = 0; i < text.length; i++) {

            linha = text[i];

            if (linha.indexOf("p") == 0	|| linha.indexOf("P") == 0) {

                problem += linha;

                i = text.length;
            }
        }

        problem = problem.replace(/(\r\n|\n|\r)/gm,"");

        problem = problem.replace(/\s+/g, " ");

        problem = problem.substring((problem.indexOf("cnf ") + 4));

        parametros = problem.split(" ");

        if (parametros[0] == variables.length) {

            if (parametros[1] == clauses.length) {

                specOk = true;
            }
        }

        return specOk;
    }

    function readFormula(fileName) {

        const fs = require("fs");

        let cfnFile = fs.readFileSync(fileName);

        let text = cfnFile.toString().split("\n");

        let clauses = readClauses(text);

        let variables = readVariables(clauses);

        let specOk = checkProblemSpecification(text, clauses, variables);

        let result = { 'clauses': [], 'variables': [] };

        if (specOk) {

            result.clauses = clauses;
            result.variables = variables;
        }

        return result;
    }

    runProgress(true);

    let formula = readFormula(fileName);

    let result = doSolve(formula.clauses, formula.variables);

    runProgress(false);

    return result; // two fields: isSat and satisfyingAssignment

};
