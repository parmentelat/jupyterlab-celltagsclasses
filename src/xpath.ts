/* eslint-disable no-case-declarations */
/* eslint-disable prettier/prettier */

// helpers to manage a JS object
//
// in this module we are only concerned about doing side effects
// in a JavaScript object


// what to do on the passed object
enum Action {
  Get,      // get the metadata at that xpath
  Set,      // set the metadata at that xpath
  Unset,    // undo the set operation
  Insert,   // insert the value inside that xpath (should point to a list)
  Remove,   // undo insert
}


export type XpathMap = Record<string, any>
export type Xpath = string | string[]

export const normalize = (xpath: Xpath): string[] => {
  if (typeof xpath === 'string') {
    const string = xpath as string
    if (string.length === 0) {
      return []
    }
    return string.split('.')
  } else if (xpath instanceof Array) {
    return xpath
  } else {
    console.error(`xpath must be string or array, got ${xpath}`)
    return []
  }
}


const _manage_metadata = (
  data: XpathMap,      // intended to be cell.metadata
  action: Action,
  xpath: Xpath,
  value: any,
): any => {

  const { Get, Set, Unset, Insert, Remove, } = Action

  const recurse = (
    scanner: XpathMap,
    action: Action,
    xpath: string[],
    value: any,
  ): any => {

    // console.log(`in recurse with xpath=${xpath}`)

    if (xpath.length === 0) {
      switch (action) {
        case Get:
          return scanner
        default:
          return undefined
      }
    } else if (xpath.length === 1) {
      const [step] = xpath
      //
      switch (action) {
        case Get:
          return scanner[step]
        case Set:
          scanner[step] = value
          return value
        case Unset:
          if (step in scanner) {
            delete scanner[step]
            return true
          } else {
            return false
          }
        case Insert:
          // create list if needed
          if (!(step in scanner)) {
            scanner[step] = []
          }
          if (!(scanner[step] instanceof Array)) {
            return undefined
          }
          // insert if not already present
          {
            const list = scanner[step] as Array<string>
            if (list.indexOf(value) < 0) {
              list.push(value)
              return value
            } else {
              return undefined
            }
          }
        case Remove:
          if (!(scanner[step] instanceof Array)) {
            return undefined
          }
          const list = (scanner[step]) as string[]
          // list.pop(value) is not accepted by ts ?!?
          const index = list.indexOf(value)
          if (index >= 0) {
            list.splice(index, 1)
          }
          return value
      }
    } else {
      const [first, ...rest] = xpath
      if (first in scanner) {
        if (!(scanner[first] instanceof Object)) {
          return undefined
        } else {
          const next = scanner[first] as Record<string, any>
          return recurse(next, action, rest, value)
        }
      } else {
        switch (action) {
          case Get:
            return undefined
          case Set:
            scanner[first] = {}
            const next = scanner[first] as Record<string, any>
            return recurse(next, action, rest, value)
          case Unset:
            return undefined
          case Insert:
            if (rest.length === 0) {
              scanner[first] = []
              return recurse(scanner[first], action, rest, value)
            } else {
              scanner[first] = {}
              return recurse(scanner[first], action, rest, value)
            }
          case Remove:
            return undefined
        }
      }
    }
  }

  const xpath_list = normalize(xpath)

  return recurse(data, action, xpath_list, value)
}

const _clean_metadata = (data: XpathMap, xpath: Xpath): XpathMap => {

  const not_empty = (x: any) : boolean => {
    if (x instanceof Array) {
      return x.length !== 0
    } else if (x instanceof Object) {
      return Object.keys(x).length !== 0
    } else if ((typeof x) === 'string') {
      return x.length !== 0
    } else {
      return true
    }
  }

  const clean_array = (data: any[]) : any[] => {
    return data.map(clean).filter(not_empty)
  }
  const clean_object = (data: Record<string, any>): Record<string, any> => {
    const result = {} as Record<string, any>
    for (const key in data) {
      const value = data[key]
      const cleaned = clean(value)
      if (not_empty(cleaned)) {
        result[key] = cleaned
      }
    }
    return result
  }

  const clean = (data: any[] | Record<string, any>) => {

    if (data instanceof Array) {
      return clean_array(data)
    } else if (data instanceof Object) {
      return clean_object(data)
    } else {
      return data
    }
  }

  const xpath_list = normalize(xpath)
  if (xpath_list.length === 0) {
    return clean(data)
  } else {
    const start = xpath_get(data, xpath_list)
    if (start === undefined) {
      // nothing serious here, just a debug message
      //console.debug(`DBG: xpath_clean: nothing to clean at ${xpath} - from ${xpath_list}`)
      return data
    } else {
      return xpath_set(data, xpath_list, clean(start))
    }
  }
}


export const xpath_get = (metadata: XpathMap, xpath: Xpath) =>
  _manage_metadata(metadata, Action.Get, xpath, undefined)
export const xpath_set = (metadata: XpathMap, xpath: Xpath, value: any) =>
  _manage_metadata(metadata, Action.Set, xpath, value)
export const xpath_unset = (metadata: XpathMap, xpath: Xpath) =>
  _manage_metadata(metadata, Action.Unset, xpath, undefined)
export const xpath_insert = (metadata: XpathMap, xpath: Xpath, key: string) =>
  _manage_metadata(metadata, Action.Insert, xpath, key)
export const xpath_remove = (metadata: XpathMap, xpath: Xpath, key: string) =>
  _manage_metadata(metadata, Action.Remove, xpath, key)
export const xpath_clean = (metadata: XpathMap, xpath: Xpath) =>
  _clean_metadata(metadata, xpath)
