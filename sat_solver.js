/**
 * This file should be placed at the node_modules sub-directory of the directory where you're
 * executing it.
 *
 * Written by Arthur Magno in December/2017.
 */

exports.solve = function(fileName) {

    function nextAssignment(currentAssignment) {

        let newAssignment = [];

        let textNewAssignment = "";

        let decimal = 0;

        for (let i = currentAssignment.length - 1; i >= 0; i--) {

            decimal += Math.pow(2, ((currentAssignment.length - 1) - i)) * currentAssignment[i];
        }

        decimal++;

        textNewAssignment = decimal.toString(2);

        textNewAssignment = "0".repeat(currentAssignment.length) + textNewAssignment.replace(/\D/g,'');
        textNewAssignment = textNewAssignment.slice((currentAssignment.length * -1), -1) + textNewAssignment.slice(-1);

        newAssignment = textNewAssignment.split("");

        for (let i = 0; i < newAssignment.length; i++) {

            newAssignment[i] = parseInt(newAssignment[i]);
        }

        return newAssignment;
    }

    function executeClauses(clauses, assignment) {

        let isSat = false;

        let resultValue;

        let clausesValues = [];

        let variableValue;
        let variableInd = -1;

        let clauseElement;

        for (let i = 0; i < clauses.length; i++) {

            for (let j = 0; j < clauses[i].length; j++) {

                clauseElement = clauses[i][j];

                variableInd = Math.abs(clauseElement) - 1;
                variableValue = (assignment[variableInd] != 0);

                variableValue = (clauseElement < 0) ? !variableValue : variableValue;

                clausesValues[i] = (clausesValues[i] || variableValue);
            }

            if (typeof resultValue === 'undefined') {

                resultValue = clausesValues[i];

            } else {

                resultValue = (resultValue && clausesValues[i]);
            }

        }

        isSat = resultValue;

        return isSat;
    }

    function doSolve(clauses, assignment) {

        let isSat = false;

        if (clauses.length > 0 && assignment.length > 0) {

            let possibilities = Math.pow(2, assignment.length);

            //console.log("assignment.length " + assignment.length);

            //console.log("possibilities " + possibilities);

            let testCount = 1;

            while ((!isSat) && (testCount < possibilities)) {

                //console.log("assignment test " + testCount);
                //console.log(assignment);

                isSat = executeClauses(clauses, assignment);

                if ((!isSat) && (testCount < possibilities)) {

                    testCount++;

                    assignment = nextAssignment(assignment);
                }

            }

            //console.log("tests " + testCount);

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

    let formula = readFormula(fileName);

    let result = doSolve(formula.clauses, formula.variables);

    return result; // two fields: isSat and satisfyingAssignment

};
