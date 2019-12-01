/**
 *  Assessment History page is displayed sequential after add new or previous assessment for existing boxer. Shows
 *  all of the assessments, including strays, with dates and checkmarks for completed vitals, pdq, and physical assessments.
 *  @author Cynthia Pham
 *  6/25/19
 *  AssessmentHistoryView.js
 */
import View from "./View";
import VitalsModel from "../models/VitalsModel";
import VitalKeywords from "../../resources/vitalKeywords";
import SummaryView from "./SummaryView";
import PALongView from "./physicalAssessment/PALongView";
import ModalComponent from "./components/ModalComponent";
import CheckBoxComponent from "./components/CheckBoxComponent";
import Toastify from "toastify-js";

'use strict';

/**
 * View class Assessment History. Handles template and rendering for assessment history page
 */
export default class AssessmentHistoryView extends View
{
    /**
     * AssessmentHistoryView constructor builds the View for Assessment History page
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks){
        super(dataHive, callbacks);
        this.fighterModel = dataHive.fighterModel;
        this.personalInfo = dataHive.personalInfo;
        this.addAssessment = dataHive.addAssessment;
        this.newFighterEnrollment = dataHive.newFighterEnrollment;
        if(this.addAssessment) this._buttonHTML = `<button class="next-button btn-rsb float-right" data-value="vitals">Vitals&nbsp;<i class="fas fa-arrow-right"></i></button>`;
        else this._buttonHTML = `<button class="float-right next-button btn-rsb mt-1 mr-3" data-value="summary"
                style="border:none;background:none;"><i class="fas fa-arrow-alt-circle-left" style="color:#0174DF; 
                font-size:40px;"></i></button>`;
    }

    postRenderSetup() {
        const editBtns = this.el.querySelectorAll('button.edit-btn');
        editBtns.forEach((editBtn) => {
            if(this.addAssessment) editBtn.style.display = "none";
            editBtn.onclick = (event) => {
                this.callbacks.editAssessment(event.target.dataset.assessment, event.target.dataset.date);
            }
        });
        const deleteBtns = this.el.querySelectorAll('button.delete-btn');
        deleteBtns.forEach((deleteBtn) => {
            if(this.addAssessment) deleteBtn.style.display = "none";
            deleteBtn.onclick = (event) => {
                const deleteModal = new ModalComponent({
                    footer: true,
                    stickFooter: false,
                    closeMethods: ['button']
                }).setContent(`<div>
                        <h3>Are you absolutely sure?</h3>
                        <hr>
                        <h5>This will delete the assessment permanently. This action cannot be undone.</h5>
                        <div class="row mt-4 ml-2">
                           ${new CheckBoxComponent()
                            .setId('deleteAssessment')
                            .setName('deleteAssessment')
                            .setLabel(`<span style="font-weight:bold;">I understand the consequences.</span>`)
                            .setValue(false)
                            ._html()}
                        </div>
                        <h5 id="errorMsg" class="ml-2 mt-2"></h5>
                    </div>`)
                .setFooterButtons([{
                    label: "Delete Assessment",
                    cssClass: 'tingle-btn tingle-btn--primary',
                    callback: () => {
                        if(!document.querySelector('#deleteAssessment').checked) {
                            document.querySelector("#errorMsg").innerHTML = `<strong style="color:red;">You need to check the box to delete the assessment.</strong>`
                        } else {
                            deleteModal.closeModal();
                            if(event.target.dataset.assessment === "vitals") {
                                this.fighterModel.vitalsModel._vitalsAssessment.delete(event.target.dataset.date);
                                this.callbacks.saveVitals(this.fighterModel.vitalsModel._vitalsAssessment);
                            }
                            if(event.target.dataset.assessment === "pdq") {
                                this.fighterModel.pdqModel._pdqAssessments.delete(event.target.dataset.date);
                                this.callbacks.savePDQ(this.fighterModel.pdqModel._pdqAssessments);
                            }
                            if(event.target.dataset.assessment === "physicalTest") {
                                this.fighterModel.physicalAssessmentModel._physicalAssessments.delete(event.target.dataset.date);
                                this.callbacks.savePA(this.fighterModel.physicalAssessmentModel._physicalAssessments);
                            }

                            this.render();
                            Toastify({
                                text: "Assessment Deleted ",
                                duration: 5000,
                                newWindow: true,
                                close: true,
                                gravity: "bottom", // `top` or `bottom`
                                positionLeft: false, // `true` or `false`
                                backgroundColor: "linear-gradient(to bottom, #0174DF, #0080FF);",
                                stopOnFocus: true // Prevents dismissing of toast on hover
                            }).showToast();
                        }
                    }
                }, {
                    label: "Cancel",
                    cssClass: 'tingle-btn tingle-btn--primary',
                    callback: () => {
                        deleteModal.closeModal();
                    }
                }]).openModal();
            }
        });
    }

    /**
     * Returns all assessment (vitals, pdq, physical assessment) dates that are not duplicates
     * @param {Map} pdqMap - map that holds key/value pair of date/taken pdq assessments
     * @param {Map} paMap - map that holds key/value pair of date/taken physical assessments
     * @param {Map} vitalsMap - map that holds key/value pair of date/taken vital assessments
     * @returns {Array} an array of non duplicate assessment dates
     */
    static getAllAssessDatesArray(pdqMap = new Map(), paMap = new Map(), vitalsMap = new Map()) {
        let assessDatesSet = new Set();
        let vitalDates = Array.from(vitalsMap.keys());
        const pdqDates = Array.from(pdqMap.keys());
        const paDates = Array.from(paMap.keys());

        const datesArray = vitalDates.concat(pdqDates, paDates);
        for(let date of datesArray) {
            assessDatesSet.add(date);
        }
        return Array.from(assessDatesSet);
    }

    /**
     * Static method sorts an array according to their dates. Oldest date is sorted to the front of the array,
     * most recent date is sorted to the back.
     * @param {Array} assessmentDatesArray - array of assessment dates
     * @param {boolean} ascendingBoolean - true if sorting dates from oldest to recent, false if sorting from recent to oldest
     */
    static sortAssessmentDateArray(assessmentDatesArray, ascendingBoolean)
    {
        assessmentDatesArray.sort((first, second) => {
            let firstD = new Date(first);
            let secondD = new Date(second);
            if(ascendingBoolean) {
                if (firstD > secondD) return 1;
                if (firstD < secondD) return -1;
                return 0;
            } else {
                if (firstD > secondD) return -1;
                if (firstD < secondD) return 1;
                return 0;
            }
        });
    }

    /**
     * Summarizes the vitals into list form
     * @param {string} assessmentDate - assessment date
     * @param {Array} assessmentData - array of physical test objects
     * @param {FighterModel} fighterModel - a reference to the Fighter Model
     * @returns {string} return HTML string
     */
    static summarizeVitalsToList(assessmentDate, assessmentData, fighterModel) {
        let vitalsList = `<div class="col-4">
                              <button class="edit-btn assessment-btn btn-rsb" data-date="${assessmentDate}" data-assessment="vitals">Edit</button> 
                              <button class="delete-btn assessment-btn btn-rsb" data-date="${assessmentDate}" data-assessment="vitals">Delete</button> 
                              <p class="font-weight-bold">Vitals</p>
                              <ul class="list-unstyled">
                                  <li class="">Weight: <strong>${assessmentData.weight ? assessmentData.weight : fighterModel.vitalsModel.weight}</strong></li>
                                  <li class="">BMI: <strong>${((assessmentData.weight || fighterModel.vitalsModel.weight) && fighterModel.personalInformationModel.height)
                                          ? VitalsModel.calculateBMI(assessmentData.weight ? assessmentData.weight : fighterModel.vitalsModel.weight, fighterModel.personalInformationModel.height)
                                          : "N/A"}</strong></li>
                                  <li class="">Falls/Last Month: <strong>${assessmentData.fallsMonth ? assessmentData.fallsMonth : "N/A"}</strong></li>
                                  <li class="">Boxing TWET: <strong>${(assessmentData.exercises && assessmentData.exercises.length > 0) ? VitalsModel.calculateTWET(assessmentData.exercises).BoxingTWET : "0"}</strong></li>
                                  <li class="">Total TWET: <strong>${(assessmentData.exercises && assessmentData.exercises.length > 0) ? VitalsModel.calculateTWET(assessmentData.exercises).TotalTWET : "0"}</strong></li>`;
        let exerciseObjectArray = assessmentData.exercises ? assessmentData.exercises : assessmentData;
        exerciseObjectArray = VitalsModel.sortExercisesByName(exerciseObjectArray);
        exerciseObjectArray.forEach((exerciseObject) => {
            vitalsList +=  `<li class="">${VitalKeywords[exerciseObject.exercise]}: <strong>${exerciseObject.hoursPerWeek}</strong></li>`;
        });
        vitalsList += `</ul></div>`;
        return vitalsList;
    }

    /**
     * Summarizes the pdq assessment into list form
     * @param {string} assessmentDate - assessment date
     * @param {Array} assessmentData - array of physical test objects
     * @returns {string} return HTML string
     */
    static summarizePDQToList(assessmentDate, assessmentData) {
        return `
                <div class="col-4">
                    <button class="edit-btn assessment-btn btn-rsb" data-date="${assessmentDate}" data-assessment="pdq">Edit</button>
                    <button class="delete-btn assessment-btn btn-rsb" data-date="${assessmentDate}" data-assessment="pdq">Delete</button>
                    <p class="font-weight-bold">PDQ</p>
                    <ul class="list-unstyled">
                        <li class="">Mobility: <strong>${assessmentData.Mobility}</strong></li>
                        <li class="">Daily Living: <strong>${assessmentData.DailyLiving}</strong></li>
                        <li class="">Emotional: <strong>${assessmentData.Emotional}</strong></li>
                        <li class="">Stigma: <strong>${assessmentData.Stigma}</strong></li>
                        <li class="">Social: <strong>${assessmentData.Social}</strong></li>
                        <li class="">Cognition: <strong>${assessmentData.Cognition}</strong></li>
                        <li class="">Communication: <strong>${assessmentData.Communication}</strong></li>
                        <li class="">Body: <strong>${assessmentData.Body}</strong></li>
                    </ul>
                </div>`;
    }

    /**
     * Summarizes the physical test assessment into list form
     * @param {string} assessmentDate - assessment date
     * @param {Array} assessmentData - array of physical test objects
     * @returns {string} return HTML string
     */
    static summarizePAToList(assessmentDate, assessmentData) {
        return `
                <div class="col-4">
                    <button class="edit-btn assessment-btn btn-rsb" data-date="${assessmentDate}" data-assessment="physicalTest">Edit</button>
                    <button class="delete-btn assessment-btn btn-rsb" data-date="${assessmentDate}" data-assessment="physicalTest">Delete</button>
                    <p class="font-weight-bold">Physical Tests</p>
                    <ul class="list-unstyled">
                        <li class="">Bal 2 Ft: <strong>${assessmentData["Bal 2 Ft"]}</strong></li>
                        <li class="">Pencil: <strong>${assessmentData["Pencil"]}</strong></li>
                        <li class="">360: <strong>${assessmentData["360"]}</strong></li>
                        <li class="">Steps: <strong>${assessmentData["Steps"]}</strong></li>
                        <li class="">Bench: <strong>${assessmentData["Bench"]}</strong></li>
                        <li class="">Heel Toe: <strong>${assessmentData["Heel Toe"]}</strong></li>
                        <li class="">1 Leg: <strong>${assessmentData["1 Leg"]}</strong></li>
                        <li class="">Foam: <strong>${assessmentData["Foam"]}</strong></li>
                        <li class="">2 Ft Jump: <strong>${assessmentData["2 Ft Jump"]}</strong></li>
                        <li class="">Inches: <strong>${assessmentData["Inches"]}</strong></li>
                        <li class="">Head Turns: <strong>${assessmentData["Head Turns"]}</strong></li>
                        <li class="">Fall Back: <strong>${assessmentData["Fall Back"]}</strong></li>
                        <li class="">Score: <strong>${assessmentData["Score"]}</strong></li>
                    </ul>
                    <p class="font-weight-bold">Sit to Stand</p>
                    <ul class="list-unstyled">
                        <li class="">You: <strong>${assessmentData["Sit to Stand"]}</strong></li>
                        <li class="">Target: <strong>${assessmentData["Target"]}</strong></li>
                        <li class="">Score: <strong>${assessmentData["S2SScore"]}</strong></li>
                    </ul>
                    <p class="font-weight-bold">Timed Up & Go</p>
                    <ul class="list-unstyled">
                        <li class="">Time: <strong>${assessmentData["Up and Go"]}</strong></li>
                        <li class="">Score: <strong>${assessmentData["UpScore"]}</strong></li>
                    </ul> 
                </div>`;

    }

    /**
     * Formats the assessment cards, sorted by date according to ascendingBoolean.
     * @param ascendingBoolean - true: cards are listed in ascending order by date, false: cards are listed in descending order by date
     * @returns {string} - HTML template
     * @private
     */
    _formatAssessmentCards(ascendingBoolean) {
        const assessmentDatesArray = AssessmentHistoryView.getAllAssessDatesArray(this.fighterModel.pdqModel._pdqAssessments,
            this.fighterModel.physicalAssessmentModel._physicalAssessments, this.fighterModel.vitalsModel._vitalsAssessment);
        AssessmentHistoryView.sortAssessmentDateArray(assessmentDatesArray, ascendingBoolean);
        let assessmentCards = "";

        assessmentDatesArray.forEach((date) => {
            let assessmentObject = {
                vitalsHTML: "",
                pdqHTML: "",
                paHTML: ""
            };

            const vitalsData = this.fighterModel.vitalsModel._vitalsAssessment.get(date);
            if(vitalsData)
                assessmentObject.vitalsHTML = AssessmentHistoryView.summarizeVitalsToList(date, vitalsData, this.fighterModel);

            let pdqData = this.fighterModel.pdqModel._pdqAssessments.get(date);
            if(pdqData) {
                pdqData = this.fighterModel.pdqModel.pdqAssessmentScore(pdqData);
                assessmentObject.pdqHTML = AssessmentHistoryView.summarizePDQToList(date, pdqData);
            }

            let paData = this.fighterModel.physicalAssessmentModel._physicalAssessments.get(date);
            if(paData) {
                paData = this.fighterModel.physicalAssessmentModel.paAssessmentScore(paData, this.personalInfo.gender, SummaryView.calculateAge(this.personalInfo.birthDate));
                assessmentObject.paHTML = AssessmentHistoryView.summarizePAToList(date, paData);
            }

            assessmentCards +=
                `<div class="card card-border ${(vitalsData && pdqData && paData) ? "" : "border-primary"} mb-2">
                    <div class="card-header">
                        <span class="font-weight-bold mr-3">${PALongView.displayDateFromDate(date)}</span>
                        <span class="mr-3">Vitals <i class="fas ${assessmentObject.vitalsHTML ? "fa-check" : "fa-times"}"></i></span>
                        <span class="mr-3">PDQ <i class="fas ${assessmentObject.pdqHTML ? "fa-check" : "fa-times"}"></i></span>
                        <span class="mr-3">Physicals <i class="fas ${assessmentObject.paHTML ? "fa-check" : "fa-times"}"></i></span>
                    </div>
                    <div class="card-body">  
                        <div class="row">
                            ${assessmentObject.vitalsHTML}
                            ${assessmentObject.pdqHTML}
                            ${assessmentObject.paHTML}
                        </div>
                    </div>
                </div>`;
        });
        return assessmentCards;
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
                        <div class="card-title" style="font-weight: bold">
                            Assessment History - ${this.personalInfo.firstName} ${this.personalInfo.lastName}
                            ${this._toggleSwitch ? this._toggleSwitch : ""}
                            ${this._buttonHTML}
                        </div>
                        <span>Coach, please take a moment to review over the previous assessments.  Incomplete assessments are indicated by the blue border.</span>
                        <div class="row mt-2">
                            <div class="col-12 ml-0">
                                ${this._formatAssessmentCards(false)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}