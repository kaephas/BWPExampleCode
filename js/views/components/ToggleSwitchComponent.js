/**
 * Toggle Switch that is used by View pages to switch fighter form fields between edit and read mode.
 * @author Cynthia Pham
 * 5/15/19
 * ToggleSwitchComponent.js
 */


"use strict";

import Component from "./Component";

/**
 * ToggleSwitchComponent class is a component used to switch between edit and read mode
 */
export default class ToggleSwitchComponent extends Component {

    /**
     * Creates a new ToggleSwitchComponent
     */
    constructor() {
        super();
    }

    /**
     * Returns HTML template for toggle switch
     * @returns {string} - HTML template
     * @private
     */
    _html() {

        this.checkForValue();

        return `<span class="float-right ml-2">
                    <label class="switch">
                        <input type="checkbox" 
                        ${this.getAttributes()}
                        onchange="{this.checked ? this.value=true : this.value=false}"
                        ${this.value === true ? ' checked ' : this.value === 'true' ? ' checked ' : ''}>
                        <span class="slider round"></span>
                    </label>
                </span>`;
    }


}