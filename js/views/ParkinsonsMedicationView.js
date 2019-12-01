/**
 * Parkinson's Medications View displays the parkinson's medications that fighters can check to all those that apply.
 * @author Cynthia Pham
 * @author Tyler Bezera
 * 2/25/19
 * ParkinsonsMedicationView.js
 */

'use strict';

import View from './View.js';
import ToggleSwitchComponent from './components/ToggleSwitchComponent';
import {generateHTMLfromDatabaseFieldList} from "../helpers/Generators";

/**
 * View class for Parkinson's Medications. Handles template and rendering.
 */
export default class ParkinsonsMedicationView extends View {

    /**
     * ParkinsonsMedication constructor builds the View. Sets subscription to APIController to dynamically add
     * parkinson's medications checkboxes, render, then set form to edit/read mode.
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks)
    {
        super(dataHive, callbacks);
        this.personalInfo = dataHive.personalInfo;
        this.parkinsonsMedications = dataHive.parkinsonsMedications;
        this.newFighterEnrollment = dataHive.newFighterEnrollment;
        this.newExistingAssessment = dataHive.newExistingAssessment;
        this.addAssessment = dataHive.addAssessment;

        if(!this.newFighterEnrollment && !this.addAssessment) {
            this._buttonHTML = `<button class="next-button btn-rsb float-left" data-value="summary"><i
                            class="fas fa-arrow-left"></i>&nbsp;Boxer Profile</button>`;
        } else {
            this._buttonHTML = `<button class="next-button btn-rsb float-right" data-value="healthConditions">Health Conditions&nbsp;<i
                            class="fas fa-arrow-right"></i></button>`;
        }

        if(!this.newFighterEnrollment) {
            this._toggleSwitch = new ToggleSwitchComponent()
                .setId('editModeSwitch')
                .setValue(this.dataHive.fighterModel.getEditStatus())
                ._html();
        }

        this.callbacks.getParkMeds();
        this.subscribeTo('APIController', 'parkMedFields', 'parkMedFieldsRetrieved', (parkMedFields) => {
            this._parkMedsHTML = generateHTMLfromDatabaseFieldList(parkMedFields, "", this.parkinsonsMedications);
            this.render();
            if(this.el.querySelector('#editModeSwitch')) {
                if(this.el.querySelector('#editModeSwitch').value === 'false' || this.el.querySelector('#editModeSwitch').value === false || this.el.querySelector('#editModeSwitch').value === "")
                    View.disableFormFields(this.el, false);
            }

        });
    }

    /**
     * Method that compiles template
     *
     * @returns {string} emergency contact template
     * @private method used for rendering
     */
    _html() {
        return `
        <div class="container">
            <div class="card card-shadow mb-4" style="border: solid 2px #dedede">
                <div class="card-body">
                    ${this._toggleSwitch ? this._toggleSwitch : ""}
                    <div class="card-title">
                        <span style="font-weight: bold">Parkinson's Medications</span> - Please select all the medications <span style="font-weight: bold">${this.personalInfo.firstName} ${this.personalInfo.lastName}</span> takes for Parkinson's Disease.
                    </div>
                    <hr>
                    <form id="ParkMedsForm" class="modern-form editableForm" data-model="parkinsonsMedicationsModel">
                        ${this._parkMedsHTML}
                        <hr>
                    </form>
                </div>
                <div class="card-footer">
                    ${this._buttonHTML}
                </div>
            </div>
        </div>`;
    }
}
