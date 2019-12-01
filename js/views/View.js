/**
 * @author Cynthia Pham
 * @author Jacob Landowski
 * @author Tyler Bezera
 * 1/29/19
 * Parent View class to be inherited with basic functions for each specific view.
 */


'use strict';

import Renderable from './Renderable';
import VanillaMasker from "vanilla-masker";
import tippy from "tippy.js";
import Toastify from 'toastify-js'

/**
 * Parent View class to be inherited with basic functions for each specific view.
 */
export default class View extends Renderable
{
    /**
     * Constructor function for View, takes in a reference to it's dataHive (set in route controller) and it's callback
     * functions.
     * @param {object} dataHive - An object of objects, references to different models
     * @param {object} callbacks - An object of callback functions, some inherited
     */
    constructor(dataHive, callbacks)
    {
        super();
        this.dataHive = dataHive;
        this.callbacks = callbacks;
    }

    /**
     * Calls Renderable for it's element to append it's view data to to, while also binding any forms, next buttons,
     * edit toggle switches, tooltips, and applies data masking.
     * @returns {HTMLElement} the prepared element
     */
    render()
    {
        this.el = super.render();
        this._bindForms();
        this._bindNextButton();
        this._bindEditToggleSwitch();
        this._bindTooltips();
        this._applyDataMask();

        this.container.innerHTML = "";
        this.container.appendChild(this.el);

        if(this.postRenderSetup) this.postRenderSetup();

        return this.el;
    }

    /**
     * Div, or other HTMLElement, for views to be appended to
     * @param {HTMLElement} container - such as div, content.. this is where the single page application views will be
     * appended to
     */
    setContentContainer(container)
    {
        this.container = container;
    }

    /**
     * Takes any form belonging to this view, iterating over them.. then adding an onblur event listening to each field
     * which allows for dynamic saving of said field.
     * @private
     */
    _bindForms()
    {
        const forms = this.el.querySelectorAll('form.modern-form');

        if(forms.length > 0 && !this.callbacks.formSave)
        {
            throw new Error(`formSaveCallback must be given to ${this.constructor.name} if a form exists.`);
        }

        // classic for loop for nodelist from querySelectorAll()
        for(let i = 0; i < forms.length; i++)
        {
            forms[i].addEventListener('blur', (event) => 
            {
                this.callbacks.formSave(event, forms[i].dataset.model);
            }, true);   
        }
    }

    /**
     * Adds an onclick event listener to the button with the class of next-button, simply invoking the callback function
     * nextPage, which navigates the app to the next screen.. based on data-value tag in button.
     * @private
     */
    _bindNextButton()
    {
        const nextButtons = this.el.querySelectorAll('button.next-button');

        // touch end needed
        if(nextButtons)
        {
            nextButtons.forEach((nextButton) => {
                nextButton.addEventListener('click', () =>
                {
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
                    this.callbacks.nextPage(nextButton.dataset.value);
                });
            });
        }
    }

    /**
     * Adds a change event listener to a ToggleSwitchComponent that has an id "editModeSwitch".  Invokes the
     * callback function changeEditMode, which passes a boolean value of making fighter's info editable from
     * RouteController to FighterModel where the editable variable is set.
     * @private
     */
    _bindEditToggleSwitch()
    {
        const editModeSwitch = this.el.querySelector('input#editModeSwitch');

        if(editModeSwitch)
        {
            editModeSwitch.addEventListener('change', (event) =>
            {
                this.callbacks.changeEditStatus(event.target.value);
                View.disableFormFields(this.el, event.target.value);
            });
        }
    }

    /**
     * TODO: Needs rework to be ambiguous for all types.
     * Applies data masking utilises to fields.
     * @private
     */
    _applyDataMask()
    {
        if(this.el.querySelector('input[type="tel"]'))
            this.el.querySelectorAll('input[type="tel"]').forEach((input) => {
                VanillaMasker(input).maskPattern("(999) 999-9999");
            });
        if(this.el.querySelector('#fighterBirthDate'))
            VanillaMasker(this.el.querySelector('#fighterBirthDate')).maskPattern("99/99/9999");
    }

    /**
     * Any elements with the [data-tippy-content] applied to it, will have clean tooltips applied.
     * @private
     */
    _bindTooltips()
    {
        tippy(this.el.querySelectorAll('[data-tippy-content]'),
            {
            arrow: true,
            arrowType: "round",
            maxWidth: "400px",
        });
    }

    static disableFormFields(contentView, editBoolean)
    {
        const form = contentView.querySelector('.editableForm');
        if(form) {
            for(let formField of form ) {
                if(formField.className !== 'inputfile') {
                    if(editBoolean === 'true' || editBoolean === true) {
                        formField.disabled = false;
                    } else if(editBoolean === 'false' || editBoolean === false) {
                        formField.disabled = true;
                    }
                }
            }
        }
    }

}