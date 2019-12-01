/**
 * Emergency Contact page, for filling out information on fighter's single emergency contact
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 5/16/19
 * EmergencyContact.js
 */

'use strict';

import View from './View.js';
import InputComponent from './components/InputComponent';
import SelectComponent from './components/SelectComponent';
import ToggleSwitchComponent from './components/ToggleSwitchComponent';

/**
 * View class for Emergency Contact. Handles template and rendering.
 */
export default class EmergencyContactView extends View
{
    /**
     * EmergencyContactView constructor builds the View
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks)
    {
        super(dataHive, callbacks);
        this.personalInfo = dataHive.personalInfo;
        this.emergencyInfo = dataHive.emergencyInfo;
        this.newFighterEnrollment = dataHive.newFighterEnrollment;
        this.addAssessment = dataHive.addAssessment;

        if(!this.newFighterEnrollment && !this.addAssessment) {
            this._buttonHTML = `<button class="next-button btn-rsb float-left" data-value="summary"><i
                            class="fas fa-arrow-left"></i>&nbsp;Boxer Profile</button>`;
        } else {
            this._buttonHTML = `<button class="next-button btn-rsb float-right" data-value="parkinsonSymptoms">PD Symptoms&nbsp;<i
                            class="fas fa-arrow-right"></i></button>`;
        }

        if(!this.newFighterEnrollment) {
            this._toggleSwitch = new ToggleSwitchComponent()
                .setId('editModeSwitch')
                .setValue(this.dataHive.fighterModel.getEditStatus())
                ._html();
        }
    }

    /**
     * Method that compiles template
     *
     * @returns {string} emergency contact template
     * @private method used for rendering
     */
    _html()
    {
        return `
        <div class="container">
            <div class="card card-shadow" style="border: solid 2px #dedede;">
                <div class="card-body">
                    ${this._toggleSwitch ? this._toggleSwitch : ""}
                    <div class="card-title" style="font-weight: bold;">
                        Emergency Contact - ${this.personalInfo.firstName} ${this.personalInfo.lastName}
                    </div>
                    <hr>
                    <form id="emergencyContact" class="modern-form editableForm" data-model="emergencyContactModel">
                        <div class="row">
                            <div class="col-6">
                                ${new InputComponent()
                                    .setId('emergencyContactName')
                                    .setClasses('form-control')
                                    .setName('contactName')
                                    .setValue(this.emergencyInfo.contactName)
                                    .setLabel('Contact Name')
                                    ._html()}
                            </div>
                            <div class="col-6">
                                ${new InputComponent()
                                    .setId('emergencyContactRelation')
                                    .setClasses('form-control')
                                    .setName('relationship')
                                    .setValue(this.emergencyInfo.relationship)
                                    .setLabel('Relationship')
                                    ._html()}
                            </div>
                        </div>
                        <hr>
                        <div class="row">
                            <div class="col-6">
                                ${new InputComponent()
                                    .setId('emergencyNumberCell')
                                    .setClasses('form-control')
                                    .setType('tel')
                                    .setName('phone').setData('field', 'primaryPhone')
                                    .setValue(this.emergencyInfo.phone.primaryPhone)
                                    .setLabel('Primary Number')
                                    .setPlaceholder('(123) 456-7890')
                                    ._html()}
                            </div>
                            <div class="col-6">
                                ${new InputComponent()
                                    .setId('emergencyNumberHome')
                                    .setClasses('form-control')
                                    .setType('tel')
                                    .setName('phone').setData('field', 'secondaryPhone')
                                    .setValue(this.emergencyInfo.phone.secondaryPhone)
                                    .setLabel('Secondary Number')
                                    .setPlaceholder('(123) 456-7890')
                                    ._html()}
                            </div>
                            <div class="col-7 col-md-6">
                                ${new InputComponent()
                                    .setId('emergencyContactEmail')
                                    .setClasses('form-control')
                                    .setType('email')
                                    .setName('email')
                                    .setValue(this.emergencyInfo.email)
                                    .setLabel('Email')
                                    ._html()}
                            </div>
                        </div>
                        <hr>
                        <div class="row">
                            <div class="col-5">
                                ${new InputComponent()
                                    .setId('emergencyContactCity')
                                    .setClasses('form-control')
                                    .setName('city')
                                    .setValue(this.emergencyInfo.city)
                                    .setLabel('City')
                                    ._html()}
                            </div>
                            <div class="col-3">
                                ${new SelectComponent(['AL','AK','AS','AZ','AR','CA','CO','CT','DE','DC','FM','FL','GA',
                                                        'GU','HI','ID','IL','IN','IA','KS','KY','LA','ME','MH','MD','MA',
                                                        'MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND',
                                                        'MP','OH','OK','OR','PW','PA','PR','RI','SC','SD','TN','TX','UT',
                                                        'VT','VI','VA','WA','WV','WI','WY'])
                                    .setId('emergencyContactState')
                                    .setClasses('form-control')
                                    .setName('state')
                                    .setValue(this.emergencyInfo.state)
                                    .setLabel('State')
                                    ._html()}
                            </div>
                            <div class="col-4">
                                ${new InputComponent()
                                    .setId('emergencyContactZIP')
                                    .setClasses('form-control')
                                    .setName('zipCode')
                                    .setValue(this.emergencyInfo.zipCode)
                                    .setLabel('Zip Code')
                                    .setData('pattern', '[0-9]{5}')
                                    .setType('number')
                                    ._html()}
                            </div>
                        </div>
                        <hr>
                    </form>
                </div>
                <div class="card-footer">
                    ${this._buttonHTML}
                </div>
            </div>
        </div>
        `;
    }
}