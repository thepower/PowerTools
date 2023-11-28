import { isUint } from './is-uint';
import { isBoolean } from './is-boolean';
import { isInt } from './is-int';
import { isBytes } from './is-bytes';

export function isValid(value: string, type: string, components?: any[]): boolean {
  if (type.search(/\buint/) !== -1) return isUint(value, +type.substring(4));
  if (type.search(/\bint/) !== -1) return isInt(value, +type.substring(3));
  if (type.search(/\bbool/) !== -1) return isBoolean(value);
  // if (type.search(/\baddress/) != -1) return isAddress(value);

  if (type.search(/\bbytes/) !== -1) {
    const len = 5;
    const exponent = type.length === len ? 32 : parseInt(type.substring(len), 10);

    return isBytes(value, exponent);
  }

  if (type.search(/\bbyte/) !== -1) {
    const len = 4;
    const exponent = type.length === len ? 1 : parseInt(type.substring(len), 10);

    return isBytes(value, exponent);
  }

  if (type === 'tuple') {
    const parsedValue = JSON.parse(value);

    if (!components || (components && components.length === 0)) {
      return false;
    }

    for (const component of components) {
      const { name, type, component: deeperComponent } = component;
      const value = parsedValue[name];

      if (!isValid(value, type, deeperComponent)) {
        return false;
      }
    }
  }

  return true;
}
