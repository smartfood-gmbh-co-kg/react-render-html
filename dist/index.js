'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.applyMiddleware = applyMiddleware;
exports.default = renderHTML;

var _parse = require('parse5');

var _parse2 = _interopRequireDefault(_parse);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAttrConverter = require('react-attr-converter');

var _reactAttrConverter2 = _interopRequireDefault(_reactAttrConverter);

var _reactStyling = require('react-styling');

var _reactStyling2 = _interopRequireDefault(_reactStyling);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const compose = (...fns) => arg => fns.reduceRight((prev, fn) => fn(prev), arg);

function baseRenderNode(renderNode) {
  return (node, key) => {
    if (node.nodeName === '#text') {
      return node.value;
    }

    const props = _extends({
      key
    }, node.attrs.reduce((attrs, attr) => {
      const name = (0, _reactAttrConverter2.default)(attr.name);
      return _extends({}, attrs, {
        [name]: name === 'style' ? (0, _reactStyling2.default)(attr.value) : attr.value
      });
    }, {}));

    const children = node.childNodes.map(renderNode);
    return _react2.default.createElement(node.tagName, props, ...children);
  };
}

function applyMiddleware(...middlewares) {
  return renderNode => (node, key) => {
    const chain = middlewares.map(middleware => middleware(renderNode));
    return compose(...chain)(node, key);
  };
}

function renderHTML(html, middleware = () => next => (...args) => next(...args)) {
  const htmlAST = _parse2.default.parseFragment(html);

  if (htmlAST.childNodes.length === 0) {
    return null;
  }

  const finalRenderNode = (node, key) => middleware(finalRenderNode)(baseRenderNode(finalRenderNode))(node, key);
  const result = htmlAST.childNodes.map(finalRenderNode);

  return result.length === 1 ? result[0] : result;
}