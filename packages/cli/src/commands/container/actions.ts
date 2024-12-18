import { Flags, ux } from '@oclif/core'
import axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { colorize } from 'json-colorizer'
import { color } from '@oclif/color'
import { BaseCommand } from '../../baseCommand.js'
import { ParamsParser } from '../../helpers/params-parser.helper.js'
import { importContainerKey } from '../../helpers/container.helper.js'
import { EvmContract } from '@thepowereco/tssdk'
import abis from '../../abis/index.js'
import { initializeNetworkApi } from '../../helpers/network.helper.js'
import cliConfig from '../../config/cli.js'

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
    '<%= config.bin %> <%= command.id %> -m "container_start" -i 1 -p 1 -f ./path/to/keyfile.pem -s mypassword',
    '<%= config.bin %> <%= command.id %> -m "container_stop" -i 1 -p 1 -f ./path/to/keyfile.pem -s mypassword',
    '<%= config.bin %> <%= command.id %> -m "container_destroy" -i 1 -p 1 -f ./path/to/keyfile.pem -s mypassword',
    '<%= config.bin %> <%= command.id %> -m "container_handover" -i 1 -p 1 -f ./path/to/keyfile.pem -s mypassword',
    '<%= config.bin %> <%= command.id %> -m "container_getPort" -i 1 -p "1 web 5000" -f ./path/to/keyfile.pem -s mypassword',
    '<%= config.bin %> <%= command.id %> -m "container_getLogs" -i 1 -p 1 -f ./path/to/keyfile.pem -s mypassword'
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
    containerId: Flags.integer({
      char: 'i',
      description: 'Container ID',
      required: true
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
    }),
    ordersScAddress: Flags.string({
      char: 'a',
      default: cliConfig.ordersScAddress,
      description: 'Orders smart contract address'
    }),
    providersScAddress: Flags.string({
      char: 'b',
      default: cliConfig.providersScAddress,
      description: 'Provider smart contract address'
    }),
    chain: Flags.integer({
      char: 'n',
      description: 'Chain ID'
    })
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContainerActions)
    const {
      method,
      params,
      containerId,
      containerKeyFilePath,
      containerPassword,
      ordersScAddress,
      providersScAddress,
      chain
    } = flags

    const paramsParser = new ParamsParser()

    const parsedParams = params && paramsParser.parse(params)

    const privateKeyPem = await importContainerKey(containerKeyFilePath, containerPassword)

    const payload = { iat: Math.floor(new Date().getTime() / 1000) }

    const jwt = jsonwebtoken.sign(payload, privateKeyPem, { algorithm: 'ES256' })

    ux.action.start('Requesting')

    const networkApi = await initializeNetworkApi({
      address: providersScAddress,
      chain
    })

    const ordersContract = new EvmContract(networkApi, ordersScAddress)

    const tasks = await ordersContract.scGet({
      abi: abis.order,
      functionName: 'tasks',
      args: [BigInt(containerId)]
    })

    const activeProvider = tasks?.[4]

    const url = await ordersContract.scGet({
      abi: abis.order,
      functionName: 'urls',
      args: [activeProvider]
    })

    const response = await jsonRpcRequest({
      url: `${url}/jsonrpc`,
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
