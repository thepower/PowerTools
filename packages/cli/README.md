oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @thepowereco/cli
$ tp COMMAND
running command...
$ tp (--version)
@thepowereco/cli/1.0.4 darwin-x64 node-v14.18.1
$ tp --help [COMMAND]
USAGE
  $ tp COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`tp help [COMMAND]`](#tp-help-command)
* [`tp plugins`](#tp-plugins)
* [`tp plugins:install PLUGIN...`](#tp-pluginsinstall-plugin)
* [`tp plugins:inspect PLUGIN...`](#tp-pluginsinspect-plugin)
* [`tp plugins:install PLUGIN...`](#tp-pluginsinstall-plugin-1)
* [`tp plugins:link PLUGIN`](#tp-pluginslink-plugin)
* [`tp plugins:uninstall PLUGIN...`](#tp-pluginsuninstall-plugin)
* [`tp plugins:uninstall PLUGIN...`](#tp-pluginsuninstall-plugin-1)
* [`tp plugins:uninstall PLUGIN...`](#tp-pluginsuninstall-plugin-2)
* [`tp plugins update`](#tp-plugins-update)
* [`tp upload`](#tp-upload)

## `tp help [COMMAND]`

Display help for tp.

```
USAGE
  $ tp help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for tp.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_

## `tp plugins`

List installed plugins.

```
USAGE
  $ tp plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ tp plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.0/src/commands/plugins/index.ts)_

## `tp plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ tp plugins:install PLUGIN...

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
  $ tp plugins add

EXAMPLES
  $ tp plugins:install myplugin 

  $ tp plugins:install https://github.com/someuser/someplugin

  $ tp plugins:install someuser/someplugin
```

## `tp plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ tp plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ tp plugins:inspect myplugin
```

## `tp plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ tp plugins:install PLUGIN...

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
  $ tp plugins add

EXAMPLES
  $ tp plugins:install myplugin 

  $ tp plugins:install https://github.com/someuser/someplugin

  $ tp plugins:install someuser/someplugin
```

## `tp plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ tp plugins:link PLUGIN

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
  $ tp plugins:link myplugin
```

## `tp plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ tp plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ tp plugins unlink
  $ tp plugins remove
```

## `tp plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ tp plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ tp plugins unlink
  $ tp plugins remove
```

## `tp plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ tp plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ tp plugins unlink
  $ tp plugins remove
```

## `tp plugins update`

Update installed plugins.

```
USAGE
  $ tp plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

## `tp upload`

Upload application files to storage

```
USAGE
  $ tp upload

DESCRIPTION
  Upload application files to storage

EXAMPLES
  $ cd app_dir && pow-up
```

_See code: [dist/src/commands/upload/index.ts](https://github.com/thepower/power_hub/blob/v1.0.4/dist/src/commands/upload/index.ts)_
<!-- commandsstop -->
