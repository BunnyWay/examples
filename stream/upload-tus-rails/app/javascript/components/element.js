// Builds a DOM element. Children are appended as text, so a file name can't inject markup.
export function element(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  node.append(...children);

  return node;
}
