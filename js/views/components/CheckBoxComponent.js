/**
 * @author Jacob Landowski
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 2/13/2019
 * Component Class to represent a Checkbox grouping and its data binding
 */

'use strict';

import LabeledComponent from './LabeledComponent';

/**
 * Component Class to represent a Checkbox grouping and its data binding
 */
export default class CheckBoxComponent extends LabeledComponent
{
    /**
     * Creates a new component
     */
    constructor()
    {   
        super();
    }

    /**
     * Returns HTML string of this checkbox component
     * @returns {string}
     * @private
     */
    _html()
    {
        this.checkForName();
        this.checkForValue();

        let html = `<div class="pretty p-icon p-smooth"><input 
            type="checkbox" 
            ${this.getAttributes()}
            onchange="{this.checked ? this.value=true : this.value=false}"
            ${this.value === true ? ' checked ' : this.value === 'true' ? ' checked ' : ''}
            required />`;

        return html + this.getLabel() + '</div>'; 
    }
}