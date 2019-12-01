/**
 * View class for the Coach login, the login system for the application
 * @author Tyler Bezera
 * 5/17/19
 * CoachLogInView.js
 */


"use strict";

import View from "./View";
import Toastify from "toastify-js";
import autocomplete from 'autocompleter';

/**
 * View class Coach Login. Handles template and rendering for coach's login page
 */
class CoachLogInView extends View
{
    /**
     * CoachLogInView constructor builds the View
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks)
    {
        super(dataHive, callbacks);
        this.callbacks.getAffiliates();
        this.callbacks.getTotalNumOfBoxers();
        this.subscribeTo("APIController", "totalNumOfBoxers", "displayNumOfBoxers", async (data) => {
            this.totalNumOfBoxers = await data.numOfBoxers;
            this.render();
        });

        this.subscribeTo("APIController", "affiliates", "grabAffiliates", async (data) => {
            let affiliates = await data;
            const affiliateInput = document.getElementById('affiliate');

            affiliates = data.map(affiliate => {
                return {
                    label: affiliate,
                    value: affiliate
                }
            });

            autocomplete({
                minLength: 1,
                input: affiliateInput,
                fetch: function(text, update) {
                    text = text.toLowerCase();
                    let suggestions = affiliates.filter(n => n.label.toLowerCase().startsWith(text));
                    update(suggestions);
                },
                onSelect: (item) => {
                    affiliateInput.value = item.label;
                    affiliateInput.onblur();
                }
            });
        });
    }

    /**
     * Calls event handler and callback functions after page has rendered.  Assists with sending data
     * to Route Controller -> API controller for login authentication.
     */
    postRenderSetup()
    {
        const login = this.el.querySelector("#login");

        this.el.querySelector('#affiliate').onblur = () => {
            this.callbacks.getLocations(this.el.querySelector('#affiliate').value.trim());
        };

        this.subscribeTo('APIController', 'locations', 'grabLocations', (locations) => {
            const locationInput = document.getElementById('location');

            const locationMap = locations.map(location => {
                return {
                    label: location,
                    value: location
                }
            });

            autocomplete({
                minLength: 1,
                input: locationInput,
                fetch: function(text, update) {
                    text = text.toLowerCase();
                    let suggestions = locationMap.filter(n => n.label.toLowerCase().startsWith(text));
                    update(suggestions);
                },
                onSelect: (item) => {
                    locationInput.value = item.label;
                    // TODO: remove the onblur? There doesn't seem to be a purpose to this
                    locationInput.onblur = function() {
                        console.log("blurred");
                    };
                }
            });
        });

        login.onclick = () => {
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
            const username = this.el.querySelector("#uname").value.trim();
            const password = this.el.querySelector("#password").value.trim();
            const affiliate = this.el.querySelector("#affiliate").value.trim();
            const location = this.el.querySelector("#location").value.trim();

            this.callbacks.attemptLogin({
                username,
                password,
                affiliate,
                location
            });
        }
    }

    /**
     * Returns HTML template that will display page for coaches to login
     * @returns {string} - HTML template
     * @private
     */
    _html()
    {
        return `
            <div class="container">
                <div class="card card-shadow" style="border: solid 2px #dedede;">
                    <div class="card-body">
                    <div class="card-text card-title">
                        Version - 0.9.94
                        <span class="float-right">${this.totalNumOfBoxers ? `${this.totalNumOfBoxers} Boxers with Parkinson's` : "" }</span>
                    </div>
                        <div class="form" id="loginForm">
                            <div class="form-group">
                                <label for="affiliate">Member</label>
                                <input type="text" class="form-control" name="affiliate" id="affiliate" autocomplete="off">
                            </div>
                            <div class="form-group">
                                <label for="location">Location</label>
                                <input type="text" class="form-control" name="location" id="location" autocomplete="off">
                            </div>
                            <div class="form-group">
                                <label for="uname">Username</label>
                                <input data-toggle="tooltip" data-placement="top" title="Now search and select your username!"
                                       type="text" class="form-control" name="uname" id="uname" autocapitalize="off">
                            </div>
                            <div class="form-group">
                                <label for="password">Password</label>
                                <input data-toggle="tooltip" data-placement="top" title="Finally enter your password."
                                       type="password" class="form-control" id="password" name="password">
                            </div>
                            <div class="form-group">
                                <label for="login">Login</label>
                                <button data-toggle="tooltip" data-placement="top" title="Login to get started" type="submit"
                                        class="form-control btn-rsb" id="login" name="login">Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row text-center mt-4">
                    <div class="col-12"><img src="img/thanks_logo.png" height="340px" width="370px" alt="Thanks logo"/></div>
                </div>
            </div>
        `;
    }
};

export default CoachLogInView;
