# SFDX Forcex

An SFDX CLI plug-in filling the gaps of the existing plug-ins.

## Installation

To install:  
`$ sfdx plugins:install https://github.com/GeorgePreece/sfdx-forcex`

To uninstall:  
`$ sfdx plugins:uninstall sfdx-forcex`

## Commands

### `forcex:jorje:import:apex`
Imports global classes from managed packages into the language server.
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
#### Command syntax
```
$ sfdx forcex:jorje:import:label 
  [--json]
  [--loglevel LOGLEVEL]
  [--targetusername TARGETUSERNAME]
  [--apiversion APIVERSION]
```
