/**
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 01/18/2019
 * Coaches Observations Model
 */

"use strict";

import Model from "./Model";

/**
 * Model class for Coach Observations page
 */
export default class CoachObservationModel extends Model{

    /**
     * Inits all fields to a default value, so no nulls get passed around
     */
    constructor(){
        super();
        this._reassessmentDate = new Date();
        this._rsbLevel = 1;
        this._boxerIntensity = BoxerIntensity.Low;
        this._comments = "";
        this._additionalConditions = "";
        this.reassessmentDateField = "---";
        this.boxerGoals = {
            conditioning: false,
            slowProgression: false,
            confidence: false,
            independence: false,
            balance: false,
            reduceFalls: false,
            reduceSymptoms: false,
            delaySymptoms: false,
            socialization: false,
            voiceActivation: false,
            cognitiveExercises: false,
            other: false
        };
    }

    /**
     * Takes a JSON representation of this class, and replaces it's field's values with that in the JSON object.
     * @param {CoachObservationModel} from - JSON rep we are taking from
     */
    deserialize(from) {
        super.deserialize();
        if(!from)
            return;
        Object.keys(from).forEach((key) => {
            if(from[key] && typeof from[key] === 'object') {
                Object.keys(from[key]).forEach((field) => {
                    this[key][field] = from[key][field];
                });
            } else {
                this[key] = from[key];
            }
        });
    }

    serialize() {
        super.serialize();
        return {
            reassessmentDate: this.reassessmentDate,
            rsbLevel: this.rsbLevel,
            boxerIntensity: this.boxerIntensity,
            averageWorkoutsWeek: this.averageWorkoutsWeek,
            comments: this.comments,
            additionalConditions: this.additionalConditions,
            reassessmentDateField: this.reassessmentDateField,
            boxerGoals: this.boxerGoals
        }
    }

    /**
     * Returns the reassessment date for fighter
     * @returns {Date}
     */
    get reassessmentDate() {
        return this._reassessmentDate;
    }

    /**
     * Sets the date, defaults to six months from assessment date
     * @param {Date} value - reassessment date, typically six months from assessment date
     */
    set reassessmentDate(value) {
        this._reassessmentDate = value;
    }

    /**
     * Fighters RSB level, as set by the coach
     * @returns {number}
     */
    get rsbLevel() {
        return this._rsbLevel;
    }

    /**
     * Value determined by the coach, based on his observations
     * @param {number} value - number anywhere from one to four
     */
    set rsbLevel(value) {
        this._rsbLevel = value;
    }

    /**
     * Returns the Boxer Intensity, i.e High, Medium, or Low
     * @returns {string}
     */
    get boxerIntensity() {
        return this._boxerIntensity;
    }

    /**
     * Intensity level, set by the coach, as a value of High, Medium, or Low
     * @param {string} value - boxer intensity, high, medium or low
     */
    set boxerIntensity(value) {
        this._boxerIntensity = value;
    }

    /**
     * The average works out per week the fighter does outside of the gym
     * @returns {number}
     */
    get averageWorkoutsWeek() {
        return this._averageWorkoutsWeek;
    }

    /**
     * Sets the average work outs per week the fighter does outside of the gym
     * @param {number} value - number of work outs
     */
    set averageWorkoutsWeek(value) {
        this._averageWorkoutsWeek = value;
    }

    /**
     * Get the coach's comments
     * @returns {string}
     */
    get comments() {
        return this._comments;
    }

    /**
     * Sets the coach's comments
     * @param {string} value - comments made by the coach
     */
    set comments(value) {
        this._comments = value;
    }

    /**
     * Comments made by the fighter, on what they wish to gain from joining RSB
     * @returns {string}
     */
    get wishToGain() {
        return this._wishToGain;
    }

    /**
     * Comments made by the fighter, on what they wish to gain from joining RSB
     * @param {string} value - comments made
     */
    set wishToGain(value) {
        this._wishToGain = value;
    }

    /**
     * Text field for a fighter to input any conditions they may have, that aren't covered by previous fields on the application
     * @returns {string}
     */
    get additionalConditions() {
        return this._additionalConditions;
    }

    /**
     * Text field for a fighter to input any conditions they may have, that aren't covered by previous fields on the application
     * @param {string} value - additional conditions
     */
    set additionalConditions(value) {
        this._additionalConditions = value;
    }
}

/**
 * Object used as an Enum for boxerIntensity
 * @type {{High: string, Low: string, Medium: string}}
 */
const BoxerIntensity = {
    High: "High",
    Medium: "Medium",
    Low: "Low"
};