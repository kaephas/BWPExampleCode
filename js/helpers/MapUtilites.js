/**
 * Converts a JSON Object representation of a Map, to an actual Map, deserialization
 * @param {object} obj - an object representation of a map
 * @returns {Map<any, any>}
 */
export function objToStrMap(obj) {
    let strMap = new Map();
    for (let k of Object.keys(obj)) {
        strMap.set(k, obj[k]);
    }
    return strMap;
}

/**
 * Converts a map to an object, serialization
 * @param {Map<any, any>} strMap - a map to be serialized
 * @returns {object}
 */
export function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k,v] of strMap) {
        obj[k] = v;
    }
    return obj;
}