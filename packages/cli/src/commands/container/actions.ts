import { Flags, ux } from '@oclif/core'
import axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { colorize } from 'json-colorizer'
import { color } from '@oclif/color'
import cliConfig from '../../config/cli.js'
import { BaseCommand } from '../../baseCommand.js'
import { ParamsParser } from '../../helpers/params-parser.helper.js'
import { importContainerKey } from '../../helpers/container.helper.js'

async function jsonRpcRequest({
  url,
  method,
  params = [],
  jwt
}: {
  url: string
  method: string
  params: any[]
  jwt: string
}) {
  const response = await axios({
    method: 'post',
    url,
    headers: {
      Authorization: `Bearer ${jwt}`
    },
    data: {
      jsonrpc: '2.0',
      id: 0,
      method,
      params
    }
  })
  return response.data
}

export default class ContainerActions extends BaseCommand {
  static override description = 'Perform various container actions'

  static override examples = [
    '<%= config.bin %> <%= command.id %> -m "container_start" -p 1 -f ./path/to/keyfile.pem -s mypassword',
    '<%= config.bin %> <%= command.id %> -m "container_stop" -p 1 -f ./path/to/keyfile.pem -s mypassword',
    '<%= config.bin %> <%= command.id %> -m "container_destroy" -p 1 -f ./path/to/keyfile.pem -s mypassword',
    '<%= config.bin %> <%= command.id %> -m "container_handover" -p 1 -f ./path/to/keyfile.pem -s mypassword',
    '<%= config.bin %> <%= command.id %> -m "container_getPort" -p "1 web 5000" -f ./path/to/keyfile.pem -s mypassword',
    '<%= config.bin %> <%= command.id %> -m "container_getLogs" -p 1 -f ./path/to/keyfile.pem -s mypassword'
  ]

  static override flags = {
    method: Flags.string({
      char: 'm',
      description: 'Method to call on the container',
      required: true
    }),
    params: Flags.string({
      char: 'p',
      description: 'Parameters for the method'
    }),
    containerKeyFilePath: Flags.file({
      char: 'f',
      description: 'Path to the container key file',
      required: true
    }),
    containerPassword: Flags.string({
      char: 's',
      default: '',
      description: 'Password for the container key file (env: CONTAINER_KEY_FILE_PASSWORD)',
      env: 'CONTAINER_KEY_FILE_PASSWORD'
    })
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContainerActions)
    const { method, params, containerKeyFilePath, containerPassword } = flags

    const paramsParser = new ParamsParser()

    const parsedParams = params && paramsParser.parse(params)

    const privateKeyPem = await importContainerKey(containerKeyFilePath, containerPassword)

    const payload = { iat: Math.floor(new Date().getTime() / 1000) }

    const jwt = jsonwebtoken.sign(payload, privateKeyPem, { algorithm: 'ES256' })

    ux.action.start('Requesting')

    const response = await jsonRpcRequest({
      url: `${cliConfig.containersUploadBaseUrl}/jsonrpc`,
      method,
      params: parsedParams || [],
      jwt
    })

    ux.action.stop()

    if (response.result) {
      this.log(colorize(response.result))
    } else {
      this.log(color.red('No result.'))
    }
  }
}
