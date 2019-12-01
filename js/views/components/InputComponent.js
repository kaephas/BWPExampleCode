/**
 * @author Jacob Landowski
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 2/11/2019
 * Component Class to represent a Input element and its data binding
 */

'use strict';

import LabeledComponent from './LabeledComponent';

/**
 * InputComponent Class to be extended by components that want to be an input of any type (text is  default).
 */
export default class InputComponent extends LabeledComponent
{
    /**
     * InputComponent constructor builds the Input Component that want to be rendered
     * @constructor
     * @param {string} type - type of input component (text, number, date, checkbox, radio). Default is text.
     */
    constructor(type='text')
    {   
        super();

        if(typeof type === undefined)
            throw new Error(`${this.constructor.name} requires an type attribute to be set.`);
        
        this.type = type;
    }

    /**
     * Sets the type of the input component.
     * @param type - type of input component (text, number, date, checkbox, radio)
     * @returns {InputComponent} returns back the input component
     */
    setType(type)
    {
        this.type = type;
        return this;
    }

    /**
     * Returns the HTML template for the input component.  If it is type number, input only accepts integer 0+
     * @returns {string} - HTML template
     * @private
     */
    _html()
    {
        this.checkForName();
        this.checkForValue();

        let html = `<input type="${this.type}" ${this.getAttributes()} 
        ${(this.type==="number") ? 'oninput="validity.valid||(value=\'\');" min="0"' : '' }
        ${(this.type === "date") ? 'min="1900-01-01"' : ""}
        required />`;

        return this.getLabel() + html; 
    }
}