/**
 * Toast Component is used for dialog boxes
 * @author Tyler Bezera
 * 5/17/18
 * ModalComponent.js
 */


"use strict";

import Renderable from "../Renderable"
import tingle from "tingle.js";

/**
 * ModalComponent Class used to display a modal on a rendered page.
 */
export default class ModalComponent extends Renderable
{
    /**
     * Constructor for a new ModalComponent
     * @param {object} options - options object for modal
     * options - {
     *      footer: Boolean //display footer or not
     *      stickyFooter: Boolean //true for footer to always be visible
     *      closeMethods: Array<String> //array of close methods, such as ['overlay', 'button', 'escape']
     *      onOpen: Function // function callback when modal opens
     *      onClose: Function // function callback when modal closes
     *      beforeOpen: Function // function callback when modal is about to open
     *      beforeClose: Function // function callback before modal is closed
     *      cssClass: Array<String> //array of custom css classes, such as ['custom-class-1', 'custom-class-2']
     *      closeLabel: String //label to appear on mobile for close button
     * }
     */
    constructor(options = {})
    {
        super();
        this.modal = new tingle.modal(options);
        this.setCloseIcon();

    }

    /**
     * Sets string 'x' as close button icon on modal
     */
    setCloseIcon()
    {
        if (this.modal.opts.closeMethods.indexOf('button') !== -1) {
            this.modal.modalCloseBtnIcon.innerHTML = 'x';
        }
    }

    /**
     * Sets the content of the modal, the html that would show in the center of the modal
     * @param {string} content - html string of content to be displayed //i.e `<h1>Welcome</h1>`
     * @returns {ModalComponent} for method chaining..
     */
    setContent(content)
    {
        this.modal.setContent(content);
        return this;
    }

    /**
     * Sets the footer buttons for the Modal
     *
     * @param {array} buttonArray - an array of button objects
     * button: {
     *     label: String //label text
     *     cssClass: String //custom css class string i.e tingle-btn
     *     callback: Function //on click function for button
     * }
     *
     */
    setFooterButtons(buttonArray)
    {
        buttonArray.forEach((button) => {
            this.modal.addFooterBtn(button.label, button.cssClass, button.callback);
        });
        return this;
    }

    /**
     * Triggers modal component to open
     * @returns {ModalComponent} - returns the modal component back
     */
    openModal()
    {
        this.modal.open();
        return this;
    }

    /**
     * Triggers modal component to close
     * @returns {ModalComponent} - returns the modal component back
     */
    closeModal()
    {
        this.modal.close();
        return this;
    }

    /**
     * Returns the HTML template of page behind modal component
     * @returns {string} - HTML template
     * @private
     */
    _html()
    {
        return `<div></div>`
    }
}