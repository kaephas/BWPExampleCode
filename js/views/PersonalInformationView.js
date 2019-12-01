/**
 * Personal Information View displays the form that gathers fighter's personal information data.
 * @author Cynthia Pham
 * @author Tyler Bezera
 * 2/25/19
 * PersonalInformationView.js
 */

'use strict';

import View from './View.js';
import SelectComponent from './components/SelectComponent';
import InputComponent from './components/InputComponent';
import ToggleSwitchComponent from './components/ToggleSwitchComponent';
import Camera from '../controllers/CameraController';
import PALongView from './physicalAssessment/PALongView';
import autocomplete from "autocompleter";

/**
 * View class for Personal Information. Handles template and rendering.
 */
export default class PersonalInformationView extends View
{
    /**
     * PersonalInformation constructor builds the View.
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks)
    {
        super(dataHive, callbacks);
        this.personalInfo = dataHive.personalInfo;
        this.affiliates = dataHive.affiliates;
        this.newFighterEnrollment = dataHive.newFighterEnrollment;
        this.addAssessment = dataHive.addAssessment;
        this.locations = dataHive.locations;

        if(!this.newFighterEnrollment && !this.addAssessment) {
            this._buttonHTML = `<button class="next-button btn-rsb float-left" data-value="summary"><i
                            class="fas fa-arrow-left"></i>&nbsp;Boxer Profile</button>`;
        } else {
            this._buttonHTML = `<button class="next-button btn-rsb float-right" data-value="emergencyContact">Emergency Contact&nbsp;<i
                            class="fas fa-arrow-right"></i></button>`;
        }

        if(!this.newFighterEnrollment) {
            this._toggleSwitch = new ToggleSwitchComponent()
                .setId('editModeSwitch')
                .setValue(this.dataHive.fighterModel.getEditStatus())
                ._html();
        }

        Date.prototype.toDateInputValue = (function() {
            let local = new Date(this);
            local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
            return local.toJSON().slice(0,10);
        });

        Date.prototype.toInputString = (function() {
            let currMonth = (this.getUTCMonth() + 1) < 10 ? "0" + (this.getUTCMonth() + 1) : (this.getUTCMonth() + 1);
            let currDate = this.getUTCDate() < 10 ? "0" + this.getUTCDate() : this.getUTCDate();
            return String(this.getUTCFullYear() + "-" + currMonth + "-" + currDate);
        });
    }

    /**
     * Event thrown when View has finished rendering.  Assists with capture/uploading fighter's image.
     */
    postRenderSetup()
    {
        const imageError = this.el.querySelector('#imageError');
        const locationInput = this.el.querySelector('#location');
        const affiliateInput = this.el.querySelector('#affiliate');

        this.el.querySelector('#takeImage').onclick = (event) => {
            event.preventDefault();
            Camera.prototype.openCamera('img#fighterImage');
            imageError.innerHTML = "";
        };

        this.el.querySelector('#uploadImage').addEventListener('change', (event) => {
            imageError.innerHTML = "";
            if (event.target.files && event.target.files[0]) {
                if(event.target.files[0].size < 5000000) { //bytes
                    imageError.innerHTML = "";
                    const reader = new FileReader();

                    reader.onload = (event) => {
                        this.el.querySelector('#fighterImage').src = event.target.result;
                        const imageURi = event.target.result.replace(/^data:image\/[a-z]+;base64,/, "");
                        console.log("Made it to here."); // TODO: Remove this line
                        console.log("image:");
                        console.log(imageURi);
                        this.callbacks.saveImgToDatabase(imageURi);
                        console.log("Also made it to here."); // TODO remove this line
                    };
                    console.log("how about here?"); // TODO remove this line
                    reader.readAsDataURL(event.target.files[0]);
                    console.log("and here?");
                } else {
                    imageError.innerHTML = `<i class="fas fa-exclamation-circle"></i>  Image size too large to save. Please limit to 5MB.`;
                }
            }
        });

        this.el.querySelector('#fighterBirthDate').onblur = (event) => {
            event.preventDefault();
            const split = event.target.value.split('/');
            let date = split.length === 3 ? `${split[2]}-${split[0]}-${split[1]}` : "";
            this.personalInfo.birthDate = new Date(date).isValid ? date : "";
            this.callbacks.updateFighter({"personalInformation.birthDate": this.personalInfo.birthDate});
        };

        locationInput.onchange = (e) => {
            e.preventDefault();
            const location = e.target.options[e.target.selectedIndex].text;
            // Updates affiliate location in coach model.
            this.callbacks.updateAffiliateLocation(this.personalInfo.affiliateName, location);
            locationInput.value = location;
            this.callbacks.updateFighter({"personalInformation.location": location});
        };

        affiliateInput.onchange = (e) => {
            e.preventDefault();
            const affiliate = e.target.options[e.target.selectedIndex].text;

            // Gets and updates location value
            const affiliateLocationNames = this.dataHive.affiliateLocationsObject[affiliate];
            const location = affiliateLocationNames.includes(locationInput.value) ? locationInput.value : affiliateLocationNames[0];

            // Updates affiliate location in coach model.
            this.callbacks.updateAffiliateLocation(affiliate, location);

            // Updates select location options
            locationInput.innerHTML = affiliateLocationNames.map((affiliateLocation) => {
                return `<option value="${affiliateLocation}" ${affiliateLocation === location ? "selected" : ""}>${affiliateLocation}</option>`;
            }).join('');
            locationInput.value = location;

            // Updates affiliateName and location in personalInformationModel and uploads changes to database
            this.personalInfo.affiliateName = affiliate;
            this.personalInfo.location = location;
            this.callbacks.updateFighter({"personalInformation.affiliateName": affiliate, "personalInformation.location": location});
        };
    }

    /**
     * Method that compiles template
     *
     * @returns {string} directory template
     * @private method used for rendering
     */
    _html()
    {
        return `
        <div class="container">
            <div class="card card-shadow" style="border: solid 2px #dedede;">
                <div class="card-body">
                    ${this._toggleSwitch ? this._toggleSwitch : ""}
                    <div class="card-title" style="font-weight: bold;">
                        Personal Information - ${this.personalInfo.firstName} ${this.personalInfo.lastName}
                    </div>
                    <hr>
                    <form id="personalInformation" class="modern-form editableForm" data-model="personalInformationModel">
                        <div class="row mb-3">
                            <div class="col-12 col-sm-6 col-md-4 col-lg-4 col-xl-3">
                                ${new InputComponent()
                                    .setId('fName')
                                    .setClasses('form-control')
                                    .setName('firstName')
                                    .setValue(this.personalInfo.firstName)
                                    .setLabel('First Name')
                                    ._html()}
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-4 col-xl-3">
                                ${new InputComponent()
                                    .setId('fighterLastName')
                                    .setClasses('form-control')
                                    .setName('lastName')
                                    .setValue(this.personalInfo.lastName)
                                    .setLabel('Last Name')
                                    ._html()}
                            </div>
                            <div class="col-12 col-sm-6 col-md-4 col-lg-4 col-xl-3">
                                ${new InputComponent()
                                    .setId('fighterNickName')
                                    .setClasses('form-control')
                                    .setName('nickName')
                                    .setValue(this.personalInfo.nickName)
                                    .setLabel('Nickname')
                                    ._html()}
                            </div>
                            <div class="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
                                ${new InputComponent()
                                    .setId('fighterBirthDate')
                                    .setClasses('form-control')
                                    .setName('birthDate')
                                    .setValue(this.personalInfo.birthDate ? PALongView.displayFullDateFromDate(new Date(this.personalInfo.birthDate).toInputString()) : "")
                                    .setPlaceholder('mm/dd/yyyy')
                                    .setLabel('Birthdate')
                                    ._html()}
                            </div>
                            <div class="col-3 col-md-2 col-xl-1">
                                <label for="fighterGender" class="form-label input-text">Gender</label>
                                <select id="fighterGender" class="form-control" name="gender">
                                    <option value="Male" ${(this.personalInfo.gender === "Male" || this.personalInfo.gender === "M") ? "selected" : ""}>M</option>
                                    <option value="Female" ${(this.personalInfo.gender === "Female" || this.personalInfo.gender === "F") ? "selected" : ""}>F</option>
                                </select>
                            </div>
                            ${this.newFighterEnrollment 
                                ? "" 
                                : `<div class="col-6 col-sm-4 col-md-3 col-xl-2">
                                        <label for="fighterActive" class="form-label input-text">Member Status</label>
                                        <select id="fighterActive" class="form-control" name="activeFlag" value="${this.personalInfo.activeFlag}">
                                            <option value="${true}" ${this.personalInfo.activeFlag ? "selected" : ""}>Active</option>
                                            <option value="${false}" ${this.personalInfo.activeFlag ? "" : "selected"}>Inactive/Hold</option>
                                        </select>
                                    </div>`}
                            <div class="col-6 col-sm-4 col-md-3 col-xl-2">
                                <label for="height" class="form-label input-text">Ht in In.</label>
                                <input type="number" class="form-control" id="height" style="width:100px;height:38px;" min="0" 
                                step="any" oninput="validity.valid||(value='');" name="height" value="${this.personalInfo.height}">
                            </div>
                        </div>
                        <hr>
                        <div class="row mb-1">
                            <div class="col-12">
                                ${new InputComponent()
                                    .setId('fighterAddressLine')
                                    .setClasses('form-control')
                                    .setName('address')
                                    .setValue(this.personalInfo.address)
                                    .setLabel('Address')
                                    ._html()}
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-5">
                                ${new InputComponent()
                                    .setId('fighterCity')
                                    .setClasses('form-control')
                                    .setName('city')
                                    .setValue(this.personalInfo.city)
                                    .setLabel('City')
                                    ._html()}
                            </div>
                            <div class="col-3">
                                ${new SelectComponent(['AL','AK','AS','AZ','AR','CA','CO','CT','DE','DC','FM','FL','GA',
                                                        'GU','HI','ID','IL','IN','IA','KS','KY','LA','ME','MH','MD','MA',
                                                        'MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND',
                                                        'MP','OH','OK','OR','PW','PA','PR','RI','SC','SD','TN','TX','UT',
                                                        'VT','VI','VA','WA','WV','WI','WY'])
                                    .setId('fighterState')
                                    .setClasses('form-control')
                                    .setName('state')
                                    .setValue(this.personalInfo.state)
                                    .setLabel('State')
                                    ._html()}
                            </div>
                            <div class="col-4">
                                ${new InputComponent()
                                    .setId('fighterZIP')
                                    .setClasses('form-control')
                                    .setName('zipCode')
                                    .setValue(this.personalInfo.zipCode)
                                    .setLabel('Zip Code')
                                    .setData('pattern', '[0-9]{5}')
                                    .setType('number')
                                    ._html()}
                            </div>
                        </div>
                        <hr>
                        <div class="row">
                            <div class="col-4">
                                ${new InputComponent()
                                    .setType('tel')
                                    .setId('fighterNumberCell')
                                    .setClasses('form-control')
                                    .setName('phone')
                                    .setValue(this.personalInfo.phone.primaryPhone)
                                    .setLabel('Primary Phone')
                                    .setData('field', 'primaryPhone')
                                    .setData('pattern', '[0-9]{3}-[0-9]{3}-[0-9]{4}')
                                    .setPlaceholder('(123) 456-7890')
                                    .setData('mask', '(000) 000-0000')
                                    ._html()}
                            </div>
                            <div class="col-4">
                                ${new InputComponent()
                                    .setType('tel')
                                    .setId('fighterNumberHome')
                                    .setClasses('form-control')
                                    .setName('phone')
                                    .setValue(this.personalInfo.phone.secondaryPhone)
                                    .setLabel('Secondary Phone')
                                    .setData('pattern', '[0-9]{3}-[0-9]{3}-[0-9]{4}')
                                    .setData('field', "secondaryPhone")
                                    .setPlaceholder('(123) 456-7890')
                                    .setData('mask', '(000) 000-0000')
                                    ._html()}
                            </div>
                            <div class="col-7 col-md-5 col-lg-4">
                                ${new InputComponent()
                                    .setType('email')
                                    .setId('fighterEmail')
                                    .setClasses('form-control')
                                    .setName('email')
                                    .setValue(this.personalInfo.email)
                                    .setLabel('Email')
                                    ._html()}
                            </div>
                        </div>
                        <hr>
                        <div class="row mb-3">
                            <div class="col-6">
                                ${new SelectComponent(this.affiliates)
                                    .setId('affiliate')
                                    .setClasses('form-control')
                                    .setName('affiliateName')
                                    .setValue(this.personalInfo.affiliateName ? this.personalInfo.affiliateName : this.dataHive.affiliate)
                                    .setLabel('Affiliate')
                                    ._html()}
                            </div>
                            <div class="col-6">
                                ${ new SelectComponent(this.locations)
                                    .setId('location')
                                    .setClasses('form-control')
                                    .setName('location')
                                    .setValue(this.personalInfo.location ? this.personalInfo.location : this.dataHive.coachLocation)
                                    .setLabel('Location')
                                    ._html()}
                            </div>
                        </div>
                        <hr>
                        <div class="row">
                            <div class="col-12 text-center">
                                <div id="fighterPicture">
                                    <img id="fighterImage" class="rounded mx-auto d-block" src="${this.personalInfo.image.length > 0 ? this.personalInfo.image : 'img/boxer.jpg'}"
                                    alt="fighterImage" aria-describedby="pictureInfo" height="300px" width="300px">
                                </div>
                                <p class="mt-2" style="font-size:11px;">* Please upload .jpg or .png files that are under 5MB.</p>
                                <p id="imageError" class="mt-2"></p>
                                <button id="takeImage" class="inputfile"></button>
                                <label for="takeImage" class="mt-2">
                                    <i class="fas fa-camera" style="font-size:1.25em;"></i>  Take photo...
                                </label>
                                <input type="file" accept="image/png, image/jpeg, image/gif" id="uploadImage"
                                    class="inputfile"/>
                                <label for="uploadImage" class="offset-2 mt-2">
                                    <i class="fas fa-images" style="font-size:1.25em;"></i>  Select image...
                                </label>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="card-footer">
                    ${this._buttonHTML}
                </div>
            </div>
        </div>`;
    }
};
