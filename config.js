const path = require('path');
var config = {};

config.apiServer = 'http://localhost:8888';

// this is the API user.
// it must match the API server config.js file settings.
// note: this is the API user, not the Database  user nor is it a COSA user.
// it is a separate user/password combo.
//
config.user = process.env["COSA_API_USER"] || 'api_user';
config.password = process.env["COSA_API_PASSWORD"] || '';

// Parameters are substituted into the arguments
// for the scripts. They are not ENV variables.
//
config.parameters = {};
config.parameters.BUILD_NUMBER = process.env.BUILD_NUMBER;
config.parameters.BUILD_ID = process.env.BUILD_ID;
config.parameters.BUILD_DISPLAY_NAME = process.env.BUILD_DISPLAY_NAME;
config.parameters.JOB_NAME = process.env.JOB_NAME;
config.parameters.JOB_BASE_NAME = process.env.JOB_BASE_NAME;
config.parameters.BUILD_TAG = process.env.BUILD_TAG;
config.parameters.EXECUTOR_NUMBER = process.env.EXECUTOR_NUMBER;
config.parameters.NODE_NAME = process.env.NODE_NAME;
config.parameters.NODE_LABELS = process.env.NODE_LABELS;
config.parameters.JS_CMD='node'   // command used to run JavaScript scripts in the scripts_dir/scripts
config.parameters.WORKSPACE = process.env.WORKSPACE;
config.parameters.JENKINS_HOME = process.env.JENKINS_HOME;
config.parameters.JENKINS_URL = process.env.JENKINS_URL;
config.parameters.BUILD_URL = process.env.BUILD_URL;
config.parameters.JOB_URL = process.env.JOB_URL;
config.parameters.TOP = process.cwd();;
config.parameters.SCRIPTS = 'scripts'; // a directory name under the top level directory for this program.
config.parameters.PWD = process.cwd();

config.scripts_dir = path.join(process.cwd(), 'scripts'); // default but can be moved.

config.scripts = {}
config.scripts.strict_args = true; // args must also follow validation same as commands.

module.exports = config;
