/**
 * @author Jacob Landowski
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 2/9/2019
 * Component Class to be extended by components that want to be rendered.
 */

import Renderable from '../Renderable';

'use strict';

/**
 * Component Class to be extended by components that want to be rendered.
 */
export default class Component extends Renderable
{
    /**
     * Inits data to empty object
     */
    constructor()
    {
        super();
        this._data   = Object.create(null);
    }

    /**
     * ID field for an HTML Element
     * @param {string} id - element id
     * @returns {Component}
     */
    setId(id)
    {
        this._id = id;
        return this;
    }

    /**
     * Set multiple classes for HTML element
     * @param {string} classes - classes, i.e "btn-rsb col-3"
     * @returns {Component}
     */
    setClasses(classes)
    {
        this._classes = typeof classes === 'string' ? classes : classes.join(' ');
        return this;
    }

    /**
     * Set the name field for HTML element
     * @param {string} name - name for element
     * @returns {Component}
     */
    setName(name)
    {
        this._name = name;
        return this;
    }

    /**
     * Set the HTML element's value
     * @param {string} value - components value
     * @returns {Component}
     */
    setValue(value)
    {
        this._value = value;
        return this;
    }

    /**
     * Set the additional data-set fields for HTML element
     * @param {string} key - the name of the field being added to the element
     * @param {String} value - the value associated with the key
     * @returns {Component}
     */
    setData(key, value)
    {
        this._data[key] = value;
        return this;
    }

    /**
     * Sets the placeholder for the HTML element
     * @param {string} placeholder - placeholder text, i.e "YYYY-MM-DD"
     * @returns {Component}
     */
    setPlaceholder(placeholder)
    {
        this._placeholder = placeholder;
        return this;
    }

    /**
     * Returns the HTML element id
     * @returns {string}
     */
    get id()     { return this._id      || ''; }

    /**
     * Returns the HTML element classes
     * @returns {string}
     */
    get classes(){ return this._classes || ''; }

    /**
     * Returns the HTML element name
     * @returns {string}
     */
    get name()   { return this._name    || ''; }

    /**
     * Returns the HTML element value
     * @returns {string}
     */
    get value()  { return this._value   || ''; }

    /**
     * Returns the HTML element placeholder
     * @returns {string}
     */
    get placeholder() { return this._placeholder || ''; }

    /**
     * Returns the HTML element data-set
     * @returns {string}
     */
    get data()
    {
        let dataString = '';
        
        for(const key in this._data)
        {
            dataString += `data-${key}="${this._data[key]}" `;
        }

        return dataString.substring(0, dataString.length - 1);
    }

    /**
     * Returns the HTML elements attributes
     * @returns {string}
     */
    getAttributes()
    {
        return `id="${this.id}" class="${this.classes}" name="${this.name}" value="${this.value}" placeholder="${this.placeholder}" ${this.data}`;
    }

    /**
     * Ensure this element has an id
     */
    checkForId()
    {
        if(this._id === undefined)
            throw new Error(`${this.constructor.name} requires an id attribute to be set.`);
    }

    /**
     * Ensure this element has classes
     */
    checkForClasses()
    {
        if(this._classes === undefined)
            throw new Error(`${this.constructor.name} requires class attribute to be set.`);
    }

    /**
     * Ensure this element has a name
     */
    checkForName()
    {
        if(this._name === undefined)
            throw new Error(`${this.constructor.name} requires a name attribute to be set.`);
    }

    /**
     * Ensure this element has a value
     */
    checkForValue()
    {
        if(this._value === undefined)
            throw new Error(`${this.constructor.name} requires a value or sticky value attribute to be set.`);
    }
}