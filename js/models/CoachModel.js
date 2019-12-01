/**
 * @author Cynthia Pham
 * 9/28/19
 * Coaches Model
 */

"use strict";

import Model from "./Model";

/**
 * Model class for Coach info like username, email, etc
 */
export default class CoachModel extends Model{

    /**
     * Inits all fields to a default value, so no nulls get passed around
     */
    constructor(){
        super();
        this._token = "";
        this._username = "";
        this._name = "";
        this._email = "";
        this._affiliateLocation = {};
        this._affiliateLocations = {}; // unedited version ex. { { "affiliate_id": "SKC", "locationName": "Covington" ... }, {...} }
        this._affiliateLocationsObject = {}; // pretty, edited version ex. { "SKC" : ["Covington", Development"] ....], ... }
        this._coaches = []; // that belong to chosen affiliate
    }

    /**
     * Formats the affiliate locations from the database to a key/value pair where the key is the affiliate names
     * and the valuee is an array of affiliate's locations
     * @param {Array} affiliateLocationArray
     */
    formatAffiliateLocations(affiliateLocationArray) {
        const affiliateLocationsObject = {};
        affiliateLocationArray.forEach((affiliateLocation) => {
            if(!affiliateLocationsObject[`${affiliateLocation.affiliate_id}`]) {
                affiliateLocationsObject[`${affiliateLocation.affiliate_id}`] = [];
            }
            affiliateLocationsObject[`${affiliateLocation.affiliate_id}`].push(affiliateLocation.locationName);
        });

        return affiliateLocationsObject;
    }

    /**
     * Getter for coach's name
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Setter for coach's email address
     * @param {string} value - email
     */
    set name(value) {
        this._name = value;
    }

    /**
     * Getter for coach's name
     * @returns {string}
     */
    get email() {
        return this._email;
    }

    /**
     * Setter for coach's email address
     * @param {string} value - email
     */
    set email(value) {
        this._email = value;
    }

    /**
     * Getter for coach's token
     * @returns {string}
     */
    get token() {
        return this._token;
    }

    /**
     * Setter for coach's token
     * @param {string} value - token
     */
    set token(value) {
        this._token = value;
    }

    /**
     * Getter for coach's username
     * @returns {string}
     */
    get username() {
        return this._username;
    }

    /**
     * Setter for coach's username
     * @param {string} value - username
     */
    set username(value) {
        this._username = value;
    }

    /**
     * Getter for coach's affiliate locations they are associated with //Unedited
     * @returns {Array}
     */
    get affiliateLocations() {
        return this._affiliateLocations;
    }

    /**
     * Setter for coach's affiliate locations they are associated with //Unedited
     * @param {Array} value
     */
    set affiliateLocations(value) {
        this._affiliateLocations = value;
    }

    /**
     * Getter for coach's affiliate locations they are associated with //Edited
     * @returns {Object}
     */
    get affiliateLocationsObject() {
        return this._affiliateLocationsObject;
    }

    /**
     * Setter for coach's affiliate locations they are associated with //Edited
     * @param {Array} value
     */
    set affiliateLocationsObject(value) {
        this._affiliateLocationsObject = this.formatAffiliateLocations(value);
    }

    /**
     * Getter for coach's chosen affiliate location
     * @returns {Object}
     */
    get affiliateLocation() {
        return this._affiliateLocation;
    }

    /**
     * Setter for coach's chosen affiliate location
     * @param {Object} value - affiliate location object
     */
    set affiliateLocation(value) {
        this._affiliateLocation = value;
    }

    /**
     * Getter for list of coaches that also belong to the same affiliate
     * @returns {Array}
     */
    get coaches() {
        return this._coaches ? this._coaches : [];
    }

    /**
     * Setter for array of coach objects that also belong to the same affiliate
     * @param {Array} value - array of coach objects
     */
    set coaches(value) {
        if(value) this._coaches = value;
        else this._coaches = [];

    }
}
