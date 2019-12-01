/**
 * Base object for Serialization
 *
 * @author Tyler Bezera
 * Date: 01/28/2019
 */

"use strict";

import EventDispatcher from "../controllers/EventDispatcher";

/**
 * Model class is used as the abstract class for all Models, and simply ensures that a model will have a serialize and
 * deserialize method for use.
 */
export default class Model extends EventDispatcher{
    constructor(){ super(); }

    /**
     * Abstract method serialize, used when packaging data up to be sent to the server
     */
    serialize(){}

    /**
     * Abstract method deserialize, used when retrieving and placing data back into model.
     */
    deserialize(){}
}