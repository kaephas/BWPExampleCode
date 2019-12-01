/**
 * @author Jacob Landowski
 * @author Tyler Bezera
 * 2/9/2019
 * Utility class to be extended by class that have a template to render
 */


'use strict';

import EventDispatcher from "../controllers/EventDispatcher";

/**
 * Utility class to be extended by class that have a template to render
 */
export default class Renderable extends EventDispatcher
{
    /**
     * Called by the view class, it requires said view to have an _html() function that returns the view's html in a
     * string.
     * @returns {Element} div with rendered HTML.
     */
    render()
    {
        if(!this._html) 
            throw new Error(`${this.constructor.name} requires a _html() method to in order to render!`);

        const div = document.createElement('div');
        div.innerHTML = this._html();
        return div.firstElementChild;
    }
}