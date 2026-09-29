// Creates an element with properties and children. Strings become text nodes,
// so file names never end up parsed as HTML.
export function h(tag, props = {}, ...children) {
  const element = Object.assign(document.createElement(tag), props);
  element.append(...children);

  return element;
}
