# SFDX Forcex

An unofficial SFDX CLI plug-in providing a simple set of tools to enhance development experience.

## Installation

To install:  
`$ sfdx plugins:install https://github.com/GeorgePreece/sfdx-forcex`

To uninstall:  
`$ sfdx plugins:uninstall sfdx-forcex`

## Commands

### `forcex:jorje:import:apex`
Imports global classes from managed packages into the language server.  
*You may have to restart the language server for the changes to take effect.*
#### Command syntax
```
$ sfdx forcex:jorje:import:apex 
  [--json]
  [--loglevel LOGLEVEL]
  [--targetusername TARGETUSERNAME]
  [--apiversion APIVERSION]
```

### `forcex:jorje:import:label`
Imports custom labels into the language server.  
*You may have to restart the language server for the changes to take effect.*
#### Command syntax
```
$ sfdx forcex:jorje:import:label 
  [--json]
  [--loglevel LOGLEVEL]
  [--targetusername TARGETUSERNAME]
  [--apiversion APIVERSION]
```

### `forcex:apex:analyze:dependencies`
Retrieves and aggregates Apex class dependencies for review.
#### Command syntax
```
$ sfdx forcex:apex:analyze:dependencies 
  [--json]
  [--loglevel LOGLEVEL]
  [--targetusername TARGETUSERNAME]
  [--apiversion APIVERSION]
```
