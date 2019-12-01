/**
 * First routed page of the PA, and is used to choose between doing a new assessment, an existing assessment.
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 5/16/19
 * PAView.js
 */

"use strict";

import View from "../View";
import ModalComponent from "../components/ModalComponent"

/**
 * View class PA Quick Form. Handles template and rendering for PA's front page.
 */
export default class PAView extends View
{

    /**
     * Constructor for PAView
     * @param {object} datahive - Datahive object for this View
     * @param {function} callbacks - Callback hook functions for use with this view
     */
    constructor(datahive, callbacks)
    {
        super(datahive, callbacks)
    }

    /**
     * Creates and displays a modal component that gives fighters options to take PA quick or long form.
     */
    postRenderSetup() {
        const modal = new ModalComponent({
            footer: true,
            stickyFooter: false,
            closeMethods: ['button', 'close', 'overlay'],
            closeLabel: "Close"
        })
            .setContent(`<div>
            <h3>Physical Assessments</h3>
            <p>Which assessment form would you like?</p></div>`)
            .setFooterButtons([
                {
                    label: "Quick",
                    cssClass: 'tingle-btn tingle-btn--primary',
                    callback: () => {
                        this.callbacks.changeEditStatus(true);
                        this.callbacks.nextPage('paQuickForm');
                        console.log("Going to quick forms..");
                        modal.closeModal();
                    }
                },
                {
                    label: "Long",
                    cssClass: "tingle-btn tingle-btn--primary",
                    callback: () => {
                        this.callbacks.nextPage('paLongForm');
                        console.log("Going to long form..");
                        modal.closeModal();
                    }
                }
            ]).openModal();
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

