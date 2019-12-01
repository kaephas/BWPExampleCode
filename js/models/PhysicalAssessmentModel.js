/**
 * @author Cynthia Pham
 * @author Tyler Bezera
 * 3/11/19
 * Physical Assessment Model
 */


"use strict";

import Model from "./Model";
import {objToStrMap} from "../helpers/MapUtilites";

/**
 * Physical Assessment Model, storage for Physical Assessment
 */
export default class PhysicalAssessmentModel extends Model {

    /**
     * Init object, create new map for assessment
     */
    constructor() {
        super();
        this._physicalAssessments = new Map();
    }

    /**
     * Adds a physical assessment name and score combination to the physicalAssessments map
     * @param {string} assessmentNum - assessment number 1-12
     * @param {number} score - score (0-4 value) for the assessments 1-8 & 10-11,
     *        if...
     *        - TUG (assessment 12), score is in secs
     *        - S2S (assessment 9), score is in number of repetitions
     * @param {array} assessmentData - additional scores for assessment 3 & 7;
     *        Each additional score is wrapped in JS object
     *          {dataName: <data field name>, dataValue: <assessment score>}
     *        - 360 (assessment 3), dataValue in number of right/left steps
     *        - 2 Ft Jump (assessment 7), dataValue in inches
     * @param {string} assessmentDate - assessment date formatted as YYYY-MM-DD
     */
    addPAScore(assessmentNum, score, assessmentData, assessmentDate){
        this.ensureAssessmentDate(assessmentDate);
        const physicalAssessment = this._physicalAssessments.get(assessmentDate);
        const assessmentName = this._getAssessmentName(assessmentNum);
        const assessmentType = this._getAssessmentType(assessmentNum);
        const index = physicalAssessment.findIndex((paScore) => paScore.assessmentName === assessmentName);
        if(physicalAssessment[index]) {
            physicalAssessment[index] = {
                assessmentName: assessmentName,
                assessmentType: assessmentType,
                assessmentScore: score,
                assessmentData: assessmentData
            }
        } else {
            physicalAssessment.push({
                assessmentName: assessmentName,
                assessmentType: assessmentType,
                assessmentScore: score,
                assessmentData: assessmentData
            });
        }

        if(physicalAssessment) this._physicalAssessments.set(assessmentDate, physicalAssessment);
        console.log(physicalAssessment);
    }


    /**
     * Based on an assessment number, returns the actual test name
     * @param {number} assessmentNum - assessment number
     * @returns {string}
     * @private
     */
    _getAssessmentName(assessmentNum) {
        const AssessmentName = [
            {FAB1: "Bal 2 Ft"},
            {FAB2: "Pencil"},
            {FAB3: "360"},
            {FAB4: "Bench"},
            {FAB5: "Heel Toe"},
            {FAB6: "1 Leg"},
            {FAB7: "Foam"},
            {FAB8: "2 Ft Jump"},
            {FAB9: "Head Turns"},
            {FAB10: "Fall Back"},
            {S2S: "Sit to Stand"},
            {TUG: "Up and Go"}
        ];
        return Object.values(AssessmentName[assessmentNum - 1])[0];
    }

    /**
     * Based on assessment number, return which type of assessment it is
     * @param {number} assessmentNum - assessment question number
     * @returns {string}
     * @private
     */
    _getAssessmentType(assessmentNum) {
        const AssessmentType = {
            FAB: "Fullerton Advanced Balance",
            TUG: "Timed Up & Go",
            S2S: "Sit to Stand"
        };

        if (assessmentNum === '11')
            return AssessmentType.S2S;
        else if (assessmentNum === '12')
            return AssessmentType.TUG;
        else
            return AssessmentType.FAB;

    }

    /**
     * Given an assessment name, will return the question number
     * @param {string} assessmentName - name of the assessment question
     * @returns {number}
     */
    getAssessmentNum(assessmentName){
        const AssessmentName = [
            "Bal 2 Ft",
            "Pencil",
            "360",
            "Bench",
            "Heel Toe",
            "1 Leg",
            "Foam",
            "2 Ft Jump",
            "Head Turns",
            "Fall Back",
            "Sit to Stand",
            "Up and Go"
        ];
        return AssessmentName.indexOf(assessmentName) + 1;
    }

    /**
     * Ensure an assessment date exists for physical tests
     * @param {Date|String} assessmentDate - an assessment date, in string format
     */
    ensureAssessmentDate(assessmentDate){
        if(!this._physicalAssessments.has(assessmentDate)){
            this._physicalAssessments.set(assessmentDate, []);
        }
    }

    /**
     * Changes an assessment, it's data and questions, from one date to another.
     * @param {Date} oldDate - the date we are taking the data from
     * @param {Date} newDate - the date we are moving the data to
     */
    changeAssessmentDate(oldDate, newDate){
        const physicalAssessment = this._physicalAssessments.get(oldDate);

        if(physicalAssessment){
            this._physicalAssessments.set(newDate, physicalAssessment);
            this._physicalAssessments.delete(oldDate);
        }

    }

    /**
     * Score a PA assessment
     * @param {Array} assessment - an array of PA assessment objects
     * @param {string} gender - fighters gender
     * @param {number} age - fighters age
     * @returns {{"Bal 2 Ft": number, Steps: string, Bench: number, "Sit to Stand": number, Pencil: number, "Heel Toe": number, "Head Turns": number, "360": number, "Up and Go": number, Foam: number, Inches: number, "Fall Back": number, "1 Leg": number, "2 Ft Jump": number}}
     */
    paAssessmentScore(assessment, gender, age){
        const scoredAssessment = {
            "Bal 2 Ft": 0,
            "Pencil": 0,
            "360": 0,
            Steps: "",
            Bench: 0,
            "Heel Toe": 0,
            "1 Leg": 0,
            Foam: 0,
            "2 Ft Jump": 0,
            Inches: 0,
            "Head Turns": 0,
            "Fall Back": 0,
            "Sit to Stand": 0,
            "Up and Go": 0
        };

        assessment.forEach((value) => {
            scoredAssessment[value.assessmentName] = value.assessmentScore;
            if(value.assessmentName === "360"){
                scoredAssessment.Steps = `R${value.assessmentData[1].dataValue} L${value.assessmentData[0].dataValue}`;
            }

            if(value.assessmentName === "2 Ft Jump"){
                scoredAssessment.Inches = value.assessmentData[0].dataValue;
            }
        });

        scoredAssessment.Score = Math.ceil((((Number(scoredAssessment["Bal 2 Ft"]) + Number(scoredAssessment["Pencil"]) +
            Number(scoredAssessment["360"]) + Number(scoredAssessment["Bench"]) + Number(scoredAssessment["Heel Toe"]) +
            Number(scoredAssessment["1 Leg"]) + Number(scoredAssessment["Foam"]) + Number(scoredAssessment["2 Ft Jump"]) +
            Number(scoredAssessment["Head Turns"]) + Number(scoredAssessment["Fall Back"]))
            / 40) * 100));

        scoredAssessment.Target = 0;

        if(gender === "Female" || gender === "F"){
            if(age < 64) scoredAssessment.Target = 12;
            else if(age > 64 && age <= 69) scoredAssessment.Target = 11;
            else if(age > 69 && age <= 79) scoredAssessment.Target = 10;
            else if(age > 79 && age <= 84) scoredAssessment.Target = 9;
            else if(age > 84 && age <= 89) scoredAssessment.Target = 8;
            else scoredAssessment.Target = 4;
        } else if(gender === "Male" || gender === "M"){
            if(age < 64) scoredAssessment.Target = 14;
            else if(age > 64 && age <= 74) scoredAssessment.Target = 12;
            else if(age > 74 && age <= 79) scoredAssessment.Target = 11;
            else if(age > 79 && age <= 84) scoredAssessment.Target = 10;
            else if(age > 84 && age <= 89) scoredAssessment.Target = 8;
            else scoredAssessment.Target = 7;
        }

        scoredAssessment.S2SScore = Number(scoredAssessment["Sit to Stand"]) > 0 ? Math.ceil((Number(scoredAssessment["Sit to Stand"]) / Number(scoredAssessment.Target)) * 100) : 0;
        scoredAssessment.UpScore = (Number(scoredAssessment["Up and Go"]) > 16) ? 0 : (Number(scoredAssessment["Up and Go"]) === 0) ? "INC" : Math.ceil((1 + ( 1 - (Number(scoredAssessment["Up and Go"]) / 8))) * 100);

        return scoredAssessment;
    }

    /**
     * JSON map of physical assessments
     * @returns {Map<Date, Array>}
     */
    serialize() {
        super.serialize();
        return this._physicalAssessments;
    }

    /**
     * JSON map of physical assessments, saved to this object
     * @param {PhysicalAssessmentModel} paAssessments - JSON map
     */
    deserialize(paAssessments) {
        super.deserialize();
        if(!paAssessments)
            return;
        this._physicalAssessments = !paAssessments ? new Map() : objToStrMap(paAssessments);
    }
}
