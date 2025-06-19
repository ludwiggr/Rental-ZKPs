# Heimdall

This repository contains the implementation of the Heimdall Zero-Knowledge Proof (ZKP) system.

## heimdalljs

The JavaScript implementation of Heimdall is located in the `heimdalljs` directory. To use it:

- Navigate to the `heimdalljs` directory
- Run `npm install` to install dependencies
- The CLI scripts are available in `heimdalljs/cli`

## Example Usage

The files `example-run.sh` provide examples for using the Heimdall CLI with different presentation types. These scripts are located in `heimdalljs/test/*`. Review and run these scripts to understand the workflow.

## Circuit Implementation

The circuits of the presentations are located in the `circom` folder. These are not required for usage since their resulting ZKeys are stored in `heimdalljs/zkp`. 
