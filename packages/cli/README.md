# @thepowereco/cli

the power cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@thepowereco/cli.svg)](https://npmjs.org/package/@thepowereco/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@thepowereco/cli.svg)](https://npmjs.org/package/@thepowereco/cli)

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g @thepowereco/cli
$ tpe COMMAND
running command...
$ tpe (--version)
@thepowereco/cli/0.0.0 linux-x64 node-v21.6.2
$ tpe --help [COMMAND]
USAGE
  $ tpe COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`tpe help [COMMAND]`](#tpe-help-command)
- [`tpe plugins`](#tpe-plugins)
- [`tpe plugins add PLUGIN`](#tpe-plugins-add-plugin)
- [`tpe plugins:inspect PLUGIN...`](#tpe-pluginsinspect-plugin)
- [`tpe plugins install PLUGIN`](#tpe-plugins-install-plugin)
- [`tpe plugins link PATH`](#tpe-plugins-link-path)
- [`tpe plugins remove [PLUGIN]`](#tpe-plugins-remove-plugin)
- [`tpe plugins reset`](#tpe-plugins-reset)
- [`tpe plugins uninstall [PLUGIN]`](#tpe-plugins-uninstall-plugin)
- [`tpe plugins unlink [PLUGIN]`](#tpe-plugins-unlink-plugin)
- [`tpe plugins update`](#tpe-plugins-update)

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.2/src/commands/help.ts)_

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

<!-- commandsstop -->
