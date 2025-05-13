import { join } from "path";

export type SanitizedPath = { toString: () => string };

function isSanitizedPath(path: string | SanitizedPath): path is SanitizedPath {
  return (
    typeof path === "object" &&
    path !== null &&
    (path as { __sanitized: true }).__sanitized === true
  );
}

export function safePath(
  strings: TemplateStringsArray,
  ...values: (string | string[] | SanitizedPath)[]
): SanitizedPath {
  const parts: string[] = [];
  const template: string[] = [];
  for (let i = 0; i < strings.length; i++) {
    parts.push(strings[i]);
    template.push(strings[i]);
    if (values[i]) {
    const _value = values[i]
    const valuesArray = Array.isArray(_value) ? _value as string[] : [_value];
    for (const valuePart of valuesArray) {
      const v = valuePart.toString()
      if(!v) continue
      parts.push(v);
      template.push(
          isSanitizedPath(valuePart) ? v : "[placeholder]"
        );
      }
    }
  }

  const fullPath = join(...parts);

  console.log("Full path:", fullPath);
  console.log("Template path:", join(...template));

  if (fullPath.split("/").length !== join(...template).split("/").length) {
    throw new Error("Path is not safe.");
  }

  const returnValue = Object.create({} as SanitizedPath, {
    path: {
      value: fullPath,
      enumerable: true,
      writable: false,
    },
    __sanitized: {
      value: true,
      enumerable: false,
      writable: false,
      configurable: false,
    },
    toString: {
      value: () => fullPath,
      enumerable: false,
    },
  });
  Object.freeze(returnValue);

  return returnValue;
}
