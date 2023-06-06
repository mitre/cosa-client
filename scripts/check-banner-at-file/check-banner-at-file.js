// example of a more complex compliance scanner
//

const fs = require('fs');

const BANNER=`You are accessing a U.S. Government information system, which includes:
(1) this computer, (2) this computer network, (3) all computers connected to this network, and (4) all devices and storage media attached to this network or to a computer on this network.
This information system is provided for U.S. Government-authorized use only. Unauthorized or improper use of this system may result in disciplinary action, as well as civil and criminal penalties.  By using this information system, you understand and consent to the following:  
(1) You have no reasonable expectation of privacy regarding any communication or data transiting or stored on this information system.
(2) At any time, and for any lawful Government purpose, the Government may monitor, intercept, and search and seize any communication or data
transiting or stored on this information system.
(3) Any communication or data transiting or stored on this information system may be disclosed or used for any lawful Government purpose.`

const PASS = 1;
const FAIL = 2;

var FILE=process.argv[2];
if (FILE === undefined || FILE === '') {
    console.error("bad invocation - missing parameter. This procedure requires a filename.");
    process.exit(2); // bad invocation.
}
fs.readFile(FILE, "utf8", (err, text) => {
    var result;
    if (err) {
        console.error(err);
    }
    if (!err && text.match(BANNER)) {
        result = {FK_WORK_ITEM_STATUS_ID : PASS, RESULT_DESC : `Found proper US Government banner in file ${FILE}`};
    }else{
        result = {
            FK_WORK_ITEM_STATUS_ID : FAIL, 
            RESULT_DESC : `Unable to find proper US Government terms of usage and privacy notice in file ${FILE}`, 

            RECOMMENDED_CORRECTIVE_ACTIONS: `Either designate proper file for scanning or update home page notice per control description to include proper US Government banner` };
    }
    console.log(JSON.stringify(result));

});

