/**
 * @author Tyler Bezera
 * 01/18/2019
 * PDQ-39 Model
 */


"use strict";

import Model from "./Model";
import {objToStrMap} from "../helpers/MapUtilites";

/**
 * PDQModel, responsible for Data storage and mutation of PDQ39 data
 */
export default class PDQModel extends Model{

    /**
     * Simply creates a new map for this model
     */
    constructor(){
        super();
        this._pdqAssessments = new Map();
    }

    /**
     * Adds a pdq question answer combination to the PDQ assessments map
     * @param {number} question - question number from 1- 39
     * @param {number} value - answer for the question from 1 - 5
     * @param {number} timeSpent - time in seconds spent on answering question
     * @param {string} assessmentDate - assessment date formatted as YYYY-MM-DD
     */
    addPdqQuestion(question, value, timeSpent, assessmentDate){
        this.ensureAssessmentDate(assessmentDate);
        const pdqAssessments = this._pdqAssessments.get(assessmentDate);

        let index = this._containsPdqQuestion(question, pdqAssessments);
        if(index !== -1){
            pdqAssessments[index].answer = value;
            if(!pdqAssessments[index].timeSpent && timeSpent) pdqAssessments[index].timeSpent = timeSpent;
        } else {
            pdqAssessments.push({
                questionID: question,
                answer: value,
                timeSpent: timeSpent,
                category: PDQModel.getPDQQuestionCategory(question)
            });
        }
        if(pdqAssessments) this._pdqAssessments.set(assessmentDate, pdqAssessments);
        console.log(this._pdqAssessments);
    }

    /**
     * Check to see if an assessmentArray already contains a given question or not
     * @param {number} questionID - the id to check against, between 1 and 39
     * @param {array} assessmentArray - the array of assessment objects
     * @returns {number} the index of the containing object, or -1
     * @private
     */
    _containsPdqQuestion(questionID, assessmentArray)
    {
        if(questionID > 39 || questionID < 1){
            return -1;
        }
        let currIndex = -1;
        for(let assessment of assessmentArray){
            currIndex++;
            if(assessment.questionID === Number(questionID) || assessment.questionID === questionID){
                return currIndex;
            }
        }

        return -1;
    }

    /**
     * Ensure an assessment date exists for pdq
     * @param {Date|String} assessmentDate - an assessment date, in string format
     */
    ensureAssessmentDate(assessmentDate){
        if(!this._pdqAssessments.has(assessmentDate)){
            this._pdqAssessments.set(assessmentDate, []);
        }
    }

    /**
     * Changes an assessment from one date, to the other.. moving all questions to the new date and removing the old.
     * @param {string} oldDate - The date we no longer want the assessment to be under
     * @param {string} newDate - The date we want the assessment to be moved to
     */
    changeAssessmentDate(oldDate, newDate){
        const pdqAssessments = this._pdqAssessments.get(oldDate);

        if(pdqAssessments){
            this._pdqAssessments.set(newDate, pdqAssessments);
            this._pdqAssessments.delete(oldDate);
        }
    }

    /**
     * Given a questionID, this function returns the category it falls under
     * @param {number} questionID - The ID of the question, from 1 to 39
     * @returns {string} The category it falls under, such as Mobility
     */
    static getPDQQuestionCategory(questionID)
    {
        if (questionID >= 1 && questionID <= 10) {
            return "Mobility";
        } else if (questionID >= 11 && questionID <= 16) {
            return "DailyLiving";
        } else if (questionID >= 17 && questionID <= 22) {
            return "Emotional";
        } else if (questionID >= 23 && questionID <= 26) {
            return "Stigma";
        } else if (questionID >= 27 && questionID <= 29) {
            return "Social";
        } else if (questionID >= 30 && questionID <= 33) {
            return "Cognition";
        } else if (questionID >= 34 && questionID <= 36) {
            return "Communication";
        } else if (questionID >= 37 && questionID <= 39) {
            return "Body";
        }
    }

    /**
     * Returns the total PDQ time to take assessment.
     * @param {Date || String} assessmentDate - the date of the taken PDQ assessment
     * @returns {Number} total PDQ time to take assessment in seconds
     */
    getTotalPDQTime(assessmentDate) {
        const pdqAssessment = this._pdqAssessments.get(assessmentDate);
        let totalPDQTime = 0;
        if(pdqAssessment.length === 39){
            for(let pdqObject of pdqAssessment) {
                if(pdqObject.timeSpent && pdqObject.timeSpent > 0) totalPDQTime += pdqObject.timeSpent;
            }
        }
        return totalPDQTime;
    }

    /**
     * Returns the PDQ Time Score
     * @param {number} pdqTime - full PDQ time in seconds
     * @returns {Number} total PDQ time score compared to target
     */
    getPDQTimeScore(pdqTime) {
        const targetTime = 300;
        return Math.round((targetTime / pdqTime) * 100);
    }

    /**
     * Given a PDQ category, this function returns the amount of questions for said category.
     * @param {string} category - Word representation of a PDQ39 category, such as Mobility or Stigma
     * @returns {number} - The amount of questions belonging to the given category
     */
    pdqCategoryQuestionsAmount(category)
    {
        switch(category){
            case "Mobility": return 10;
            case "DailyLiving": return 6;
            case "Emotional": return 6;
            case "Stigma": return 4;
            case "Social": return 3;
            case "Cognition": return 4;
            case "Communication": return 3;
            case "Body": return 3;
        }
    }

    /**
     * Formats the total PDQ time from seconds to M:SS
     * @param {number} seconds - total PDQ time in seconds
     * @return {string} returns PDQ time in M:SS format
     */
    static formatTotalPDQTime(seconds) {
        if(seconds < 60) {
            return `0:${seconds < 10 ? `0${seconds}` : seconds}`;
        } else {
            let m = Math.floor(seconds / 60);
            let s = seconds % (m * 60);
            return `${m}:${s < 10 ? `0${s}` : s}`;
        }
    }

    /**
     * Given an array of PDQ39 question objects, this function grades the assessment into it's categories.
     * @param {array} assessmentArray - An array of assessment objects
     * @returns {object} scoredAssessment - An object containing the different categories of the PDQAssessment, graded.
     */
    pdqAssessmentScore(assessmentArray)
    {
        const scoredAssessment = {
            Mobility: 0,
            DailyLiving: 0,
            Emotional: 0,
            Stigma: 0,
            Social: 0,
            Cognition: 0,
            Communication: 0,
            Body: 0
        };
        assessmentArray.forEach((value) => {
            scoredAssessment[value.category] += Number(value.answer);
        });

        Object.keys(scoredAssessment).forEach((value) => {
           scoredAssessment[value] = Math.ceil((scoredAssessment[value] / this.pdqCategoryQuestionsAmount(value)) * 100);
        });

        return scoredAssessment;
    }

    /**
     * Returns in JSON format, a map of assessments.
     * @returns {map} returns a map of date to assessment array
     */
    serialize()
    {
        super.serialize();
        return this._pdqAssessments;
    }

    /**
     * When getting information from the server, this is called to save the data back into the application.
     * @param {string} pdqAssessments - JSONified map
     */
    deserialize(pdqAssessments) {
        super.deserialize();
        if(!pdqAssessments)
            return;
        this._pdqAssessments = !pdqAssessments ? new Map() : objToStrMap(pdqAssessments);
    }
}