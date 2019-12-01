/**
 * PDQ39 page displays a long form used for fighters to answer the PDQ's 39 questions. Each card displayed
 * on page will have one of the 39 PDQ questions. Fighter must select answer to move onto the next question.
 * @author Tyler Bezera
 * 5/16/19
 * PDQ39View.js
 */

"use strict";

import View from "../View";
import Toastify from "toastify-js";
import Timer from "../../depend/easytimer";
import ModalComponent from "../components/ModalComponent";

/**
 * View class PDQ39 Long Form. Handles template and rendering for each of PDQ's 39 questions.
 */
export default class PDQ39View extends View
{
    /**
     * PDQ39View constructor builds the View
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks)
    {
        super(dataHive, callbacks);
        this.personalInfo = this.dataHive.personalInfo;
        this._currentQuestionIndex = 1;
        this._assessmentDate = dataHive.intakeDate ? dataHive.intakeDate : new Date().toDateInputValue();
        this._timer = new Timer();
    }

    /**
     * Calls event handler and callback functions after page has rendered.  Assists with saving selected PDQ answer
     * and moving onto next question.
     */
    postRenderSetup()
    {
        const startButton = this.el.querySelector("#startPDQ");
        if(startButton)
        {
            startButton.onclick = () => {
                this._html = () => {
                    return this._pdqQuestion(1, this.dataHive.pdqQuestions.get(1));
                };

                this.render();
                this._timer.start({precision: 'secondTenths'});

            };
        }

        const options = this.el.querySelectorAll(".radio");
        let selectedAnswer = -1;
        if(options)
        {
            options.forEach((element) => {
                element.onmousedown = () => {
                    options.forEach((el) => {
                        if(el.classList.contains("selected"))
                        {
                            el.classList.remove("selected");
                            selectedAnswer = 0;
                        }
                    });
                    element.classList.add("selected");
                    selectedAnswer = element.dataset.value;
                }
            });

        }

        const nextQuestion = this.el.querySelector("#nextQuestion");

        const lastQuestion = () => {
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
            this.callbacks.savePDQ(this.dataHive.pdq._pdqAssessments);
            this.callbacks.updateReassessmentDate();
            this.callbacks.nextPage("pdqSummary");
        };

        const shakeContainer = this.el.querySelector('#shakeContainer');
        if(nextQuestion)
        {
            nextQuestion.onclick = () => {
                if(Number(selectedAnswer) >= 0){
                    if(shakeContainer.classList.contains("shakeError")) shakeContainer.classList.remove("shakeError");

                    this.dataHive.pdq.addPdqQuestion(this._currentQuestionIndex, selectedAnswer, this._timer.getTimeValues().seconds, this._assessmentDate);
                    selectedAnswer = -1;
                    this._html = () => {
                        return this._pdqQuestion(++this._currentQuestionIndex, this.dataHive.pdqQuestions.get(this._currentQuestionIndex));
                    };
                    if(Number(this._currentQuestionIndex) === 39)
                    {
                        const notifiy = new ModalComponent({
                            footer: true,
                            stickFooter: false,
                            closeMethods: ['button']
                        }).setContent(`<div>
                    <h3>Please hand the device back to the coach.</h3>
                    </div>`).setFooterButtons([{
                            label: "Done",
                            cssClass: 'tingle-btn tingle-btn--primary',
                            callback: () => {
                                notifiy.closeModal();
                                lastQuestion();
                            }
                        }]).openModal();
                    }
                    else
                    {
                        this.render();
                        this._timer.reset();
                    }
                } else {
                    if(!shakeContainer.classList.contains("shakeError")) shakeContainer.classList.add("shakeError");
                }
            };
        }
    }

    /**
     * Returns HTML template that will display as a card with a question and its answer options, specified to
     * one of PDQ's 39 questions.
     * @param {number} questionID - current question index
     * @param {string} questionText - the question's text
     * @returns {string} - HTML template
     * @private
     */
    _pdqQuestion(questionID, questionText)
    {
        return `
            <div class="container">
                <div class="card card-shadow mb-3" style="border: solid 2px #dedede">
                    <p class="p-3" style="font-size:18px;"><strong>Due to having Parkinson's disease, how often <u>during the last month</u> have
                        you....</strong></p>
                </div>
                <div class="card card-shadow" style="border: solid 2px #dedede">
                    <div class="card-body">
                        <div class="card-title" style="font-weight: bold" style="font-size:18px;">Question ${questionID} / 39</div>
                        <hr>
                        <div class="slideTransition" style="font-size:18px;" id="questionText">${questionText}</div>
                        <div class="card-shadow" id="shakeContainer" style="margin-top:60px;">
                            <ul class="list-group p-3 radio-group"  style="font-size:18px;">
                                <li class="list-group-item text-center radio m-1" data-value="1">Never</li>
                                <li class="list-group-item text-center radio m-1" data-value=".75">Occasionally</li>
                                <li class="list-group-item text-center radio m-1" data-value=".5">Sometimes</li>
                                <li class="list-group-item text-center radio m-1" data-value=".25">Often</li>
                                <li class="list-group-item text-center radio m-1" data-value="0">Always</li>
                            </ul>
                        </div>
                    </div>
                    <div class="card-footer">
                        <input class="btn btn-rsb float-right" type="button" id="nextQuestion" value="Next Question"/>
                    </div>
                </div>          
            </div>
        `;
    }

    /**
     * Method that compiles the complete PDQ39 template
     *
     * @returns {string} the entire PDQ39 template
     * @private method used for rendering
     */
    _html()
    {
        return `
            <div class="container">
                <div class="card card-shadow mb-4" style="border: solid 2px #dedede">
                    <div class="card-body">
                        <div class="card-title" style="font-weight: bold">PDQ - 39 - ${this.personalInfo.firstName} ${this.personalInfo.lastName}</div>
                        <div class="card-text p3 mb-3">
                            <p>The PDQ-39 is a self-report questionnaire, which assesses Parkinson's disease-specific health
                                related quality of life since your last assessment.</p>
                            <p class="mb-2">Please provide answers to the best of your knowledge. Only one option may be selected per question.</p>
                            <p>Questions follow formatting below:</p>
                        </div>
                        <div class="card card-shadow mb-3">
                            <p class="p-3"><strong>Due to having Parkinson's disease, how often <u>during the last month</u>
                                have you....</strong></p>
                        </div>
                        <div class="card card-shadow" style="border: solid 2px #dedede">
                            <div class="card-body">
                                <h4>Sample Question</h4>
        
                                <div class="card-text p3 mb-3">Had difficulty doing the leisure activities which you would
                                    like to do?
                                </div>
                                <ul class="list-group p-3">
                                    <li class="list-group-item text-center m-1">Never</li>
                                    <li class="list-group-item text-center m-1">Occasionally</li>
                                    <li class="list-group-item text-center m-1">Sometimes</li>
                                    <li class="list-group-item text-center m-1">Often</li>
                                    <li class="list-group-item text-center m-1">Always</li>
                                </ul>
                            </div>
                        </div>
                        <div class="card-text mt-3">
                            <h4 class="p3">Coach, please press begin and hand the tablet to the fighter.</h4>
                        </div>
                    </div>
                    <div class="card-footer">
                        <input class="btn btn-rsb float-right" type="button" id="startPDQ" value="Begin"/>
                    </div>
                </div>
            </div>
        `;
    }
}