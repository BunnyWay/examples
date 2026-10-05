// Builds a DOM element. Children are appended as text, so file names are never parsed as HTML.
export function element(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);

  return node;
}
