/**
 * View page for Coach's Page, for filling out re-assessment date, RSB level, boxer's intensity, avg. workouts/week,
 * coach's comments/observations, other fighter conditions, and whether fighter would like to join RSB.
 * @author Tyler Bezera
 * 5/16/19
 * CoachPageView.js
 */


'use strict';

import View from './View.js';
import ToggleSwitchComponent from './components/ToggleSwitchComponent';
import Toastify from "toastify-js";
import SelectComponent from "./components/SelectComponent";
import InputComponent from "./components/InputComponent";
import {
    generateHTMLfromDatabaseFieldList,
    twoColumnRowFormatter
} from "../helpers/Generators";
import SummaryView from "./SummaryView";

/**
 * View class Coach Page. Handles template and rendering for additional fighter data and coach's comments/observations.
 * Also asks fighter if they want to join RSB.
 */
export default class CoachPageView extends View
{
    /**
     * CoachPageView constructor builds the View.  Constructs strings for RSB level, boxer intensity, and avg. workouts/week.
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks)
    {
        super(dataHive, callbacks);
        this.observations = dataHive.observations;
        this.personalInfo = dataHive.personalInfo;
        this.newFighterEnrollment = dataHive.newFighterEnrollment;
        this.addAssessment = dataHive.addAssessment;
        this.newExistingAssessment = dataHive.newExistingAssessment;

        if(this.newFighterEnrollment) {
            this._joinHTML =  `<hr>
                                <div class="row mb-4">
                                    <div class="col-12">
                                        <p style="font-weight: bold">${this.addAssessment && this.newExistingAssessment
                                                            ? "Is this an active boxer?"
                                                            : "Does the boxer wish to join BwP at this time?"}
                                        </p>
                                        <p>${this.addAssessment && this.newExistingAssessment
                                            ? "Inactive boxers will not be shown in the boxer directory. To change a boxer's active status in the future, please check the active box in personal information."
                                            : "By joining BwP, you will be walked through our terms and policies, and gain access to our gym with hands on guidance and assessments."}
                                        </p>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-6 text-center">
                                        <button id="join" class="btn-rsb joinBtn">
                                            ${this.addAssessment && this.newExistingAssessment
                                                ? "Yes/Activate"
                                                : "Join"}</button>
                                    </div>
                                    <div class="col-6 text-center">
                                        <button id="decline" class="btn-rsb joinBtn">
                                            ${this.addAssessment && this.newExistingAssessment
                                                ? "No/Hold"
                                                : "Don't Join"}</button>
                                    </div>
                                </div>
                                <hr>`;
        } else {
            this._toggleSwitch = new ToggleSwitchComponent()
                                .setId('editModeSwitch')
                                .setValue(this.dataHive.fighterModel.getEditStatus())
                                ._html();
            this._buttonHTML = `<button class="next-button btn-rsb ${this.addAssessment ? "float-right" : "float-left"}" 
                    data-value="summary"><i class="fas ${this.addAssessment ? "fa-arrow-right" : "fa-arrow-left"}">
                    </i>&nbsp;${this.addAssessment ? "Save and Go to Boxer Profile" : "Boxer Profile"}</button>`;
        }

        this.reassessmentDateOptions = {
          "---": 0,
          "1 Month": 1,
          "3 Month": 3,
          "6 Month": 6,
          "12 Month": 12
        };

        this.callbacks.getBoxerGoals();
        this.subscribeTo('APIController', 'boxerGoalsFields', 'boxerGoalsFieldsRetrieved', (boxerGoalFields) => {
            this._boxerGoalsHTML = generateHTMLfromDatabaseFieldList(boxerGoalFields, "boxerGoals", this.observations, twoColumnRowFormatter);
            this.render();
            if(this.el.querySelector('#editModeSwitch').value === 'false' || this.el.querySelector('#editModeSwitch').value === false || this.el.querySelector('#editModeSwitch').value === "")
                View.disableFormFields(this.el, false);
        });
    }

    /**
     * Calls event handler and callback functions after page has rendered.  Assists with saving fighter's
     * option to accept or decline to join RSB.
     */
    postRenderSetup()
    {
        this.el.querySelector('#reassessmentDateField').onblur = () => {
           // const reDate = e.target.options[e.target.selectedIndex].text;
            this.callbacks.updateReassessmentDate();
            this.el.querySelector('#reassessmentDate').value = this.observations.reassessmentDate;
        };

        const joinButtons = this.el.querySelectorAll('button.joinBtn');
        joinButtons.forEach((btn) => {
            btn.onclick = () => {
                Toastify({
                    text: "Loading...",
                    duration: 1000,
                    newWindow: true,
                    close: true,
                    gravity: "bottom", // `top` or `bottom`
                    positionLeft: false, // `true` or `false`
                    backgroundColor: "linear-gradient(to bottom, #0174DF, #0080FF);",
                    stopOnFocus: true // Prevents dismissing of toast on hover
                }).showToast();
                if(btn.id === "join") {
                    this.personalInfo.activeFlag = true;
                    this.callbacks.nextPage('waivers');
                } else if(btn.id === "decline") {
                    this.personalInfo.activeFlag = false;
                    this.callbacks.endEnrollment();
                    this.callbacks.nextPage('summary');
                }
            };
        });
    }

    /**
     * Returns HTML template that will display page for Coach's page
     * @returns {string} - HTML template
     * @private
     */
    _html()
    {
        return `
        <div class="container">
        <div class="card card-shadow" style="border: solid 2px #dedede">
            <div class="card-body">
                ${this._toggleSwitch ? this._toggleSwitch : ""}
                <div class="card-title">
                    <span style="font-weight: bold">Boxer Observations</span> - Please set the following information based on observations of <span style="font-weight: bold">${this.personalInfo.firstName} ${this.personalInfo.lastName}</span>
                </div>
                <hr>
                <form id="coachObservation" data-model="coachObservationModel" class="editableForm modern-form">
                    <div class="form-row">
                    <div class="col-6 col-md-4 col-lg-3 form-group">
                    ${new SelectComponent(Object.keys(this.reassessmentDateOptions))
                        .setId('reassessmentDateField')
                        .setClasses('form-control')
                        .setName('reassessmentDateField')
                        .setValue(this.observations.reassessmentDateField)
                        .setLabel('Re-assessment Interval')
                        ._html()}
                    </div>
                    <div class="col-6 col-md-3 col-xl-2 form-group">
                        ${new InputComponent()
                            .setId('reassessmentDate')
                            .setClasses('form-control')
                            .setName('reassessmentDate')
                            .setType('date')
                            .setValue(this.observations.reassessmentDate ? new Date(this.observations.reassessmentDate).toInputString() : new Date())
                            .setPlaceholder('mm/dd/yyyy')
                            .setLabel('Re-assessment Date')
                        ._html()}
                    </div>
                    <div class="col-6 col-sm-2 form-group">
                        ${new SelectComponent(["1", "2", "3", "4"])
                            .setId('rsbLevel')
                            .setClasses('form-control')
                            .setName('rsbLevel')
                            .setValue(this.observations.rsbLevel)
                            .setLabel('BwP Level')
                            ._html()}
                    </div>
                    <div class="col-6 col-sm-3 col-lg-2 form-group">
                        ${new SelectComponent(['High', 'Medium', 'Low'])
                            .setId('boxerIntensity')
                            .setClasses('form-control')
                            .setName('boxerIntensity')
                            .setValue(this.observations.boxerIntensity)
                            .setLabel('Boxer Intensity')
                            ._html()}
                    </div>
                    </div>
                    <hr>
                    <div class="form-row">
                        <div class="col-12">
                            <div class="form-group">
                                <label for="comments">Coach's Comments</label>
                                <textarea name="comments" class="form-control" id="comments" rows="3">${this.observations.comments}</textarea>
                            </div>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="col-12">
                            <div class="form-group">
                                <label for="diagnosed">Are there any other conditions you have been diagnosed for or 
                                is there anything we should know that should be considered${this.newFighterEnrollment ?
                                "before you join us?" : "."}</label>
                                <textarea name="additionalConditions" class="form-control" id="diagnosed" rows="3">${this.observations.additionalConditions}</textarea>
                            </div>
                        </div>
                    </div>
                <label for="">What goals does the boxer wish to achieve?</label>
                ${this._boxerGoalsHTML}
                </form>
                ${this._joinHTML ? this._joinHTML : ""}
            </div>
            <div class="card-footer">
                ${this._buttonHTML ? this._buttonHTML : ""}
            </div>
        </div>
    </div>
        `;
    }
};