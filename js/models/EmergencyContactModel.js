/**
 * @author Jen Shin
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 1/18/2019
 * Emergency Contact Model
 */

"use strict";

import Model from "./Model";

/**
 * Emergency Contact Model, stores relevant data from the View
 */
export default class EmergencyContactModel extends Model{

    /**
     * Inits all fields to default values, so no null values
     */
    constructor() {
        super();
        this._contactName = "";
        this._relationship = "";
        this.phone = {
            primaryPhone: "",
            secondaryPhone: "",
        };
        this._primaryPhone = "";
        this._secondaryPhone = "";
        this._city = "";
        this._zipCode = "";
        this._state = "";
        this._email = "";
    }

    /**
     * Converts this instance to a JSON object, for transfer to server
     * @returns {{zipCode: number, phone: {primaryPhone: string, secondaryPhone: string}, city: string, contactName: string, state: string, relationship: string, email: string}}
     */
    serialize(){
        return {
            contactName: this.contactName,
            relationship: this.relationship,
            phone: {
                primaryPhone: this.phone.primaryPhone,
                secondaryPhone: this.phone.secondaryPhone
            },
            city: this.city,
            zipCode: this.zipCode,
            state: this.state,
            email: this.email
        }
    }

    /**
     * Takes JSON representation of this class, and saves it's fields to this object
     * @param {EmergencyContactModel} from - JSON object we are taking from
     */
    deserialize(from) {
        super.deserialize();
        if(!from)
            return;
        Object.keys(from).forEach((key) => {
            if (from[key] && typeof from[key] === 'object') {
                Object.keys(from[key]).forEach((field) => {
                    this[key][field] = from[key][field];
                });
            } else {
                    this[key] = from[key];
            }
        });
    }

    /**
     * The Emergency Contact name, there is only one needed for the application
     * @returns {string}
     */
    get contactName() {
        return this._contactName;
    }

    /**
     * Sets the Emergency Contact name, both first and last, i.e "Billy Joel"
     * @param {string} value - contact name
     */
    set contactName(value) {
        this._contactName = value;
    }

    /**
     * Single string field, describes the relationship to fighter.
     * @returns {string}
     */
    get relationship() {
        return this._relationship;
    }

    /**
     * Sets the relationship to the fighter
     * @param {string} value - relationship to the fighter
     */
    set relationship(value) {
        this._relationship = value;
    }

    /**
     * Contact's City
     * @returns {string}
     */
    get city() {
        return this._city;
    }

    /**
     * Set Contacts City
     * @param {string} value - name of city
     */
    set city(value) {
        this._city = value;
    }

    /**
     * Contacts ZipCode
     * @returns {string}
     */
    get zipCode() {
        return this._zipCode;
    }

    /**
     * Set Contact's ZipCode
     * @param {string} value - zipcode value
     */
    set zipCode(value) {
        this._zipCode = value;
    }

    /**
     * Contact's State
     * @returns {string}
     */
    get state() {
        return this._state;
    }

    /**
     * Set Contact's State
     * @param {string} value - name of contact's state
     */
    set state(value) {
        this._state = value;
    }

    /**
     * Contact's Email
     * @returns {string}
     */
    get email() {
        return this._email;
    }

    /**
     * Set Contact's Email
     * @param {string} value - contact's email
     */
    set email(value) {
        this._email = value;
    }
}