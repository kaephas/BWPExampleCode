/**
 * Health Conditions page, for filling out the health and heart conditions that the fighter has.
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 5/16/19
 * HealthConditions.js
 */


'use strict';

import View from './View.js';
import ToggleSwitchComponent from './components/ToggleSwitchComponent';
import {generateHTMLfromDatabaseFieldList} from "../helpers/Generators";

/**
 * View class for Health Conditions. Handles template and rendering.
 */
export default class HealthConditionsView extends View
{
    /**
     * HealthConditionsView constructor builds the View
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks)
    {
        super(dataHive, callbacks);
        this.fighterName = dataHive.fighterFirstName + " " + dataHive.fighterLastName;
        this.healthConditions = dataHive.healthConditions;
        this.newFighterEnrollment = dataHive.newFighterEnrollment;
        this.addAssessment = dataHive.addAssessment;
        this.newExistingAssessment = dataHive.newExistingAssessment;

        if(!this.newFighterEnrollment && !this.addAssessment) {
            this._buttonHTML = `<button class="next-button btn-rsb float-left" data-value="summary"><i
                            class="fas fa-arrow-left"></i>&nbsp;Boxer Profile</button>`;
        } else {
            this._buttonHTML = `<button class="btn-rsb float-right" id="beginAssess">Begin Assessment&nbsp;<i class="fas fa-arrow-right"></i></button>`;
        }

        if(!this.newFighterEnrollment) {
            this._toggleSwitch = new ToggleSwitchComponent()
                .setId('editModeSwitch')
                .setValue(this.dataHive.fighterModel.getEditStatus())
                ._html();
        }

        this.callbacks.getHealthFields();
        this.subscribeTo('APIController', 'healthFields', 'healthFieldsRetrieved', (healthFields) => {
            this._healthConditionsHTML = generateHTMLfromDatabaseFieldList(healthFields.health, "health", this.healthConditions);
            this._heartConditionsHTML = generateHTMLfromDatabaseFieldList(healthFields.heart, "heart", this.healthConditions);
            this.render();
            if(this.el.querySelector('#editModeSwitch')) {
                if (this.el.querySelector('#editModeSwitch').value === 'false' || this.el.querySelector('#editModeSwitch').value === false || this.el.querySelector('#editModeSwitch').value === "")
                    View.disableFormFields(this.el, false);
            }
        });
    }

    /**
     * Calls event handler and callback functions after page has rendered
     */
    postRenderSetup()   {
        const beginAssessBtn = this.el.querySelector('#beginAssess');
        if(beginAssessBtn) beginAssessBtn.onclick = () => {console.log(this.newExistingAssessment);
        this.callbacks.addAssessment({newExistingAssessment: this.newExistingAssessment})};
    }

    /**
     * Method that compiles template
     *
     * @returns {string} health/heart conditions template
     * @private method used for rendering
     */
    _html()
    {
        return `
        <div class="container">
        <div class="card card-shadow" style="border: solid 2px #dedede">
            <div class="card-body">
                ${this._toggleSwitch ? this._toggleSwitch : ""}
                <div class="card-title">
                    <span style="font-weight: bold">Health Conditions</span> - Please select all the conditions for which <span style="font-weight: bold">${this.fighterName}</span> takes medication.
                </div>    
                <form id="HealthConditionsForm" class="modern-form editableForm" data-model="healthAndHeartModel">
                    <hr>
                        ${this._healthConditionsHTML}
                    <hr>
    <!--heart conditions-->
                    <div class="card-title"><span style="font-weight: bold">Heart Conditions</span> - Please select all heart conditions that <span style="font-weight: bold">${this.fighterName}</span> has.</div>
                    <hr>
                        ${this._heartConditionsHTML}
                    <hr>
                </form>
            </div>
            <div class="card-footer">
                ${this._buttonHTML}
            </div>
        </div>
    </div>`;
    }
};

