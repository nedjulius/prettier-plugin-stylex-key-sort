import {
  PSEUDO_CLASS_PRIORITIES,
  AT_RULE_PRIORITIES,
  PSEUDO_ELEMENT_PRIORITY,
} from '@stylexjs/shared';

type PriorityAndType = {
  priority: number;
  type: 'string' | 'pseudoClass' | 'pseudoElement' | 'atRule';
};

export default function getKeyValuePriorityAndType(
  keyValue: string,
): PriorityAndType {
  if (keyValue.startsWith('@supports')) {
    return { priority: AT_RULE_PRIORITIES['@supports'], type: 'atRule' };
  }

  if (keyValue.startsWith('::')) {
    return { priority: PSEUDO_ELEMENT_PRIORITY, type: 'pseudoElement' };
  }

  if (keyValue.startsWith(':')) {
    const prop =
      keyValue.startsWith(':') && keyValue.includes('(')
        ? keyValue.slice(0, keyValue.indexOf('('))
        : keyValue;

    return {
      priority:
        PSEUDO_CLASS_PRIORITIES[prop as keyof typeof PSEUDO_CLASS_PRIORITIES] ??
        40,
      type: 'pseudoClass',
    };
  }

  if (keyValue.startsWith('@media')) {
    return { priority: AT_RULE_PRIORITIES['@media'], type: 'atRule' };
  }

  if (keyValue.startsWith('@container')) {
    return { priority: AT_RULE_PRIORITIES['@container'], type: 'atRule' };
  }

  return { priority: 1, type: 'string' };
}
