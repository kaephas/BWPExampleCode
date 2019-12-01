/**
 * @author Jacob Landowski
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 1/19/19
 * Class to hold the data and code execution 
 */

'use strict';

/**
 * Class to hold the data and code execution
 */
export default class Route
{
    /**
     * Constructor function for Route object, sets information to be used within this class
     * @param {HTMLElement} contentContainer - element for app content(html) to be appended to
     * @param {HTMLElement} sidebarContainer - element for the app menu to be appended to
     * @param {DataStore} dataStore - reference to the datastore for the app instance
     */
    constructor(contentContainer, sidebarContainer, dataStore)
    {
        if(!contentContainer) 
            throw new Error('Route must be given an html container to render content in.');

        if(!sidebarContainer)
            throw new Error('Route must be given an html container to render sidebar content in.');

        if(!dataStore) 
            throw new Error('Route must be given a reference to the DataStore instance.');
        
        this.contentContainer = contentContainer;
        this.sidebarContainer = sidebarContainer;
        this.dataStore = dataStore;
        this.callbacks = {};
    }

    /**
     * Executes (runs) this route, and renders it
     */
    executeAndRender()
    {
        if(this._execBefore) this._execBefore();
        const contentView = this._render();
        if(this._execAfter) this._execAfter(contentView);
    }

    /**
     * Sets the View belonging to this route
     * @param {View} view - view belonging to this route
     * @returns {Route} for chaining method calls
     */
    setView(view)
    {
        this.view = view;
        return this;
    }

    /**
     * Sets the name belonging to this route
     * @param {string} name - name belonging to this route
     * @returns {Route} for chaining method calls
     */
    setName(name)
    {
        this.routeName = name.substring(1);
        return this;
    }

    /**
     * Adds a callback function for this route, to it's callbacks object.
     * @param {string} name - name of the callback function
     * @param {function} callback - function for the callback
     * @returns {Route} for chaining method calls
     */
    setCallback(name, callback)
    {
        this.callbacks[name] = callback;
        return this;
    }

    /**
     * Set what function should be called, if any, before rendering the view
     * @param {function} beforeAction - function to be called
     * @returns {Route} for chaining method calls
     */
    setBeforeRender(beforeAction)
    {
        this.beforeAction = beforeAction;
        return this;
    }

    /**
     * Set what function should be called, if any, after rendering the view
     * @param {function} afterAction - function to be called
     * @returns {Route} for chaining method calls
     */
    setAfterRender(afterAction)
    {
        this.afterAction = afterAction;
        return this;
    }

    /**
     * Set the dataHive for this route, set in routes controller
     * @param {object} dataHive - an object of references to models
     * @returns {Route} for chaining method calls
     */
    setDataHive(dataHive)
    {
        this.dataHive = dataHive;
        return this;
    }

    /**
     * Method which when called, renders the content and side menu
     * @private
     */
    _render()
    {
        const ContentView = this.view.content;
        const SidebarView = this.view.sidebar;

        if(SidebarView)
        {
            const sidebarContents = new SidebarView(this.dataStore, this.callbacks, this.routeName);
            sidebarContents.setSidebarContainer(this.sidebarContainer);
            sidebarContents.setContentContainer(this.contentContainer);

            sidebarContents.render();
        }

        if(ContentView)
        {
            const contents = new ContentView(this.getData(), this.callbacks);
            contents.setContentContainer(this.contentContainer);

            return contents.render();
        }


    }

    /**
     * Called before rendering
     * @private
     */
    _execBefore()
    {
        if(this.beforeAction) this.beforeAction(this.dataHive);
    }

    /**
     * Called after rendering
     * @private
     */
    _execAfter(contentView)
    {
        if(this.afterAction) this.afterAction(contentView, this.dataHive);
    }

    /**
     * Getter for DataHive
     * @returns {Object|{}} an object of references to models
     */
    getData()
    {
        return this.dataHive || {};
    }
}