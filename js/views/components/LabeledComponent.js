/**
 * @author Jacob Landowski
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 2/9/2019
 * Component Class to be extended by components that want a label set for it. It allows for input focus when
 * user touches label, beneficially for checkboxes and radio buttons.
 */

'use strict';

import Component from './Component';

/**
 * InputComponent Class to be extended by components that want a label set for it.
 */
export default class LabeledComponent extends Component
{
    /**
     * LabeledComponent constructor builds the Labeled Component that want to be rendered
     * @constructor
     */
    constructor()
    {   
        super();
    }

    /**
     * Sets label that will be displayed next to the component.
     * @param {string} label - the label text
     * @returns {LabeledComponent} - returns back the label component
     */
    setLabel(label)
    {
        this.label = label;
        return this;
    }

    /**
     * Checks whether it an instance of CheckboxComponent in order to return label with correct classes. Returns the
     * HTML template with label component.
     * @returns {string}
     */
    getLabel()
    {
        let html = '';

        if(this.label)
        {
            this.checkForId();
    
            html += this.constructor.name === 'CheckBoxComponent' ? 
                `<div class="state p-primary"><label for="${this.id}">${this.label}</label></div>` : 
                `<label for=${this.id} class="form-label input-text">${this.label}</label>`;
        }

        return html;
    }
}