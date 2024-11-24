export default [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: '_taskId',
        type: 'uint256'
      }
    ],
    name: 'completeTaskUpload',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: '_provdireId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_taskId',
        type: 'uint256'
      }
    ],
    name: 'completeUpload',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'provdireId',
        type: 'uint256'
      }
    ],
    name: 'providerRegister',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'provdireId',
        type: 'uint256'
      }
    ],
    name: 'providerUpdate',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: '_taskId',
        type: 'uint256'
      }
    ],
    name: 'taskAdd',
    type: 'event'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_name',
        type: 'string'
      },
      {
        internalType: 'uint256',
        name: '_hash',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_expire',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_size',
        type: 'uint256'
      }
    ],
    name: 'addTask',
    outputs: [
      {
        internalType: 'uint256',
        name: 'taskId',
        type: 'uint256'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'deleteProvider',
    outputs: [
      {
        internalType: 'bool',
        name: '_deleted',
        type: 'bool'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_address',
        type: 'address'
      }
    ],
    name: 'findStrorageNode',
    outputs: [
      {
        internalType: 'uint256',
        name: 'nodeId',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256'
      }
    ],
    name: 'getProvider',
    outputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address'
      },
      {
        internalType: 'string',
        name: 'baseUrls',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'uploadUrl',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256'
      }
    ],
    name: 'getProviderBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: 'providesBalance',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256'
      }
    ],
    name: 'getTask',
    outputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address'
      },
      {
        internalType: 'string',
        name: 'name',
        type: 'string'
      },
      {
        internalType: 'uint256',
        name: 'hash',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'size',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'taskTime',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'expire',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'uploader',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'status',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256'
      }
    ],
    name: 'getTaskBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: 'taskBalance',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256'
      }
    ],
    name: 'getTaskHistory',
    outputs: [
      {
        internalType: 'uint256',
        name: 'taskId',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256'
      }
    ],
    name: 'getTaskStruct',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'id',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address'
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string'
          },
          {
            internalType: 'uint256',
            name: 'hash',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'size',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'time',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'expire',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'uploader',
            type: 'uint256'
          },
          {
            internalType: 'enum StorageRF3.TasksStatus',
            name: 'status',
            type: 'uint8'
          },
          {
            internalType: 'uint256',
            name: 'version',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'syncTime',
            type: 'uint256'
          }
        ],
        internalType: 'struct StorageRF3.StorageTask',
        name: '_storageTasks',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256'
      }
    ],
    name: 'increaseTaskBalance',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_expire',
        type: 'uint256'
      }
    ],
    name: 'increaseTaskStorageTime',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    name: 'providersBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'redudancyFactor',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_uploadUrl',
        type: 'string'
      },
      {
        internalType: 'string',
        name: '_baseUrls',
        type: 'string'
      }
    ],
    name: 'registerProvider',
    outputs: [
      {
        internalType: 'uint256',
        name: 'providerId',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    name: 'storageNodes',
    outputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address'
      },
      {
        internalType: 'string',
        name: 'baseUrls',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'uploadUrl',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'storageNodesCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    name: 'storageNodesId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    name: 'storageTasks',
    outputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address'
      },
      {
        internalType: 'string',
        name: 'name',
        type: 'string'
      },
      {
        internalType: 'uint256',
        name: 'hash',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'size',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'time',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'expire',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'uploader',
        type: 'uint256'
      },
      {
        internalType: 'enum StorageRF3.TasksStatus',
        name: 'status',
        type: 'uint8'
      },
      {
        internalType: 'uint256',
        name: 'version',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'syncTime',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'storageTasksCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      },
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    name: 'taskByName',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_account',
        type: 'address'
      },
      {
        internalType: 'string',
        name: '_name',
        type: 'string'
      }
    ],
    name: 'taskIdByName',
    outputs: [
      {
        internalType: 'uint256',
        name: 'taskID',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    name: 'tasksBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    name: 'tasksHistory',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'tasksHistoryCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256'
      },
      {
        internalType: 'string',
        name: '_uploadUrl',
        type: 'string'
      },
      {
        internalType: 'string',
        name: '_baseUrls',
        type: 'string'
      }
    ],
    name: 'updateProvider',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_hash',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_expire',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_size',
        type: 'uint256'
      }
    ],
    name: 'updateTask',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256'
      }
    ],
    name: 'uploadComplete',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    name: 'uploadHistory',
    outputs: [
      {
        internalType: 'uint256',
        name: 'countUploaders',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'uploaderIndex',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const
