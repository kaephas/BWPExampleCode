/**
 * @author Jacob Landowski
 * 2/9/2019
 * Component Class to represent a Select element and its data binding
 */

'use strict';

import LabeledComponent from './LabeledComponent';

export default class SelectComponent extends LabeledComponent
{
    /**
     * SelectComponent constructor builds the Select Component that want to be rendered
     * @constructor
     * @param {array} options - an array of strings that will be displayed as the select options
     */
    constructor(options)
    {   
        super();
        this.options = options;
    }

    /**
     * Checks for required name and value attributes. Returns the HTML template with select component and its select options.
     * @returns {string}
     */
    _html()
    {
        this.checkForName();
        this.checkForValue();

        let html = `<select ${this.getAttributes()} required>`;

        this.options.forEach((option) => 
        {
            html += `<option ${option === String(this.value) ? 'selected' : ''} value="${option}">${option}</option>`;
        });

        return this.getLabel() + html + '</select>'; 
    }
}