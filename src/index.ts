import {
  Expression, JSXAttribute, JSXAttrValue,
  JSXElement, JSXExpression, JSXText, Program,
} from '@swc/core';
import Visitor from '@swc/core/Visitor';
import {
  ExprOrSpread, JSXElementChild, Pattern
} from '@swc/core/types';
import {
  buildArrayExpression,
  buildArrowFunctionExpression,
  buildBooleanLiteral,
  buildCallExpression,
  buildIdentifier,
  buildImportDeclaration,
  buildJSXElement,
  buildJSXExpressionContainer,
  buildJSXText,
  buildMemberExpression,
  buildNamedImportSpecifier,
  buildNullLiteral,
  buildStringLiteral, buildThisExpression
} from './utils';

function JSXListToStandard(n: JSXElement) {
  let openingAttributes = n.opening.attributes;

  if (openingAttributes) {
    openingAttributes = openingAttributes.filter((attribute) => {
      if (attribute.type === 'JSXAttribute' && attribute.name.type === 'Identifier' && attribute.name.value === 'x-for') {
        return false;
      }
      return true;
    });
  }
  return buildJSXElement({
    ...n.opening,
    attributes: openingAttributes
  }, n.children, n.closing)
}

function transformJSXList(n: JSXElement, currentList: JSXElementChild[], currentIndex: number): JSXElement | JSXText {
  n.children = n.children.map((c, i) => {
    if (c.type === 'JSXElement' && isJSXList(c)) {
      return transformJSXList(c, n.children, i);
    }
    return c;
  });

  if (isJSXList(n)) {
    let attrValue = getJSXList(n);
    if (!attrValue || attrValue.type !== 'JSXExpressionContainer') {
      console.warn('ignore x-for due to stynax error.');
      return n;
    }

    // @ts-ignore
    if (n.__listHandled) return n;
    // @ts-ignore
    n.__listHandled = true;

    let { expression } = attrValue;
    let params: Pattern[] = [];
    let iterValue: Expression;

    if (expression.type === 'BinaryExpression' && expression.operator === 'in') {
      // x-for={(item, index) in value}
      const { left, right } = expression;
      iterValue = right;

      if (left.type === 'ParenthesisExpression' && left.expression.type === 'SequenceExpression') {
        // x-for={(item, key) in value}
        params = left.expression.expressions;
      } else if (left.type === 'Identifier') {
        // x-for={item in value}
        params.push(buildIdentifier(left.value));
      } else {
        // x-for={??? in value}
        throw new Error('Stynax error of x-for.');
      }
    } else {
      // x-for={value}, x-for={callExp()}, ...
      iterValue = expression;
    }

    let callee = buildMemberExpression(buildIdentifier('__create_list__'), buildIdentifier('call'));
    let body = buildCallExpression(callee, [
      {
        expression: buildThisExpression()
      },
      {
        expression: iterValue
      },
      {
        expression: buildArrowFunctionExpression(params, JSXListToStandard(n))
      }
    ]) as any;

    return buildJSXExpressionContainer(body) as any;
  }

  return n;
}

function getJSXList(n: JSXElement): JSXAttrValue | undefined {
  let opening = n.opening;
  let openingAttributes = opening.attributes;

  if (openingAttributes) {
    for (let attribute of openingAttributes) {
      if (attribute.type === 'JSXAttribute' && attribute.name.type === 'Identifier' && attribute.name.value === 'x-for') {
        return attribute.value;
      }
    }
  }
}

function isJSXList(n: JSXElement): boolean {
  let opening = n.opening;
  let openingAttributes = opening.attributes;

  if (openingAttributes) {
    for (let attribute of openingAttributes) {
      if (attribute.type === 'JSXAttribute' && attribute.name.type === 'Identifier' && attribute.name.value === 'x-for') {
        return true;
      }
    }
  }
  return false;
}

class JSXListTransformer extends Visitor {
  visitJSXElement(n: JSXElement): JSXElement {
    return transformJSXList(n, [], -1) as JSXElement;
  }
}

export default function JSXConditionTransformPlugin(m: Program): Program {
  let result = new JSXListTransformer().visitProgram(m);
  let babelImport = buildImportDeclaration([
    buildNamedImportSpecifier(
      buildIdentifier('__create_list__', false),
      buildIdentifier('createList', false)
    )
  ], buildStringLiteral('babel-runtime-jsx-plus'));
  result.body.unshift(babelImport as any);

  return result;
}
