/**
 *  Vitals Summary page is displayed sequential after the vitals form, it shows the fighter's weight and exercise/hour
 *  per week during every assessment.
 *  @author Cynthia Pham
 *  6/25/19
 *  VitalSummaryView.js
 */
import View from "../View";
import SummaryView from "../SummaryView";
import VitalsModel from "../../models/VitalsModel";
import VitalKeywords from "../../../resources/vitalKeywords";

'use strict';

/**
 * View class Vitals Summary. Handles template and rendering for Vital's summary page
 */
export default class VitalSummaryView extends View
{
    /**
     * VitalSummaryView constructor builds the View for Vitals's summary page after the vitals form.
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks){
        super(dataHive, callbacks);
        this.fighterModel = dataHive.fighterModel;
        this.personalInfo = dataHive.personalInfo;
        this.newFighterEnrollment = dataHive.newFighterEnrollment;
        this.addAssessment = dataHive.addAssessment;
        this.newExistingAssessment = dataHive.newExistingAssessment;

        if(!this.newFighterEnrollment && !this.addAssessment) {
            this._buttonHTML = `<button class="next-button btn-rsb float-left" data-value="summary"><i class="fas fa-arrow-left"></i>&nbsp;Boxer Profile</button>`;
            this._addButtonHTML = `<button class="float-right" id="addAssessment" style="border:none;background:none;"><i class="fas fa-plus-circle" style="color:#5cb85c;font-size:40px;"></i></button>`;
        } else {
            this._buttonHTML = `<button class="next-button btn-rsb col-5" data-value="${this.newExistingAssessment ? "pdq39QuickForm" : "pdq39Form"}">Continue to PDQ</button>
                                <button class="next-button btn-rsb col-5 offset-1" data-value="${this.newExistingAssessment ? "paQuickForm" : "paLongForm"}">Skip PDQ, Continue to PA</button>`;
        }
        this.vitals = this.fighterModel.vitalsModel.serialize();
        this._vitalsDisplayAssessDates = SummaryView.getDisplayAssessDates(this.vitals.vitalsAssessment);
        this._summarizedExerciseNames = VitalSummaryView.summarizeExerciseNamesToList(this._vitalsDisplayAssessDates, this.vitals.vitalsAssessment);
        this._summarizedExerciseHours = VitalSummaryView.summarizeExerciseHoursToList(this._vitalsDisplayAssessDates, this.vitals.vitalsAssessment, this.fighterModel);
    }

    /**
     * Event thrown when View has finished rendering
     */
    postRenderSetup()
    {
        if(this._addButtonHTML)
            document.getElementById('addAssessment').onclick = () => { this.callbacks.addSingleVitalsAssessment(); };
    }

    /**
     * Static method summarizes the vital's weight BMI, TWET and exercises hours per week in list form.
     * @param {Array} vitalsDatesArray - an array of dates that will be used to generate list of exercise names
     * @param {Map} assessmentMap - a Map object that contains vitals dates taken as keys and array of vitals exercises as values
     * @param {FighterModel} fighterModel - a fighter model object
     * @returns {string} - HTML string
     */
    static summarizeExerciseHoursToList(vitalsDatesArray, assessmentMap, fighterModel)
    {
        let vitalsList = "";
        const vitalsExerciseNames = VitalSummaryView.getSortedVitalsExerciseNames(vitalsDatesArray, assessmentMap);
        vitalsDatesArray.forEach((assessmentDate) => {
            let assessmentMiniDate = SummaryView.miniDateFromDate(assessmentDate);
            let assessmentData = assessmentMap.get(assessmentDate);
            vitalsList += `<div class="col-2">
                               <p class="font-weight-bold">${assessmentMiniDate}</p>
                               <ul class="list-unstyled">
                                    <li class="">${assessmentData.weight ? assessmentData.weight : fighterModel.vitalsModel.weight}</li>
                                    <li class="">${((assessmentData.weight || fighterModel.vitalsModel.weight) && fighterModel.personalInformationModel.height)
                                            ? VitalsModel.calculateBMI(assessmentData.weight ? assessmentData.weight : fighterModel.vitalsModel.weight, fighterModel.personalInformationModel.height)
                                            : "N/A"}</li>
                                    <li class="">${assessmentData.fallsMonth ? assessmentData.fallsMonth : "N/A"}</li>
                                    <li class="">${assessmentData.exercises.length > 0 ? VitalsModel.calculateTWET(assessmentData.exercises).BoxingTWET : "0"}</li>
                                    <li class="">${assessmentData.exercises.length > 0 ? VitalsModel.calculateTWET(assessmentData.exercises).TotalTWET : "0"}</li>`;
            vitalsExerciseNames.forEach((exerciseName) => {
                let exerciseObjArray = assessmentData.exercises ? assessmentData.exercises : assessmentData;
                let exerciseObj = exerciseObjArray.find(exerciseObj => exerciseObj.exercise === exerciseName);
                exerciseObj
                    ? vitalsList+= `<li class="">${exerciseObj.hoursPerWeek}</li>`
                    : vitalsList+= `<li class=""> --- </li>`;
            });
            vitalsList += `</ul>
                       </div>`;
        });
        return vitalsList;
    }

    /**
     * Method summarizes the vital's exercise names in list form.
     * @param {Array} vitalsDatesArray - an array of dates that will be used to generate list of exercise names
     * @param {Map} assessmentMap - a Map object that contains vitals dates taken as keys and array of vitals exercises as values
     * @returns {string} - HTML string
     */
    static summarizeExerciseNamesToList(vitalsDatesArray, assessmentMap)
    {
        let vitalsList = "";
        const vitalsExerciseNames = VitalSummaryView.getSortedVitalsExerciseNames(vitalsDatesArray, assessmentMap);
        vitalsExerciseNames.forEach((exerciseName) => {
            vitalsList += `<li class="">${VitalKeywords[exerciseName]}</li>`
        });
        return vitalsList;
    }

    /**
     * Method returns all exercises (no duplicates) into an array, sorted by name.
     * @param {Array} vitalsDatesArray - an array of dates that will be used to generate list of exercise names
     * @param {Map} assessmentMap - a Map object that contains vitals dates taken as keys and array of vitals exercises as values
     * @returns {Array} - Containing exercise names, no duplicates
     */
    static getSortedVitalsExerciseNames(vitalsDatesArray, assessmentMap)
    {
        let exerciseNamesSet = new Set();
        vitalsDatesArray.forEach((value) => {
            let assessmentData = assessmentMap.get(value);
            let assessmentExercises = (assessmentData.exercises) ? (assessmentData.exercises) : assessmentData;
            assessmentExercises.forEach((exerciseObject) => {
                exerciseNamesSet.add(exerciseObject.exercise);
            });
        });
        return Array.from(exerciseNamesSet).sort();
    }

    /**
     * Returns HTML template that will display the Vitals's summary with relevant data (weight & exercises)
     * @returns {string} - HTML template
     * @private
     */
    _html()
    {
        return `
            <div class="container">
                <div class="card card-shadow" style="border: solid 2px #dedede">
                    <div class="card-body">
                        <div class="card-title" style="font-weight: bold">Vitals Summary - ${this.personalInfo.firstName} ${this.personalInfo.lastName} ${this._addButtonHTML ? this._addButtonHTML : ''}</div>
                        <div class="card-text mb-3">
                            Coach, please discuss the following information based on the vitals data.
                        </div>
                        <div class="card card-shadow card-border">
                            <div class="card-body">
                                <div class="card-title font-weight-bold">Vitals Data</div>   
                                    <div class="row">
                                        <div class="col-4">
                                        <span class="font-weight-bold">Date:</span>
                                            <ul class="list-unstyled">
                                                <li class="">Weight</li>
                                                <li class="">BMI 
                                                    <span><a role="button" style="font-size:18px;" data-tippy-content='
                                                        <p class="m-2">BMI is calculated from height and weight. Make sure these values are entered.</p>'
                                                        <i class="fas fa-lg fa-info-circle ml-1"></i></a>
                                                    </span>
                                                </li>
                                                <li class="">Falls/Last Month</li>
                                                <li class="">Boxing TWET</li>
                                                <li class="">Total TWET</li>
                                                ${this._summarizedExerciseNames}
                                            </ul>
                                        </div>
                                        ${this._summarizedExerciseHours}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer text-center">
                            ${this._buttonHTML ? this._buttonHTML : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}