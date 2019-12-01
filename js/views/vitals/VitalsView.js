/**
 * @author Tyler Bezera
 */


"use strict";

import View from "../View";
import ModalComponent from "../components/ModalComponent";
import VitalsKeywords from "../../../resources/vitalKeywords";

/**
 * View class for Vitals, page for fighter's weight and weekly exercises.
 */
export default class VitalsView extends View{

    /**
     * Inits a new VitalsView
     * @param {Object} dataHive views datahive
     * @param {Object} callbacks - object of function pointers
     */
    constructor(dataHive, callbacks){
        super(dataHive, callbacks);
        this.vitals = dataHive.vitals;
        this.personalInfo = dataHive.personalInfo;
        this.addAssessment = dataHive.addAssessment;
        this.fighterModel = dataHive.fighterModel;

        this.START_DATE = "1970-01-01";
        this._vitalsDate = new Date(dataHive.intakeDate ? dataHive.intakeDate : this.START_DATE);

        if(this.addAssessment) this._buttonHTML = `<button class="btn-rsb float-right" data-value="vitalSummary" id="saveVitals">Vitals Summary&nbsp;<i class="fas fa-arrow-right"></i></button>`;
        else {
            this._saveButton = `<button class="btn-rsb float-right p-2" id="saveVitals" data-value="vitalSummary">Save & Back&nbsp;<i style="font-size: 20px;" class="far fa-save"></i></button>`;
            this._backButton = `<button class="float-right mr-4" id="backBtn" style="border:none;background:none;"><i class="fas fa-arrow-circle-left" style="color:#0174DF; 
            font-size:40px;"></i></button>`;
        }

        this.subscribeTo('RouteController', 'editVitals','editVitals', (date) =>
        {
            this._saveButton = `<button class="btn-rsb float-right p-2 mt-4 mr-2" data-value="assessmentHistory" id="saveVitals">Save & Back&nbsp;<i style="font-size: 20px;" class="far fa-save"></i></button>`;
            this._backButton = "";
            this._populateVitals(date).then(() => {
                this._disableFormFields(true);
                this.el.querySelector("#DateTaken").disabled = true;
            });
        });

        this.subscribeTo('RouteController', 'addSingleVitalsAssessment','enableVitalsForm', () =>
        {
            this.addSingleVitalsAssessment = true;
            this._disableFormFields(true);
        });
    }

    postRenderSetup() {
        const checkboxes = this.el.querySelectorAll('input[type="checkbox"]');
        const exerciseHoursInputs = this.el.querySelectorAll('input.exerciseInfo[type="number"]');
        const fallsMonthInput = this.el.querySelector('#fallsMonth');
        const weightInput = this.el.querySelector("#weight");
        const dateInput = this.el.querySelector("#DateTaken");
        const vitalsDate = dateInput.value;
        const dateError = this.el.querySelector("#dateError");
        const vitalsForm = this.el.querySelector("#vitalsForm");

        if((this.addSingleVitalsAssessment || this.addAssessment) && vitalsDate !== new Date(this.START_DATE)) {
            const vitalsAssessment = this.vitals._vitalsAssessment.get(new Date(vitalsDate).toInputString());
            if(vitalsAssessment && (vitalsAssessment.weight || vitalsAssessment.fallsMonth || vitalsAssessment.exercises.length > 0)) {
                dateError.innerHTML = "An assessment with this date already exists, please set to another date before continuing.";
                if (!dateInput.classList.contains("shakeError")) dateInput.classList.add("shakeError");
                this.el.querySelector("#saveVitals").style.display = "none";
                View.disableFormFields(vitalsForm, false);
                this._vitalsDate = new Date(this.START_DATE);
            }
        }

        checkboxes.forEach((checkbox) => {
            checkbox.onclick = (event) => {
                this._displayNumInput(event.target.checked, event.target.id);
            }
        });

        exerciseHoursInputs.forEach((numInput) => {
            numInput.onchange = (event) => {
                if ((event.target.value) && Number(event.target.value) > 0)
                    this.vitals.addWeeklyExercise(this._vitalsDate.toInputString(), event.target.name, event.target.value);
            }
        });

        weightInput.onchange = (event) => {
            if(Number(event.target.value) > 0) this.vitals.setWeight(this._vitalsDate.toInputString(), event.target.value);
        };

        fallsMonthInput.onchange = (event) => {
            if(Number(event.target.value) > 0) this.vitals.setFallsMonth(this._vitalsDate.toInputString(), event.target.value);
        };

        dateInput.onchange = (event) => {
            const newDate = new Date(event.target.value);
            let error = "";
            if(newDate !== new Date(this.START_DATE)) {
                const vitalsAssessment = this.vitals._vitalsAssessment.get(newDate.toInputString());
                if(vitalsAssessment && (vitalsAssessment.weight || vitalsAssessment.fallsMonth || vitalsAssessment.exercises.length > 0)) {
                    error = "An assessment with this date already exists, please set to another date before continuing.";
                    dateError.innerHTML = error;
                    if(!dateInput.classList.contains("shakeError")) dateInput.classList.add("shakeError");

                    View.disableFormFields(vitalsForm, false);
                    this.el.querySelector("#saveVitals").style.display = "none";
                    dateInput.disabled = false;
                } else {
                    dateError.innerHTML = "";
                    if(dateInput.classList.contains("shakeError")) dateInput.classList.remove("shakeError");

                    View.disableFormFields(vitalsForm, true);
                    this.el.querySelector("#saveVitals").style.display = "";
                    this.vitals.changeAssessmentDate(this._vitalsDate.toInputString(), newDate.toInputString());
                    this._vitalsDate = newDate;
                }
            }
        };

        this.el.querySelector("#saveVitals").onclick = (event) => {
            let error = "";
            const unfilledVitalsArray = this._retrieveUnfilledVitals();
            if(this._vitalsDate.toInputString() === this.START_DATE || !this._vitalsDate.isValid()) error += "  The date entered is invalid.";

            const weight = weightInput.value;
            if(!weight || weight === 0)
                error += "  The weight is missing.";

            const fallsMonth = fallsMonthInput.value;
            if(!fallsMonth) error += "  The number of falls in the last month is missing.";

            if(unfilledVitalsArray.length > 0)
                error += `  Hours are not filled for the checked exercise${unfilledVitalsArray.length > 1
                        ? "s: " : ": "}${unfilledVitalsArray.map(exercise => `${VitalsKeywords[String(exercise)]}`).join(", ") + "."}`;

            if(error) {
                const errorModal = new ModalComponent({
                    footer: true,
                    stickFooter: false,
                    closeMethods: ['button']})
                    .setContent(`<div>
                                    <h3>Whoops, vitals form isn't complete!</h3>
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
                this.callbacks.saveVitals(this.vitals._vitalsAssessment);
                this.callbacks.updateReassessmentDate();
                this.callbacks.nextPage(event.target.dataset.value);
            }
        };

        if(this._backButton) this.el.querySelector('#backBtn').onclick = () => {
            if(weightInput.value || fallsMonthInput.value || this.el.querySelector('input[type="radio"]:checked')) {
                const errorModal = new ModalComponent({
                    footer: true,
                    stickFooter: false,
                    closeMethods: ['button']})
                    .setContent(`<div>
                                <h3>Are you sure?</h3>
                                <hr>
                                <h5>Going back to the vitals summary will lose all of your unsaved changes.</h5>
                            </div>`)
                    .setFooterButtons([{
                        label: "Yes, go back",
                        cssClass: 'tingle-btn tingle-btn--primary',
                        callback: () => {
                            errorModal.closeModal();
                            this.vitals._vitalsAssessment.delete(this._vitalsDate.toInputString());
                            this.callbacks.nextPage('vitalSummary');
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

                this.callbacks.nextPage('vitalSummary');
            }
        }
    }

    _displayNumInput(checked, name) {
        const numInput = this.el.querySelector('#' + name).closest('div.p-icon').nextElementSibling;
        if(checked) {
            numInput.style.display = "";
            const numValue = this.el.querySelector('input[name="' + name + '"]').value;
            if (numValue && Number(numValue) > 0) {
                this.vitals.addWeeklyExercise(this._vitalsDate.toInputString(), name, numValue);
            }
        } else {
            numInput.style.display = "none";
            this.vitals.removeWeeklyExercise(this._vitalsDate.toInputString(), name);
        }
    }

    /**
     * Disable Vitals form fields depending on editBoolean
     * @param editBoolean, true - will make form fields editable. false - form fields are disabled
     * @private
     */
    _disableFormFields(editBoolean) {
        const vitalsForm = this.el.querySelector('#vitalsForm');
        View.disableFormFields(vitalsForm, editBoolean);
    }

    /**
     * Populates checked radio buttons and number inputs from taken vitals assessment
     * @param vitalsDate - date in format yyyy-MM-dd used to retrieve taken vitals assessment
     * @private
     */
    async _populateVitals(vitalsDate)
    {
        await this.render();
        this.el.querySelector("#DateTaken").value = vitalsDate;
        this._vitalsDate = new Date(vitalsDate);

        const vitalsAssessment = this.vitals._vitalsAssessment.get(this._vitalsDate.toInputString());
        this.el.querySelector('#weight').value = vitalsAssessment.weight ? vitalsAssessment.weight : this.vitals.weight;
        this.el.querySelector('#fallsMonth').value = vitalsAssessment.fallsMonth;
        for(let exerciseObject of vitalsAssessment.exercises) {
            this.el.querySelector('input[type="checkbox"]#' + exerciseObject.exercise).checked = true;
            const numInput = this.el.querySelector('#' + exerciseObject.exercise).closest('div.p-icon').nextElementSibling;
            numInput.style.display = "";
            this.el.querySelector('input[name="' + exerciseObject.exercise + '"]').value = exerciseObject.hoursPerWeek;
        }
    }

    /**
     * Checks the Vitals form for unfilled input type="number" and returns the array of exercise name(s)
     * @returns {Array} an array of unfilled exercise hours per week
     * @private
     */
    _retrieveUnfilledVitals() {
        let unfilledExerciseHoursSet = new Set();
        const checkedVitalsExercises = this.el.querySelectorAll('input[type="checkbox"]:checked');
        for(let exercise of checkedVitalsExercises) {
            const exerciseHours = this.el.querySelector('input[type="number"][name="' + exercise.id + '"]');
            if(!exerciseHours.value.trim() || exerciseHours.value.trim() <= 0) unfilledExerciseHoursSet.add(exercise.id)
        }
        return Array.from(unfilledExerciseHoursSet);
    }

    _html(){
        return `
            <div class="container">
                <div class="card card-shadow mb-4" id="vitals" style="border: solid 2px #dedede">
                    <div class="card-body">
                        <div class="card-title" style="font-weight: bold;">
                            Vitals - ${this.personalInfo.firstName} ${this.personalInfo.lastName}
                            ${this._saveButton ? this._saveButton : ""}
                            ${this._backButton ? this._backButton : ""}
                        </div>
                        <div class="row">
                            <div class="col-xs-2 ml-3">
                                Date Taken:&emsp;<input type="date" class="form-control" value="${this._vitalsDate ? this._vitalsDate.toInputString() : this.START_DATE}" id="DateTaken" name="DateTaken">
                            </div>
                            <span id="dateError" class="col-12" style="color:#007bff;font-size:16px;"></span>
                        </div>
                        <hr>
                        <!-- Vitals go here -->
                        <div id="vitalsForm">
                            <form class="editableForm">
                                <div class="row mb-3">
                                    <div class="col-12">
                                        <div class="row ml-1">
                                            <span class="float-left">
                                                <label for="weight">Weight in lbs:</label>
                                                <input type="number" class="form-control" id="weight" style="width:100px;" min="0" 
                                                step="any" oninput="validity.valid||(value='');" name="weight">
                                            </span>
                                            <span>
                                                <label for="fallsMonth"># Falls/Last Month</label>
                                                <input type="number" class="form-control" id="fallsMonth" style="width:100px;" 
                                                min="0" oninput="validity.valid||(value='');" name="fallsMonth">
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="card-title ml-3 mr-3">
                                        <span style="font-weight: bold">TWET: Typical Weekly Exercise Therapy</span> - Please check the activities you do in a typical week and estimate how much time you spend on each.<hr></div>
                                    <div class="col-sm-6">
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="bikingUnderSevenMPH">
                                                <div class="state p-primary"><label for="bikingUnderSevenMPH">Biking < 7 MPH</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="bikingUnderSevenMPH" class="form-control ml-5 mr-1 exerciseInfo" 
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="bikingOverSevenMPH">
                                                <div class="state p-primary"><label for="bikingOverSevenMPH">Biking > 7 MPH</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="bikingOverSevenMPH" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="boxingL1">
                                                <div class="state p-primary"><label for="boxingL1">Boxing L1-2</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="boxingL1" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="boxingL3">
                                                <div class="state p-primary"><label for="boxingL3">Boxing L3</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="boxingL3" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="boxingL4">
                                                <div class="state p-primary"><label for="boxingL4">Boxing L4</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="boxingL4" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="cyclingStationary">
                                                <div class="state p-primary"><label for="cyclingStationary">Cycling - Stationary</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="cyclingStationary" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="dancing">
                                                <div class="state p-primary"><label for="dancing">Dancing</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="dancing" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="gardening">
                                                <div class="state p-primary"><label for="gardening">Gardening/Lawn Care</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="gardening" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="golf">
                                                <div class="state p-primary"><label for="golf">Golf</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="golf" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="hiking">
                                                <div class="state p-primary"><label for="hiking">Hiking</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="hiking" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="homeEquipment">
                                                <div class="state p-primary"><label for="homeEquipment">Home Equipment</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="homeEquipment" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="jogging">
                                                <div class="state p-primary"><label for="jogging">Jogging</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="jogging" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="other">
                                                <div class="state p-primary"><label for="other">Other</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="other" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="pilates">
                                                <div class="state p-primary"><label for="pilates">Pilates</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="pilates" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="racquetball">
                                                <div class="state p-primary"><label for="racquetball">Racquetball</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="racquetball" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="running">
                                                <div class="state p-primary"><label for="running">Running</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="running" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="swimSplash">
                                                <div class="state p-primary"><label for="swimSplash">Swim - Splash Around</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="swimSplash" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="swimStructured">
                                                <div class="state p-primary"><label for="swimStructured">Swim - Structured</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="swimStructured" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="taichi">
                                                <div class="state p-primary"><label for="taichi">Tai Chi</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="taichi" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="tennisDoubles">
                                                <div class="state p-primary"><label for="tennisDoubles">Tennis - Doubles</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="tennisDoubles" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="tennisSingles">
                                                <div class="state p-primary"><label for="tennisSingles">Tennis - Singles</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="tennisSingles" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="walking">
                                                <div class="state p-primary"><label for="walking">Walking</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="walking" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="yoga">
                                                <div class="state p-primary"><label for="yoga">Yoga</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="yoga" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <div class="pretty p-icon p-smooth">
                                                <input type="checkbox" class="form-control" id="zumbaKickboxing">
                                                <div class="state p-primary"><label for="zumbaKickboxing">Zumba/Kickboxing</label></div>
                                            </div>
                                            <div class="row" style="display: none">
                                                <input type="number" name="zumbaKickboxing" class="form-control ml-5 mr-1 exerciseInfo"
                                                min="0" max="40" step="any" oninput="validity.valid||(value='');">
                                                <span class="pt-1">Hours/week</span>
                                            </div>
                                        </div>
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