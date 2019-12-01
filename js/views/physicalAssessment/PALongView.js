/**
 * Long forms for PA, used when fighter is present to perform physical assessments. Each card displayed
 * on page will have one of the 12 physical assessments. Fighter must select/input answer to move onto the next question.
 * Tools such as timers and metronome are provided in specific physical assessments.
 *
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 5/16/17
 * PALongView.js
 */

"use strict";

import View from "../View";
import InputComponent from "../components/InputComponent";
import Timer from "../../depend/easytimer";
import SummaryView from "../SummaryView";
import ModalComponent from "../components/ModalComponent";
import Toastify from "toastify-js";

/**
 * View class PA Long Form. Handles template and rendering each of the 12 physical assessments
 */
export default class PALongView extends View
{
    /**
     * PALongView constructor builds the View for PA's long form
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks)
    {
        super(dataHive, callbacks);
        this._currentAssessmentIndex = 1;
        this.physicalAssessments = this.dataHive.physicalAssessments;
        this.recentPhysicalAssessment = PALongView.retrieveRecentPA(this.physicalAssessments.serialize());
        this._paDate = dataHive.intakeDate ? dataHive.intakeDate : new Date().toDateInputValue();
        this._timer = new Timer();
    }

    /**
     * Calls event handler and callback functions after page has rendered.  Assists with saving PA answers
     * in new physical assessments.
     */
    postRenderSetup()
    {
        this._formatTimer();

        const paCard = this.el.querySelector('#paCard');
        const nextAssessment = this.el.querySelector("#nextAssessment");
        const shakeContainer = this.el.querySelector('#shakeContainer');
        const tugBtns = this.el.querySelectorAll('.tugBtn');
        if(nextAssessment) {
            nextAssessment.onclick = () => {
                if (this._currentAssessmentIndex < 12) {
                    if (checkPAInputsFilled(paCard)) {
                        if(shakeContainer.classList.contains("shakeError")) shakeContainer.classList.remove("shakeError");

                        const paScore = {};
                        const paAdditionalData = [];
                        paScore.assessmentNum = this._currentAssessmentIndex;
                        if (paCard.querySelector('input[type="radio"]')) {
                            paScore.assessmentScore = paCard.querySelector('input[type="radio"]:checked').value;
                        }

                        if (paCard.querySelector('input[type="number"]')) {
                            const inputs = paCard.querySelectorAll('input[type="number"]');
                            if (paCard.querySelector('input[type="radio"]')) {
                                inputs.forEach((input) => {
                                    paAdditionalData.push({
                                        dataName: input.name,
                                        dataValue: input.value
                                    })
                                });
                            } else {
                                paScore.assessmentScore = inputs[0].value;
                            }
                        }

                        this.physicalAssessments.addPAScore(paScore.assessmentNum, paScore.assessmentScore,
                            paAdditionalData, this._paDate);
                        this._currentAssessmentIndex++;
                        this.render();
                    } else {
                        if(!shakeContainer.classList.contains("shakeError")) shakeContainer.classList.add("shakeError");
                    }

                }
            }
        }

        tugBtns.forEach((tugBtn) => {
            tugBtn.onclick = (event) => {
                if(event.target.id === "saveTUGTime" && this._currentAssessmentIndex === 12) {
                    const TUGTotalSecs = Number(this.el.querySelector('#tugTime').value);
                    if(TUGTotalSecs > 0) {
                        this.physicalAssessments.addPAScore(this._currentAssessmentIndex, TUGTotalSecs,
                            [], this._paDate);
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
                        this.callbacks.nextPage("paSummary");
                    } else {
                        const errorModal = new ModalComponent({
                            footer: true,
                            stickFooter: false,
                            closeMethods: ['button']
                        }).setContent(`<div>
                    <h3>Invalid time. Please start the timer or enter the time manually before saving.</h3>
                    </div>`).setFooterButtons([{
                            label: "Ok",
                            cssClass: 'tingle-btn tingle-btn--primary',
                            callback: () => {
                                errorModal.closeModal();
                            }
                        }]).openModal();
                    }
                } else if(event.target.id === "cannotComplete") {
                    this.physicalAssessments.addPAScore(this._currentAssessmentIndex, 0, [], this._paDate);
                    this.callbacks.savePA(this.physicalAssessments._physicalAssessments);
                    this.callbacks.updateReassessmentDate();
                    this.callbacks.nextPage("paSummary");
                }
            }
        })


    }

    /**
     * Retrieves and returns the most recent physical assessment as a JS object:
     * {recentPADate : <YYYY-MM-DD>, recentPAScoresArray : [ {<paScoreObject1>}, {<paScoreObject2>} ... {<paScoreObject12>} ]}
     * @param physicalAssessmentsMap - map that contains all taken physical assessments;
     *  keys are dates taken in YYYY-MM-DD format, values are JS objects that contain physical assessment score info
     */
    static retrieveRecentPA(physicalAssessmentsMap) {
        if(physicalAssessmentsMap.size > 0) {
            const assessmentDates = Array.from(physicalAssessmentsMap.keys());
            SummaryView.sortAssessmentDateArray(assessmentDates);
            const recentPADate = assessmentDates[assessmentDates.length - 1];
            return {recentPADate: recentPADate, recentPAScoresArray: physicalAssessmentsMap.get(recentPADate)};
        }
    }

    /**
     * Formats YYYY-MM-DD string to MM/DD/YY string to display on view page
     * @param date - String in YYYY-MM-DD format
     * @returns {string} - returns String in MM/DD/YY format
     */
    static displayDateFromDate(date)
    {
        if(RegExp('\\d{4}-\\d{2}-\\d{2}').test(date)) {
            let splitDate = date.toString().split("-");
            let year = splitDate[0].charAt(2) + splitDate[0].charAt(3);
            return `${splitDate[1]}/${splitDate[2]}/${year}`;
        } else if(RegExp('\\d{2}/\\d{2}/\\d{2}').test(date)) return date;
        else throw new Error("Date string needs to be in YYYY-MM-DD format to be converted to MM/DD/YY format");
    }

    /**
     * Formats YYYY-MM-DD string to MM/YYYY string to display on view page
     * @param date - String in YYYY-MM-DD format
     * @returns {string} - returns String in MM/YYYY format
     */
    static displayMonthYearFromDate(date)
    {
        if(RegExp('\\d{4}-\\d{2}-?(?:\\d){0,1}').test(date)) {
            let splitDate = date.toString().split("-");
            return `${splitDate[1]}/${splitDate[0]}`;
        } else if(RegExp('^\\d{2}/\\d{2}/\\d{4}').test(date)) {
            let splitDate = date.toString().split("/");
            return `${splitDate[0]}/${splitDate[2]}`;
        }
        else if(RegExp('^\\d{2}/\\d{4}$').test(date)) return date;
        else throw new Error("Date string needs to be in YYYY-MM-DD or YYYY-MM format to be converted to MM/YYYY format");
    }

    /**
     * Formats YYYY-MM-DD string to MM/DD/YYYY string to display on view page
     * @param date - String in YYYY-MM-DD format
     * @returns {string} - returns String in MM/DD/YYYY format
     */
    static displayFullDateFromDate(date)
    {
        if(RegExp('\\d{4}-\\d{2}-\\d{2}').test(date)) {
            let splitDate = date.toString().split("-");
            return `${splitDate[1]}/${splitDate[2]}/${splitDate[0]}`;
        } else if(RegExp('\\d{2}/\\d{2}/\\d{4}').test(date)) return date;
        else throw new Error("Date string needs to be in YYYY-MM-DD format to be converted to MM/DD/YYYY format");
    }

    /**
     * Formats YYYY-MM-DD string to MM/DD string to display on view page
     * @param date - String in YYYY-MM-DD format
     * @returns {string} - returns String in MM/DD format
     */
    static displayMonthDayFromDate(date)
    {
        if(RegExp('\\d{4}-\\d{2}-\\d{2}').test(date)) {
            let splitDate = date.toString().split("-");
            return `${splitDate[1]}/${splitDate[2]}`;
        } else if(RegExp('\\d{2}/\\d{2}').test(date)) return date;
        else throw new Error("Date string needs to be in YYYY-MM-DD format to be converted to MM/DD format");
    }

    /**
     * Formats the timer that is shown on "Bal 2 Ft", "1 Leg", "Foam", "Sit to Stand", "Up and Go" cards.  "Bal 2 Ft" and
     * "Sit to Stand" are 30 sec countdown timers. "1 Leg" and "Foam" are 20 sec countdown timers. "Up and Go" is a stopwatch
     * @private
     */
    _formatTimer()
    {
        this._timer.stop();

        const assessmentTimer = {
            1: {    startingTime: '30:0',
                timeValuesParams: ['seconds', 'secondTenths'],
                countParams: {countdown: true, precision: 'secondTenths', startValues: {seconds: 30}}   },
            6: {    startingTime: '00:0',
                timeValuesParams: ['seconds', 'secondTenths'],
                countParams: {precision: 'secondTenths', target: {seconds: 20}} },
            7: {    startingTime: '20',
                timeValuesParams: ['seconds'],
                countParams: {countdown: true, startValues: {seconds: 20}}  },
            11: {    startingTime: '30:0',
                timeValuesParams: ['seconds', 'secondTenths'],
                countParams: {countdown: true, precision: 'secondTenths', startValues: {seconds: 30}}  },
            12: {   startingTime: '00:0',
                timeValuesParams: ['seconds', 'secondTenths'],
                countParams: {precision: 'secondTenths'}    }
        };

        if(assessmentTimer[this._currentAssessmentIndex]) {

            const updateTime = () => {
                if(this._currentAssessmentIndex !== 12) {
                    this.el.querySelector('#time').innerHTML =
                        `${this._timer.getTimeValues().toString(assessmentTimer[this._currentAssessmentIndex].timeValuesParams)}`;
                } else {
                    this.el.querySelector('#tugTime').value =  Number(this._timer.getTotalTimeValues().secondTenths)/10;
                }
            };

            this._timer.addEventListener('secondTenthsUpdated', updateTime);
            this._timer.addEventListener('started', updateTime);
            this._timer.addEventListener('reset', updateTime);
            this._timer.addEventListener('targetAchieved', () => {
                navigator.notification.beep(1);
            });

            this.el.querySelector('#timer').innerHTML =
                `<div id="PATimer">
                    <div class="row justify-content-center">
                        <a id="startTimer" class="mr-2 timer-size"><i class="fas fa-play fa-lg"></i></a>
                        <div class="timer-size ${this._currentAssessmentIndex === 12 ? "mr-5 ml-5" : ""}" id="time">
                        ${this._currentAssessmentIndex !== 12 
                                ? assessmentTimer[this._currentAssessmentIndex].startingTime 
                                : `<input type="number" id="tugTime" class="form-control paInfo" name="tugTime" 
                                    value="0.0" data-assessmentnum="12" oninput="validity.valid||(value='');" 
                                    min="0" style="height:75px;width:120px;font-size:35px;text-align:center;" step="any">`}
                        </div>
                        <a id="pauseTimer" class="ml-2 ${this._currentAssessmentIndex === 12 ? "mr-5" : "mr-2"} timer-size"><i class="fas fa-pause fa-lg"></i></a>
                        <a id="resetTimer" class="ml-2 mr-2 timer-size"><i class="fas fa-redo fa-lg"></i></a>
                    </div>
                </div>`;

            this.el.querySelector('#startTimer').onclick = () => {
                navigator.notification.beep(1);
                setTimeout(() => {this._timer.start(assessmentTimer[this._currentAssessmentIndex].countParams)}, 750);
            };

            this.el.querySelector('#pauseTimer').onclick = () => {
                navigator.notification.beep(1);
                this._timer.pause();
            };

            this.el.querySelector('#resetTimer').onclick = () => {
                this._timer.stop();
                navigator.notification.beep(1);
                setTimeout(() => {this._timer.reset()}, 1000);
            };

        } else {
            if(this.el.querySelector('#timer')) this.el.querySelector('#timer').innerHTML = "";
        }
    }

    /**
     * With the assessment number, it retrieves the last previous score if there's an existing taken physical assessment.
     * @param {number} assessmentNum - physical assessment number from 1 - 12
     * @returns {string} formats as "Previous score from <recent PA mini date>: <previous score>"
     * @private
     */
    _formatPreviousScore(assessmentNum) {
        const assessmentData = {
            turnLeftSteps: "L",
            turnRightSteps: "R",
            jumpInches: "Jump "
        };

        let returnString = "";
        if(this.recentPhysicalAssessment) {
            const { recentPADate, recentPAScoresArray } = this.recentPhysicalAssessment;
            const index = recentPAScoresArray.findIndex((paScoreObject) =>
                paScoreObject.assessmentName === this.physicalAssessments._getAssessmentName(assessmentNum));
            const recentPAMiniDate = PALongView.displayDateFromDate(recentPADate);
            const score = recentPAScoresArray[index].assessmentScore >= 0 ? recentPAScoresArray[index].assessmentScore : "N/A";
            returnString += `Previous score from ${recentPAMiniDate}: <strong style="font-size:27px;color:#f63535">${score}</strong>`;
            if(recentPAScoresArray[index].assessmentData.length > 0) {
                recentPAScoresArray[index].assessmentData.forEach((additionalDataObject) => {
                    returnString += `<strong style="font-size:27px;color:#f63535">, ${assessmentData[additionalDataObject.dataName]}${additionalDataObject.dataValue}</strong>`;
                });
            }
        }
        return returnString;
    }

    /**
     * Formats each card shown with one of the twelve physical assessments and any necessary tools
     * @param physicalAssessmentInfo
     * @returns {string} - HTML template
     * @private
     */
    _formatPACard(physicalAssessmentInfo)
    {
        const paTestCardComponents = {
            additionalInformation: "",
            additionalDataInputs: "",
            radioButtons: "",
            testTool: "",
            button: ""
        };

        if(physicalAssessmentInfo.scoring && Object.keys(physicalAssessmentInfo.scoring).length) {
            Object.keys(physicalAssessmentInfo.scoring).forEach( (score) => {
                paTestCardComponents.radioButtons +=
                    `<label class="control control--radio ml-3">(${score}) ${physicalAssessmentInfo.scoring[score]}
                        <input type="radio" class="paInfo" name="${this._currentAssessmentIndex}" value="${score}"/>
                        <div class="control__indicator"></div>
                    </label>`;
            });
        }

        if(this._currentAssessmentIndex === 3) {
            paTestCardComponents.additionalDataInputs =     `<div class="form-group row mt-4 ml-5">
                                                                <div class="col-xs-2 mr-2">
                                                                    ${new InputComponent()
                                                                    .setId('turnLeftSteps')
                                                                    .setType('number')
                                                                    .setClasses('form-control paInfo')
                                                                    .setName('turnLeftSteps')
                                                                    .setValue(null)
                                                                    .setData('assessmentNum', this._currentAssessmentIndex)
                                                                    .setLabel('Number of Left Steps: ')
                                                                    ._html()}
                                                                </div>
                                                                <div class="col-xs-2 mr-2">
                                                                    ${new InputComponent()
                                                                    .setId('turnRightSteps')
                                                                    .setType('number')
                                                                    .setClasses('form-control paInfo')
                                                                    .setName('turnRightSteps')
                                                                    .setValue(null)
                                                                    .setData('assessmentNum', this._currentAssessmentIndex)
                                                                    .setLabel('Number of Right Steps: ')
                                                                    ._html()}
                                                                </div>
                                                            </div>`;
        } else if(this._currentAssessmentIndex === 8) {
            paTestCardComponents.additionalDataInputs =     `<div class="col-xs-2 mt-4 ml-5 mb-3">
                                                                ${new InputComponent()
                                                                .setId('jumpInches')
                                                                .setType('number')
                                                                .setClasses('form-control paInfo')
                                                                .setName('jumpInches')
                                                                .setValue(null)
                                                                .setData('assessmentNum', this._currentAssessmentIndex)
                                                                .setLabel('Inches from Jump: ')
                                                                ._html()}
                                                            </div>`;
            paTestCardComponents.additionalInformation =
                `<div class="mb-2"><strong>For consistency, the BwPP standard is to measure toe to toe.  Click </strong>
                    <span><a role="button" style="font-weight:bold;text-decoration:underline;" data-tippy-content='<p class="m-2">For consistency, 
                    the BwPP standard is to measure toe to toe.  A boxer who has a 10 inch foot jumps 11 inches toe to toe.  
                    That would be 1 inch toe to heel.  How far did they actually jump?  Their nose moved 11 inches.  
                    Toe to heel scores a 2 and toe to toe scores a 3.    If the Boxer jumps 21 inches toe to toe, that 
                    is 11 inches toe to heel and scores a 3 whereas toe to toe is a 4.  Why would we penalize Boxers by 
                    a "foot" from their real jump distance?</p>'
                    <strong>here</strong></a>
                    </span><strong> for more information.</strong>
                </div>`;
        } else if(this._currentAssessmentIndex === 11) {
            paTestCardComponents.additionalDataInputs =     `<div class="col-xs-2 ml-4">
                                                                ${new InputComponent()
                                                                .setId('s2sRepetitions')
                                                                .setType('number')
                                                                .setClasses('form-control paInfo')
                                                                .setName('s2sRepetitions')
                                                                .setValue(null)
                                                                .setData('assessmentNum', this._currentAssessmentIndex)
                                                                .setLabel('Repetitions: ')
                                                                ._html()}
                                                            </div>`;
        }

        if(this._currentAssessmentIndex === 12) {
            paTestCardComponents.testTool =   `<span id="timer"></span>`;
        } else if(this._currentAssessmentIndex === 9) {
            paTestCardComponents.testTool =  `<span class="float-left ml-5">
                                                  <div id="metronome">
                                                      <div class="row justify-content-center">
                                                          <audio controls loop volume="1.0" id="metronomeAudio">
                                                              <source src="${cordova.file.applicationDirectory}www/audio/beep.mp3" type="audio/ogg">
                                                              Your browser does not support the audio element.
                                                          </audio>
                                                      </div>
                                                  </div>
                                              </span>`;
        } else {
            paTestCardComponents.testTool = `<span class="float-left ml-5" id="timer"></span>`;
        }

        if(this._currentAssessmentIndex === 12) {
            paTestCardComponents.button = `<input class="btn btn-rsb col-4 offset-1 tugBtn" type="button" id="saveTUGTime"
                                                value="Save Time & Finish"/><input class="btn btn-rsb col-4 offset-1 tugBtn" 
                                                type="button" id="cannotComplete" value="Could Not Complete ">`;
        } else {
            paTestCardComponents.button = `<input class="btn btn-rsb float-right mt-2" type="button" id="nextAssessment"
                                                value="Next Assessment"/>`;
        }

        return `<div class="card card-shadow mb-3" style="border: solid 2px #dedede; font-size:18px;">
                    <p class="p-3"><strong>${physicalAssessmentInfo.name}</strong>&emsp;${this._currentAssessmentIndex} / 12
                    <span class="float-right">${physicalAssessmentInfo.type}</span></p>
                </div>
                <div class="card card-shadow mb-4" id="paCard" style="border: solid 2px #dedede">
                    <div class="card-body" id="shakeContainer">
                        <div class="card-title" style="font-size:18px;">
                            ${physicalAssessmentInfo.verbal_instruction}
                            <span><a role="button" style="font-size: 24px;" data-tippy-content='<h5>${physicalAssessmentInfo.name}</h5>
                            <p class="mb-2"><strong>Purpose:</strong> ${physicalAssessmentInfo.purpose}</p>
                            <p class="mb-2"><strong>Equipment:</strong> ${physicalAssessmentInfo.equipment}</p>
                            <p class="mb-2"><strong>Safety Procedure:</strong> ${physicalAssessmentInfo.safety_procedure}</p>
                            <p class="mb-2"><strong>Testing Procedure:</strong> ${physicalAssessmentInfo.testing_procedure}</p>'
                            <i class="fas fa-lg fa-info-circle ml-1"></i></a>
                            </span>
                        </div>
                        <hr>
                        ${this._currentAssessmentIndex === 8 ? paTestCardComponents.additionalInformation : ""}    
                        <div class="ml-3 mb-4" style="font-size:18px;">${this._formatPreviousScore(this._currentAssessmentIndex)}</div>
                            ${paTestCardComponents.additionalDataInputs}
                            ${paTestCardComponents.radioButtons}
                            ${this._currentAssessmentIndex === 12 ? paTestCardComponents.testTool : ""}    
                    </div>
                    <div class="card-footer">
                        ${this._currentAssessmentIndex !== 12 ? paTestCardComponents.testTool : ""}
                        ${paTestCardComponents.button}
                    </div>
                </div>`;
    }

    /**
     * Returns the HTML template for complete page with physical assessment card.
     * @returns {string} - HTML template
     * @private
     */
    _html()
    {
        return `
            <div class="container">
                ${this._formatPACard(this.dataHive.physicalAssessmentInfo.get(this._currentAssessmentIndex.toString()))}
            </div>
        `;
    }
}

/**
 * Searches within div element to check that if there are radios, one radio is checked
 * and that if there are number inputs, all number inputs are filled. Returns boolean value.
 * @param divElement - html div element to search within
 * @returns {boolean} - false if all inputs are unfilled; true if inputs are filled
 */
export const checkPAInputsFilled = (divElement) => {
    let filled = true;

    if(divElement.querySelector('input[type="radio"]')) {
        if(!divElement.querySelector('input[type="radio"]:checked')) {
            filled = false;
        }
    }
    if(divElement.querySelector('input[type="number"]')) {
        divElement.querySelectorAll('input[type="number"]').forEach((input) => {
            if(!input.value.trim() || input.value.trim() < 0) filled = false;
        });
    }
    return filled;
};