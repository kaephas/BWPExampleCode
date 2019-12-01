/**
 *  PDQ Summary page is displayed sequential after the PDQ long form, it shows the calculated score for the fighter's
 *  assessment they just took.
 *  @author Tyler Bezera
 *  5/16/19
 *  PDQSummaryView.js
 */
import View from "../View";
import SummaryView from "../SummaryView";
import Toastify from "toastify-js";

'use strict';

/**
 * View class PDQ Summary. Handles template and rendering for PDQ's summary page
 */
export default class PDQSummaryView extends View
{
    /**
     * PDQSummaryView constructor builds the View for PDQ's summary page after a fighter has taken the PDQ.
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

        if(this.newFighterEnrollment || this.addAssessment)
            this._buttonHTML = `<button class="next-button btn-rsb col-5" 
                data-value="${this.newExistingAssessment ? "paQuickForm" : "paLongForm"}">Continue to PA</button>`;
        else
        {
            this._addButtonHTML = `<button class="float-right btn-rsb" id="addAssessment"
                style="border:none;background:none;"><i class="fas fa-plus-circle" style="color:#5cb85c; 
                font-size:40px;"></i></button>`;
            this._buttonHTML = `<button class="next-button btn-rsb float-left" data-value="summary"><i class="fas fa-arrow-left"></i>&nbsp;Boxer Profile</button>`;
        }

        this._summarizedPDQ = SummaryView.summarizePDQsToList(this.fighterModel.pdqModel.serialize(), this.fighterModel, this.addAssessment);
    }

    /**
     * Calls event handler and callback functions after page has rendered
     */
    postRenderSetup(){
        if(this._addButtonHTML)
            this.el.querySelector('#addAssessment').onclick = () => { this.callbacks.addSinglePDQAssessment();};

        this.el.querySelectorAll(".viewPDQButton").forEach((viewPDQButton) => {
            viewPDQButton.onclick = () => {
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
                this.callbacks.viewCompletePDQ(viewPDQButton.dataset.pdqDate, "pdqSummary");
            }
        });

    }

    /**
     * Returns HTML template that will display the PDQ's summary with calculated score
     * @returns {string} - HTML template
     * @private
     */
    _html()
    {
        return `
            <div class="container">
                <div class="card card-shadow" style="border: solid 2px #dedede">
                    <div class="card-body">
                        <div class="card-title" style="font-weight: bold">PDQ Summary - ${this.personalInfo.firstName} ${this.personalInfo.lastName} ${this._addButtonHTML ? this._addButtonHTML : ''}</div>
                        <div class="card-text mb-3">
                            Coach, please discuss the following information based on the assessment data.
                        </div>
                        <div class="card card-shadow card-border">
                            <div class="card-body">
                                <div class="card-title font-weight-bold">PDQ Scores by Category</div>   
                                    <div class="row">
                                        <div class="col-4">
                                        ${!this.addAssessment ? "<br>" : ""}
                                        <span class="font-weight-bold">Date:</span>
                                            <ul class="list-unstyled">
                                                <li class="">PDQ Time (M:SS)</li>
                                                <li class="">PDQ Time Score</li>
                                                <li class="">Mobility</li>
                                                <li class="">Daily Living</li>
                                                <li class="">Emotional</li>
                                                <li class="">Stigma</li>
                                                <li class="">Social</li>
                                                <li class="">Cognition</li>
                                                <li class="">Communication</li>
                                                <li class="">Body</li>
                                            </ul>
                                            
                                    </div>
                                    ${this._summarizedPDQ}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer text-center">
                        ${this._buttonHTML}
                    </div>
                </div>
            </div>
        `;
    }
}