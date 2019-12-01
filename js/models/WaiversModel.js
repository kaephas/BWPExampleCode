/**
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 01/18/2019
 * Waivers Model
 */

"use strict";

import Model from "./Model";

/**
 * Waiver Model, stores the waiver agreements and signatures by fighter
 */
export default class WaiversModel extends Model {


    /**
     * Init agreement fields to boolean value
     * Init signature fields to Blob objects
     */
    constructor(){
        super();
        this._signedDate = new Date();
        this._signedMediaRelease = false;
        this._optOutMediaRelease = false;
        this._signedResearchParticipationAgreement = false;
        this._optOutResearchParticipationAgreement = false;
        this._signedPrivacyPolicy = false;
    }

    /**
     * Whether fighter agrees to media release form
     * @returns {boolean} - true if fighter agrees to media release form, false if not
     */
    get signedMediaRelease() {
        return this._signedMediaRelease;
    }

    /**
     * Sets signedMediaRelease to boolean value
     * @param {boolean} value - true if fighter agrees to media release form, false if not
     */
    set signedMediaRelease(value) {
        this._signedMediaRelease = value;
    }

    get optOutMediaRelease() {
        return this._optOutMediaRelease;
    }

    set optOutMediaRelease(value) {
        this._optOutMediaRelease = value;
    }

    /**
     * Whether fighter agrees to research participation agreement
     * @returns {boolean} - true if fighter agrees to research participation agreement form, false if not
     */
    get signedResearchParticipationAgreement() {
        return this._signedResearchParticipationAgreement;
    }

    /**
     * Sets signedResearchParticipationAgreement field to boolean value
     * @param {boolean} value - true if fighter agrees to research participation agreement form, false if not
     */
    set signedResearchParticipationAgreement(value) {
        this._signedResearchParticipationAgreement = value;
    }

    get optOutResearchParticipationAgreement() {
        return this._optOutResearchParticipationAgreement;
    }

    set optOutResearchParticipationAgreement(value) {
        this._optOutResearchParticipationAgreement = value;
    }

    /**
     * Whether fighter agrees to privacy policy form
     * @returns {boolean} - true if fighter agrees to privacy policy form, false if not
     */
    get signedPrivacyPolicy() {
        return this._signedPrivacyPolicy;
    }

    /**
     * Sets signedPrivacyPolicy field to boolean value
     * @param {boolean} value - true if fighter agrees to privacy policy form, false if not
     */
    set signedPrivacyPolicy(value) {
        this._signedPrivacyPolicy = value;
    }

    /**
     * Returns the date the fighter signed the waiver
     * @returns {Date} - the date the fighter signed the waivers
     */
    get signedDate() {
        return this._signedDate;
    }

    /**
     * Sets signed date field to new Date
     * @param value - new date
     */
    set signedDate(value) {
        this._signedDate = value
    }

    /**
     * Converts this instance to a JSON object, for transfer to server
     * @returns {{signedResearchParticipationAgreement: boolean, signedDate: Date, signedPrivacyPolicy: boolean, signedMediaRelease: boolean}}
     */
    serialize(){
        return {
            signedDate: this.signedDate,
            signedMediaRelease: this.signedMediaRelease,
            optOutMediaRelease: this.optOutMediaRelease,
            signedResearchParticipationAgreement: this.signedResearchParticipationAgreement,
            optOutResearchParticipationAgreement: this.optOutResearchParticipationAgreement,
            signedPrivacyPolicy: this.signedPrivacyPolicy
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
            if(key === 'signedDate' && from[key]) {
                this.signedDate = new Date(from[key]);
            } else {
                this[key] = from[key];
            }
        });
    }
}
