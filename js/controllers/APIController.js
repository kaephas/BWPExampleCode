/**
 * @author Cynthia Pham
 * @author Tyler Bezera
 * @author Jake Landowski
 * 1/29/2019
 */


"use strict";

import * as Fetcher from "../helpers/FetchUtilities";
import EventDispatcher from "./EventDispatcher";
import ModalComponent from "../views/components/ModalComponent";
import InputComponent from '../views/components/InputComponent';
import {strMapToObj} from "../helpers/MapUtilites";

/**
 * API Controller serves as a high level access point to the backend API, using tools provided by Fetch Utilities
 */
export default class APIController extends EventDispatcher
{
    /**
     * Creates a new APIController instance
     * @param {DataStore} dataStore - Reference to data store object
     */
    constructor(dataStore) 
    {
        super();
        this.dataStore = dataStore;
        this._setupSubscriptions();
        this._getPDQAssessments((data) => {
            this.dataStore.pdqQuestions = data;
            this._setupPDQInfo();
        });
        this._getPhysicalAssessmentInfo((data) => {
            this.dataStore.physicalAssessmentInfo = data;
            this._setupPAInfo();
        });
    }
    /**
     * Method to download, extract and format PDQ39 assessment information, i.e question wording
     * @private
     */
    _setupPDQInfo()
    {
        const pdqObjectArray = this.dataStore.pdqQuestions;
        this.dataStore.pdqQuestions = new Map();
        Object.keys(pdqObjectArray).forEach((key) => {
            if(key !== "_id"){
                this.dataStore.pdqQuestions.set(pdqObjectArray[key].questionID, pdqObjectArray[key].questionText);
            }
        });
    }

    /**
     * Retrieve form fields from server
     * @param {String} form - which form to retrieve fields from
     * @private
     */
    _getFieldsForForm(form, eventToFire)
    {
        Fetcher.getRequest(`resource/${form}`, (result) => {
            this.fireEvent(eventToFire, result);
        }, this.dataStore.coachModel.token);
    }

    /**
     * Method to download, extract, and format PA assessment information, i.e question wording
     * @private
     */
    _setupPAInfo()
    {
        const paObjectArray = this.dataStore.physicalAssessmentInfo;
        this.dataStore.physicalAssessmentInfo = new Map();
        Object.keys(paObjectArray).forEach((key) => {
            if(key !== "_id"){
                this.dataStore.physicalAssessmentInfo.set(paObjectArray[key].id, paObjectArray[key].info);
            }
        });
    }

    /**
     * Method to create a new fighter in the database
     * @param {object} fighterData - An object with the initial fighter information, first and last name.
     */
    createFighter(fighterData) 
    {
        Fetcher.create(fighterData, (result) => 
        {
            console.log("Result of creating new fighter " + JSON.stringify(result) + "with id " + result.id);
            this.dataStore.fighterModel.id = result.id;
        }, this.dataStore.coachModel.token);
    }

    /**
     * Method to login a coach
     * @param {object} credentials - An object containing the relevant login fields: username, password, affiliate
     * @param {function} resultHook - Function called upon fetch request completion
     */
    loginCoach(credentials, resultHook)
    {
        const url = `api/auth/login/`;
        Fetcher.postRequest(url, credentials, resultHook, this.dataStore.coachModel.token);
    }

    /**
     * Method used to update new information into a fighters model in database
     * @param {object} fighterData - formatted object for updating information, i.e {"personalInformation.firstName": "MyName" }
     * @param {number} id - the object id of the fighter object we are updating, provided by mongoose
     * @param {function} resultHook - function called when fetch request has completed
     */
    updateFighter(fighterData, id, resultHook)
    {
        Fetcher.update(fighterData, id, resultHook, this.dataStore.coachModel.token);
    }

    /**
     * Method to retrieve a fighter from the database
     * @param {number} id - the fighter's id for whom we are requesting
     */
    getFighter(id) 
    {
        Fetcher.readOne(id, (data) => {
            console.log(data);
            console.log('fired event fighter (id: ' + data._id + ') retrieved!');
            this.dataStore.fighterModel.deserialize(data);
            this.dataStore.fighterModel.id = data._id;
            global.debug(this.dataStore.fighterModel);
            this.fireEvent("rerouteToSummary");
        }, this.dataStore.coachModel.token);
    }


    /**
     * Method to delete a fighter from the database, should not be used lightly.
     * @param {number} id - id of fighter we are deleting
     */
    deleteFighter(id) 
    {
        Fetcher.remove(id, this.dataStore.coachModel.token);
    }

    /**
     * Method to retrieve directory info of all fighters belonging to the selected affiliate name and locations that the coach belongs to
     * @param {String} affiliateName - name of the affiliate
     * @param {Array} locations - array that contains the affiliate locations
     * @param {function} hook - called upon fetch request resolution
     */
    getDirectoryInfo(affiliateName, locations, hook)
    {
        let locationQueryParams = "";
        for(let location of locations) {
            locationQueryParams += `&locations[]=${location}`;
        }

        return Fetcher.connect(`api/fighters/directoryInfo/?affiliateName=${affiliateName}${locationQueryParams}`, null, "GET", this.dataStore.coachModel.token, hook);
    }


    /**
     * Method to require PDQ assessment information
     * @param {function} hook - called upon fetch request resolution
     * @private
     */
    _getPDQAssessments(hook)
    {
        return Fetcher.connect("api/pdqAssessmentInfo", null, "GET", this.dataStore.coachModel.token, hook);
    }

    /**
     * Method to require PA assessment information
     * @param {function} hook - called upon fetch request resolution
     * @private
     */
    _getPhysicalAssessmentInfo(hook)
    {
        return Fetcher.connect("api/physicalAssessmentInfo", null, "GET", this.dataStore.coachModel.token, hook);
    }

    /**
     * Method to require all affiliate (member) names
     * @param {function} hook - called upon fetch request resolution
     * @private
     */
    _getAffiliates(hook)
    {
        return Fetcher.connect('api/affiliate/names', null, "GET", this.dataStore.coachModel.token, hook);
    }

    /**
     * Method to require total number of non active and active boxers
     * @param {function} hook - called upon fetch request resolution
     * @private
     */
    _getTotalNumOfBoxers(hook)
    {
        return Fetcher.connect('api/resource/numOfBoxers', null, "GET", this.dataStore.coachModel.token, hook);
    }

    /**
     * Method to retrieve locations for an affiliate
     * @param {String} affiliate - affiliate which locations belong to
     * @param {function} hook - called upon fetch request resolution
     * @private
     */
    _getLocations(affiliate, hook)
    {
        return Fetcher.connect(`api/affiliate/locations/${affiliate}`, null, "GET", this.dataStore.coachModel.token, hook);
    }

    /**
     * Method used to setup EventDispatcher subscriptions
     * @private
     */
    _setupSubscriptions()
    {
        this.subscribeTo("RouteController", 'createNewFighter', "creatingFighter", (value) => {
            const nameModal = new ModalComponent({
                footer: true,
                stickFooter: false,
                closeMethods: ['button']
            }).setContent(`<div>
                <h3>${value === "enrollNewBoxer" ? "New Boxer Enrollment" : value === "addExistingBoxer" ? "Existing Boxer & Intake Assessment Entry" : ""}</h3>
                <hr>
                <h5>Please set the ${value === "enrollNewBoxer" ? "enrollment" : "original intake"} date:</h5>
                <h5 id="dateError"></h5>
                <div class="row">
                    <div class="col-6">
                        ${new InputComponent()
                        .setId('entryDate')
                        .setClasses('form-control')
                        .setName('entryDate')
                        .setType('date')
                        .setValue(this.dataStore.fighterModel.intakeDate ? new Date(this.dataStore.fighterModel.intakeDate).toInputString() : new Date().toDateInputValue())
                        .setPlaceholder('mm/dd/yyyy')
                        .setLabel('')
                        ._html()}
                    </div>
                </div>
                <h5>Please enter first and last name:</h5>
                <h5 id="nameError"></h5>
                <div class="row">
                    <div class="col-6">
                                ${new InputComponent()
                .setId('fName')
                .setClasses('form-control')
                .setName('firstName')
                .setValue(null)
                .setLabel('First Name')
                ._html()}
                            </div><br>
                            <div class="col-6">
                                ${new InputComponent()
                .setId('fighterLastName')
                .setClasses('form-control')
                .setName('lastName')
                .setValue(null)
                .setLabel('Last Name')
                ._html()}
                            </div>
                </div>
            </div>`).setFooterButtons([{
                label: "Continue",
                cssClass: 'tingle-btn tingle-btn--primary',
                callback: () => {
                    document.querySelector("#dateError").innerHTML = "";
                    document.querySelector("#nameError").innerHTML = "";
                    const firstName = document.querySelector('#fName').value;
                    const lastName = document.querySelector("#fighterLastName").value;
                    const entryDate = new Date(document.querySelector('#entryDate').value);

                    if(!firstName || !lastName){
                        document.querySelector("#nameError").innerHTML = `<strong style="color:red;">You need to enter both first and last name.</strong>`
                    }

                    if(!entryDate.isValid()) {
                        document.querySelector("#dateError").innerHTML = `<strong style="color:red;">You need to enter a valid date.</strong>`
                    }

                    if(firstName && lastName && entryDate.isValid()) {
                        nameModal.closeModal();
                        this.dataStore.newFighterEnrollment = true;
                        this.dataStore.addAssessment = true;
                        value === "addExistingBoxer"
                            ?  (this.dataStore.newExistingAssessment = true)
                            : (this.dataStore.newExistingAssessment = false);
                        this.dataStore.fighterModel.clear();
                        this.dataStore.fighterModel.intakeDate = entryDate.toInputString();
                        this.dataStore.fighterModel.personalInformationModel.firstName = firstName;
                        this.dataStore.fighterModel.personalInformationModel.lastName = lastName;
                        this.dataStore.fighterModel.personalInformationModel.affiliateName = this.dataStore.coachModel.affiliateLocation.affiliate_id;
                        this.dataStore.fighterModel.personalInformationModel.location = this.dataStore.coachModel.affiliateLocation.locationName;
                        this.dataStore.fighterModel.personalInformationModel.state = this.dataStore.coachModel.affiliateLocation.locationState;
                        this.dataStore.fighterModel.emergencyContactModel.state = this.dataStore.coachModel.affiliateLocation.locationState;
                        this.createFighter(this.dataStore.fighterModel.serialize());
                        this.fireEvent('rerouteToPI', {});
                    }
                }
            }]).openModal();
        });

        this.subscribeTo('RouteController', 'retrieveHealthFields', "retrieving", (data) => {
            this._getFieldsForForm("health", "healthFields");
        });
        this.subscribeTo('RouteController', 'retrieveParkMedFields', "retrieving", (data) => {
            this._getFieldsForForm("parkMeds", "parkMedFields");
        });
        this.subscribeTo('RouteController', 'retrieveSymptomFields', "retrieving", (data) => {
            this._getFieldsForForm("parkSymptoms", "parkSymptomsFields");
        });
        this.subscribeTo('RouteController', 'retrieveBoxerGoals', "retrieving", (data) => {
            this._getFieldsForForm("boxerGoals", "boxerGoalsFields");
        });

        this.subscribeTo('RouteController', 'updateFighterExplicit', "updating", (data) => {
           this.updateFighter(data, this.dataStore.fighterModel.id, undefined)
        });

        this.subscribeTo('RouteController', 'getLocations', 'gettingLocations', (affiliate) => {
            this._getLocations(affiliate, (locations) => {
                if(locations)
                    this.fireEvent("locations", locations);
            })
        });

        this.subscribeTo('RouteController', 'getAffiliates', 'gettingAffiliates', () => {
            this._getAffiliates((data) => {
                this.fireEvent('affiliates', data);
            })
        });

        this.subscribeTo('RouteController', 'getDirectoryInfo', 'gettingDirectoryInfo', (data) => {
            this.getDirectoryInfo(data.affiliateName, data.locations, (data) => {
                this.fireEvent('directoryInfo', data);
            });
        });

        this.subscribeTo('RouteController', 'getTotalNumOfBoxers', 'retrievingTotalNumOfBoxers', () => {
            this._getTotalNumOfBoxers((numOfTotalBoxers) => {
                if(numOfTotalBoxers)
                    this.fireEvent('totalNumOfBoxers', numOfTotalBoxers)
            })
        });

        this.subscribeTo('RouteController', 'attemptLogin', 'attemptingLogin', (credentials) => {
            this.loginCoach(credentials, (data) => {
                if (data.success) {
                    this.dataStore.coachModel.token = data.token;
                    this.dataStore.coachModel.username = data.username;
                    this.dataStore.coachModel.name = data.name;
                    this.dataStore.coachModel.email = data.email;
                    this.dataStore.coachModel.affiliateLocation = data.affiliateLocation;
                    this.dataStore.coachModel.affiliateLocations = data.affiliateLocations.sort((affiliateObject1, affiliateObject2) => {
                        return affiliateObject1.affiliate_id - affiliateObject2.affiliate_id;
                    });
                    this.dataStore.coachModel.affiliateLocationsObject = this.dataStore.coachModel.affiliateLocations;
                    this.dataStore.coachModel.coaches = data.coaches;
                    this.fireEvent("reroute", "directory")
                } else {
                        const errorModal = new ModalComponent({
                            footer: true,
                            stickFooter: false,
                            closeMethods: ['button']
                        }).setContent(`<div>
                    <h3>There was an issue with logging you in</h3>
                    <h4>${data.message}</h4>
            </div>`).setFooterButtons([{
                            label: "Done",
                            cssClass: 'tingle-btn tingle-btn--primary',
                            callback: () => {
                                errorModal.closeModal();
                            }
                        }]).openModal();
                }
            });
        });

        this.subscribeTo('RouteController', 'uploadData', 
        'sendToDatabase', (data) => 
        {
            const additionalField = data.event.target.dataset.field ? "." + data.event.target.dataset.field : "";
            const queryField = `${data.model.toString().substr(0, data.model.toString().indexOf("Model")) + "." + data.event.target.name + additionalField}`;
            const queryValue = `${data.event.target.value}`;
            const queryObject = {};
            queryObject[queryField] = queryValue;

            global.debug(queryObject);
            this.updateFighter(queryObject, this.dataStore.fighterModel.id);
        });


        this.subscribeTo('RouteController', 'requestedFighter',
        'retrieveFighterFromDatabase', (data) =>
        {
            this.getFighter(data.id);
            this.dataStore.newFighterEnrollment = false;
            console.log('called get fighter by id: ' + data.id);
        });

        this.subscribeTo('RouteController', 'savePDQ',
            'savingPDQ', (data) => {
                this.updateFighter({ pdq: strMapToObj(data) }, this.dataStore.fighterModel.id, null);
            });

        this.subscribeTo('RouteController', 'saveVitals',
            'savingVitals', (data) => {
                this.updateFighter({ "vitals.vitalsAssessment": strMapToObj(data) }, this.dataStore.fighterModel.id, null);
            });

        this.subscribeTo('RouteController', 'savePA',
            'savingPA', (data) => {
                this.updateFighter({physicalAssessments: strMapToObj(data)}, this.dataStore.fighterModel.id, null);
            });
        this.subscribeTo('CameraController', 'imageTaken',
            'sendImgToDatabase', (imageURi) => {
                this.updateFighter({"personalInformation.image" : imageURi}, this.dataStore.fighterModel.id, (data) => {
                    this.dataStore.fighterModel.personalInformationModel.image = data.fighterImgURL;
                });
            });
        this.subscribeTo('RouteController', 'imageTaken',
            'sendImgToDatabase', (imageURi) => {
                this.updateFighter({"personalInformation.image" : imageURi}, this.dataStore.fighterModel.id, (data) => {
                    this.dataStore.fighterModel.personalInformationModel.image = data.fighterImgURL;
                });
            });
    }
}