# @thepowereco/cli

the power cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@thepowereco/cli.svg)](https://npmjs.org/package/@thepowereco/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@thepowereco/cli.svg)](https://npmjs.org/package/@thepowereco/cli)

<!-- toc -->
* [@thepowereco/cli](#thepowerecocli)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g @thepowereco/cli
$ tpe COMMAND
running command...
$ tpe (--version)
@thepowereco/cli/1.11.127 linux-x64 node-v18.20.3
$ tpe --help [COMMAND]
USAGE
  $ tpe COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`tpe acc get-balance`](#tpe-acc-get-balance)
* [`tpe acc register`](#tpe-acc-register)
* [`tpe acc send-sk`](#tpe-acc-send-sk)
* [`tpe autocomplete [SHELL]`](#tpe-autocomplete-shell)
* [`tpe contract deploy`](#tpe-contract-deploy)
* [`tpe contract get`](#tpe-contract-get)
* [`tpe contract set`](#tpe-contract-set)
* [`tpe help [COMMAND]`](#tpe-help-command)
* [`tpe plugins`](#tpe-plugins)
* [`tpe plugins add PLUGIN`](#tpe-plugins-add-plugin)
* [`tpe plugins:inspect PLUGIN...`](#tpe-pluginsinspect-plugin)
* [`tpe plugins install PLUGIN`](#tpe-plugins-install-plugin)
* [`tpe plugins link PATH`](#tpe-plugins-link-path)
* [`tpe plugins remove [PLUGIN]`](#tpe-plugins-remove-plugin)
* [`tpe plugins reset`](#tpe-plugins-reset)
* [`tpe plugins uninstall [PLUGIN]`](#tpe-plugins-uninstall-plugin)
* [`tpe plugins unlink [PLUGIN]`](#tpe-plugins-unlink-plugin)
* [`tpe plugins update`](#tpe-plugins-update)
* [`tpe storage tasklist [CONFIGPATH]`](#tpe-storage-tasklist-configpath)
* [`tpe storage upload [CONFIGPATH]`](#tpe-storage-upload-configpath)
* [`tpe update [CHANNEL]`](#tpe-update-channel)

## `tpe acc get-balance`

Get the balance of a wallet address

```
USAGE
  $ tpe acc get-balance [-a <value> | -k <value>] [-c <value>] [-d <value>] [-p <value>]

FLAGS
  -a, --address=<value>       Wallet address
  -c, --chain=<value>         Chain ID
  -d, --defaultChain=<value>  [default: 1025] Default chain ID
  -k, --keyFilePath=<value>   Path to the key file
  -p, --password=<value>      Password for the key file

DESCRIPTION
  Get the balance of a wallet address

EXAMPLES
  $ tpe acc get-balance --address AA100000001677748249 --chain 1

  $ tpe acc get-balance -a AA100000001677748249 -c 1

  $ tpe acc get-balance --address AA100000001677748249 --defaultChain 1025

  $ tpe acc get-balance --keyFilePath ./path/to/keyfile.pem --password mypassword
```

_See code: [dist/commands/acc/get-balance.js](https://github.com/thepower/PowerTools/blob/v1.11.127/dist/commands/acc/get-balance.js)_

## `tpe acc register`

Register a new account on the specified blockchain or network

```
USAGE
  $ tpe acc register [-c <value> | -n devnet|testnet|appchain] [-f <value> | -x] [-h <value>] [-p <value>] [-r
    <value>] [-s <value>]

FLAGS
  -c, --chain=<value>     Specify the chain
  -f, --filePath=<value>  Path to save the exported file
  -h, --hint=<value>      Hint for the account password
  -n, --network=<option>  Specify the network
                          <options: devnet|testnet|appchain>
  -p, --password=<value>  Password for the account
  -r, --referrer=<value>  Referrer for the account
  -s, --seed=<value>      Seed for the account
  -x, --noSave            Do not save the exported file

DESCRIPTION
  Register a new account on the specified blockchain or network

EXAMPLES
  $ tpe acc register --chain 1 --password mypassword --filePath /path/to/save
  Register a new account on a specified chain with a password and save the data to a specified file path.

  $ tpe acc register --network devnet --referrer myreferrer
  Register a new account on the devnet network with a specified referrer.

  $ tpe acc register
  Interactively register a new account by selecting the network and chain.

  $ tpe acc register --chain 1 --no-save
  Register a new account on a specified chain without saving the data to a file.
```

_See code: [dist/commands/acc/register.js](https://github.com/thepower/PowerTools/blob/v1.11.127/dist/commands/acc/register.js)_

## `tpe acc send-sk`

Send SK tokens to a specified address

```
USAGE
  $ tpe acc send-sk -a <value> -k <value> -t <value> [-c <value>] [-d <value>] [-m <value>] [-p <value>]

FLAGS
  -a, --amount=<value>        (required) Amount to send
  -c, --chain=<value>         Chain ID
  -d, --defaultChain=<value>  [default: 1025] Default chain ID
  -k, --keyFilePath=<value>   (required) Path to the key file
  -m, --message=<value>       Message to include
  -p, --password=<value>      Password for the key file
  -t, --to=<value>            (required) Recipient address

DESCRIPTION
  Send SK tokens to a specified address

EXAMPLES
  $ tpe acc send-sk --amount 100 --to AA100000001677748249 --keyFilePath ./path/to/keyfile.pem --password mypassword

  $ tpe acc send-sk -a 100 -t AA100000001677748249 -k ./path/to/keyfile.pem -p mypassword

  $ tpe acc send-sk --amount 100 --to AA100000001677748249 --chain 1 --keyFilePath ./path/to/keyfile.pem
```

_See code: [dist/commands/acc/send-sk.js](https://github.com/thepower/PowerTools/blob/v1.11.127/dist/commands/acc/send-sk.js)_

## `tpe autocomplete [SHELL]`

Display autocomplete installation instructions.

```
USAGE
  $ tpe autocomplete [SHELL] [-r]

ARGUMENTS
  SHELL  (zsh|bash|powershell) Shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  Display autocomplete installation instructions.

EXAMPLES
  $ tpe autocomplete

  $ tpe autocomplete bash

  $ tpe autocomplete zsh

  $ tpe autocomplete powershell

  $ tpe autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v3.1.4/src/commands/autocomplete/index.ts)_

## `tpe contract deploy`

Deploy a smart contract to the blockchain

```
USAGE
  $ tpe contract deploy -a <value> -b <value> -c <value> -k <value> [-t <value>] [-v <value>] [-i <value>...] [-p
    <value>]

FLAGS
  -a, --abiPath=<value>        (required) Path to the ABI file
  -b, --binPath=<value>        (required) Path to the binary file
  -c, --chain=<value>          (required) Chain ID to deploy on
  -i, --initParams=<value>...  [default: ] Initialization parameters
  -k, --keyFilePath=<value>    (required) Path to the key file
  -p, --password=<value>       Password for the key file
  -t, --gasToken=<value>       [default: SK] Token used to pay for gas
  -v, --gasValue=<value>       [default: 2000000000] Gas value for deployment

DESCRIPTION
  Deploy a smart contract to the blockchain

EXAMPLES
  $ tpe contract deploy --abiPath ./path/to/abi.json --binPath ./path/to/bin --chain 1 --keyFilePath ./path/to/keyfile.pem --password mypassword

  $ tpe contract deploy -a ./path/to/abi.json -b ./path/to/bin -c 1 -k ./path/to/keyfile.pem -p mypassword --gasToken SK --gasValue 2000000000

  $ tpe contract deploy --abiPath ./path/to/abi.json --binPath ./path/to/bin --chain 1 --keyFilePath ./path/to/keyfile.pem --initParams param1 param2
```

_See code: [dist/commands/contract/deploy.js](https://github.com/thepower/PowerTools/blob/v1.11.127/dist/commands/contract/deploy.js)_

## `tpe contract get`

Call a method on a deployed smart contract

```
USAGE
  $ tpe contract get -a <value> -d <value> -c <value> -m <value> [-p <value>...]

FLAGS
  -a, --abiPath=<value>    (required) Path to the ABI file
  -c, --chain=<value>      (required) Chain ID
  -d, --address=<value>    (required) Smart contract address
  -m, --method=<value>     (required) Method name to call
  -p, --params=<value>...  [default: ] Parameters for the method

DESCRIPTION
  Call a method on a deployed smart contract

EXAMPLES
  $ tpe contract get --abiPath ./path/to/abi.json --address AA100000001677748249 --chain 1 --method getBalance --params 0x456...

  $ tpe contract get -a ./path/to/abi.json -d AA100000001677748249 -c 1 -m getBalance -p 0x456...

  $ tpe contract get --abiPath ./path/to/abi.json --address AA100000001677748249 --chain 1 --method getInfo
```

_See code: [dist/commands/contract/get.js](https://github.com/thepower/PowerTools/blob/v1.11.127/dist/commands/contract/get.js)_

## `tpe contract set`

Execute a method on a specified smart contract

```
USAGE
  $ tpe contract set -a <value> -d <value> -c <value> -k <value> -m <value> [-r <value>...] [-p <value>]

FLAGS
  -a, --abiPath=<value>      (required) Path to the ABI file
  -c, --chain=<value>        (required) Chain ID
  -d, --address=<value>      (required) Smart contract address
  -k, --keyFilePath=<value>  (required) Path to the key file
  -m, --method=<value>       (required) Method name to call
  -p, --password=<value>     Password for the key file
  -r, --params=<value>...    [default: ] Parameters for the method

DESCRIPTION
  Execute a method on a specified smart contract

EXAMPLES
  $ tpe contract set --abiPath ./path/to/abi.json 
      --address AA100000001677748249 --chain 1 --keyFilePath ./path/to/keyfile.pem --method set --params value1 value2 --password mypassword

  $ tpe contract set -a ./path/to/abi.json -d AA100000001677748249 -c 1 -k ./path/to/keyfile.pem -m set -r value1 value2 -p mypassword

  $ tpe contract set --abiPath ./path/to/abi.json 
      --address AA100000001677748249 --chain 1 --keyFilePath ./path/to/keyfile.pem --method setData --params param1 param2
```

_See code: [dist/commands/contract/set.js](https://github.com/thepower/PowerTools/blob/v1.11.127/dist/commands/contract/set.js)_

## `tpe help [COMMAND]`

Display help for tpe.

```
USAGE
  $ tpe help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for tpe.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.3/src/commands/help.ts)_

## `tpe plugins`

List installed plugins.

```
USAGE
  $ tpe plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ tpe plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.2/src/commands/plugins/index.ts)_

## `tpe plugins add PLUGIN`

Installs a plugin into tpe.

```
USAGE
  $ tpe plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into tpe.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the TPE_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the TPE_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ tpe plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ tpe plugins add myplugin

  Install a plugin from a github url.

    $ tpe plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ tpe plugins add someuser/someplugin
```

## `tpe plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ tpe plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ tpe plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.2/src/commands/plugins/inspect.ts)_

## `tpe plugins install PLUGIN`

Installs a plugin into tpe.

```
USAGE
  $ tpe plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into tpe.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the TPE_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the TPE_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ tpe plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ tpe plugins install myplugin

  Install a plugin from a github url.

    $ tpe plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ tpe plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.2/src/commands/plugins/install.ts)_

## `tpe plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ tpe plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ tpe plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.2/src/commands/plugins/link.ts)_

## `tpe plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ tpe plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ tpe plugins unlink
  $ tpe plugins remove

EXAMPLES
  $ tpe plugins remove myplugin
```

## `tpe plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ tpe plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.2/src/commands/plugins/reset.ts)_

## `tpe plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ tpe plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ tpe plugins unlink
  $ tpe plugins remove

EXAMPLES
  $ tpe plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.2/src/commands/plugins/uninstall.ts)_

## `tpe plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ tpe plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ tpe plugins unlink
  $ tpe plugins remove

EXAMPLES
  $ tpe plugins unlink myplugin
```

## `tpe plugins update`

Update installed plugins.

```
USAGE
  $ tpe plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.2/src/commands/plugins/update.ts)_

## `tpe storage tasklist [CONFIGPATH]`

Shows the list of all tasks for the current account

```
USAGE
  $ tpe storage tasklist [CONFIGPATH]

ARGUMENTS
  CONFIGPATH  Config to read

DESCRIPTION
  Shows the list of all tasks for the current account

EXAMPLES
  $ tpe storage tasklist

  $ tpe storage tasklist ./config.json
```

_See code: [dist/commands/storage/tasklist.js](https://github.com/thepower/PowerTools/blob/v1.11.127/dist/commands/storage/tasklist.js)_

## `tpe storage upload [CONFIGPATH]`

Upload application files to the storage

```
USAGE
  $ tpe storage upload [CONFIGPATH]

ARGUMENTS
  CONFIGPATH  Config to read

DESCRIPTION
  Upload application files to the storage

EXAMPLES
  $ tpe storage upload ./config.json
```

_See code: [dist/commands/storage/upload.js](https://github.com/thepower/PowerTools/blob/v1.11.127/dist/commands/storage/upload.js)_

## `tpe update [CHANNEL]`

update the tpe CLI

```
USAGE
  $ tpe update [CHANNEL] [--force |  | [-a | -v <value> | -i]]

FLAGS
  -a, --available        See available versions.
  -i, --interactive      Interactively select version to install. This is ignored if a channel is provided.
  -v, --version=<value>  Install a specific version.
      --force            Force a re-download of the requested version.

DESCRIPTION
  update the tpe CLI

EXAMPLES
  Update to the stable channel:

    $ tpe update stable

  Update to a specific version:

    $ tpe update --version 1.0.0

  Interactively select version:

    $ tpe update --interactive

  See available versions:

    $ tpe update --available
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v4.4.2/src/commands/update.ts)_
<!-- commandsstop -->
