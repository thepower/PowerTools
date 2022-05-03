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
$ npm install -g the_power_cli
$ pow-up COMMAND
running command...
$ pow-up (--version)
the_power_cli/1.0.3 darwin-x64 node-v14.18.1
$ pow-up --help [COMMAND]
USAGE
  $ pow-up COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`pow-up help [COMMAND]`](#pow-up-help-command)
* [`pow-up plugins`](#pow-up-plugins)
* [`pow-up plugins:install PLUGIN...`](#pow-up-pluginsinstall-plugin)
* [`pow-up plugins:inspect PLUGIN...`](#pow-up-pluginsinspect-plugin)
* [`pow-up plugins:install PLUGIN...`](#pow-up-pluginsinstall-plugin-1)
* [`pow-up plugins:link PLUGIN`](#pow-up-pluginslink-plugin)
* [`pow-up plugins:uninstall PLUGIN...`](#pow-up-pluginsuninstall-plugin)
* [`pow-up plugins:uninstall PLUGIN...`](#pow-up-pluginsuninstall-plugin-1)
* [`pow-up plugins:uninstall PLUGIN...`](#pow-up-pluginsuninstall-plugin-2)
* [`pow-up plugins update`](#pow-up-plugins-update)
* [`pow-up upload`](#pow-up-upload)

## `pow-up help [COMMAND]`

Display help for pow-up.

```
USAGE
  $ pow-up help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for pow-up.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

## `pow-up plugins`

List installed plugins.

```
USAGE
  $ pow-up plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ pow-up plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `pow-up plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ pow-up plugins:install PLUGIN...

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
  $ pow-up plugins add

EXAMPLES
  $ pow-up plugins:install myplugin 

  $ pow-up plugins:install https://github.com/someuser/someplugin

  $ pow-up plugins:install someuser/someplugin
```

## `pow-up plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ pow-up plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ pow-up plugins:inspect myplugin
```

## `pow-up plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ pow-up plugins:install PLUGIN...

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
  $ pow-up plugins add

EXAMPLES
  $ pow-up plugins:install myplugin 

  $ pow-up plugins:install https://github.com/someuser/someplugin

  $ pow-up plugins:install someuser/someplugin
```

## `pow-up plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ pow-up plugins:link PLUGIN

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
  $ pow-up plugins:link myplugin
```

## `pow-up plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ pow-up plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ pow-up plugins unlink
  $ pow-up plugins remove
```

## `pow-up plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ pow-up plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ pow-up plugins unlink
  $ pow-up plugins remove
```

## `pow-up plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ pow-up plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ pow-up plugins unlink
  $ pow-up plugins remove
```

## `pow-up plugins update`

Update installed plugins.

```
USAGE
  $ pow-up plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

## `pow-up upload`

Upload application files to storage

```
USAGE
  $ pow-up upload

DESCRIPTION
  Upload application files to storage

EXAMPLES
  $ cd app_dir && pow-up
```

_See code: [dist/commands/upload/index.ts](https://github.com/sbabushkin/pow-up/blob/v1.0.3/dist/commands/upload/index.ts)_
<!-- commandsstop -->
