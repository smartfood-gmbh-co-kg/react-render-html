import React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import renderHTML, { applyMiddleware } from '../index'

const renderTest = (reactEl, expectedHTML) => {
  expect(ReactDOMServer.renderToStaticMarkup(reactEl)).toEqual(expectedHTML)
}

const singleElementTest = html => {
  renderTest(renderHTML(html), html)
}

test('returns a single React element rendering a provided HTML', () => {
  singleElementTest(
    '<ul>' +
      '<li><a class="hello" href="https://github.com">hihi</a></li>' +
      '<li><p><b>hello</b>world</p><p>react</p></li>' +
      '</ul>'
  )
})

test('returns an array of React elements if several nodes are provided', () => {
  const arr = renderHTML(
    '<li><a class="hello" href="https://github.com">hihi</a></li>' +
      '<li><p><b>hello</b>world</p><p>react</p></li>'
  )

  expect(arr.length).toEqual(2)
  renderTest(
    arr[0],
    '<li><a class="hello" href="https://github.com">hihi</a></li>'
  )
  renderTest(arr[1], '<li><p><b>hello</b>world</p><p>react</p></li>')
})

test('parse the style attribute when specified as a string', () => {
  singleElementTest(
    '<ul>' +
      '<li style="font-weight:bold;color:green"><a class="hello" href="https://github.com">hihi</a></li>' +
      '<li style="font-style:italic"><p><b>hello</b>world</p><p>react</p></li>' +
      '</ul>'
  )
})

test('uses the given `renderNode` function', () => {
  const replaceHref = () => next => (node, key) => {
    const element = next(node, key)
    if (node.tagName === 'a') {
      return React.cloneElement(element, {
        href: 'https://example.com'
      })
    }
    return element
  }
  const htmlElement = renderHTML(
    '<ul>' +
      '<li><a class="hello" href="https://github.com">hihi</a></li>' +
      '<li><p><b>hello</b>world</p><p>react</p></li>' +
      '</ul>',
    replaceHref
  )

  renderTest(
    htmlElement,
    '<ul>' +
      '<li><a class="hello" href="https://example.com">hihi</a></li>' +
      '<li><p><b>hello</b>world</p><p>react</p></li>' +
      '</ul>'
  )
})

test('can compose `renderNode` functions', () => {
  const replaceHref = () => next => (node, key) => {
    const element = next(node, key)
    if (node.tagName === 'a') {
      return React.cloneElement(element, {
        href: 'https://example.com'
      })
    }
    return element
  }
  const replacePs = () => next => (node, key) => {
    if (node.tagName === 'p') {
      return React.createElement(node.tagName, {}, 'Redacted')
    }
    return next(node, key)
  }
  const addLi = renderNode => next => (node, key) => {
    const element = next(node, key)
    if (node.tagName === 'ul') {
      return React.cloneElement(
        element,
        {},
        ...node.childNodes.map(renderNode),
        React.createElement('li', {}, 'One more')
      )
    }
    return element
  }
  const htmlElement = renderHTML(
    '<ul>' +
      '<li><a class="hello" href="https://github.com">hihi</a></li>' +
      '<li><p><b>hello</b>world</p><p>react</p></li>' +
      '</ul>',
    applyMiddleware(replaceHref, replacePs, addLi)
  )

  renderTest(
    htmlElement,
    '<ul>' +
      '<li><a class="hello" href="https://example.com">hihi</a></li>' +
      '<li><p>Redacted</p><p>Redacted</p></li>' +
      '<li>One more</li>' +
      '</ul>'
  )
})
