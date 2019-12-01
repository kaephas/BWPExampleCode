/**
 * @author Tyler Bezera
 */


"use strict";

import Model from "./Model";
import {objToStrMap} from "../helpers/MapUtilites";

/**
 * Vitals model class stores vitals information such as weight, and exercises per week
 */
export default class VitalsModel extends Model{

    /**
     * Inits a new VitalsModel, setting default values
     */
    constructor(){
        super();
        this._vitalsAssessment = new Map();
    }

    /**
     * JSON string of this model
     */
    serialize() {
        super.serialize();
        return {
            vitalsAssessment: this._vitalsAssessment
        }
    }

    /**
     * Takes JSON string and converts to this
     * @param {VitalsModel} from - JSON representation of this model
     */
    deserialize(from) {
        super.deserialize();
        if(from){
            this.weight = from.weight; //keeping this here cause mike added fighters before this was added inside vitals map
            this._vitalsAssessment = !from.vitalsAssessment ? new Map() : objToStrMap(from.vitalsAssessment);
        }
    }

    /**
     * Adds an exercise to this assessment date
     * @param {Date|String} assessmentDate - The date we are taking this assessment for
     * @param {String} exercise - Name of the exercise
     * @param {Number} timeSpent - Amount of time, in hours, spent doing this exercise per week
     */
    addWeeklyExercise(assessmentDate, exercise, timeSpent){
        this.ensureAssessmentDate(assessmentDate);
        const vitalsAssessment = this._vitalsAssessment.get(assessmentDate);

        const index = vitalsAssessment.exercises.findIndex((vitalObject) => vitalObject.exercise === exercise);
        if(vitalsAssessment.exercises[index]) {
            vitalsAssessment.exercises[index] = {
                exercise: exercise,
                hoursPerWeek: Number(timeSpent)
            }
        } else {
            vitalsAssessment.exercises.push({
                exercise: exercise,
                hoursPerWeek: Number(timeSpent)
            });
        }
        if(vitalsAssessment) this._vitalsAssessment.set(assessmentDate, vitalsAssessment);
    }

    /**
     * Removes an exercise from this assessment date
     * @param {Date|String} assessmentDate - The date we are taking this assessment for
     * @param {String} exercise - Name of the exercise
     */
    removeWeeklyExercise(assessmentDate, exercise){
        const vitalsAssessment = this._vitalsAssessment.get(assessmentDate);

        if(vitalsAssessment) {
            const index = vitalsAssessment.exercises.findIndex((vitalObject) => vitalObject.exercise === exercise);
            if(vitalsAssessment.exercises[index]) {
                vitalsAssessment.exercises.splice(index, 1);
            }
        }
        if(vitalsAssessment) this._vitalsAssessment.set(assessmentDate, vitalsAssessment);
    }



    /**
     * Ensure an assessment date exists for vitals
     * @param {Date|String} assessmentDate - an assessment date, in string format
     */
    ensureAssessmentDate(assessmentDate){
        if(!this._vitalsAssessment.has(assessmentDate)){
            this._vitalsAssessment.set(assessmentDate, {weight: 0, fallsMonth: 0, exercises: []});
        }
    }

    /**
     * Changes an assessment, it's data and questions, from one date to another.
     * @param {Date} oldDate - the date we are taking the data from
     * @param {Date} newDate - the date we are moving the data to
     */
    changeAssessmentDate(oldDate, newDate){
        const vitalsAssessment = this._vitalsAssessment.get(oldDate);

        if(vitalsAssessment){
            this._vitalsAssessment.set(newDate, vitalsAssessment);
            this._vitalsAssessment.delete(oldDate);
        }

    }

    /**
     * Sets the weight value in the assessement map
     * @param {Date|String} assessmentDate - The date we are taking this assessment for
     * @param {number} value - the weight in lbs.
     */
    setWeight(assessmentDate, value) {
        this.ensureAssessmentDate(assessmentDate);
        const vitalsAssessment = this._vitalsAssessment.get(assessmentDate);
        vitalsAssessment.weight = Number(value);
    }

    /**
     * Sets the fallsMonth value in the assessement map
     * @param {Date|String} assessmentDate - The date we are taking this assessment for
     * @param {number} value - the number of falls last month
     */
    setFallsMonth(assessmentDate, value) {
        this.ensureAssessmentDate(assessmentDate);
        const vitalsAssessment = this._vitalsAssessment.get(assessmentDate);
        vitalsAssessment.fallsMonth = Number(value);
    }

    /**
     * Takes weight in lbs and height in inches to calculate and return imperial BMI = (Weight (LBS) x 703 ÷ Height (Inches²))
     * @param weight - in lbs
     * @param height - in inches
     */
    static calculateBMI(weight, height) {
        if(height > 0) return (weight * 703 / Math.pow(height, 2)).toFixed(1);
    }

    /**
     * Uses calculated formula to get TWET (Target Weekly Exercise Therapy) score
     * @param {Array} assessmentData - an array of objects that contains exercise names and hoursPerWeek
     */
    static calculateTWET(assessmentData) {
        const exerciseMatrix = {
            "bikingUnderSevenMPH": 8.0,
            "bikingOverSevenMPH": 10.0,
            "boxingL1": 15.0,
            "boxingL3": 12.0,
            "boxingL4": 8.0,
            "cyclingStationary": 8.0,
            "dancing": 8.0,
            "gardening": 5.0,
            "golf": 6.0,
            "hiking": 8.0,
            "homeEquipment": 8.0,
            "jogging": 12.0,
            "other": 5.0,
            "pilates": 10.0,
            "racquetball": 10.0,
            "running": 10.0,
            "swimSplash": 8.0,
            "swimStructured": 10.0,
            "taichi": 10.0,
            "tennisDoubles": 7.0,
            "tennisSingles": 10.0,
            "walking": 6.0,
            "yoga": 10.0,
            "zumbaKickboxing": 10.0
        };
        let twetScore = 0;
        let boxingTwetScore = 0;
        if(assessmentData && assessmentData.length > 0) {
            assessmentData.forEach((exerciseObject) => {
                const hoursPerWeek = exerciseObject.hoursPerWeek;
                if(exerciseObject.exercise === "boxingL1" || exerciseObject.exercise === "boxingL3" || exerciseObject.exercise === "boxingL4") {
                    boxingTwetScore += exerciseMatrix[exerciseObject.exercise] * hoursPerWeek;
                } else {
                    twetScore += exerciseMatrix[exerciseObject.exercise] * hoursPerWeek;
                }
            })
        }
        return {TotalTWET: Math.round(twetScore), BoxingTWET: Math.round(boxingTwetScore)};
    }

    /**
     * Uses calculated TWET score to find the TWET level
     * @param {number} twetScore - TWET score
     * @return {String} TWET value:  > 100 = Great, 80 to 99 = Good, 60 to 79 = Getting There, < 60 = It's a Start
     */
    static getTWETLevel(twetScore) {
        if(twetScore < 60) {
            return "It's a Start";
        } else if(60 <= twetScore <= 79) {
            return "Getting There";
        } else if(80 <= twetScore <= 99) {
            return "Good";
        } else if(twetScore > 100) {
            return "Great";
        }
    }

    /**
     * Sorts the array of exercise names
     * @param {Array} assessmentData - an array of objects that contains exercise names
     * @returns {Array} sorted array of exercise objects
     */
    static sortExercisesByName(assessmentData) {
        const compare = (a, b) => {
            const exerciseA = a.exercise.toLowerCase();
            const exerciseB = b.exercise.toLowerCase();
            return exerciseA < exerciseB ? -1 : exerciseA > exerciseB ? 1 : 0;
        };

        return assessmentData.sort(compare);
    }
}
