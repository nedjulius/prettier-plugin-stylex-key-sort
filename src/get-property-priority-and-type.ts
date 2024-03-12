import {
  PSEUDO_CLASS_PRIORITIES,
  AT_RULE_PRIORITIES,
  PSEUDO_ELEMENT_PRIORITY,
} from '@stylexjs/shared';

type PriorityAndType = {
  priority: number;
  type: 'string' | 'pseudoClass' | 'pseudoElement' | 'atRule';
};

export default function getPropertyPriorityAndType(
  key: string,
): PriorityAndType {
  if (key.startsWith('@supports')) {
    return { priority: AT_RULE_PRIORITIES['@supports'], type: 'atRule' };
  }

  if (key.startsWith('::')) {
    return { priority: PSEUDO_ELEMENT_PRIORITY, type: 'pseudoElement' };
  }

  if (key.startsWith(':')) {
    const prop =
      key.startsWith(':') && key.includes('(')
        ? key.slice(0, key.indexOf('('))
        : key;

    return {
      priority:
        PSEUDO_CLASS_PRIORITIES[prop as keyof typeof PSEUDO_CLASS_PRIORITIES] ??
        40,
      type: 'pseudoClass',
    };
  }

  if (key.startsWith('@media')) {
    return { priority: AT_RULE_PRIORITIES['@media'], type: 'atRule' };
  }

  if (key.startsWith('@container')) {
    return { priority: AT_RULE_PRIORITIES['@container'], type: 'atRule' };
  }

  return { priority: 1, type: 'string' };
}
