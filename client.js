"use strict";

var rp = require("request-promise");
var child_proc = require("child_process");
const path = require("path");
const format = require("string-template");
var fs = require("fs");
const config = require("./config.js");
var argv = require("yargs")
    .usage("Usage: $0 <system name> [options]")
    .command("'Hello World'", "Run the automated tests for Hello World")
    .alias("s", "stage")
    .nargs("s", 1)
    .describe("s", "Specify a Stage ([runtime], image, or build)")
    .default("stage", "runtime")
    .help("h")
    .alias("h", "help")
    .epilog("COSA Client").argv;

var systemName = argv._[0];

if (systemName == null) {
    console.log("Missing Required System Name. COSA Client Exiting...");
    process.exit();
}

let getAutomatedTestsRequest = {
    uri: config.apiServer + "/API/AutomatedTestsBySystem",
    json: true,
    body: {
        systemName: systemName,
        stage: argv.stage || "runtime",
    },
    auth: {
        user: config.user,
        pass: config.password,
    },
};

if (!config.parameters.TOP) {
    config.parameters.TOP = process.cwd();
}

if (config.password === '') {
    console.error('error: blank password in config.js')
    process.exit(2)
}

rp.get(getAutomatedTestsRequest)
    .then(function (automatedTests) {
        process_automation_list(automatedTests);
    })
    .catch(function (err) {
        console.log("Attempted to obtain automated tests but received internal error")
        console.log("Internal Error,", err.message);
        console.log("Internal Error (full object),", JSON.stringify(err));
        console.log("COSA Client Exiting...");
        process.exit();
    });

function process_automation_list(tests) {
    if (tests.length === 0) {
        console.log(
            `COSA Client: No record found for system ${systemName}, result set length = 0: `
        );
    } else {
        tests.forEach((test, i) => {
            execute_automation(test);
        });
    }
}

// execute_automation takes the test record and forms a command suitable for
// execution via the child_proc.execFile command.
// A test record contains one command and one argument.  The argument is sometimes a JSON string, so keep that in mind.
// This function is affected by the config object so keep that in mind (see details below).
//
// @param test - the full test record from the COSA server
function execute_automation(test) {
    if (
        test.COMMAND_TO_EXECUTE == null ||
        test.COMMAND_TO_EXECUTE.length == 0
    ) {
        console.log(
            "COSA Client: Warning: command to execute is null for rule id: " +
                test.PK_SYSTEM_CONTROL_TEST_ID
        );
    } else {
        try {
            const cmd_parsed = path.parse(test.COMMAND_TO_EXECUTE);
            let cmd = '' 
            const arg1 = test.AUTO_EVIDENCE; // legacy name of the one and only argument
            const specific_dir = cmd_parsed.name; // name without extension
            const cwd = path.join(config.scripts_dir, specific_dir);
            config.parameters.PROCS = cwd;

            let args = []; // make compatible with string template library

            switch (cmd_parsed.ext) {
                case ".js": // JavaScript commands cannot run directly, so we must invoke the interpreter of choice.
                    cmd = config.parameters.JS_CMD; // such as node or deno
                    args = [cmd, replaceCurlies(arg1)];
                    break;
                default:
                    cmd = cmd_parsed.base
                    args = [replaceCurlies(arg1)];
                    break;
            }

            if (config.scripts.strict_args) {  // very restrictive policy. JSON will not pass.
                args.forEach((arg) => validateCommand(arg));
            }

            // script's specific directory name is script name without extension.
            // for example:
            // cmd  = check-banner-at-file.js
            // thus:
            // cwd =  ..../scripts/check-banner-at-file

            console.log(`COSA Client: command to execute = ${cmd} with args=${args}`);

            child_proc.execFile(
                cmd,
                args,
                {
                    cwd: cwd,
                    windowsHide: true,
                    shell: false,
                },
                (err, stdout, stderr) => {
                    process_cmd_results(err, stdout, stderr, test, cmd);
                }
            );
        } catch (ex) {
            console.error(`exception during attempt to execute command: ${ex}`);
        }
    }
}

function process_cmd_results(err, stdout, stderr, test, commandToExecute) {
    console.log(commandToExecute);
    if (test) {
        console.log(`Whole Command Record: ${JSON.stringify(test)}`);
    } else {
        console.log(`Whole Command Record: ${test}`);
    }
    console.log(`COSA Client: child_proc.exec returned.`);

    // 3 possible return codes:
    // 0 => PASS control assessment
    // 1 => FAIL control assessment
    // 2 => Internal error with script or environment. Not same as FAIL
    if (err) {
        if (err.code >= 2) {
            console.error(
                `COSA Client: for command '${commandToExecute}' Error encountered: code = '${err.code}' msg =  '${err}' Stderr = ${stderr}`
            );
            return;
        }
    }
    try {
        parse_command_findings_and_post_to_server(stdout, commandToExecute, test);
    } catch (ex) {
        console.error(`exception: ${ex}`);
    }
}

function parse_command_findings_and_post_to_server(stdout, commandToExecute, test) {
    let finding = {};
    try {
        console.log(">>>>>", stdout);
        finding = JSON.parse(stdout);
    } catch (ex) {
        console.error(`exception: ${ex}`);
    }

    if (!hasRequiredFields(finding)) {
        throw "Missing required fields in finding JSON.";
    }

    finding = setFindingDefaultFields(finding);
    console.log("TEST:" + JSON.stringify(test));
    rp.post({
        uri: config.apiServer + "/api/UpdateFindingsByRuleId",
        json: true,
        body: {
            finding: finding,
            rule_id: test.PK_SYSTEM_CONTROL_TEST_ID,
        },
        auth: {
            user: config.user,
            pass: config.password,
        },
        headers: {
            "content-type": "application/json",
        },
    })
        .then(function (response) {
            console.log(`result successfully updated for ${commandToExecute}`);
            if (typeof finding.FILES != "undefined") {
                if (finding.FILES.length > 0) {
                    upload_evidence_files(test.WORK_ITEM_RESULT_ID, finding);
                }
            }
        })
        .catch(function (error) {
            console.error(error);
        });
}

function upload_evidence_files(workitemResultId, finding) {
    let files = [];
    finding.FILES.forEach((file) => {
        files.push(fs.createReadStream(file));
    });
    rp.post({
        uri: config.apiServer + "/api/uploadEvidenceFiles",
        formData: {
            workitemId: workitemResultId,
            "files[]": files,
        },
        auth: {
            user: config.user,
            pass: config.password,
        },
        headers: {
            "content-type": "application/json",
        },
    })
        .then(function (response) {
            console.log(`result successfully uploaded files`, finding.FILES);
        })
        .catch(function (error) {
            console.error(error);
        });
}

// @param test a test record from COSA server
//
// This function may throw an exception.
//
// Remember: this command will execute from the top of the scripts folder
// so it does not need a prepended path.
//
// also remember the COMMAND_TO_EXECUTE may be something lke  "node check-pass.js"
//

function prepare_command_from_test_and_parameters(test) {
    validateCommand(test.COMMAND_TO_EXECUTE);
    var commandToExecute =
        test.COMMAND_TO_EXECUTE + " '" + test.AUTO_EVIDENCE + "'";
    // make compatible with string template library
    commandToExecute = replaceCurlies(commandToExecute);
    config.parameters.PROCS = path.join(config.parameters.SCRIPTS, test.NAME);
    return format(commandToExecute, config.parameters);
}
function validateCommand(cmd) {
    if (cmd.includes(".."))
        throw Error(
            "Command contains invalid character sequence (..). Do not execute"
        );
    if (cmd.includes("/"))
        throw Error("Command contains invalid characters (/) . Do not execute");
    if (cmd.includes("\\"))
        throw Error("Command contains invalid characters (\\). Do not execute");
    if (cmd.includes("$"))
        throw Error("Command contains invalid characters ($}. Do not execute");
    if (cmd.includes("{"))
        throw Error("Command contains invalid characters. Do not execute");
    if (cmd.includes("~"))
        throw Error("Command contains invalid characters. Do not execute");
    if (cmd.includes(";"))
        throw Error("Command contains invalid characters. Do not execute");
}

function isEmpty(v) {
    return v === null || v === "";
}

function hasRequiredFields(finding) {
    return (
        typeof finding.RESULT_DESC === "string" &&
        typeof finding.FK_WORK_ITEM_STATUS_ID === "number"
    );
}

function setFindingDefaultFields(finding) {
    if (
        typeof finding.UPDATED_BY === "undefined" ||
        isEmpty(finding.UPDATED_BY)
    )
        finding.UPDATED_BY = "system";
    if (
        typeof finding.FORWARD_TO_ROLE === "undefined" ||
        isEmpty(finding.FORWARD_TO_ROLE)
    )
        finding.FORWARD_TO_ROLE = 1;
    if (
        typeof finding.REPEAT_FINDING === "undefined" ||
        isEmpty(finding.REPEAT_FINDING)
    )
        finding.REPEAT_FINDING = 0;
    if (
        typeof finding.FK_CONTROL_WEAKNESS_TYPE_ID === "undefined" ||
        isEmpty(finding.FK_CONTROL_WEAKNESS_TYPE_ID)
    )
        finding.FK_CONTROL_WEAKNESS_TYPE_ID = 1;
    if (
        typeof finding.FK_LIKELIHOOD_ID === "undefined" ||
        isEmpty(finding.FK_LIKELIHOOD_ID)
    )
        finding.FK_LIKELIHOOD_ID = 1;
    if (
        typeof finding.FK_IMPACT_ID === "undefined" ||
        isEmpty(finding.FK_IMPACT_ID)
    )
        finding.FK_IMPACT_ID = 1;

    return finding;
}

// replace "${" with "{"
function replaceCurlies(s) {
    return s.replace(/\$\{/g, "{");
}
