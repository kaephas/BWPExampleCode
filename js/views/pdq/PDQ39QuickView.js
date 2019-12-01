/**
 * Quick forms for PDQ, for filling out information from a paper assessment
 * @author Tyler Bezera
 * 5/16/19
 * PDQ39QuickView.js
 */

"use strict";

import View from '../View';
import ModalComponent from "../components/ModalComponent";
import PDQKeywords from "../../../resources/pdqKeywords";
import PDQModel from "../../models/PDQModel";
import Toastify from "toastify-js";

/**
 * View class PDQ39 Quick Form. Handles template and rendering for PDQ's 39 questions.
 */
export default class PDQ39QuickView extends View
{
    /**
     * PDQ39QuickView constructor builds the View for PDQ's quick form and sets up subscriptions.
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks)
    {
        super(dataHive, callbacks);
        this.START_DATE = "1970-01-01";
        this._pdqDate = new Date(dataHive.intakeDate ? dataHive.intakeDate : this.START_DATE);
        this.PDQMAX = 39;
        this.pdq = dataHive.pdq;
        this.addAssessment = dataHive.addAssessment;
        if(this.addAssessment) this._buttonHTML = `<button class="btn-rsb float-right" data-value="pdqSummary" id="savePDQ">PDQ Summary&nbsp;<i class="fas fa-arrow-right"></i></button>`;
        else this._saveButton = `<button class="btn-rsb float-right p-2 mt-4 mr-2" data-value="pdqSummary" id="savePDQ">Save & Back&nbsp;<i style="font-size: 20px;" class="far fa-save"></i></button>`;

        this.subscribeTo('RouteController', 'viewCompletePDQ','viewCompletePDQ', (data) =>
        {
            this._saveButton = `<button class="float-right next-button btn-rsb mt-3 mr-4" data-value="${data.requestingRoute}"
                style="border:none;background:none;"><i class="fas fa-arrow-circle-left" style="color:#0174DF; 
                font-size:40px;"></i></button>`;
            this._populatePDQ(data.pdqDate);
            this._disableFormFields(false);
        });

        this.subscribeTo('RouteController', 'editPDQ','editPDQ', (date) =>
        {
            this._saveButton = `<button class="btn-rsb float-right p-2 mt-4 mr-2" data-value="assessmentHistory" id="savePDQ">Save & Back&nbsp;<i style="font-size: 20px;" class="far fa-save"></i></button>`;
            this._populatePDQ(date).then(() => {
                this._disableFormFields(true);
                this.el.querySelector("#DateTaken").disabled = true;
            });
        });

        this.subscribeTo('RouteController', 'addSinglePDQAssessment','enablePDQQuickForm', () =>
        {
            this._disableFormFields(true);
            this._backButton = `<button class="float-right mr-4 mt-4" id="backBtn" style="border:none;background:none;"><i class="fas fa-arrow-circle-left" style="color:#0174DF; 
            font-size:40px;"></i></button>`;
            this.addSinglePDQAssessment = true;
            this.render();
        });
    }

    /**
     * Calls event handler and callback functions after page has rendered. Assists with saving selected PDQ answer
     * in new or previously taken pdq assessments.
     */
    postRenderSetup()
    {
        const dateInput = this.el.querySelector("#DateTaken");
        const pdqForm = this.el.querySelector("#pdqForm");
        const saveBtn = this.el.querySelector("#savePDQ");
        const dateError = this.el.querySelector("#dateError");
        const pdqDate = dateInput.value;

        if((this.addSinglePDQAssessment || this.addAssessment) &&
        (pdqDate !== new Date(this.START_DATE) && this.pdq._pdqAssessments.get(pdqDate) && this.pdq._pdqAssessments.get(pdqDate).length > 0)) {
            dateError.innerHTML = "An assessment with this date already exists, please set to another date before continuing.";
            if(!dateInput.classList.contains("shakeError")) dateInput.classList.add("shakeError");
            View.disableFormFields(pdqForm, false);
            this.el.querySelector("#savePDQ").style.display = "none";
            dateInput.disabled = false;
            this._pdqDate = new Date(this.START_DATE);
        }

        pdqForm.onchange = (event) => {
            const question = event.target;
            if(question.classList.contains("existPDQInfo")){
                this.pdq.addPdqQuestion(question.name, question.value, 0, this._pdqDate.toInputString());
            }
        };

        dateInput.onchange = (event) => {
            const newDate = new Date(event.target.value);
            let error = "";
            if(newDate !== new Date(this.START_DATE)) {
                const pdqAssessment = this.pdq._pdqAssessments.get(newDate.toInputString());
                if(pdqAssessment && pdqAssessment.length > 0) {
                    error = "An assessment with this date already exists, please set to another date before continuing.";
                    dateError.innerHTML = error;
                    if(!dateInput.classList.contains("shakeError")) dateInput.classList.add("shakeError");
                    console.log("disabling");
                    View.disableFormFields(pdqForm, false);
                    this.el.querySelector("#savePDQ").style.display = "none";
                    dateInput.disabled = false;
                } else {
                    dateError.innerHTML = "";
                    if(dateInput.classList.contains("shakeError")) dateInput.classList.remove("shakeError");
                    View.disableFormFields(pdqForm, true);
                    this.el.querySelector("#savePDQ").style.display = "";

                    this.pdq.changeAssessmentDate(this._pdqDate.toInputString(), newDate.toInputString());
                    this._pdqDate = newDate;
                }
            }
        };

        if(saveBtn) {
            saveBtn.onclick = (event) => {
                let error = "";
                if(!this._pdqDate.isValid() || this._pdqDate.toInputString() === this.START_DATE) error += `Please enter a valid date.<br>`;

                const unfilledPDQsArray = this._retrieveUnfilledPDQs();
                if(unfilledPDQsArray.length > 0) {
                    error += `You'll need to fill out question${(unfilledPDQsArray.length > 1 ? "s " : " ") + String(unfilledPDQsArray.join(", "))} before continuing.`;
                }
                if(error) {
                    const errorModal = new ModalComponent({
                        footer: true,
                        stickFooter: false,
                        closeMethods: ['button']})
                        .setContent(`<div>
                            <h3>Whoops, the PDQ form isn't complete!</h3>
                            <hr>
                            <h5>${error}</h5>
                            </div>`)
                        .setFooterButtons([{
                            label: "Got it!",
                            cssClass: 'tingle-btn tingle-btn--primary',
                            callback: () => {
                                errorModal.closeModal();
                            }
                        }])
                        .openModal();
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
                    this.callbacks.savePDQ(this.pdq._pdqAssessments);
                    this.callbacks.nextPage(event.target.dataset.value);
                }
            }
        }

        if(this._backButton) this.el.querySelector('#backBtn').onclick = () => {
            if(this._retrieveUnfilledPDQs().length < this.PDQMAX) {
                const errorModal = new ModalComponent({
                    footer: true,
                    stickFooter: false,
                    closeMethods: ['button']})
                    .setContent(`<div>
                                <h3>Are you sure?</h3>
                                <hr>
                                <h5>Going back to the PDQ summary will lose all of your unsaved changes.</h5>
                            </div>`)
                    .setFooterButtons([{
                        label: "Yes, go back",
                        cssClass: 'tingle-btn tingle-btn--primary',
                        callback: () => {
                            errorModal.closeModal();
                            this.pdq._pdqAssessments.delete(this._pdqDate.toInputString());
                            this.callbacks.nextPage('pdqSummary');
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
                this.callbacks.nextPage('pdqSummary');
            }
        }
    }

    /**
     * Disable PDQ form fields depending on editBoolean
     * @param editBoolean, true - will make form fields editable. false - form fields are disabled
     * @private
     */
    _disableFormFields(editBoolean) {
        const pdqForm = this.el.querySelector("#pdqForm");
        View.disableFormFields(pdqForm, editBoolean);
    }

    /**
     * Returns HTML template for all of the PDQ's questions
     * @returns {string} HTML template
     * @private
     */
    _formatPDQQuestionsForm()
    {
        const pdqCategoryTitle = {
            11: "Daily Living",
            37: "Aches & Pains"
        };

        let returnString = "";
        this.dataHive.pdqQuestions.forEach((value, key) => {
        switch (key) {
            case 1:
            case 17:
            case 23:
            case 27:
            case 30:
            case 34:
                returnString += `<div class="col-12 mb-3"><u>${PDQModel.getPDQQuestionCategory(key)}</u></div>`;
                break;
        }
        if(key === 11 || key === 37) returnString += `<div class="col-12 mb-3"><u>${pdqCategoryTitle[key]}</u></div>`;

        returnString +=
            `<div class="form-row ml-3 mt-2 existPDQAnswer d-flex justify-content-around">
                <div class="card-title col-sm-3"><p>${key}.  ${PDQKeywords[key]}?</p></div>
                <label class="control control--radio ml-md-3">N
                    <input type="radio" class="existPDQInfo" name="${key}" value="1"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control control--radio ml-3">Oc
                    <input type="radio" class="existPDQInfo" name="${key}" value="0.75"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control control--radio ml-3">S
                    <input type="radio" class="existPDQInfo" name="${key}" value="0.5"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control control--radio ml-3">Of
                    <input type="radio" class="existPDQInfo" name="${key}" value="0.25"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control control--radio ml-3">A
                    <input type="radio" class="existPDQInfo" name="${key}" value="0"/>
                    <div class="control__indicator"></div>
                </label>
            </div>`;
        });
        return returnString;
    }

    /**
     * Checks the PDQ form for unfilled radio buttons and returns the array of pdq question #
     * @returns {Array} an array of unfilled pdq question numbers
     * @private
     */
    _retrieveUnfilledPDQs() {
        let unfilledPDQSet = new Set();
        const pdqQuestions = this.el.querySelectorAll('.existPDQAnswer');
        for(let pdqQuestion of pdqQuestions) {
            if(!pdqQuestion.querySelector('input[type="radio"]:checked')) unfilledPDQSet.add(pdqQuestion.querySelector('input[type="radio"]').name);
        }
        return Array.from(unfilledPDQSet);
    }

    /**
     * Populates checked radio buttons according to the answers from a taken pdq assessment
     * @param pdqDate - date in format yyyy-MM-dd used to retrieve taken pdq assessment
     * @private
     */
    async _populatePDQ(pdqDate)
    {
        await this.render();
        this.el.querySelector("#DateTaken").value = pdqDate;
        this._pdqDate = new Date(pdqDate);

        const pdqAssessment = this.pdq._pdqAssessments.get(this._pdqDate.toInputString());
        for(let pdqObject of pdqAssessment) {
            this.el.querySelector('.existPDQInfo[name="' +
                pdqObject.questionID + '"][value="' + pdqObject.answer + '"]').checked = true;
        }
    }

    /**
     * Returns HTML template that will display a page with all 39 PDQ questions
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
                        <div id="pdqForm">
                            <form class="editableForm">
                                <div class="row">
                                    <div class="col-xs-2 ml-5">
                                        Date Taken:&emsp;<input type="date" class="form-control" value="${this._pdqDate.toInputString()}" id="DateTaken" name="DateTaken">
                                    </div>
                                    <span id="dateError" class="col-12 ml-5 pl-0" style="color:#007bff;font-size:16px;"></span>
                                </div>
                                <div class="row">
                                    <div class="col-12">
                                        <hr>
                                        ${this._formatPDQQuestionsForm()}
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
}
