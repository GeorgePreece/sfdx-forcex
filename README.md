# SFDX Forcex

An unofficial SFDX CLI plug-in providing a simple set of tools to enhance development experience.

## Installation

To install:  
`$ sfdx plugins:install https://github.com/GeorgePreece/sfdx-forcex`

To uninstall:  
`$ sfdx plugins:uninstall sfdx-forcex`

## Commands

### `forcex:apex:graph`
Generates a dependency graph from Apex components.
#### Command syntax
```bash
$ sfdx forcex:apex:graph 
  [--json]
  [--loglevel LOGLEVEL]
  [--targetusername TARGETUSERNAME]
  [--apiversion APIVERSION]
```
#### Examples
```bash
$ sfdx forcex:apex:graph --json > graph.json
```