/**
 * @author: Tyler Bezera
 * Date: 1/21/2019
 * Facilities connection between backend with front end, by implementing the basic CRUD operations
 */

"use strict";

const url = "https://bwp-app.herokuapp.com/";

/**
 * Connection to backend, using fetch this method builds it's call based on parameters given, is used for all
 * underlying API calls.
 *
 * @param {string} api - api which api endpoint are we calling to, i.e. /api/fighter
 * @param {object} data - data data object we are passing to the backend
 * @param {string} method - method PUT, GET, POST, DELETE...
 * @param {string} token - token to be sent to server for validation
 * @param {function} resultHook - function pointer to what should be done with data after fetch is complete.
 */
export function connect(api, data, method, token, resultHook)
{
    let options = 
    {
        method: method,
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: 
        {
            "x-access-token": token,
            "Content-Type": "application/json"
        }
    };

    if(data)
    {
        options.body = JSON.stringify(data);
        console.log("if(data)");
        console.log(options.body);
        console.log("Binary String?");
        console.log(options.body[2]);
    } else {
        console.log("not(data)");
    }

    fetch(url + api, options).then((response) => {
            return response.json();
        }).then((data) => {
            console.log(data);
            if(resultHook) resultHook(data);
        }).catch((reason) => {
            console.log(data);
            console.log(reason);
    });
}

/**
 * POST to backend, this will create a new fighter in the database, with the given fighterData passed to this
 * function.
 * @param {object} fighterData - Fighter DataStore object, containing all the fighter models, whether they are filled out
 * or not
 * @param {function} resultHook - callback functions to be called on error or success
 * @param {string} token - verified token, to be sent to backend for validation
 */
export function create(fighterData, resultHook, token)
{
    connect("api/fighter/", {data: fighterData}, "POST", token, resultHook);
}

/**
 * Get x amount of fighters, based on criteria
 * @param {object} criteria - search criteria to get fighters on
 * @param {number} limit - amount of fighters to get from query (pagination use)
 * @param {string} token - coach token for connecting to API
 */
export function read(criteria, limit, token)
{
    let obj = {
        criteria: criteria,
        limit: limit
    };

    connect("api/fighter/", obj, "GET", token, null);
}

/**
 * Generic get request
 * @param {string} category - which api to access
 * @param {function} resultHook - function to be called when fetch is complete
 * @param {string} token - coach token for connecting to API
 */
export function getRequest(category, resultHook, token)
{
    const apiString = "api/" + category;
    connect(apiString, null, "GET", token, resultHook);
}

/**
 * Generic POST request
 * @param {string} api - which api are we sending it to, i.e /fighter/
 * @param {object} data - the data being sent in the POST request body
 * @param {function} resultHook - function called on resolution of fetch request
 * @param {string} token - coach api token
 */
export function postRequest(api, data, resultHook, token)
{
    connect(api, data, "POST", token, resultHook)
}

/**
 * Generic PUT request to the api
 * @param {string} api - which api are we sending it to, i.e /fighter/:id
 * @param {object} data - the data being sent in the PUT request body
 * @param {function} resultHook - function called on resolution of fetch request
 * @param {string} token- coach api token
 */
export function putRequest(api, data, resultHook, token)
{
    connect(api, data, "PUT", token, resultHook)
}

/**
 * Read all the fighters from the database
 * @param {function} resultHook - function called when fetch request has resolved
 * @param {string} token - coach api token
 */
export function readAll(resultHook, token)
{
    connect("api/fighters/", null, "GET", token, resultHook);
}

/**
 * Read a certain number of fighters at a time
 * @param {object} criteria - projection for what data we want
 * @param {number} currentIndex - index at which we are on, for pagination
 * @param {number} limit - the amount of fighters we want
 * @param {function} resultHook - function called when fetch request has resolved
 * @param {string} token - coach api token
 */
export function readPagination(criteria, currentIndex, limit, resultHook, token){
    connect(`api/fighter/${JSON.stringify(criteria)}/${currentIndex}/${limit}`, null, 'GET', token, resultHook);
}

/**
 * GET a fighter based on ID, typically only used for getting fighter from directory
 * @param {number} id - ID to search on
 * @param {function} resultHook - function called when fetch request has resolved
 * @param {string} token - coach api token
 */
export function readOne(id, resultHook, token){
    let api = "api/fighter/" + id;
    connect(api, null,"GET", token, resultHook);
}

/**
 * PUT on our api, to update a fighters information, based on ID for finding correct fighter
 * @param {object} fighterData - JSON data on fighter that we are updating
 * @param {number} id - fighter's id to update on
 */
export function update(fighterData, id, resultHook, token)
{
    console.log("Updating " + fighterData + "with id " + id);
    connect(`api/fighter/${id}`, {data: fighterData}, "PUT", token, resultHook);
}

/**
 * DELETE on our api, to delete a fighter from the database, this should be used VERY CAREFULLY
 * @param {number} id - fighter's id to delete on
 * @param {string} token - coach token used to access API
 */
export function remove(id, token)
{
    connect("api/fighter/", {id}, "DELETE", token, null);
}