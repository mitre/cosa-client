# COSA Client  

This is the source code to the COSA client application which communicates with the COSA API server.

This is the application that must be installed and configured on the system that will be performing scans. Usually, this is your Continuous Integration/ Continuous Deployment (CI/CD) server.  However, there are other acceptable configurations, such as a quality assurance/testing server.

It does not require elevated privileges to work. Do not run as root or administrator.

Many instances of the client may communicate with a single COSA API server.

The client application is plug-in based.  That is, it executes specific plugins when instructed by the COSA server.  Thus, you will need to also install or develop plugins for your specific needs.  A few sample plugins are provided.


There are two parameter when invoking this program, one of which is optional.

The first parameter is the system name. It must match a system as configured in COSA.
The second parameter (optional) sets the "stage". By default, COSA defines 3 stages: image, runtime, and build. The default
is build which is a static, build-time scan.

### Examples:
```bash
node client.js SYSTEM_IN_COSA 
node client.js SYSTEM_IN_COSA  -s runtime
```

## NOTICE  

Approved for Public Release; Distribution Unlimited. Case Number  21-3449.

## NOTICE  

MITRE hereby grants express written permission to use, reproduce, distribute, modify, and otherwise leverage this software to the extent permitted by the licensed terms provided in the LICENSE.md file included with this project.

## NOTICE  

This software was produced for the U. S. Government under Contract Number 75FCMC18D0047, and is subject to Federal Acquisition Regulation Clause 52.227-14, Rights in Data-General.  

No other use other than that granted to the U. S. Government, or to those acting on behalf of the U. S. Government under that Clause is authorized without the express written permission of The MITRE Corporation. 

For further information, please contact The MITRE Corporation, Contracts Management Office, 7515 Colshire Drive, McLean, VA  22102-7539, (703) 983-6000.  

(c) 2022 The MITRE Corporation.

