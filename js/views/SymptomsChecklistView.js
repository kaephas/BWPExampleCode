/**
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 5/16/19
 * EmergencyContact.js
 */


'use strict';

import View from './View.js';
import CheckBoxComponent from './components/CheckBoxComponent';
import InputComponent from './components/InputComponent';
import ToggleSwitchComponent from './components/ToggleSwitchComponent';
import {generateHTMLfromDatabaseFieldList, oneColumnRowFormatter, oneRowFormatter} from "../helpers/Generators";

/**
 * View class for Parkinson's symptoms. Handles template and rendering.
 */
export default class SymptomsChecklistView extends View
{
    /**
     * SymptomsChecklistView constructor builds the View
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks)
    {
        super(dataHive, callbacks);
        this.personalInfo = dataHive.personalInfo;
        this.parkinsonSymptoms = dataHive.parkinsonSymptoms;
        this.newFighterEnrollment = dataHive.newFighterEnrollment;
        this.addAssessment = dataHive.addAssessment;

        if(!this.newFighterEnrollment && !this.addAssessment) {
            this._buttonHTML = `<button class="next-button btn-rsb float-left" data-value="summary"><i
                            class="fas fa-arrow-left"></i>&nbsp;Boxer Profile</button>`;
        } else {
            this._buttonHTML = `<button class="next-button btn-rsb float-right" data-value="parkinsonsMedications">Parkinson's Medications&nbsp;<i
                            class="fas fa-arrow-right"></i></button>`;
        }

        if(!this.newFighterEnrollment) {
            this._toggleSwitch = new ToggleSwitchComponent()
                .setId('editModeSwitch')
                .setValue(this.dataHive.fighterModel.getEditStatus())
                ._html();
        }

        this.callbacks.getSymptomFields();
        this.subscribeTo('APIController', 'parkSymptomsFields', 'parkSymptomsFieldsRetrieved', (parkSymptomsFields) => {
            this._tremorsHTML = generateHTMLfromDatabaseFieldList(parkSymptomsFields.tremors, "tremors", this.parkinsonSymptoms, oneRowFormatter);
            this._posturalChangesHTML = generateHTMLfromDatabaseFieldList(parkSymptomsFields.posturalChanges, "posturalChanges", this.parkinsonSymptoms, oneRowFormatter);
            this._assistiveDevicesHTML = generateHTMLfromDatabaseFieldList(parkSymptomsFields.assistiveDevices, "assistiveDevice", this.parkinsonSymptoms, oneRowFormatter);
            this._parkinsonSymptomsHTML = generateHTMLfromDatabaseFieldList(parkSymptomsFields.parkinsonSymptoms, "", this.parkinsonSymptoms, oneColumnRowFormatter);
            this.render();
            if(this.el.querySelector('#editModeSwitch')) {
                if (this.el.querySelector('#editModeSwitch').value === 'false' || this.el.querySelector('#editModeSwitch').value === false || this.el.querySelector('#editModeSwitch').value === "")
                    View.disableFormFields(this.el, false);
            }
        });
    }

    /**
     * Method that compiles template
     *
     * @returns {string} parkinson's symptom's template
     * @private method used for rendering
     */
    _html()
    {
        return `
        <div class="container">
            <div class="card card-shadow mb-4" style="border: solid 2px #dedede">
                <div class="card-body">
                    ${this._toggleSwitch ? this._toggleSwitch : ""}
                    <div class="card-title">
                        <span style="font-weight: bold;">Parkinson's Symptoms Checklist</span> - Please select all the symptoms <span style="font-weight: bold;">${this.personalInfo.firstName} ${this.personalInfo.lastName}</span> has from Parkinson's Disease.
                    </div>
                    <hr>
                    <form id="symptomsChecklistForm" class="modern-form editableForm" data-model="parkinsonSymptomsModel">
                        <div class="row mb-4">
                            <div class="col-7 col-sm-5 col-md-4 col-lg-3">
                                ${new InputComponent()
                                .setId('firstSymptomsDate')
                                .setClasses('form-control')
                                .setName('firstSymptomsDate')
                                .setPlaceholder('mm/dd/yyyy')
                                .setValue(this.parkinsonSymptoms.firstSymptomsDate ? new Date(this.parkinsonSymptoms.firstSymptomsDate).toMonthInputString() : "")
                                .setLabel('First Symptoms Date')
                                .setType('month')
                                ._html()}
                            </div>
                            <div class="col-7 col-sm-5 col-md-4 col-lg-3">    
                                ${new InputComponent()
                                .setId('diagnosisDate')
                                .setClasses('form-control')
                                .setName('diagnosisDate')
                                .setPlaceholder('mm/dd/yyyy')
                                .setValue(this.parkinsonSymptoms.diagnosisDate ? new Date(this.parkinsonSymptoms.diagnosisDate).toMonthInputString() : "")
                                .setLabel('Diagnosis Date')
                                .setType('month')
                                ._html()}
                            </div>
                        </div>
                        <hr>
                        <label for="">Tremors</label><div class="multiCheckboxes">${this._tremorsHTML}</div>
                        <hr>
                        <label for="">Postural Changes</label><div class="multiCheckboxes">${this._posturalChangesHTML}</div>
                        <hr>
                        <label for="">Assistive Device</label><div class="multiCheckboxes">${this._assistiveDevicesHTML}</div>
                        <hr>
                        ${this._parkinsonSymptomsHTML}
                    </form>
                </div>
                <div class="card-footer">
                    ${this._buttonHTML}
                </div>
            </div>
        </div>
        ;`
    }
};