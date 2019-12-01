/**
 * PA Summary View, used to display the scored physical assessment after the long form has been completed. Same form as
 * on the summary view, lists of previous assessments. First, Last, Current is the format displayed in the lists, where
 * the date is in (MM/YY) format.
 * @author Tyler Bezera
 * 5/17/19
 * PASummaryView.js
 */

'use strict';

import View from "../View";
import SummaryView from "../SummaryView";
import BadgerAccordion from "badger-accordion";
import Toastify from "toastify-js";

/**
 * View class PDQ Summary. Handles template and rendering for PA's summary page
 */
export default class PASummaryView extends View
{
    /**
     * PASummaryView constructor builds the View for PA's summary page after a fighter has taken the PA.
     * Also calls SummaryView's static method to calculate score and return HTML template that lists the answers
     * and score.
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks){
        super(dataHive, callbacks);
        this.fighterModel = dataHive.fighterModel;
        this.personalInfo = dataHive.personalInfo;
        this.newFighterEnrollment = dataHive.newFighterEnrollment;
        this.addAssessment = dataHive.addAssessment;
        this.newExistingAssessment = dataHive.newExistingAssessment;

        if(this.newFighterEnrollment || this.addAssessment) {
            this._buttonHTML = `<button class="next-button btn-rsb col-6 offset-3" 
                data-value="${(!this.newFighterEnrollment && this.addAssessment && this.newExistingAssessment) ? "summary" : "coachPage"}">
                ${(!this.newFighterEnrollment && this.addAssessment && this.newExistingAssessment) ? "Finish Assessment & Go to Boxer's Profile" : "Continue to Coach's Page"}</button>`;
        } else  {
            this._addButtonHTML = `<button class="float-right" id="addAssessment" style="border: none; background: none;">
                <i class="fas fa-plus-circle" style="color: #5cb85c;font-size:40px;"></i></button>`;
            this._buttonHTML = `<button class="next-button btn-rsb float-left" data-value="summary"><i
                            class="fas fa-arrow-left"></i>&nbsp;Boxer Profile</button>`;
        }

        this._summarizedPA = SummaryView.summarizePAToListObject(this.fighterModel.physicalAssessmentModel.serialize(), this.fighterModel);
    }

    /**
     * Event thrown when View has finished rendering
     */
    postRenderSetup()
    {
        if(this._addButtonHTML)
            document.getElementById('addAssessment').onclick = () => { this.callbacks.addSinglePAAssessment(); };

        this.el.querySelectorAll(".viewPAButton").forEach((viewPAButton) => {
            viewPAButton.onclick = () => {
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
                this.callbacks.changeEditStatus(false);
                this.callbacks.viewCompletePA(viewPAButton.dataset.paDate);
            }
        });
    }

    /**
     * Returns HTML template that will display the PA's summary with calculated scores for FAB, S2S, and TUG.
     * @returns {string} - HTML template
     * @private
     */
    _html()
    {
        return `
            <div class="container">
                <div class="card card-shadow mb-4" style="border: solid 2px #dedede">
                    <div class="card-body">
                        <div class="card-title ml-2 mr-2 mb-2" style="font-weight: bold;">Physical Assessment Summary - ${this.personalInfo.firstName} ${this.personalInfo.lastName} ${this._addButtonHTML ? this._addButtonHTML : ''}</div>
                        <div class="card-text mb-3 pl-2 pr-4">
                            <p>Coach, please take a moment to discuss the client&#8217;s physical test results. Emphasize that the results reflect their
                            age, general health and having Parkinson&#8217;s disease.</p><br>
                            <p>Tests provide valuable input for coaches to understand the client&#8217;s capabilities, limitations and
                            the need for modifications or a cornerman.</p><br>
                            <p>The tests also establish a baseline for re-assessments every 6 months or so to track performance
                            improvements or losses over time.</p>
                        </div>
                        <div class="card card-shadow card-border">
                                <div class="card-body">
                                    <div class="card-title font-weight-bold">Fullerton Advanced Balance</div>   
                                    <div class="row">
                                        <div class="col-4">
                                            <span class="font-weight-bold">Date:</span>
                                            <ul class="list-unstyled">
                                                <li class="">Bal 2 Ft</li>
                                                <li class="">Pencil</li>
                                                <li class="">360</li>
                                                <li class="ml-1" style="color: gold;">Steps</li>
                                                <li class="">Bench</li>
                                                <li class="">Heel Toe</li>
                                                <li class="">1 Leg</li>
                                                <li class="">Foam</li>
                                                <li class="">2 Ft Jump</li>
                                                <li class="ml-1" style="color: gold;">Inches</li>
                                                <li class="">Head Turns</li>
                                                <li class="">Fall Back</li>
                                                <li class="">Score</li>
                                            </ul>
                                        </div>
                                        ${this._summarizedPA.paList}
                                        ${this._summarizedPA.fabTrends}
                                    </div>
                                    <div class="card-title font-weight-bold">Timed Up & Go</div> 
                                        <div class="row">
                                            <div class="col-4">
                                                <ul class="list-unstyled">
                                                    <li class="">Time</li>
                                                    <li class="">Score</li>
                                                </ul>
                                            </div>
                                            ${this._summarizedPA.upNGo}
                                            ${this._summarizedPA.upNGoTrends}
                                        </div>
                                        <div class="card-title font-weight-bold">Sit to Stand</div>   
                                        <div class="row">
                                            <div class="col-4">
                                                <ul class="list-unstyled">
                                                    <li class="">You</li>
                                                    <li class="">Target</li>
                                                    <li class="">Score</li>
                                                </ul>
                                            </div>
                                            ${this._summarizedPA.s2s}
                                            ${this._summarizedPA.s2sTrends}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <div class="card-footer">
                            ${this._buttonHTML}
                        </div>
                    </div>
                </div>
            </div>`;
    }
}