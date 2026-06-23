import { readFileSync, writeFileSync } from "node:fs";

function hasKey(dataSource, key) {
  return Object.hasOwn(dataSource, key);
}

function lookup(dataSource, key, locale) {
  return dataSource[key][locale];
}

function update(filename, dataSource, key, locale, text) {
  dataSource[key] = { ...dataSource[key], [locale]: text };
}

function save(filename, dataSource) {
  writeFileSync(filename, JSON.stringify(dataSource, null, 2));
}

export function initializeJSONDataSource(filename) {
  let dataSource;

  try {
    dataSource = JSON.parse(readFileSync(filename, "utf-8"));
  } catch (err) {
    writeFileSync(filename, JSON.stringify({}));
    dataSource = JSON.parse(readFileSync(filename, "utf-8"));
  }

  return {
    hasKey: hasKey.bind(null, dataSource),
    lookup: lookup.bind(null, dataSource),
    update: update.bind(null, filename, dataSource),
    save: save.bind(null, filename, dataSource),
  };
}
