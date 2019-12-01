/**
 * First routed page of the PDQ39, and is used to choose between doing a new assessment, an existing assessment,
 * or skipping onto physical assessment.
 * @author Tyler Bezera
 * 5/16/19
 * PDQView.js
 */

"use strict";

import View from "../View";
import ModalComponent from "../components/ModalComponent"

/**
 * View class PDQ39 Quick Form. Handles template and rendering for PDQ's Front Page.
 */
export default class PDQView extends View
{

    /**
     * Constructor for PDQView
     * @param {object} datahive - Datahive object for this View
     * @param {function} callbacks - Callback hook functions for use with this view
     */
    constructor(datahive, callbacks)
    {
        super(datahive, callbacks);
        this.newFighterEnrollment = this.dataHive.newFighterEnrollment;
    }

    /**
     * Creates and displays a modal component that gives fighters options to take PDQ quick or long form, or skip
     * onto physical assessments
     */
    postRenderSetup() {
        const modal = new ModalComponent({
            footer: true,
            stickyFooter: false,
            closeMethods: ['button', 'close', 'overlay'],
            closeLabel: "Close"
        })
            .setContent(`<div>
            <h3>PDQ-39</h3>
            <p>Which assessment form would you like?</p></div>`)
            .setFooterButtons([
            {
                label: "Quick",
                cssClass: 'tingle-btn tingle-btn--primary',
                callback: () => {
                    this.callbacks.changeEditStatus(true);
                    this.callbacks.nextPage('pdq39QuickForm');
                    console.log("Going to quick forms..");
                    modal.closeModal();
                }
            },
            {
                label: "Long",
                cssClass: "tingle-btn tingle-btn--primary",
                callback: () => {
                    this.callbacks.nextPage('pdq39Form');
                    console.log("Going to long form..");
                    modal.closeModal();
                }
            },
                {
                    label: "Skip",
                    cssClass: "tingle-btn tingle-btn--primary",
                    callback: () => {
                        this.callbacks.nextPage('physicalAssessment');
                        console.log("Skipping");
                        modal.closeModal();
                    }

                }
        ]);

        if(this.newFighterEnrollment)
            modal.openModal();
        else
            this.callbacks.nextPage('pdqSummary');
    }

    /**
     * Returns the HTML template for the page
     * @returns {string} -  HTML template
     * @private
     */
    _html()
    {
        return `<div></div>`
    }
}

