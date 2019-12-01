'use strict';

global.debug = function(...stuff)
{ 
    console.log('============= DEBUG =============');
    
    stuff.forEach((thing, index) => 
    {
         console.log(`param ${index + 1}: type = ${typeof thing}`);
         console.log(thing);
         console.log('=================================');
    }); 
};


import DataStore from "./models/DataStore";
import RouteController from './controllers/RouteController.js';
import APIController from './controllers/APIController.js';
import RouteNavigatorDebug from './helpers/RouteNavigatorDebug.js';

const dataStore = new DataStore();
const routeController = new RouteController(document.getElementById("panel"),
                        document.getElementById("menu"), dataStore);
const apiController = new APIController(dataStore);
//const routeDebug = new RouteNavigatorDebug(routeController.routerJS);

routeController.routerJS.redirect('#coachLogin');

document.addEventListener("DOMContentLoaded", function(){
    init();
    Date.prototype.toDateInputValue = (function() {
        let local = new Date(this);
        local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
        return local.toJSON().slice(0,10);
    });

    Date.prototype.toInputString = (function() {
        let currMonth = (this.getUTCMonth() + 1) < 10 ? "0" + (this.getUTCMonth() + 1) : (this.getUTCMonth() + 1);
        let currDate = this.getUTCDate() < 10 ? "0" + this.getUTCDate() : this.getUTCDate();
        return String(this.getUTCFullYear() + "-" + currMonth + "-" + currDate);
    });

    Date.prototype.toMonthInputString = (function() {
        let currMonth = (this.getUTCMonth() + 1) < 10 ? "0" + (this.getUTCMonth() + 1) : (this.getUTCMonth() + 1);
        let currDate = this.getUTCDate() < 10 ? "0" + this.getUTCDate() : this.getUTCDate();
        return String(this.getUTCFullYear() + "-" + currMonth);
    });

    Date.prototype.isValid = (function() {
        return !isNaN(Date.parse(this))
    });
});

function onDeviceReady() {
    //Load the correct stylesheet
    if (cordova.platformid === 'android') {
        navigator.app.loadUrl("index.html/#coachLogin");
    }
}
function init() {
    document.addEventListener("deviceready", onDeviceReady, false);
    // Download the update silently, but install it on
    // the next resume, as long as at least 5 minutes
    // has passed since the app was put into the background.
    if (cordova.platformid === 'android') {
        codePush.sync(null, {
            updateDialog: {
                appendReleaseDescription: true,
                descriptionPrefix: "\n\nChange log:\n"
            },
            installMode: InstallMode.ON_NEXT_RESUME, minimumBackgroundDuration: 60 * 5 });
    }
    //init Sentry
    // const Sentry = cordova.require("sentry-cordova.Sentry");
    // Sentry.init({ dsn: 'https://20c4c2e1dbd54e9f9eeb4c33a5ba70df@sentry.io/1545961' });
    localStorage.clear();
}