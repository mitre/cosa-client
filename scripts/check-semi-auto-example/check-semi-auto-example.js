/*
 * This is a sample "semi-automated" procedure because it collects data 
 * but doesn't interpret it.
 * 
 * Now, it is important that the autoworkmgr NOT create a new work item for a automated procedure
 * that has a manual result (so this is may be a change.)
 */


const INCOMPLETE = 3;
const EVIDENCE_PROVIDER = 3;

const finding = `I found proof that PI = 3.  What do you think?`;

const results = {
                    RESULT_DESC : '',
                    FINDING_DESCRIPTION : finding,
                    FORWARD_TO_ROLE_ID : EVIDENCE_PROVIDER ,
                    FK_WORK_ITEM_STATUS_ID : INCOMPLETE, 
                    UPDATED_BY : 'system',
                };
console.log(JSON.stringify(results));
process.exit(0);

