import { transformNodeList } from '../helpers/network.helper';
import { ChainBootstrapConfig, ChainConfig } from '../typings';

export const config: ChainConfig = {
  requestTotalAttempts: 5,
  callbackCallDelay: 900,
  chainRequestTimeout: 5000,
  maxNodeResponseTime: 99999,
};

export const chainConfig: ChainBootstrapConfig = {
  '102': transformNodeList({
    '2UYKF1HyNz7QSFTGY5ffZSG8oWem': {
      'host': [
        'http://c102n6.thepower.io:43382',
        'https://c102n6.thepower.io:43482',
      ],
      'ip': [
        'http://c102n6.thepower.io:43382',
        'https://c102n6.thepower.io:43482',
      ],
    },
    '2i6tWT8XuT3jQcvpzKUM9V51L2sm': {
      'host': [
        'http://c102n7.thepower.io:43382',
        'https://c102n7.thepower.io:43482',
      ],
      'ip': [
        'http://c102n7.thepower.io:43382',
        'https://c102n7.thepower.io:43482',
      ],
    },
    '3UvkSW1iMARXVpxAwLRXppVJ5xNJ': {
      'host': [
        'http://c102n2.thepower.io:43382',
        'https://c102n2.thepower.io:43482',
      ],
      'ip': [
        'http://c102n2.thepower.io:43382',
        'https://c102n2.thepower.io:43482',
      ],
    },
    '4ChWotb5pfLvmGXBc5M8fu7jNHXB': {
      'host': [
        'http://c102n4.thepower.io:43382',
        'https://c102n4.thepower.io:43482',
      ],
      'ip': [
        'http://c102n4.thepower.io:43382',
        'https://c102n4.thepower.io:43482',
      ],
    },
    '4NoNQJzEcWr2gyszSUdGShXXseaC': {
      'host': [
        'http://c102n5.thepower.io:43382',
        'https://c102n5.thepower.io:43482',
      ],
      'ip': [
        'http://c102n5.thepower.io:43382',
        'https://c102n5.thepower.io:43482',
      ],
    },
    'NPvVcKpnHuGKsActjmEmWKgSbZh': {
      'host': [
        'http://c102n9.thepower.io:43382',
        'https://c102n9.thepower.io:43482',
      ],
      'ip': [
        'http://c102n9.thepower.io:43382',
        'https://c102n9.thepower.io:43482',
      ],
    },
    'oM2yj49e3g3gWquE1x1JDfa8ZQD': {
      'host': [
        'http://c102n3.thepower.io:43382',
        'https://c102n3.thepower.io:43482',
      ],
      'ip': [
        'http://c102n3.thepower.io:43382',
        'https://c102n3.thepower.io:43482',
      ],
    },
    'wFQYUgQLa2yJqdEgVD7sJLJxewC': {
      'host': [
        'http://c102n10.thepower.io:43382',
        'https://c102n10.thepower.io:43482',
      ],
      'ip': [
        'http://c102n10.thepower.io:43382',
        'https://c102n10.thepower.io:43482',
      ],
    },
  }),
  '8':transformNodeList({
    '8rxo4eAncEqj8kraFFmS9MvJTGW': {
      'host': [
        'http://c8n1.thepower.io:43288',
        'https://c8n1.thepower.io:43388',
      ],
      'ip': [
        'http://51.15.80.38:43288',
        'https://51.15.80.38:43388',
      ],
    },
  }),
  '2':transformNodeList({
    '2UYKF1HyNz7QSFTGY5ffZSG8oWem': {
      'host': [
        'http://c102n6.thepower.io:43382',
        'https://c102n6.thepower.io:43482',
      ],
      'ip': [
        'http://c102n6.thepower.io:43382',
        'https://c102n6.thepower.io:43482',
      ],
    },
    '2i6tWT8XuT3jQcvpzKUM9V51L2sm': {
      'host': [
        'http://c102n7.thepower.io:43382',
        'https://c102n7.thepower.io:43482',
      ],
      'ip': [
        'http://c102n7.thepower.io:43382',
        'https://c102n7.thepower.io:43482',
      ],
    },
    '3UvkSW1iMARXVpxAwLRXppVJ5xNJ': {
      'host': [
        'http://c102n2.thepower.io:43382',
        'https://c102n2.thepower.io:43482',
      ],
      'ip': [
        'http://c102n2.thepower.io:43382',
        'https://c102n2.thepower.io:43482',
      ],
    },
    '4ChWotb5pfLvmGXBc5M8fu7jNHXB': {
      'host': [
        'http://c102n4.thepower.io:43382',
        'https://c102n4.thepower.io:43482',
      ],
      'ip': [
        'http://c102n4.thepower.io:43382',
        'https://c102n4.thepower.io:43482',
      ],
    },
    '4NoNQJzEcWr2gyszSUdGShXXseaC': {
      'host': [
        'http://c102n5.thepower.io:43382',
        'https://c102n5.thepower.io:43482',
      ],
      'ip': [
        'http://c102n5.thepower.io:43382',
        'https://c102n5.thepower.io:43482',
      ],
    },
    'oM2yj49e3g3gWquE1x1JDfa8ZQD': {
      'host': [
        'http://c102n3.thepower.io:43382',
        'https://c102n3.thepower.io:43482',
      ],
      'ip': [
        'http://c102n3.thepower.io:43382',
        'https://c102n3.thepower.io:43482',
      ],
    },
    'wFQYUgQLa2yJqdEgVD7sJLJxewC': {
      'host': [
        'http://c102n10.thepower.io:43382',
        'https://c102n10.thepower.io:43482',
      ],
      'ip': [
        'http://c102n10.thepower.io:43382',
        'https://c102n10.thepower.io:43482',
      ],
    },
  }),
  '103': transformNodeList({
    '2YEYpJT9bBFfu9rdHpZpqdS1Dweo': {
      'host': [
        'http://c103n10.thepower.io:49841',
        'https://c103n10.thepower.io:43392',
      ],
      'ip': [
        'http://c103n10.thepower.io:49841',
        'https://c103n10.thepower.io:43392',
      ],
    },
  }),
  '1': transformNodeList({
    'BZQcNTcWE9qrWDVXfysZyarSdaA': {
      'host': [
        'http://c1n2:44002', 'https://c1n2:45002',
      ],
      'ip':[
        'http://testnet.thepower.io:44002', 'https://testnet.thepower.io:45002',
      ],
    },
  }),
};
