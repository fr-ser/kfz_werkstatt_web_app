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
  jsonResponse?: boolean;
  jsonData?: any;
}

const fetchDefaults = {
  method: "GET",
  jsonResponse: true,
};

export async function appFetch(options: FetchArgs) {
  const { url, method, jsonData, jsonResponse } = { ...fetchDefaults, ...options };

  let requestOptions: RequestInit = { method };
  if (jsonData) {
    requestOptions.headers = {
      "Content-Type": "application/json",
    };
    requestOptions.body = JSON.stringify(jsonData);
  }

  try {
    const resp = await fetch(url, requestOptions);
    await raiseForStatus(resp);

    let result: any;
    if (jsonResponse) {
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
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutID);
    const context = this;

    timeoutID = window.setTimeout(function () {
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
    return searchItem.flatMap((value) => _searchSerialize(value));
  } else if (searchItem === undefined || searchItem === null || typeof searchItem === "boolean") {
    return [];
  } else if (typeof searchItem === "object") {
    return Object.values(searchItem).flatMap((value) => _searchSerialize(value));
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

  const searchString = _searchSerialize(searchItem).join(" ").toLowerCase();

  return filterList.every((filter) => searchString.includes(filter));
}

/**
 * The function takes a numeric string (german) and returns the number
 * It throws an error if it cannot be parsed
 * @param strNum numeric string
 * @param precision optional precision of output
 */
export function strToFloat(strNum: string, precision?: number): number {
  if ((strNum.match(/,/g) || []).length > 1) {
    throw Error(`Too many commas in input "${strNum}"`);
  }

  const cleanStr = strNum.trim().replace(/[\s.]/g, "").replace(",", ".");

  const parsedNum = parseFloat(cleanStr);

  if (isNaN(parsedNum) || typeof parsedNum !== "number") {
    throw Error(`Could not convert string "${strNum}" to number`);
  }

  if (typeof precision === "number") return round(parsedNum, precision);
  else return parsedNum;
}

export function getDateForDOM(date: Date) {
  var temp = date;
  return (
    temp.getFullYear() +
    "-" +
    ("00" + (temp.getMonth() + 1)).slice(-2) +
    "-" +
    ("00" + temp.getDate()).slice(-2)
  );
}

/**
 * Small helper to get correct rounding with decimals
 * @param number number to round
 * @param precision number of decimals to round to
 */
function round(number: number, precision = 2) {
  if (Math.round(precision) !== precision) {
    throw Error(`Precision cannot be a float "${precision}"`);
  }
  return Math.round((number + Number.EPSILON) * 10 ** precision) / 10 ** precision;
}
