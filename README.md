# SFDX Forcex

An unofficial SFDX CLI plug-in providing a simple set of tools to enhance development experience.

## Installation

To install:  
`$ sfdx plugins:install https://github.com/GeorgePreece/sfdx-forcex`

To uninstall:  
`$ sfdx plugins:uninstall sfdx-forcex`

## Commands

### `forcex:apex:jorje:import`
Imports global classes and external strings from managed packages into the language server.  
*You may have to restart the language server for the changes to take effect.*
#### Command syntax
```bash
$ sfdx forcex:apex:jorje:import 
  [--json]
  [--loglevel LOGLEVEL]
  [--targetusername TARGETUSERNAME]
  [--apiversion APIVERSION]
```
#### Examples
```bash
$ sfdx forcex:apex:jorje:import
```

### `forcex:apex:graph:create`
Generates a dependency graph from Apex components.
#### Command syntax
```bash
$ sfdx forcex:apex:graph:create
  [--json]
  [--loglevel LOGLEVEL]
  [--targetusername TARGETUSERNAME]
  [--apiversion APIVERSION]
```
#### Examples
```bash
$ sfdx forcex:apex:graph:create --json > graph.json
```