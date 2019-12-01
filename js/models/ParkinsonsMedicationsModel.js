/**
 * @author Tyler Bezera
 * @author Cynthia Pham
 * @author Jen Shin
 * 1/18/2019
 * Parkinsons Medications Model
 */


"use strict";

import Model from "./Model";

/**
 * Parkinson's Medications Model, stores medications the fighter takes
 */
export default class ParkinsonsMedicationsModel extends Model{

    /**
     * Init all fields to boolean value
     */
    constructor() {
        super();
        this._amantadine = false;
        this._amantadineERGocovri = false;
        this._apokynApomorphine = false;
        this._benztropineCogentin = false;
        this._carbidopaLevodopaSinemet = false;
        this._carbidopaLevodopaCRSinemetCR = false;
        this._duopa = false;
        this._entacaponeComtan = false;
        this._mirapexER = false;
        this._pramipexoleMirapex = false;
        this._rasagilineAzilect = false;
        this._requipXL = false;
        this._ropiniroleRequip = false;
        this._rotigotineExelon = false;
        this._rytary = false;
        this._safinamideXadago = false;
        this._selegilineEldepryl = false;
        this._stalevo = false;
        this._trihexyphenidyl = false;
        this.nuplazid = false;
    }

    /**
     * Serialize's this object to JSON
     * @returns {{mirapexER: boolean, benztropineCogentin: boolean, requipXL: boolean, ropiniroleRequip: boolean,
     *             trihexyphenidyl: boolean, apokynApomorphine: boolean, carbidopaLevodopaCRSinemetCR: boolean,
     *             amantadine: boolean, rotigotineExelon: boolean, pramipexoleMirapex: boolean, entacaponeComtan: boolean,
     *             duopa: boolean, rasagilineAzilect: boolean, selegilineEldepryl: boolean, stalevo: boolean,
     *             safinamideXadago: boolean, carbidopaLevodopaSinemet: boolean, rytary: boolean, amantadineERGocovri: boolean}}
     */
    serialize() {
        super.serialize();
        return {
            amantadine: this.amantadine,
            amantadineERGocovri: this.amantadineERGocovri,
            apokynApomorphine: this.apokynApomorphine,
            benztropineCogentin: this.benztropineCogentin,
            carbidopaLevodopaSinemet: this.carbidopaLevodopaSinemet,
            carbidopaLevodopaCRSinemetCR: this.carbidopaLevodopaCRSinemetCR,
            duopa: this.duopa,
            entacaponeComtan: this.entacaponeComtan,
            mirapexER: this.mirapexER,
            pramipexoleMirapex: this.pramipexoleMirapex,
            rasagilineAzilect: this.rasagilineAzilect,
            requipXL: this.requipXL,
            ropiniroleRequip: this.ropiniroleRequip,
            rotigotineExelon: this.rotigotineExelon,
            rytary: this.rytary,
            safinamideXadago: this.safinamideXadago,
            selegilineEldepryl: this.selegilineEldepryl,
            stalevo: this.stalevo,
            trihexyphenidyl: this.trihexyphenidyl,
            nuplazid: this.nuplazid
        }
    }

    /**
     * Deserialize this object from JSON
     * @param {ParkinsonsMedicationsModel} from - JSON object of this
     */
    deserialize(from) {
        super.deserialize();
        if(!from)
            return;
        Object.keys(from).forEach((key) => {
            this[key] = from[key];
        });
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get amantadine() {
        return this._amantadine;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set amantadine(value) {
        this._amantadine = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get amantadineERGocovri() {
        return this._amantadineERGocovri
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set amantadineERGocovri(value) {
        this._amantadineERGocovri = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get apokynApomorphine() {
        return this._apokynApomorphine;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set apokynApomorphine(value) {
        this._apokynApomorphine = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get benztropineCogentin() {
        return this._benztropineCogentin;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set benztropineCogentin(value) {
        this._benztropineCogentin = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get carbidopaLevodopaSinemet() {
        return this._carbidopaLevodopaSinemet;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set carbidopaLevodopaSinemet(value) {
        this._carbidopaLevodopaSinemet = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get carbidopaLevodopaCRSinemetCR() {
        return this._carbidopaLevodopaCRSinemetCR;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set carbidopaLevodopaCRSinemetCR(value) {
        this._carbidopaLevodopaCRSinemetCR = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get duopa() {
        return this._duopa;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set duopa(value) {
        this._duopa = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get entacaponeComtan() {
        return this._entacaponeComtan;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set entacaponeComtan(value) {
        this._entacaponeComtan = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get mirapexER() {
        return this._mirapexER;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set mirapexER(value) {
        this._mirapexER = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get pramipexoleMirapex() {
        return this._pramipexoleMirapex;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set pramipexoleMirapex(value) {
        this._pramipexoleMirapex = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get rasagilineAzilect() {
        return this._rasagilineAzilect;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set rasagilineAzilect(value) {
        this._rasagilineAzilect = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get requipXL() {
        return this._requipXL;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set requipXL(value) {
        this._requipXL = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get ropiniroleRequip() {
        return this._ropiniroleRequip;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set ropiniroleRequip(value) {
        this._ropiniroleRequip = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get rotigotineExelon() {
        return this._rotigotineExelon;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set rotigotineExelon(value) {
        this._rotigotineExelon = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get rytary(){
        return this._rytary;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set rytary(value) {
        this._rytary = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get safinamideXadago() {
        return this._safinamideXadago;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set safinamideXadago(value) {
        this._safinamideXadago = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get selegilineEldepryl() {
        return this._selegilineEldepryl;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set selegilineEldepryl(value) {
        this._selegilineEldepryl = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get stalevo() {
        return this._stalevo;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set stalevo(value) {
        this._stalevo = value;
    }

    /**
     * True or false, depending on if they take the medication or not.
     * @returns {boolean}
     */
    get trihexyphenidyl() {
        return this._trihexyphenidyl;
    }

    /**
     * True if they take the medication, false if they don't.
     * @param {boolean} value - bool value for if they take it or not
     */
    set trihexyphenidyl(value) {
        this._trihexyphenidyl = value;
    }
}