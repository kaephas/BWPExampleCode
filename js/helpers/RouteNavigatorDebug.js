/**
 * @author Tyler Bezera
 * @author Cynthia Pham
 */


'use strict';

import routeConfig from '../routes.js';

/**
 * Debug/Development class used to display menu buttons to different pages one very page of the app.
 */
export default class RouteNavigatorDebug
{
    /**
     * Builds the menu, rendering it to screen.
     * @param {Router} routerJS - reference to the router
     */
    constructor(routerJS)
    {
        const buttonHeight = 50;
        const buttonStyles = `width: 50%; height: ${buttonHeight}px;`;
        let routeButtons = [];
        let button;
        
        for(const routeName in routeConfig)
        {
            button = this._renderHtmlString(`<button id="${routeName.substring(1)}" style="${buttonStyles}">${routeName}</button>`);
            button.addEventListener('click', () => { routerJS.redirect(routeName); });
            routeButtons.push(button);
        }
        
        const bottomPosition = (routeButtons.length/2) * buttonHeight + 30;
        const componentStyles = `padding: 15px; position: absolute; width: 400px; bottom: ${bottomPosition}px; right: 400px;`;

        this.contentDiv = this._renderHtmlString(`<div styles="${componentStyles}"></div>`);

        routeButtons.forEach((routeButton) => { this.contentDiv.appendChild(routeButton); });
        
        document.body.appendChild(this.contentDiv);
    }

    /**
     * Creates a new html div, setting it's innerHTML as the passed parameter
     * @param {string} string - HTML to be added in innerHTML
     * @returns {ChildNode}
     * @private
     */
    _renderHtmlString(string)
    {
        const div = document.createElement('div');
        div.innerHTML = string;
        return div.firstChild;
    }
}