/**
 * Sidebar View defines that basic functions for each specific sidebar view
 * @author Cynthia Pham
 * 3/25/19
 *  SidebarView.js
 */


'use strict';

import Renderable from './Renderable';
import Slideout from 'slideout';
import Toastify from "toastify-js";

/**
 * Parent SidebarView class to be inherited with basic functions for each specific sidebar view
 */
export default class SidebarView extends Renderable {

    /**
     * Constructor for SidebarView
     * @constructor
     * @param {object} dataHive - DataStore object connected to this SidebarView
     * @param callbacks - callback functions that are defined in Route Controller class
     * @param routeName - the route that the app is on, it will be used to exclude from the menu options.
     */
    constructor(dataHive, callbacks, routeName) {
        super();
        this.dataHive = dataHive;
        this.callbacks = callbacks;
        this.routeName = routeName;
        this._setupSubscriptions();
    }

    /**
     * Calls Renderable for its element to append its view data to in the sidebar container. Also binds sidebar
     * and adds event handlers to the menu links within the sidebar
     * @returns {HTMLElement} the prepared element
     */
    render()
    {
        this.el = super.render();
        this.sidebarContainer.innerHTML = "";
        this.sidebarContainer.appendChild(this.el);
        this._bindSidebar();
        this._addEventHandlers();

        if(this.postRenderSetup) this.postRenderSetup();

        return this.el;
    }

    /**
     * Sets the sidebar container where the sidebar content will append to
     * @param {HTMLElement} container - such as div, content.. this is where the sidebar views will be
     * appended to
     */
    setSidebarContainer(container)
    {
        this.sidebarContainer = container;
    }

    /**
     * Div, or other HTMLElement, for views to be appended to.  Required to create new Slideout object.
     * @param {HTMLElement} container - such as div, content.. this is where the single page application views will be
     * appended to
     */
    setContentContainer(container)
    {
        this.contentContainer = container;
    }

    /**
     * Creates new slideout and binds to the sidebar container
     * @private
     */
    _bindSidebar()
    {
        this.slideout = new Slideout({
            'panel': this.contentContainer,
            'menu': this.sidebarContainer,
            'padding': 256,
            'tolerance': 70
        });
    }

    /**
     * Add event handlers to menu options to call callback functions and/or slideout functions
     * @private
     */
    _addEventHandlers()
    {
        document.querySelector('span#openNav').onclick = () => {
            this.slideout.toggle();
        };

        this.el.querySelectorAll('a.nav-link').forEach((navLink) => {
            navLink.onclick = () => {
                if(navLink.dataset.link) {
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
                    this.slideout.close();
                    this.callbacks.nextPage(navLink.dataset.link);
                }
            }
        });

        const logoutBtn = this.el.querySelector('#logout');
        if(logoutBtn) {
            logoutBtn.onclick = () => {
                this.slideout.close();
                this.callbacks.logout();
            };
        }


        this.contentContainer.onclick = () => {
            this.slideout.close();
        };

        const accordionHeaders = this.el.querySelectorAll(".navAccordionHeader");
        accordionHeaders.forEach((accordionHeader) => {
            accordionHeader.onclick = () => {
                accordionHeader.querySelector("i#chevron-icon").classList.toggle("fa-chevron-down");
                accordionHeader.querySelector("i#chevron-icon").classList.toggle("fa-chevron-up");

                const accordionBody = accordionHeader.nextElementSibling;
                if(accordionBody.style.display === "block") accordionBody.style.display = "none";
                else accordionBody.style.display = "block";
            }
        });
    }

    /**
     * Adds returns HTML string for an accordion in sidebar for clean sidebar structure/navigation
     * @param {string} accordionDisplayName - the display name that is shown on the accordion header
     * @param {Array} navLinksHTMLArray - an array of nav links HTML strings
     * @param {string} id - id name for accordion header if needed for future manipulations
     */
    static returnAccordionNavHTML(accordionDisplayName, navLinksHTMLArray, id="") {
        return `<button class="navAccordionHeader" id="${id}">${accordionDisplayName}<i class="fas fa-chevron-down float-right" id="chevron-icon"></i></button>
                <div class="navAccordionBody">
                    ${navLinksHTMLArray.map(navLinkHTML => `<div style="border-top:solid 1px;border-left:solid 1px;border-right:solid 1px;">${navLinkHTML}</div>`).join("")}
                </div>`;
    }

    /**
     * Method used to setup EventDispatcher subscriptions
     * @private
     */
    _setupSubscriptions() {

        this.subscribeTo("RouteController", "closeSidebar", "closeSidebar", () => {
            this.slideout.close();
        });
    }
}