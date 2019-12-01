/**
 * LoadingNotificationComponent is used to display a loading spinner that notifies users that app is processing form
 * submissions and/or transitioning between pages.
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 5/18/19
 * LoadingNotificationComponent.js
 */


"use strict";

import EventDispatcher from "../../controllers/EventDispatcher";

/**
 * LoadingNotificationComponent Class that will be displayed on the page during routing and/or after form submissions.
 * Triggered to display loading spinner by fired class events.
 */
export default class LoadingNotificationComponent extends EventDispatcher
{
    /**
     * LoadingNotificationComponent constructor that shows load spinner for a x amount of seconds.
     * @constructor
     * @param {number} timeInSeconds - number of seconds that the load icon spins for. Defaults to 1 sec.
     */
    constructor(timeInSeconds = 1)
    {
        super();
        this._loadingTimeSeconds = timeInSeconds;
    }

    /**
     * Returns the loading time that the spinner is shown in seconds
     * @returns {number} - loading time in seconds
     */
    get loadingTimeSeconds() {
        return this._loadingTimeSeconds;
    }

    /**
     * Sets the loading time that the spinner would be shown for
     * @param {number} value - number of seconds
     */
    set loadingTimeSeconds(value) {
        this._loadingTimeSeconds = value;
    }

    /**
     * Starts the loading notification
     */
    beginLoadingNotification()
    {
        this.fireEvent("loadingNotificationBegan", "");
        this._start().catch((err) => {
            throw err;
        });
    }

    /**
     * Async function that waits promise to fulfill loading notification before returning results.
     * @returns {Promise<void>} -
     * @private
     */
    async _start()
    {
        let promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve("Loading Notification Completed");
                this.fireEvent("LoadingNotificationCompleted", "");
            }, this.loadingTimeSeconds * 1000);
        });

        let result = await promise;
        console.log(result);
    }

    /**
     * Returns HTML template that contains load spinner
     * @returns {string} - HTML template
     * @private
     */
    _html()
    {
        return `
            <div class="spinner">
            </div>
        `;
    }
}
