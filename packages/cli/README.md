Power Ecosystem Command Line Tool
=================

<!-- toc -->
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
@thepowereco/cli/1.2.11 darwin-x64 node-v14.18.1
$ tpe --help [COMMAND]
USAGE
  $ tpe COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`tpe help [COMMAND]`](#tpe-help-command)
* [`tpe plugins`](#tpe-plugins)
* [`tpe plugins:install PLUGIN...`](#tpe-pluginsinstall-plugin)
* [`tpe plugins:inspect PLUGIN...`](#tpe-pluginsinspect-plugin)
* [`tpe plugins:install PLUGIN...`](#tpe-pluginsinstall-plugin-1)
* [`tpe plugins:link PLUGIN`](#tpe-pluginslink-plugin)
* [`tpe plugins:uninstall PLUGIN...`](#tpe-pluginsuninstall-plugin)
* [`tpe plugins:uninstall PLUGIN...`](#tpe-pluginsuninstall-plugin-1)
* [`tpe plugins:uninstall PLUGIN...`](#tpe-pluginsuninstall-plugin-2)
* [`tpe plugins update`](#tpe-plugins-update)
* [`tpe upload`](#tpe-upload)

## `tpe help [COMMAND]`

Display help for tpe.

```
USAGE
  $ tpe help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for tpe.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_

## `tpe plugins`

List installed plugins.

```
USAGE
  $ tpe plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ tpe plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.0/src/commands/plugins/index.ts)_

## `tpe plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ tpe plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ tpe plugins add

EXAMPLES
  $ tpe plugins:install myplugin 

  $ tpe plugins:install https://github.com/someuser/someplugin

  $ tpe plugins:install someuser/someplugin
```

## `tpe plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ tpe plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ tpe plugins:inspect myplugin
```

## `tpe plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ tpe plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ tpe plugins add

EXAMPLES
  $ tpe plugins:install myplugin 

  $ tpe plugins:install https://github.com/someuser/someplugin

  $ tpe plugins:install someuser/someplugin
```

## `tpe plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ tpe plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ tpe plugins:link myplugin
```

## `tpe plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ tpe plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ tpe plugins unlink
  $ tpe plugins remove
```

## `tpe plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ tpe plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ tpe plugins unlink
  $ tpe plugins remove
```

## `tpe plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ tpe plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ tpe plugins unlink
  $ tpe plugins remove
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

## `tpe upload`

Upload application files to storage

```
USAGE
  $ tpe upload

DESCRIPTION
  Upload application files to storage

EXAMPLES
  $ cd app_dir && pow-up
```

_See code: [dist/src/commands/upload/index.ts](https://github.com/thepower/power_hub/blob/v1.2.11/dist/src/commands/upload/index.ts)_
<!-- commandsstop -->
