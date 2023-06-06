Protocol for automatic scanning scripts.

the command is also the name of the folder, to which we add ".js" to form the naem of the script.

input parameter: a single string to be interpreted by the script. In some cases, just a file name. In others, a JSON string.

output: a JSON object emitted to stdout.

The output will be interpreted to be an object containing the following properties only (all others will be ignored.):

                    'FK_WORK_ITEM_STATUS_ID'== one of 1 for "PASS" or 2 for "FAIL"  (3 is 'INCOMPLETE')
                    'RESULT_DESC'  == what was observed.
                    'UPDATED_BY' == defaults to 'system'. If set to 'approver', causes entry into workflow (future capability).
                    'FORWARD_TO_ROLE_ID' == default to 1
                    'REPEAT_FINDING' == 0 for FALSE or 1 for TRUE
                    'FK_CONTROL_WEAKNESS_TYPE_ID' = NULL for now. 
                    'FK_LIKELIHOOD_ID'  == 1 for LOW, 2 for MODERATE, 3 for HIGH
                    'FINDING_DESCRIPTION' == Describes why this is a finding.
                    'WEAKNESS_DESCRIPTION' == Describes the nature of the weakness
                    'RECOMMENDED_CORRECTIVE_ACTION' == Describes corrective action, if possible.
                    'FK_IMPACT_ID' ==  1 for LOW, 2 for MODERATE, 3 for HIGH

Any property ending in 'ID' is expected to be a positive integer or null.

exit code:

0 means success
1 means failure
2 means internal error (failure in some fashion that is outside the bounds of an error)




