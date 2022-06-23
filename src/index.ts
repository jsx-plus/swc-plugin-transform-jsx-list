import {
  Expression,
  JSXElement, JSXText, Program,
} from '@swc/core';
import Visitor from '@swc/core/Visitor';
import {
  ExprOrSpread, JSXElementChild
} from '@swc/core/types';
import {
  buildArrayExpression,
  buildArrowFunctionExpression, buildBooleanLiteral, buildCallExpression, buildIdentifier, buildImportDeclaration,
  buildJSXElement,
  buildJSXExpressionContainer, buildJSXText, buildNamedImportSpecifier, buildNullLiteral, buildStringLiteral
} from './utils';

function transformJSXList(n: JSXElement, currentList: JSXElementChild[], currentIndex: number): JSXElement | JSXText {
  return n;
}

class JSXListTransformer extends Visitor {
  visitJSXElement(n: JSXElement): JSXElement {
    return n;
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
