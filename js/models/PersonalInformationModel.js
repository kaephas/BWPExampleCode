/**
 * @author Tyler Bezera
 * 01/17/2019
 * Personal Information Model
 */

"use strict";

import Model from "./Model";

/**
 * Model class responsible for storing fighter's personal information
 */
export default class PersonalInformationModel extends Model{

    /**
     * Creates a new model, with fields init to defaults
     * @param {PersonalInformationModel} from - JSON personal information model, to deserialize upon creation
     */
    constructor(from){
        super();

        if(from){
            this.deserialize(from);
        }
        else {
            this._activeFlag = true;
            this._firstName = "";
            this._lastName = "";
            this._nickName = "";
            this._birthDate = "1950-06-15";
            this._gender = 'Male';
            this._height = "";
            this._address = "";
            this._city = "";
            this._state = "";
            this._zipCode = "";
            this.phone = {
                primaryPhone: "",
                secondaryPhone: "",
            };
            this._primaryPhone = "";
            this._secondaryPhone = "";
            this._email = "";
            this._image = "";
            this.affiliateName = "";
            this.location = "";
        }
    }


    /**
     * Serialize this model to JSON
     * @returns {{firstName: string, lastName: string, zipCode: string, image: string, address: string, gender: string, city: string, phone: {primaryPhone: string, secondaryPhone: string}, state: string, birthDate: string, email: string, activeFlag: boolean}}
     */
    serialize() {
        super.serialize();
        return {
            activeFlag: this.activeFlag,
            firstName: this.firstName,
            lastName: this.lastName,
            nickName: this.nickName,
            birthDate: this.birthDate,
            gender: this.gender,
            height: this.height,
            address: this.address,
            city: this.city,
            state: this.state,
            zipCode: this.zipCode,
            phone: {
                primaryPhone: this.primaryPhone,
                secondaryPhone: this.secondaryPhone
            },
            email: this.email,
            image: this.image,
            affiliateName: this.affiliateName,
            location: this.location
        };
    }

    /**
     * Deserialize this model from JSON model
     * @param {PersonalInformationModel} from - JSONified model
     */
    deserialize(from) {
        super.deserialize();
        if(!from)
            return;
        Object.keys(from).forEach((key) => {
            /********Hard coded**********/
            if (key === 'phone') {
                this.phone.secondaryPhone = from.phone.secondaryPhone;
                this.phone.primaryPhone = from.phone.primaryPhone;
            } else if (key === 'birthDate' && from.birthDate) {
                const split = from.birthDate.split('-');
                this.birthDate = `${split[0]}-${split[1]}-${split[2].slice(0, 2)}`;
            } else {
                this[key] = from[key];
            }
        });
    }

    /**
     * Getter for fighter first name
     * @returns {string}
     */
    get firstName() {
        return this._firstName;
    }

    /**
     * Setter for fighter first name
     * @param {string} value - first name
     */
    set firstName(value) {
        this._firstName = value;
    }

    /**
     * Getter for fighter last name
     * @returns {string}
     */
    get lastName() {
        return this._lastName;
    }

    /**
     * Sets the height value
     * @param {number} value - the height in inches.
     */
    set height(value) {
        this._height = value;
    }

    /**
     * Returns height value
     * @returns {number} height in inches.
     */
    get height() {
        return this._height;
    }


    /**
     * Setter for fighter last name
     * @param value
     */
    set lastName(value) {
        this._lastName = value;
    }

    /**
     * Getter for fighter nickname
     * @returns {string}
     */
    get nickName() {
        return this._nickName;
    }

    /**
     * Setter for fighter nick name
     * @param value
     */
    set nickName(value) {
        this._nickName = value;
    }

    /**
     * Getter for birthdate YYYY-MM-DD
     * @returns {string}
     */
    get birthDate() {
        return this._birthDate;
    }

    /**
     * Setter for birth date YYYY-MM-DD
     * @param {string} value - birth date as string
     */
    set birthDate(value) {
        this._birthDate = value;
    }

    /**
     * Getter for gender
     * @returns {string}
     */
    get gender() {
        return this._gender;
    }

    /**
     * Setter for gender
     * @param {string} value - gender value (Male/Female)
     */
    set gender(value) {
        this._gender = value;
    }

    /**
     * Getter for address field
     * @returns {string}
     */
    get address() {
        return this._address;
    }

    /**
     * Setter for address field
     * @param {string} value - address as a string
     */
    set address(value) {
        this._address = value;
    }

    /**
     * Getter for city as string
     * @returns {string}
     */
    get city() {
        return this._city;
    }

    /**
     * Setter for city
     * @param value
     */
    set city(value) {
        this._city = value;
    }

    /**
     * Getter for state
     * @returns {string}
     */
    get state() {
        return this._state;
    }

    /**
     * Setter for state
     * @param {string} value - state value
     */
    set state(value) {
        this._state = value;
    }

    /**
     * Getter for zipcode
     * @returns {string}
     */
    get zipCode() {
        return this._zipCode;
    }

    /**
     * Setter for zipcode
     * @param value
     */
    set zipCode(value) {
        this._zipCode = value;
    }

    /**
     * Getter for primary phone number
     * @returns {string}
     */
    get primaryPhone() {
        return this._primaryPhone;
    }

    /**
     * Setter for primary phone number
     * @param {string} value - phone number
     */
    set primaryPhone(value) {
        this._primaryPhone = value;
    }

    /**
     * Getter for phone number
     * @returns {string}
     */
    get secondaryPhone() {
        return this._secondaryPhone;
    }

    /**
     * Setter for secondary phone number
     * @param {string} value - 222 222 2222
     */
    set secondaryPhone(value) {
        this._secondaryPhone = value;
    }

    /**
     * Getter for the email field
     * @returns {string}
     */
    get email() {
        return this._email;
    }

    /**
     * Setter for the email field
     * @param {string} value - email@email.com
     */
    set email(value) {
        this._email = value;
    }

    /**
     * String for the image URL, stored S3 storage
     * @returns {string}
     */
    get image() {
        return this._image;
    }

    /**
     * Stores binary data, until switched to image url
     * @param {string} value - image binary data
     */
    set image(value) {
        this._image = value;
    }

    /**
     * Getter for whether the fighter is active or not
     * @returns {boolean}
     */
    get activeFlag() {
        return this._activeFlag;
    }

    /**
     * Setter for whether the fighter is active or not
     * @param {boolean} value - active flag
     */
    set activeFlag(value) {
        this._activeFlag = value;
    }
}