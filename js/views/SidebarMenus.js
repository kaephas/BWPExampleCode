/**
 * Contains all of child SidebarView classes that holds the menu templates and its event handlers functions
 * @author Cynthia Pham
 * 3/25/19
 * SidebarMenu.js
 */


'use strict';

import SidebarView from "./SidebarView";
import ModalComponent from "./components/ModalComponent";
import Toastify from "toastify-js";

/**
 * CoachLoginMenuView class that defines menu options when on coach's login page
 */
export class CoachLoginMenuView extends SidebarView {

    /**
     * Constructor for CoachLoginMenuView
     * @constructor
     * @param {object} dataHive - DataStore object connected to this SidebarView
     * @param callbacks - callback functions that are defined in coachLogin route in Route Controller class
     * @param routeName - the route that the app is on.
     */
    constructor(dataHive, callbacks, routeName) {
        super(dataHive, callbacks, routeName);
    }

    /**
     * Returns the HTML template for the sidebar menu when on coach login's page
     * @returns {string} HTML template for sidebar menu
     * @private
     */
    _html() {
        return `<section class="menu-section">
                    <h2 class="menu-section-title mb-4">Menu</h2>
                    <ul class="menu-section-list"></ul>
                </section>`
    }
}

/**
 * DirectoryMenuView class that defines menu options when on directory's page
 */
export class DirectoryMenuView extends SidebarView {

    /**
     * Constructor for DirectoryMenuView
     * @constructor
     * @param {object} dataHive - DataStore object connected to this SidebarView
     * @param callbacks - callback functions that are defined in directory route in Route Controller class
     * @param routeName - the route that the app is on.
     */
    constructor(dataHive, callbacks, routeName) {
        super(dataHive, callbacks, routeName);
        this.routeName = routeName;
    }

    /**
     * Calls functions after page has rendered with the sidebar menu
     */
    postRenderSetup() {
        this.el.querySelectorAll('a.addBoxerLink').forEach((link) => {
            link.onclick = () => {
                this.callbacks.closeSidebar();
                this.callbacks.createNewFighter(link.id);
            }
        });

        this.el.querySelector('#directoryReport').onclick = () => {
            this.callbacks.closeSidebar();
            this.callbacks.directoryReport();
        };

        this.el.querySelector('#assessmentReport').onclick = () => {
            this.callbacks.closeSidebar();
            this.callbacks.assessmentReport();
        }
    }

    /**
     * Returns the HTML template for the sidebar menu when on directory's page
     * @returns {string} HTML template for sidebar menu
     * @private
     */
    _html() {
        return `<section class="menu-section">
                    <h2 class="menu-section-title mb-4">Menu</h2>
                    <ul class="menu-section-list">
                        ${this.routeName !== "directory" ? '<a data-link="directory" class="nav-link"><i class="fas fa-list mr-2"></i>Boxer Directory</a>' : ""}
                        ${SidebarView.returnAccordionNavHTML('<i class="fas fa-file-pdf mr-2" style="font-size:19px;"></i>Reports', [
                            '<a id="directoryReport" class="nav-link">Directory Report</a>',
                            '<a id="assessmentReport" class="nav-link">Assessments Report</a>'
                        ])}
                        <a id="enrollNewBoxer" class="nav-link addBoxerLink"><i class="fas fa-user-plus mr-2"></i>Enroll New Boxer</a>
                        <a id="addExistingBoxer" class="nav-link addBoxerLink"><i class="fas fa-id-card-alt mr-2"></i>Add Existing Boxer</a>
                        <hr>
                        <a data-link="aboutUs" class="nav-link"><i class="fas fa-hand-point-right mr-2" style="font-size:19px;"></i>About Us</a>
                        <a id="logout" class="nav-link"><i class="fas fa-sign-out-alt mr-2" style="font-size:19px;"></i>Log Out</a>
                    </ul>
                </section>`
    }
}

/**
 * GeneralMenuView class includes a template of all menu options excluding the route rendered.
 */
export class GeneralMenuView extends SidebarView {

    /**
     * Constructor for CoachPageMenuView
     * @constructor
     * @param {object} dataHive - DataStore object connected to this SidebarView
     * @param callbacks - callback functions that are defined in coachPage route in Route Controller class
     * @param routeName - the route that the app is on, it will be used to exclude from the menu options.
     */
    constructor(dataHive, callbacks, routeName) {
        super(dataHive, callbacks, routeName);
        this.routeName = routeName;
        this.dataHive = dataHive;
        this.newFighterEnrollment = dataHive.newFighterEnrollment;
        this.newExistingAssessment = dataHive.newExistingAssessment;
        this.addAssessment = dataHive.addAssessment;
        this.varyingMenuOptions = {
            boxerProfile: `<a data-link="summary" class="nav-link">Boxer Profile</a>`,

            vitals: {
                vitalsForm: `<a data-link="vitals" class="nav-link"><i class="fas fa-plus-circle mr-2"></i>Vitals</a>`,
                vitalsHistory: `<a data-link="vitalSummary" class="nav-link">Vitals History</a>`,
                vitalsSummary: `<a data-link="vitalSummary" class="nav-link">Vitals Summary</a>`
            },
            pdq: {
                pdqLongForm: `<a data-link="pdq39Form" class="nav-link"><i class="fas fa-plus-circle mr-2"></i>PDQ</a>`,
                pdqQuickForm: `<a data-link="pdq39QuickForm" class="nav-link"><i class="fas fa-plus-circle mr-2"></i>PDQ</a>`,
                pdqHistory: `<a data-link="pdqSummary" class="nav-link">PDQ History</a>`,
                pdqSummary: `<a data-link="pdqSummary" class="nav-link">PDQ Summary</a>`
            },
            physicalAssessment: {
                paLongForm: `<a data-link="paLongForm" class="nav-link"><i class="fas fa-plus-circle mr-2"></i>Physical Tests</a>`,
                paQuickForm: `<a data-link="paQuickForm" class="nav-link"><i class="fas fa-plus-circle mr-2"></i>Physical Tests</a>`,
                paHistory: `<a data-link="paSummary" class="nav-link">Physical History</a>`,
                paSummary: `<a data-link="paSummary" class="nav-link">Physical Summary</a>`
            },
            enrollNewBoxer: `<a id="enrollNewBoxer" class="nav-link addBoxerLink"><i class="fas fa-user-plus mr-2"></i>Enroll New Boxer</a>`,
            addExistingBoxer: `<a id="addExistingBoxer" class="nav-link addBoxerLink"><i class="fas fa-id-card-alt mr-2"></i>Add Existing Boxer</a>`,
            beginAssessment: `<a id="beginAssess" class="nav-link addAssessLink ml-1"><i class="far fa-circle mr-2 mr-2"></i>Begin Assessment</a>`,
            addExistingAssessment: `<a id="addPrevAssess" class="nav-link addAssessLink"><i class="fas fa-plus-circle mr-2"></i>Add Previous Assess</a>`,
            addNewAssessment: `<a id="addNewAssess" class="nav-link addAssessLink"><i class="fas fa-plus-circle mr-2"></i>Add New Assessment</a>`,
            assessmentHistory: `<a data-link="assessmentHistory" class="nav-link ml-1"><i class="fas fa-archive mr-2"></i>Assessment History</a>`,
            waivers: `<a data-link="waivers" class="nav-link">Waivers</a>`,
            coachPage: `<a data-link="coachPage" class="nav-link">Coach's Page</a>`
        };
    }

    /**
     * Calls functions after page has rendered with the sidebar menu
     */
    postRenderSetup() {
        const link = this.el.querySelector('a.nav-link[data-link="' + this.routeName + '"]');
        if(link) link.remove();

        this.el.querySelectorAll('a.addBoxerLink').forEach((addBoxerLink) => {
            addBoxerLink.onclick = () => {
                this.callbacks.closeSidebar();
                this.callbacks.createNewFighter(addBoxerLink.id);
            }
        });

        this.el.querySelector('a[data-link="directory"]').onclick = (event) => {
            if(this.newFighterEnrollment || (!this.newFighterEnrollment && this.addAssessment)) {
                event.preventDefault();
                const confirmModal = new ModalComponent({
                    footer: true,
                    stickFooter: false,
                    closeMethods: ['button']})
                    .setContent(`<div>
                                            <h3>Going to the boxer directory?</h3>
                                            <hr>
                                            <h4>${this.newFighterEnrollment ? "You haven't completed the boxer " +
                        (this.newExistingAssessment ? "entry" : "enrollment") + " process."
                        : "The assessment is incomplete, which can lead to invalid scores."} Are you sure to continue?</h4>
                                         </div>`)
                    .setFooterButtons([{
                        label: "Yes, let's leave",
                        cssClass: 'tingle-btn tingle-btn--primary',
                        callback: () => {
                            this.callbacks.closeSidebar();
                            this.callbacks.nextPage('directory');
                            confirmModal.closeModal();
                        }
                    }, {
                        label: "No, let's finish",
                        cssClass: 'tingle-btn tingle-btn--primary',
                        callback: () => {
                            confirmModal.closeModal();
                            this.callbacks.closeSidebar();
                        }
                    }]).openModal();
            } else {
                this.callbacks.closeSidebar();
                this.callbacks.nextPage('directory');
            }
        };

        this.el.querySelectorAll('a.addAssessLink').forEach((addAssessLink) => {
            addAssessLink.onclick = () => {
                this.callbacks.closeSidebar();
                if(addAssessLink.id === "addNewAssess") {
                    Toastify({
                        text: "Please confirm the boxer's information",
                        duration: 10000,
                        newWindow: true,
                        close: true,
                        gravity: "bottom", // `top` or `bottom`
                        positionLeft: true, // `true` or `false`
                        backgroundColor: "linear-gradient(to bottom, #0174DF, #0080FF);",
                        stopOnFocus: true // Prevents dismissing of toast on hover
                    }).showToast();
                    setTimeout(Toastify({
                        text: `Use the toggle switch <i class="fas fa-toggle-on fa-flip-horizontal fa-lg mr-2 ml-2"></i> in the top-right corner to change the edit mode`,
                        duration: 10000,
                        newWindow: true,
                        close: true,
                        gravity: "bottom", // `top` or `bottom`
                        positionLeft: true, // `true` or `false`
                        backgroundColor: "linear-gradient(to bottom, #0174DF, #0080FF);",
                        stopOnFocus: true // Prevents dismissing of toast on hover
                    }).showToast(), 30000);
                    this.dataHive.addAssessment = true;
                    this.callbacks.nextPage('personalInformation');
                } else if(addAssessLink.id === "beginAssess") {
                    this.callbacks.addAssessment({newExistingAssessment: this.newExistingAssessment})
                } else if(addAssessLink.id === "addPrevAssess") {
                    this.callbacks.addAssessment({newExistingAssessment: true});
                }
            }
        });

        this.el.querySelector('#bwpReport').onclick = () => {
            this.callbacks.closeSidebar();
            this.callbacks.bwpReport();
        }
    }

    /**
     * Returns the portion of the menu template that coaches will see when after they've clicked on a boxer in the boxer directory
     * @returns {string} - HTML template string
     * @private
     */
    _returnGeneralBoxerMenuHTML() {
        return `
        <ul class="menu-section-list">
            ${SidebarView.returnAccordionNavHTML('Boxer History', [
                this.varyingMenuOptions.assessmentHistory
                + this.varyingMenuOptions.vitals.vitalsHistory
                + this.varyingMenuOptions.pdq.pdqHistory
                + this.varyingMenuOptions.physicalAssessment.paHistory
            ])}
         
        </ul>    
        ${this.varyingMenuOptions.coachPage
        + this.varyingMenuOptions.waivers} 
        <h3 class="menu-section-title mt-3 mb-3">Assessments</h3>
        <ul class="menu-section-list pl-2" style="background:#0174DF;">
            ${this.varyingMenuOptions.enrollNewBoxer
            + this.varyingMenuOptions.addExistingBoxer
            + this.varyingMenuOptions.addNewAssessment
            + this.varyingMenuOptions.addExistingAssessment}
        </ul>`;
    }

    /**
     * Returns the portion of the menu template that coaches will see when they either clicked on "Enroll New Boxer",
     * "Add Existing Boxer", "Add New Assessment, or "Add Previous Assess".
     * @returns {string} - HTML template string
     * @private
     */
    _returnAddMenuHTML() {
        const vitalsAssessments = this.dataHive.fighterModel.vitalsModel._vitalsAssessment;
        const pdqAssessments = this.dataHive.fighterModel.pdqModel._pdqAssessments;
        const physicalAssessments = this.dataHive.fighterModel.physicalAssessmentModel._physicalAssessments;

        const vitalNavLinksArray = [this.varyingMenuOptions.vitals.vitalsForm];
        if(vitalsAssessments.size > 0) vitalNavLinksArray.push(this.varyingMenuOptions.vitals.vitalsSummary);

        const pdqNavLinksArray = [];
        if(this.newExistingAssessment) pdqNavLinksArray.push(this.varyingMenuOptions.pdq.pdqQuickForm);
        else pdqNavLinksArray.push(this.varyingMenuOptions.pdq.pdqLongForm);
        if(pdqAssessments.size > 0) pdqNavLinksArray.push(this.varyingMenuOptions.pdq.pdqSummary);

        const paNavLinksArray = [];
        if(this.newExistingAssessment) paNavLinksArray.push(this.varyingMenuOptions.physicalAssessment.paQuickForm);
        else paNavLinksArray.push(this.varyingMenuOptions.physicalAssessment.paLongForm);
        if(physicalAssessments.size > 0) paNavLinksArray.push(this.varyingMenuOptions.physicalAssessment.paSummary);

        let assessmentHistory = "";
        if(!this.newFighterEnrollment && (vitalsAssessments.size > 0 || pdqAssessments.size > 0 ||
            physicalAssessments.size > 0)) assessmentHistory = this.varyingMenuOptions.assessmentHistory;

        return `<h3 class="menu-section-title mt-3 mb-3">Assessments</h3>
                <ul class="menu-section-list" style="background:#0868c1;">
                    ${this.newFighterEnrollment
                        ? this.varyingMenuOptions.beginAssessment
                        : ""}
                    ${assessmentHistory
                    + SidebarView.returnAccordionNavHTML("VITALS", vitalNavLinksArray)
                    + SidebarView.returnAccordionNavHTML("PDQ", pdqNavLinksArray)
                    + SidebarView.returnAccordionNavHTML("PHYSICAL TESTS", paNavLinksArray)}
                </ul>
                ${!(!this.newFighterEnrollment && this.addAssessment && this.newExistingAssessment)
                    ? this.varyingMenuOptions.coachPage
                    : ""}`;
    }


    /**
     * Returns the HTML template for the sidebar menu when on coach page
     * @returns {string} HTML template for sidebar menu
     * @private
     */
    _html() {
        return `<section class="menu-section">
                    <h2 class="menu-section-title mb-4">Menu</h2>
                    <ul class="menu-section-list">
                        <a data-link="directory" class="nav-link"><i class="fas fa-list mr-2"></i>Boxer Directory</a>
                        ${SidebarView.returnAccordionNavHTML('<i class="fas fa-file-pdf mr-2" style="font-size:19px;"></i>Reports', [
                            '<a id="bwpReport" class="nav-link">BwP Report</a>'
                        ])}
                        ${(!this.newFighterEnrollment && !this.addAssessment && !this.newExistingAssessment) 
                            ? this.varyingMenuOptions.boxerProfile 
                            : ""
                        }
                        ${!(!this.newFighterEnrollment && this.addAssessment && this.newExistingAssessment)
                            ?  `${SidebarView.returnAccordionNavHTML('Boxer Information', [
                                    '<a data-link="personalInformation" class="nav-link">Personal Information</a>',
                                    '<a data-link="emergencyContact" class="nav-link">Emergency Contact Information</a>',
                                    '<a data-link="parkinsonSymptoms" class="nav-link">Parkinsons Symptoms</a>',
                                    '<a data-link="parkinsonsMedications" class="nav-link">Parkinsons Medications</a>',
                                    '<a data-link="healthConditions" class="nav-link">Health & Heart Conditions</a>'
                                ])}`
                            :   ""
                        }
                        ${(!this.newFighterEnrollment && !this.addAssessment && !this.newExistingAssessment) 
                            ? this._returnGeneralBoxerMenuHTML()
                            : ""
                        }
                        ${this.addAssessment ? this._returnAddMenuHTML() : ""}
                        <hr>
                        <a id="logout" class="nav-link"><i class="fas fa-sign-out-alt mr-2" style="font-size:19px;"></i>Log Out</a>
                    </ul>
                </section>`;
    }
}

