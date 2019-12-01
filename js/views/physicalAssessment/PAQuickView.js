/**
 * Quick forms for PA, for filling out information from a paper assessment.  Has all physical assessments and input fields
 * used for coaches to quickly fill out information.  PA quick form is also used to view and edit previously taken
 * assessments. Coaches won't be able to move on unless all fields are filled.
 *
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 5/17/19
 * PAQuickView.js
 * */


"use strict";

import View from '../View';
import InputComponent from "../components/InputComponent";
import ModalComponent from "../components/ModalComponent";
import { checkPAInputsFilled } from "./PALongView";
import Toastify from "toastify-js";
/**
 * View class PA Quick Form. Handles template and rendering for twelve physical assessments
 */
export default class PAQuickView extends View
{
    /**
     * PAQuickView constructor builds the View for PA's quick form. Sets up subscriptions.
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks)
    {
        super(dataHive, callbacks);
        this.START_DATE = "1970-01-01";
        this.NUM_OF_PAS = 12;
        this._paDate = new Date(dataHive.intakeDate ? dataHive.intakeDate : this.START_DATE);
        this.physicalAssessments = dataHive.physicalAssessments;
        this.addAssessment = this.dataHive.addAssessment;
        this._setupSubscriptions();

        if(this.addAssessment) this._buttonHTML = `<button class="btn-rsb float-right" data-value="paSummary" id="savePA">Physical Summary&nbsp;<i class="fas fa-arrow-right"></i></button>`;
        else this._saveButton = `<button class="btn-rsb float-right p-2 mt-4 mr-2" data-value="paSummary" id="savePA">Save & Back&nbsp;<i style="font-size: 20px;" class="far fa-save"></i></button>`;

        this.subscribeTo('RouteController', 'addSinglePAAssessment','enablePAQuickForm', () =>
        {
            const paForm = this.el.querySelector('#paForm');
            this.addSinglePAAssessment = true;
            View.disableFormFields(paForm, true);
            this._backButton = `<button class="float-right mr-4 mt-4" id="backBtn" style="border:none;background:none;"><i class="fas fa-arrow-circle-left" style="color:#0174DF;
            font-size:40px;"></i></button>`;
            this.render();
        });

        this.subscribeTo('RouteController', 'editPhysical','editPhysical', (date) =>
        {
            this._saveButton = `<button class="btn-rsb float-right p-2 mt-4 mr-2" data-value="assessmentHistory" id="savePA">Save & Back&nbsp;<i style="font-size: 20px;" class="far fa-save"></i></button>`;
            this._populatePA(date).then(() => {
                    this._disableFormFields(true);
                    this.el.querySelector("#DateTaken").disabled = true;
            });
        });
    }

    /**
     * Calls event handler and callback functions after page has rendered.  Assists with saving PA answers
     * from physical assessments taken via paper form or editing PA answers previously taken physical assessments.
     */
    postRenderSetup()
    {
        const paCards = this.el.querySelectorAll(".paCard");
        const dateInput = this.el.querySelector("#DateTaken");
        const paDate = dateInput.value;
        const dateError = this.el.querySelector('span#dateError');
        const paForm = this.el.querySelector('#paForm');
        this.el.querySelector('#tugTime').step = "any";

        if((this.addSinglePAAssessment || this.addAssessment) &&
            (paDate !== new Date(this.START_DATE) && this.physicalAssessments._physicalAssessments.get(paDate) && this.physicalAssessments._physicalAssessments.get(paDate).length > 0)) {
            dateError.innerHTML = "An assessment with this date already exists, please set to another date before continuing.";
            if(!dateInput.classList.contains("shakeError")) dateInput.classList.add("shakeError");
            this.callbacks.changeEditStatus(false);
            this.el.querySelector("#savePA").style.display = "none";
            dateInput.disabled = false;
            this._paDate = new Date(this.START_DATE);
        }

         dateInput.onchange = (event) => {
            const newDate = new Date(event.target.value);
            let error = "";
            if(newDate !== new Date(this.START_DATE)) {
                const physicalAssessment = this.physicalAssessments._physicalAssessments.get(newDate.toInputString());
                if(physicalAssessment && physicalAssessment.length > 0) {
                    error = "An assessment with this date already exists, please set to another date before continuing.";
                    dateError.innerHTML = error;
                    if(!dateInput.classList.contains("shakeError")) dateInput.classList.add("shakeError");
                    View.disableFormFields(paForm, false);
                    this.el.querySelector("#savePA").style.display = "none";
                    dateInput.disabled = false;
                } else {
                    dateError.innerHTML = "";
                    if(dateInput.classList.contains("shakeError")) dateInput.classList.remove("shakeError");
                    View.disableFormFields(paForm, true);
                    this.el.querySelector("#savePA").style.display = "";

                    this.physicalAssessments.changeAssessmentDate(this._paDate.toInputString(), newDate.toInputString());
                    this._paDate = newDate;
                }
            }
        };

        paCards.forEach((paCard) => {
            paCard.onchange = (event) => {
                if(event.target.value && checkPAInputsFilled(paCard)) {
                    const paScore = {};
                    const paAdditionalData = [];
                    paCard.querySelectorAll('.paInfo').forEach((input) => {
                        if (input.type === 'radio' && paCard.querySelector('input[type="radio"]:checked')) {
                            paScore['assessmentNum'] = input.name;
                            paScore['assessmentScore'] = paCard.querySelector('input[type="radio"]:checked').value;
                        } else if (input.type === 'number' && input.value) {
                            paScore['assessmentNum'] = input.dataset.assessmentnum;
                            if(!paCard.querySelector('input[type="radio"]')) {
                                paScore['assessmentScore'] = input.value;
                            } else {
                                paAdditionalData.push({
                                    dataName: input.name,
                                    dataValue: input.value})
                            }
                        }
                    });
                    this.physicalAssessments.addPAScore(paScore.assessmentNum, paScore.assessmentScore,
                        paAdditionalData, this._paDate.toInputString());
                }
            }
        });

        //when button to save physical assessment is clicked
        this.el.querySelector("#savePA").onclick = (event) => {
            let error = "";
            if(!this._paDate.isValid() || this._paDate.toInputString() === this.START_DATE) error += `Please enter a valid date.<br>`;

            let unfilledPAsArray = this._retrieveUnfilledPAs();
            if(unfilledPAsArray.length > 0) error += `You'll need to complete physical test${unfilledPAsArray.length > 1 ? "s:" : ":"} ${String(unfilledPAsArray.join(', '))} before continuing.`;
            if(error){
                const errorModal = new ModalComponent({
                    footer: true,
                    stickFooter: false,
                    closeMethods: ['button']
                }).setContent(`<div>
                    <h3>Whoops, the PA form isn't complete!</h3>
                    <hr>
                    <h5>${error}</h5>
                    </div>`).setFooterButtons([{
                        label: "Got it",
                        cssClass: 'tingle-btn tingle-btn--primary',
                        callback: () => {
                            errorModal.closeModal();
                        }
                    }]).openModal();
            } else {
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
                this.callbacks.savePA(this.physicalAssessments._physicalAssessments);
                this.callbacks.nextPage(event.target.dataset.value);
            }
        };

        //when back button is clicked
        if(this._backButton) this.el.querySelector('#backBtn').onclick = () => {
            if(this._retrieveUnfilledPAs().length < this.NUM_OF_PAS) {
                const errorModal = new ModalComponent({
                    footer: true,
                    stickFooter: false,
                    closeMethods: ['button']})
                    .setContent(`<div>
                                <h3>Are you sure?</h3>
                                <hr>
                                <h5>Going back to the PA summary will lose all of your unsaved changes.</h5>
                            </div>`)
                    .setFooterButtons([{
                        label: "Yes, go back",
                        cssClass: 'tingle-btn tingle-btn--primary',
                        callback: () => {
                            errorModal.closeModal();
                            this.physicalAssessments._physicalAssessments.delete(this._paDate.toInputString());
                            this.callbacks.nextPage('paSummary');
                        }
                    }, {
                        label: "Close",
                        cssClass: 'tingle-btn tingle-btn--primary',
                        callback: () => {
                            errorModal.closeModal();
                        }
                    }])
                    .openModal();
            } else {
                this.callbacks.nextPage('paSummary');
            }
        }
    }

    /**
     * Disable Physical Assessment form fields depending on editBoolean
     * @param editBoolean, true - will make form fields editable. false - form fields are disabled
     * @private
     */
    _disableFormFields(editBoolean) {
        const paForm = this.el.querySelector("#paForm");
        View.disableFormFields(paForm, editBoolean);
    }

    /**
     * Checks the PA form for unfilled physical test inputs and returns an array of the assessment
     * @returns {Array}
     * @private
     */
    _retrieveUnfilledPAs() {
        let unfilledPASet = new Set();
        const paCards = this.el.querySelectorAll('.paCard');
        for(let paCard of paCards) {
            const paRadio = paCard.querySelector('input[type="radio"]');
            if(paRadio) {
                if(!paCard.querySelector('input[type="radio"]:checked')) unfilledPASet.add(this.physicalAssessments._getAssessmentName(paRadio.name));
            }
            const paNum = paCard.querySelector('input[type="number"]');
            if(paNum) {
                if(!paCard.querySelector('input[type="number"]').value) unfilledPASet.add(this.physicalAssessments._getAssessmentName(paNum.dataset.assessmentnum));
            }
        }
        return Array.from(unfilledPASet);
    }

    /**
     * Formats the individual PA card  that contains all of the form fields for a specific physical test
     * @returns {string} - HTML template
     * @private
     */
    _formatPACard(assessmentNum, paInfoObject)
    {
        const paTestCardComponents = {
            testTypeName: "",
            additionalDataInputs: "",
            radioButtons: ""
        };

        paTestCardComponents.testTypeName = paInfoObject.type;

        if(paInfoObject.scoring && Object.keys(paInfoObject.scoring).length) {
            Object.keys(paInfoObject.scoring).forEach( (score) => {
                paTestCardComponents.radioButtons += `<label class="control control--radio ml-2 ml-md-4 ml-lg-5 mr-lg-3">${score}
                                                                 <input type="radio" class="paInfo" name="${assessmentNum}" value="${score}"/>
                                                                 <div class="control__indicator"></div>
                                                              </label>`;
            });
        }

        if(assessmentNum === '3') {
            paTestCardComponents.additionalDataInputs = `<div class="form-group row col-10 offset-3 offset-md-2 pl-2 pl-md-4 pl-lg-5">
                                                            <div class="col-xs-2 mr-4">
                                                                ${new InputComponent()
                                                                    .setId('turnLeftSteps')
                                                                    .setType('number')
                                                                    .setClasses('form-control paInfo')
                                                                    .setName('turnLeftSteps')
                                                                    .setValue(null)
                                                                    .setData('assessmentNum', assessmentNum)
                                                                    .setLabel('Number of Left Steps: ')
                                                                    ._html()}
                                                            </div>
                                                            <div class="col-xs-2">
                                                                ${new InputComponent()
                                                                .setId('turnRightSteps')
                                                                .setType('number')
                                                                .setClasses('form-control paInfo')
                                                                .setName('turnRightSteps')
                                                                .setValue(null)
                                                                .setData('assessmentNum', assessmentNum)
                                                                .setLabel('Number of Right Steps: ')
                                                                ._html()}
                                                            </div>
                                                        </div>`;
        } else if(assessmentNum === '8') {
            paTestCardComponents.additionalDataInputs = `<div class="col-10 offset-3 offset-md-2 pl-2 pl-md-4 pl-lg-5">
                                                            ${new InputComponent()
                                                            .setId('jumpInches')
                                                            .setType('number')
                                                            .setClasses('form-control paInfo')
                                                            .setName('jumpInches')
                                                            .setValue(null)
                                                            .setData('assessmentNum', assessmentNum)
                                                            .setLabel('Inches from Jump: ')
                                                            ._html()}
                                                        </div>`;
        } else if(assessmentNum === '11') {
            paTestCardComponents.additionalDataInputs = `<div class="ml-2 ml-md-4 ml-lg-5">
                                                            ${new InputComponent()
                                                            .setId('s2sRepetitions')
                                                            .setType('number')
                                                            .setClasses('form-control paInfo')
                                                            .setName('s2sRepetitions')
                                                            .setValue(null)
                                                            .setData('assessmentNum', assessmentNum)
                                                            .setLabel('Repetitions: ')
                                                            ._html()}
                                                        </div>`;
        } else if(assessmentNum === '12') {
            paTestCardComponents.additionalDataInputs = `<div class="ml-2 ml-md-4 ml-lg-5">
                                                            ${new InputComponent()
                                                            .setId('tugTime')
                                                            .setType('number')
                                                            .setClasses('form-control paInfo')
                                                            .setName('tugTime')
                                                            .setValue(null)
                                                            .setData('assessmentNum', assessmentNum)
                                                            .setLabel('Time in Seconds: ')
                                                            ._html()}
                                                        </div>`;
        }

        return `<div class="form-row ml-2 ml-md-5 mt-2 paCard">
                    <div class="card-title col-3 col-md-2"><p>${paTestCardComponents.testTypeName + "/" +this.physicalAssessments._getAssessmentName(assessmentNum)}</p></div>
                        ${paTestCardComponents.radioButtons}
                        ${paTestCardComponents.additionalDataInputs}
                </div>`;
    }

    /**
     * Formats the PA Quick form that contains all physical assessments cards.
     * @returns {string} - HTML template
     * @private
     */
    _formatPAForm()
    {
        let returnString = "";
        this.dataHive.physicalAssessmentInfo.forEach((paInfoObject, assessmentNum) => {
            returnString += this._formatPACard(assessmentNum, paInfoObject);
        });
        return returnString;
    }

    /**
     * Populates checked radio buttons and input fields according to the answers from a taken physical assessment
     * @param paDate - date in format yyyy-MM-dd used to retrieve taken physical assessment
     * @private
     */
    async _populatePA(paDate)
    {
        await this.render();
        this.el.querySelector("#DateTaken").value = paDate;
        this._paDate = new Date(paDate);

        const physicalAssessment = this.physicalAssessments._physicalAssessments.get(this._paDate.toInputString());
        for(let paObject of physicalAssessment) {
            if(paObject.assessmentData) {
                paObject.assessmentData.forEach((assessmentData) => {
                    this.el.querySelector('input#' + assessmentData.dataName).value = assessmentData.dataValue;
                })
            }
            if(paObject.assessmentName === 'Sit to Stand') {
                this.el.querySelector('#s2sRepetitions').value = paObject.assessmentScore;
            } else if(paObject.assessmentName === 'Up and Go') {
                this.el.querySelector('#tugTime').value = paObject.assessmentScore;
            } else {
                this.el.querySelector('.paInfo[type="radio"][name="' +
                    this.physicalAssessments.getAssessmentNum(paObject.assessmentName) +
                    '"][value="' + paObject.assessmentScore + '"]').checked = true;
            }
        }
    }

    /**
     * Returns HTML template that will display a page with all 12 physical assessment score options and form fields
     * @returns {string} - HTML template
     * @private
     */
    _html()
    {
        return `
            <div class="container">
                <div class="card card-shadow mb-4" style="border: solid 2px #dedede">
                    <div class="card-body">
                        ${this._saveButton ? this._saveButton : ""}
                        ${this._backButton ? this._backButton : ""}
                        <div id="paForm">
                            <form class="editableForm">
                                <div class="row">
                                    <div class="col-xs-2 ml-5">
                                        Date Taken:&emsp;<input type="date" class="form-control" value="${this._paDate.toInputString()}" id="DateTaken" name="DateTaken">
                                    </div>
                                    <span id="dateError" class="col-12 ml-5 pl-0" style="color:#007bff;font-size:16px;"></span>
                                </div>
                                <div class="row">
                                    <div class="col-12">
                                        <hr>
                                        ${this._formatPAForm()}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div class="card-footer">
                        ${this._buttonHTML ? this._buttonHTML : ""}
                    </div>
                </div>
            </div>`;
    }

    /**
     * Sets up subscriptions to class events.  Assists with populating scores on PA quick form once
     * Route Controller fires event that a fighter has decide to view the whole version of a PA from the Summary View.
     * @private
     */
    _setupSubscriptions()
    {
        this.subscribeTo('RouteController', 'populatePAForm',
            'populatePAForm', (paDate) =>
            {
                this._populatePA(paDate);
            });
    }
}




