import * as Sentry from "@sentry/browser";

export async function raiseForStatus(response: Response) {
  if (!response.ok) {
    let responseText: string;

    try {
      responseText = await response.text();
    } catch (_) {
      responseText = "No text available";
    }

    throw Error(`${response.statusText} - ${responseText}`);
  }
}

interface FetchArgs {
  url: string;
  method?: string;
  json?: boolean;
}

const fetchDefaults = {
  method: "GET",
  json: false,
};

export async function appFetch(options: FetchArgs) {
  const { url, method, json } = { ...fetchDefaults, ...options };

  try {
    const resp = await fetch(url, { method });
    await raiseForStatus(resp);

    let result: any;
    if (json) {
      result = await resp.json();
    } else {
      result = resp;
    }

    return result;
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
}

export function debounce<F extends Function>(func: F, wait: number): F {
  let timeoutID: number;

  if (!Number.isInteger(wait)) {
    throw Error(`Called debounce without a valid number: ${wait}`);
  }

  // conversion through any necessary as typescript complains
  return function(this: any, ...args: any[]) {
    clearTimeout(timeoutID);
    const context = this;

    timeoutID = window.setTimeout(function() {
      func.apply(context, args);
    }, wait);
  } as any;
}

function _searchSerialize(searchItem: any): string[] {
  if (typeof searchItem === "string") {
    return [searchItem];
  } else if (typeof searchItem === "number") {
    return [searchItem.toLocaleString("de-DE")];
  } else if (Array.isArray(searchItem)) {
    return searchItem.flatMap(value => _searchSerialize(value));
  } else if (searchItem === undefined || searchItem === null || typeof searchItem === "boolean") {
    return [];
  } else if (typeof searchItem === "object") {
    return Object.values(searchItem).flatMap(value => _searchSerialize(value));
  } else {
    throw Error(`Unexhausted if for: ${searchItem}`);
  }
}

/**
 *
 * @param searchItem This will be serialized and searched through
 * @param filterText This will be split by space and each filter will be
 *                   applied (boolean "AND")
 * @returns Boolean: Wheter the filterText matched on the searchItem
 */
export function anyTextSearch(searchItem: any, filterText: string): boolean {
  if (filterText.trim() === "") return true;

  const filterList = filterText.toLowerCase().split(" ");

  const searchString = _searchSerialize(searchItem)
    .join(" ")
    .toLowerCase();

  return filterList.every(filter => searchString.includes(filter));
}
