//
// node program that always passes and sets finding id.
// 
// usage: check-pass 'message you want passed'
function usage(msg)
{
    console.error(`Error: ${msg}`);
    console.error(`Usage: node ${process.argv[1]} ruleid "message you want passed"`);
    process.exit(2);
}

var message = process.argv[2];

const PASS = 1;
const FAIL = 2;

const fk_status_id = PASS;

if (process.argv.length !=3 || !message){
    usage('missing message');
    process.exit(2);
}

const result = { FK_WORK_ITEM_STATUS_ID : fk_status_id, RESULT_DESC:message};
console.log(JSON.stringify(result));
process.exit(fk_status_id == PASS ? 0 : 1);
