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
@thepowereco/cli/1.11.129 linux-x64 node-v22.2.0
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
* [`tpe container actions`](#tpe-container-actions)
* [`tpe container create`](#tpe-container-create)
* [`tpe container list`](#tpe-container-list)
* [`tpe container update`](#tpe-container-update)
* [`tpe container upload`](#tpe-container-upload)
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
* [`tpe storage tasklist`](#tpe-storage-tasklist)
* [`tpe storage upload`](#tpe-storage-upload)
* [`tpe update [CHANNEL]`](#tpe-update-channel)

## `tpe acc get-balance`

Get the balance of a wallet address

```
USAGE
  $ tpe acc get-balance [-a <value> | -k <value>] [-b <value>] [-p <value>]

FLAGS
  -a, --address=<value>         Wallet address
  -b, --bootstrapChain=<value>  [default: 1025] Bootstrap chain ID
  -k, --keyFilePath=<value>     Path to the key file
  -p, --password=<value>        Password for the key file

DESCRIPTION
  Get the balance of a wallet address

EXAMPLES
  $ tpe acc get-balance --address AA100000001677748249

  $ tpe acc get-balance -a AA100000001677748249

  $ tpe acc get-balance --address AA100000001677748249 --bootstrapChain 1025

  $ tpe acc get-balance --keyFilePath ./path/to/keyfile.pem --password mypassword
```

_See code: [dist/commands/acc/get-balance.js](https://github.com/thepower/PowerTools/blob/v1.11.129/dist/commands/acc/get-balance.js)_

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

_See code: [dist/commands/acc/register.js](https://github.com/thepower/PowerTools/blob/v1.11.129/dist/commands/acc/register.js)_

## `tpe acc send-sk`

Send SK tokens to a specified address

```
USAGE
  $ tpe acc send-sk -a <value> -k <value> -t <value> [-b <value>] [-m <value>] [-p <value>]

FLAGS
  -a, --amount=<value>          (required) Amount to send
  -b, --bootstrapChain=<value>  [default: 1025] Default chain ID
  -k, --keyFilePath=<value>     (required) Path to the key file
  -m, --message=<value>         Message to include
  -p, --password=<value>        Password for the key file
  -t, --to=<value>              (required) Recipient address

DESCRIPTION
  Send SK tokens to a specified address

EXAMPLES
  $ tpe acc send-sk --amount 100 --to AA100000001677748249 --keyFilePath ./path/to/keyfile.pem --password mypassword

  $ tpe acc send-sk -a 100 -t AA100000001677748249 -k ./path/to/keyfile.pem -p mypassword

  $ tpe acc send-sk --amount 100 --to AA100000001677748249 --keyFilePath ./path/to/keyfile.pem
```

_See code: [dist/commands/acc/send-sk.js](https://github.com/thepower/PowerTools/blob/v1.11.129/dist/commands/acc/send-sk.js)_

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

## `tpe container actions`

Perform various container actions

```
USAGE
  $ tpe container actions -m <value> -f <value> [-p <value>...] [-s <value>]

FLAGS
  -f, --containerKeyFilePath=<value>  (required) Path to the container key file
  -m, --method=<value>                (required) Method to call on the container
  -p, --params=<value>...             [default: ] Parameters for the method
  -s, --containerPassword=<value>     Password for the container key file

DESCRIPTION
  Perform various container actions

EXAMPLES
  $ tpe container actions -m "container_start" -p 1234 -f ./path/to/keyfile.pem -s mypassword

  $ tpe container actions -m "container_stop" -p 1234 -f ./path/to/keyfile.pem -s mypassword

  $ tpe container actions -m "container_destroy" -p 1234 -f ./path/to/keyfile.pem -s mypassword

  $ tpe container actions -m "container_handover" -p 1234 -f ./path/to/keyfile.pem -s mypassword

  $ tpe container actions -m "container_getPort" -p 1 web 5000 -f ./path/to/keyfile.pem -s mypassword

  $ tpe container actions -m "container_getLogs" -p 1 -f ./path/to/keyfile.pem -s mypassword
```

_See code: [dist/commands/container/actions.js](https://github.com/thepower/PowerTools/blob/v1.11.129/dist/commands/container/actions.js)_

## `tpe container create`

Create a new container with a given name and key pair

```
USAGE
  $ tpe container create -k <value> -n <value> [-p <value>] [-f <value>] [-s <value>] [-a <value>]

FLAGS
  -a, --ordersScAddress=<value>       [default: AA100000001677749450] Orders smart contract address
  -f, --containerKeyFilePath=<value>  Path to the container key file
  -k, --keyFilePath=<value>           (required) Path to the key file
  -n, --containerName=<value>         (required) Name of the container
  -p, --password=<value>              Password for the key file
  -s, --containerPassword=<value>     Password for the container key file

DESCRIPTION
  Create a new container with a given name and key pair

EXAMPLES
  $ tpe container create -k ./key.pem -p mypassword -n "NewContainer" -s containerpassword

  $ tpe container create -k ./key.pem --password mypassword --containerName "NewContainer" --containerPassword containerpassword
```

_See code: [dist/commands/container/create.js](https://github.com/thepower/PowerTools/blob/v1.11.129/dist/commands/container/create.js)_

## `tpe container list`

List containers owned by a user

```
USAGE
  $ tpe container list -k <value> [-p <value>] [-a <value>]

FLAGS
  -a, --ordersScAddress=<value>  [default: AA100000001677749450] Orders smart contract address
  -k, --keyFilePath=<value>      (required) Path to the key file
  -p, --password=<value>         Password for the key file

DESCRIPTION
  List containers owned by a user

EXAMPLES
  $ tpe container list -k ./key.pem -p mypassword

  $ tpe container list -k ./key.pem --password mypassword
```

_See code: [dist/commands/container/list.js](https://github.com/thepower/PowerTools/blob/v1.11.129/dist/commands/container/list.js)_

## `tpe container update`

Update container details

```
USAGE
  $ tpe container update -k <value> -i <value> -n <value> -f <value> [-p <value>] [-s <value>] [-a <value>]

FLAGS
  -a, --ordersScAddress=<value>       [default: AA100000001677749450] Orders smart contract address
  -f, --containerKeyFilePath=<value>  (required) Path to the container key file
  -i, --containerId=<value>           (required) Id of the container
  -k, --keyFilePath=<value>           (required) Path to the key file
  -n, --containerName=<value>         (required) Name of the container
  -p, --password=<value>              Password for the key file
  -s, --containerPassword=<value>     Password for the container key file

DESCRIPTION
  Update container details

EXAMPLES
  $ tpe container update -k ./key.pem -p mypassword -i 123 -n "New Container Name" -f ./containerKey.pem -s containerpassword

  $ tpe container update -k ./key.pem --password mypassword --containerId 123 
      --containerName "New Container Name" --containerKeyFilePath ./containerKey.pem --containerPassword containerpassword
```

_See code: [dist/commands/container/update.js](https://github.com/thepower/PowerTools/blob/v1.11.129/dist/commands/container/update.js)_

## `tpe container upload`

Upload files to a container

```
USAGE
  $ tpe container upload -k <value> -i <value> -f <value> -t <value> [-p <value>] [-s <value>] [-a <value>]

FLAGS
  -a, --ordersScAddress=<value>       [default: AA100000001677749450] Orders smart contract address
  -f, --containerKeyFilePath=<value>  (required) Path to the container key file
  -i, --containerId=<value>           (required) Container ID
  -k, --keyFilePath=<value>           (required) Path to the key file
  -p, --password=<value>              Password for the key file
  -s, --containerPassword=<value>     Password for the container key file
  -t, --filesPath=<value>             (required) Path to the files

DESCRIPTION
  Upload files to a container

EXAMPLES
  $ tpe container upload --containerId 123 --containerKeyFilePath ./key.pem --containerPassword mypassword --filesPath ./files

  $ tpe container upload -i 123 -f ./key.pem -s mypassword -p ./files
```

_See code: [dist/commands/container/upload.js](https://github.com/thepower/PowerTools/blob/v1.11.129/dist/commands/container/upload.js)_

## `tpe contract deploy`

Deploy a smart contract to the blockchain

```
USAGE
  $ tpe contract deploy -a <value> -b <value> -k <value> [-t <value>] [-v <value>] [-i <value>...] [-p <value>]

FLAGS
  -a, --abiPath=<value>        (required) Path to the ABI file
  -b, --binPath=<value>        (required) Path to the binary file
  -i, --initParams=<value>...  [default: ] Initialization parameters
  -k, --keyFilePath=<value>    (required) Path to the key file
  -p, --password=<value>       Password for the key file
  -t, --gasToken=<value>       [default: SK] Token used to pay for gas
  -v, --gasValue=<value>       [default: 2000000000] Gas value for deployment

DESCRIPTION
  Deploy a smart contract to the blockchain

EXAMPLES
  $ tpe contract deploy --abiPath ./path/to/abi.json --binPath ./path/to/bin --keyFilePath ./path/to/keyfile.pem --password mypassword

  $ tpe contract deploy -a ./path/to/abi.json -b ./path/to/bin -k ./path/to/keyfile.pem -p mypassword --gasToken SK --gasValue 2000000000

  $ tpe contract deploy --abiPath ./path/to/abi.json --binPath ./path/to/bin --keyFilePath ./path/to/keyfile.pem --initParams param1 param2
```

_See code: [dist/commands/contract/deploy.js](https://github.com/thepower/PowerTools/blob/v1.11.129/dist/commands/contract/deploy.js)_

## `tpe contract get`

Call a method on a deployed smart contract

```
USAGE
  $ tpe contract get -a <value> -d <value> -m <value> [-p <value>...]

FLAGS
  -a, --abiPath=<value>    (required) Path to the ABI file
  -d, --address=<value>    (required) Smart contract address
  -m, --method=<value>     (required) Method name to call
  -p, --params=<value>...  [default: ] Parameters for the method

DESCRIPTION
  Call a method on a deployed smart contract

EXAMPLES
  $ tpe contract get --abiPath ./path/to/abi.json --address AA100000001677748249 --method getBalance --params 0x456...

  $ tpe contract get -a ./path/to/abi.json -d AA100000001677748249 -m getBalance -p 0x456...

  $ tpe contract get --abiPath ./path/to/abi.json --address AA100000001677748249 --method getInfo
```

_See code: [dist/commands/contract/get.js](https://github.com/thepower/PowerTools/blob/v1.11.129/dist/commands/contract/get.js)_

## `tpe contract set`

Execute a method on a specified smart contract

```
USAGE
  $ tpe contract set -a <value> -d <value> -k <value> -m <value> [-r <value>...] [-p <value>]

FLAGS
  -a, --abiPath=<value>      (required) Path to the ABI file
  -d, --address=<value>      (required) Smart contract address
  -k, --keyFilePath=<value>  (required) Path to the key file
  -m, --method=<value>       (required) Method name to call
  -p, --password=<value>     Password for the key file
  -r, --params=<value>...    [default: ] Parameters for the method

DESCRIPTION
  Execute a method on a specified smart contract

EXAMPLES
  $ tpe contract set --abiPath ./path/to/abi.json 
      --address AA100000001677748249 --keyFilePath ./path/to/keyfile.pem --method set --params value1 value2 --password mypassword

  $ tpe contract set -a ./path/to/abi.json -d AA100000001677748249 -k ./path/to/keyfile.pem -m set -r value1 value2 -p mypassword

  $ tpe contract set --abiPath ./path/to/abi.json 
      --address AA100000001677748249 --keyFilePath ./path/to/keyfile.pem --method setData --params param1 param2
```

_See code: [dist/commands/contract/set.js](https://github.com/thepower/PowerTools/blob/v1.11.129/dist/commands/contract/set.js)_

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

## `tpe storage tasklist`

Shows the list of all tasks for the current account

```
USAGE
  $ tpe storage tasklist [-b <value>] [-c <value>] [-a <value>]

FLAGS
  -a, --storageScAddress=<value>  [default: AA100000001677723663] Storage smart contract address
  -b, --bootstrapChain=<value>    [default: 1025] Default chain ID
  -c, --configPath=<value>        [default: ./tp-cli.json] Config to read

DESCRIPTION
  Shows the list of all tasks for the current account

EXAMPLES
  $ tpe storage tasklist

  $ tpe storage tasklist ./tp-cli.json
```

_See code: [dist/commands/storage/tasklist.js](https://github.com/thepower/PowerTools/blob/v1.11.129/dist/commands/storage/tasklist.js)_

## `tpe storage upload`

Upload application files to the storage

```
USAGE
  $ tpe storage upload [-b <value>] [-c <value>] [-a <value>]

FLAGS
  -a, --storageScAddress=<value>  [default: AA100000001677723663] Storage smart contract address
  -b, --bootstrapChain=<value>    [default: 1025] Default chain ID for bootstrap
  -c, --configPath=<value>        [default: ./tp-cli.json] Config to read

DESCRIPTION
  Upload application files to the storage

EXAMPLES
  $ tpe storage upload ./tp-cli.json
```

_See code: [dist/commands/storage/upload.js](https://github.com/thepower/PowerTools/blob/v1.11.129/dist/commands/storage/upload.js)_

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
