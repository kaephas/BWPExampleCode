/**
 * PDF Report View formats and displays the information shown when a PDF file is generated for reporting
 * @author Cynthia Pham
 * 8/14/2019
 * PDFReportView.js
 */


'use strict';

import View from '../View.js';
import PALongView from '../physicalAssessment/PALongView';
import PDFReportController from "../../controllers/PDFReportController";
import ModalComponent from "../components/ModalComponent";
import InputComponent from "../components/InputComponent";
import CheckBoxComponent from "../components/CheckBoxComponent";
import BoxerDirectoryReport from "./BoxerDirectoryReport";
import AssessmentsReport from "./AssessmentsReport";
import BwPAssessmentReport from "./BwPAssessmentReport";
/**
 * View class for PDF files.
 */
export default class PDFReportView extends View {

    /**
     * PDFReportView constructor builds the View. Generates the format for the BwP, RSB, and Directory Reports.
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks) {
        super(dataHive, callbacks);
        this.affiliate = dataHive.dataStore.coachModel.affiliateLocation.affiliate_id;
        this.affiliateLocations = dataHive.dataStore.coachModel.affiliateLocations;
        this.affiliateLocationsObject = dataHive.dataStore.coachModel.affiliateLocationsObject;
        this.coaches = dataHive.dataStore.coachModel.coaches;
        this.locations = this.affiliateLocationsObject[this.affiliate].sort();
        this.email = dataHive.dataStore.coachModel.email;
        this.fighterModel = dataHive.fighterModel;
        this.pdf = new PDFReportController();
        this.emailRecipients = [];
        this.coachEmail = "";
        this.boxerEmail = "";

        this.subscribeTo("RouteController","displayDirectoryReport", "displayDirectoryReport", async (fightersArray) => {
            const fighters = {};
            for(let location of this.locations) {
                if(location !== "Development") fighters[location] = [];
            }

            for(let fighter of fightersArray) {
                if(fighter.activeFlag && fighter.location !== "Development") {
                    fighters[fighter.location].push(fighter);
                }
            }

            this._reportTitleHTML = `${this.affiliate} Boxer Directory - Active Boxers`;
            this._addCoachesToEmailList();
            this._reportHTML = await BoxerDirectoryReport(fighters, this.fighterModel);
            this.render();
        });

        this.subscribeTo("RouteController","displayAssessmentReport", "displayAssessmentReport", async (fightersArray) => {
            this._reportTitleHTML = `${this.affiliate} - Assessments`;
            const fightersObject = {"Overdue": [], "Upcoming": []};
            const checkUpcoming = (reassessmentDate) => {
                const reassessment = new Date(reassessmentDate);
                const today = new Date(Date.now());
                const fortyFiveDays = new Date(today).setDate(today.getDate() + 45);
                return reassessment.valueOf() >= today.valueOf() && reassessment.valueOf() <= fortyFiveDays.valueOf();
            };
            const checkOverdue= (reassessmentDate) => {
                const reassessment = new Date(reassessmentDate);
                const today = new Date(Date.now());
                const sixMonths = new Date(today).setMonth(today.getMonth() - 6);
                return reassessment.valueOf() <= sixMonths.valueOf();
            };
            for(let fighter of fightersArray) {
                if(fighter.activeFlag && fighter.location !== "Development") {
                    if(checkOverdue(fighter.reassessmentDate)) fightersObject["Overdue"].push(fighter);
                    if(checkUpcoming(fighter.reassessmentDate)) fightersObject["Upcoming"].push(fighter);
                }
            }
            this._addCoachesToEmailList();
            this._reportHTML = await AssessmentsReport(fightersObject);
            this.render();
        });

        this.subscribeTo("RouteController","displayBwPReport", "displayBwPReport", async (fighterModel) => {
            this._reportTitleHTML = `BwP Assessment - ${fighterModel.personalInformationModel.firstName} ${fighterModel.personalInformationModel.lastName}`;
            this._additionalReportTitleHTML = `${this.affiliate}, ${fighterModel.personalInformationModel.location}${fighterModel.personalInformationModel.email ?
                                        `, ${fighterModel.personalInformationModel.email}` : ""}`;
            this._addCoachesToEmailList();
            if(fighterModel.personalInformationModel.email) this.boxerEmail = fighterModel.personalInformationModel.email;
            this._reportHTML = await BwPAssessmentReport(fighterModel, false);
            this.render();
        });
    }

    /**
     * Calls event handler and callback functions after page has rendered.  Assists with email and print functions
     * with the generated pdf file.
     */
    postRenderSetup() {
        this.el.querySelector('#sharePDF').onclick = () => {
            this._openPrintModal();
        };

        this.el.querySelector('#emailPDF').onclick = () => {
            this._openEmailModal(this.emailRecipients);
        };
    }

    /**
     * Adds coaches to the email recipient list. If there's a parameter of an array of locations, it will be used to
     * filter against the coach's location.
     * @param {Array} locations - optional parameter where it holds an array of locations used to filter the
     * coaches that will  become the email recipients.
     * @private
     */
    _addCoachesToEmailList(locations=[]) {
        this.emailRecipients = [];
        this.coaches.forEach((coach) => {
            if (coach.email) {
                if(locations.length > 0) {
                    if(locations.includes(coach.location)) this.emailRecipients.push({name: coach.name, email: coach.email});
                }
                else this.emailRecipients.push({name: coach.name, email: coach.email});
            }
        });
        this.coachEmail = this.email;
    }

    /**
     * Generates PDF and opens share window that will allow users to either print or download the PDF file
     * @private
     */
    _openPrintModal() {
        console.log(this._reportHTML);
        this.pdf
            .setFileName(`${this.affiliate} - Boxer Directory Report`)
            .setContent(`<div class="card-body">
                                            <div class="card-title" style="font-weight: bold;">
                                            ${this._reportTitleHTML ? `<span>${this._reportTitleHTML}</span><br><span class="float-left">${PALongView.displayFullDateFromDate(new Date().toInputString())}</span>` : ""}
                                             </div>
                                        </div>
                                        ${this._reportHTML}`)
            .generateSharePDF();
    }

    /**
     * Opens a modal to gather data (file name, subject line, email recipients) to generate pdf and email using external email app.
     * @param {Array} emailRecipients - array of email recipients
     * @private
     */
    _openEmailModal(emailRecipients) {
        const emailModal = new ModalComponent({footer: true, stickFooter: false, closeMethods: ['button']})
            .setContent(`<div>
                            <h3>Email PDF</h3>
                            <hr>
                            <h5>Please enter a file name and subject line:</h5>
                            <h5 id="fileNameError"></h5>
                            <div class="row">
                                <div class="col-12">
                                    <label for="fileName" class="form-label input-text">File Name</label>
                                    <div class="input-group">
                                        <input type="text" id="fileName" class="form-control" name="fileName" value="${new Date().toInputString()} ${this._reportTitleHTML}">
                                        <div class="input-group-append"><span class="input-group-text">.pdf</span></div>
                                    </div>
                                </div>
                                <div class="col-12">
                                    ${new InputComponent()
                                    .setId('subjectLine')
                                    .setClasses('form-control')
                                    .setName('subjectLine')
                                    .setValue(PALongView.displayFullDateFromDate(new Date().toInputString()) + " " + this._reportTitleHTML)
                                    .setLabel('Subject')
                                    ._html()}
                                </div>
                            </div>
                            <h5 class="mb-0">Please choose the following email recipient(s):</h5>
                            <small>*You will be able to add other email recipients after the pdf file has generated</small>
                            <div class="row mt-2">
                                ${this.boxerEmail ? 
                                `<div class="col-12">
                                    ${new CheckBoxComponent()
                                    .setId(this.boxerEmail)
                                    .setClasses('form-control')
                                    .setName('emailRecipient[]')
                                    .setValue(null)
                                    .setLabel(`Boxer (${this.boxerEmail})`)
                                    ._html()}
                                </div>` : ""}
                                ${this.coachEmail ? 
                                `<div class="col-12">
                                    ${new CheckBoxComponent()
                                    .setId(this.coachEmail)
                                    .setClasses('form-control')
                                    .setName('emailRecipient[]')
                                    .setValue(null)
                                    .setLabel(`Myself (${this.coachEmail})`)
                                    ._html()}
                                </div>` : ""}
                                ${emailRecipients.map((recipientObj) => `
                                    <div class="col-12">
                                        ${new CheckBoxComponent()
                                        .setId(recipientObj.email)
                                        .setClasses('form-control')
                                        .setName('emailRecipient[]')
                                        .setValue(null)
                                        .setLabel(`${recipientObj.name} (${recipientObj.email})`)
                                        ._html()}
                                    </div>
                                `.trim()).join('')}`)
            .setFooterButtons([{
                label: "Generate PDF",
                cssClass: 'tingle-btn tingle-btn--primary',
                callback: () => {
                    document.querySelector("#fileNameError").innerHTML = "";
                    const fileName = document.querySelector('#fileName').value;
                    const subjectLine = document.querySelector('#subjectLine').value;

                    if(!fileName)
                        document.querySelector("#fileNameError").innerHTML = `<strong style="color:red;">You need to enter a file name to continue.</strong>`;
                    else {
                        const emailRecipients = [];
                        document.querySelectorAll('input[name="emailRecipient[]"]:checked').forEach((emailRecipient) => {
                            emailRecipients.push(emailRecipient.id);
                        });
                        emailModal.closeModal();
                        this.pdf
                            .setFileName(fileName)
                            .setContent(`<div class="card-body">
                                            <div class="card-title" style="font-weight: bold;">
                                            ${this._reportTitleHTML ? `<span>${this._reportTitleHTML}</span><br><span class="float-left">${PALongView.displayFullDateFromDate(new Date().toInputString())}</span>` : ""}
                                             </div>
                                        </div>
                                        ${this._reportHTML}`)
                            .generateEmailPDF(emailRecipients, subjectLine);
                    }
                }
            }, {
                label: "Cancel",
                cssClass: 'tingle-btn tingle-btn--primary',
                callback: () => {
                    emailModal.closeModal();
                }
            }]).openModal();
    }

    /**
     * Method that compiles template
     *
     * @returns {string} pdf report template
     * @private method used for rendering
     */
    _html() {
        return `
        <div class="container">
            <div class="card card-shadow" style="border: solid 2px #dedede">
                <div class="card-body">
                    <div class="card-title" style="font-weight: bold;">
                        <div class="btn-group float-right" role="group" aria-label="PDF">
                            <button type="button" class="btn btn-secondary" id="sharePDF">Print<i class="fas fa-print ml-2"></i></button>
                            <button type="button" class="btn btn-secondary" id="emailPDF">Email<i class="fas fa-envelope ml-2"></i></button>
                        </div>
                        ${this._reportTitleHTML ? `<span>${this._reportTitleHTML}</span><br>
                        ${this._additionalReportTitleHTML ? `<span>${this._additionalReportTitleHTML}</span><br>` : ""}
                        <span class="float-left">${PALongView.displayFullDateFromDate(new Date().toInputString())}</span>` : ""}
                    </div>
                </div>
                <div class="card-body pt-0">
                    ${this._reportHTML ? this._reportHTML : ""}
                </div>
            </div>
        <div>`;
    }


}