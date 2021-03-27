# SFDX Forcex

An SFDX CLI plug-in filling the gaps of the existing plug-ins.

## Installation

Clone this repository:  
`$ git clone https://github.com/GeorgePreece/sfdx-forcex.git`  

Link the plug-in:  
`$ sfdx plugins:link sfdx-forcex`

## Commands

### `forcex:jorje:import:apex`
Imports global classes from managed packages into the language server.
#### Command syntax
```
$ sfdx forcex:jorje:import:apex 
  [--json]
  [--loglevel LOGLEVEL]
  [--targetusername TARGETUSERNAME]
  [--apiversion APIVERSIOn]
```

### `forcex:jorje:import:label`
Imports custom labels into the language server.
#### Command syntax
```
$ sfdx forcex:jorje:import:label 
  [--json]
  [--loglevel LOGLEVEL]
  [--targetusername TARGETUSERNAME]
  [--apiversion APIVERSIOn]
```