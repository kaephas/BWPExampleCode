/**
 * @author Jacob Landowski
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 1/17/19
 * Class to Handle the route resolution and view rendering
 */

'use strict';

import EventDispatcher from './EventDispatcher.js';
import routeConfig from '../routes.js';
import Router from '../depend/router.min.js';
import Route from './Route.js';
import View from '../views/View';
import ModalComponent from "../views/components/ModalComponent";
import InputComponent from "../views/components/InputComponent";
import Toastify from "toastify-js";
import SummaryView from "../views/SummaryView";

export  default  class RouteController extends EventDispatcher {
    /**
     * Creates a new Route Controller
     * @param {HTMLElement} contentContainer - The HTML element in which we will append any rendered view to
     * @param {HTMLElement} sidebarContainer - The HTML element in which we will append the rendered sidebar to
     * @param {DataStore} dataStore - Reference to the DataStore object
     */
    constructor(contentContainer, sidebarContainer, dataStore)
    {
        super();

        if(!contentContainer)
            throw new Error('RouteController must be given an html container to render content in.');

        if(!sidebarContainer)
            throw new Error('RouteController must be given an html container to render sidebar content in.');

        if(!dataStore)
            throw new Error('RouteController must be given a reference to the DataStore instance.');

        this.dataStore = dataStore;
        this.contentContainer = contentContainer;
        this.sidebarContainer = sidebarContainer;
        this.routerJS = new Router();
        this.routes = new Map();



        this._setupRouteViews();
        this._setupRoutesActions();
        this._setupRouteViewCallbacks();
        this._startRoutes();
    }

    /**
     * Sets views to it's route
     * @private
     */
    _setupRouteViews()
    {
        this._forEachRouteView((routeName, view) =>
        {
            if(!this.routes.get(routeName))
            {
                this.routes.set(routeName, this._createRoute());
            }

            this.routes.get(routeName).setView(view);
            this.routes.get(routeName).setName(routeName);
        });
    }

    /**
     * Setting actions to a route, such as it's data hive, and any callback functions it should have access to
     * @private
     */
    _setupRoutesActions()
    {
        //============= Boxer Profile/Summary Route ==============//
        this.routes.get('#summary')
            .setBeforeRender(() =>
            {
                this.dataStore.newFighterEnrollment = false;
                this.dataStore.addAssessment = false;
                this.dataStore.newExistingAssessment = false;
                this.dataStore.fighterModel.intakeDate = "";
            })
            .setDataHive(
                {
                    fighterModel: this.dataStore.fighterModel,
                    fighterImg: this.dataStore.fighterModel.personalInformationModel.image,
                    newFighterEnrollment: this.dataStore.newFighterEnrollment,
                    addAssessment: this.dataStore.addAssessment
                })
            .setCallback('viewCompletePA', (paDate) =>
            {
                this.routerJS.redirect("#paQuickForm");
                this.fireEvent('populatePAForm', paDate)
            })
            .setCallback('viewCompletePDQ', (date, routeName) =>
            {
                this.routerJS.redirect("#pdq39QuickForm");
                this.fireEvent('viewCompletePDQ', {pdqDate: date, requestingRoute: routeName})
            });
        //======== Coach Page Route ========//
        this.routes.get('#coachPage')
            .setBeforeRender(() => {
                if(this.dataStore.newFighterEnrollment || (!this.dataStore.newFighterEnrollment && this.dataStore.addAssessment && this.dataStore.newExistingAssessment)) this.dataStore.fighterModel.editable = true;

                if(!this.dataStore.newFighterEnrollment && this.dataStore.addAssessment && !this.dataStore.newExistingAssessment) this.dataStore.fighterModel.editable = false;
            })
            .setDataHive(
                {
                    personalInfo: this.dataStore.fighterModel.personalInformationModel,
                    observations: this.dataStore.fighterModel.coachObservationModel,
                    fighterModel: this.dataStore.fighterModel,
                    newFighterEnrollment: this.dataStore.newFighterEnrollment,
                    addAssessment: this.dataStore.addAssessment,
                    newExistingAssessment: this.dataStore.newExistingAssessment
                })
            .setCallback('updateFighter', (data) => {
                this.fireEvent('updateFighterExplicit', data);
            })
            .setCallback('getBoxerGoals', () => {
                this.fireEvent('retrieveBoxerGoals');
            })
            .setCallback('endEnrollment', () => {
                this.dataStore.newExistingAssessment = false;
                this.dataStore.addAssessment = false;
                this.dataStore.newExistingAssessment = false;
                Toastify({
                    text: "Success! Boxer is Saved.",
                    duration: 10000,
                    newWindow: true,
                    close: true,
                    gravity: "bottom", // `top` or `bottom`
                    positionLeft: false, // `true` or `false`
                    backgroundColor: "linear-gradient(to bottom, #0174DF, #0080FF);",
                    stopOnFocus: true // Prevents dismissing of toast on hover
                }).showToast();
            });

        //======== Directory Route ========//
        this.routes.get('#directory')
            .setBeforeRender(() =>
            {
                this.dataStore.directoryModel.resetPage();
                this.dataStore.newFighterEnrollment = false;
                this.dataStore.addAssessment = false;
                this.dataStore.newExistingAssessment = false;
            })
            .setDataHive(
                {
                    directory: this.dataStore.directoryModel,
                    location: this.dataStore.coachModel.affiliateLocation.locationName,
                    affiliate: this.dataStore.coachModel.affiliateLocation.affiliate_id,
                    affiliateLocation: this.dataStore.coachModel.affiliateLocation,
                    affiliateLocations: this.dataStore.coachModel.affiliateLocations,
                    affiliateLocationsObject: this.dataStore.coachModel.affiliateLocationsObject,
                    dataStore: this.dataStore
                })
            .setCallback('retrieveFighters', () =>
            {
                const affiliateName = this.dataStore.coachModel.affiliateLocation.affiliate_id;
                this.fireEvent("getDirectoryInfo",
                    {affiliateName: affiliateName,
                          locations: this.dataStore.coachModel.affiliateLocationsObject[affiliateName] });
            })
            .setCallback('retrieveFighter', (id) =>
            {
                this.fireEvent('requestedFighter', {id: id});
            })
            .setCallback('directoryReport', () => {
                this.routerJS.redirect('#directoryPDFReport');
                this.fireEvent("displayDirectoryReport", this.dataStore.directoryModel.getOriginalFightersArray());
            })
            .setCallback('assessmentReport', () => {
                this.routerJS.redirect('#directoryPDFReport');
                this.fireEvent("displayAssessmentReport", this.dataStore.directoryModel.getOriginalFightersArray());
            });

        //======== Emergency Contact Route ========//
        this.routes.get('#emergencyContact')
            .setBeforeRender(() => {
                if(this.dataStore.newFighterEnrollment || (!this.dataStore.newFighterEnrollment && this.dataStore.addAssessment && this.dataStore.newExistingAssessment)) this.dataStore.fighterModel.editable = true;

                if(!this.dataStore.newFighterEnrollment && this.dataStore.addAssessment && !this.dataStore.newExistingAssessment) this.dataStore.fighterModel.editable = false;
            })
            .setDataHive(
                {
                    personalInfo:  this.dataStore.fighterModel.personalInformationModel,
                    emergencyInfo: this.dataStore.fighterModel.emergencyContactModel,
                    fighterModel: this.dataStore.fighterModel,
                    newFighterEnrollment: this.dataStore.newFighterEnrollment,
                    addAssessment: this.dataStore.addAssessment
                });

        //======== Health and Heart Conditions Route =========//
        this.routes.get('#healthConditions')
            .setBeforeRender(() => {
                if(this.dataStore.newFighterEnrollment || (!this.dataStore.newFighterEnrollment && this.dataStore.addAssessment && this.dataStore.newExistingAssessment)) this.dataStore.fighterModel.editable = true;

                if(!this.dataStore.newFighterEnrollment && this.dataStore.addAssessment && !this.dataStore.newExistingAssessment) this.dataStore.fighterModel.editable = false;
            })
            .setDataHive(
                {
                    fighterFirstName: this.dataStore.fighterModel.personalInformationModel.firstName,
                    fighterLastName: this.dataStore.fighterModel.personalInformationModel.lastName,
                    healthConditions: this.dataStore.fighterModel.healthAndHeartModel,
                    fighterModel: this.dataStore.fighterModel,
                    newFighterEnrollment: this.dataStore.newFighterEnrollment,
                    addAssessment: this.dataStore.addAssessment,
                    newExistingAssessment: this.dataStore.newExistingAssessment
                })
            .setCallback('getHealthFields', () => {
                this.fireEvent('retrieveHealthFields');
            });

        //======== Waivers Route ========//
        this.routes.get('#waivers')
            .setBeforeRender(() => {
                if(this.dataStore.newFighterEnrollment || (!this.dataStore.newFighterEnrollment && this.dataStore.addAssessment && this.dataStore.newExistingAssessment)) this.dataStore.fighterModel.editable = true;

                if(!this.dataStore.newFighterEnrollment && this.dataStore.addAssessment && !this.dataStore.newExistingAssessment) this.dataStore.fighterModel.editable = false;
            })
            .setDataHive(
                {
                    personalInfo:  this.dataStore.fighterModel.personalInformationModel,
                    waivers: this.dataStore.fighterModel.waiversModel,
                    fighterModel: this.dataStore.fighterModel,
                    newFighterEnrollment: this.dataStore.newFighterEnrollment
                })
            .setCallback('updateFighter', (data) => {
                this.fireEvent('updateFighterExplicit', data);
            })
            .setCallback('endEnrollment', () => {
                this.dataStore.newExistingAssessment = false;
                this.dataStore.addAssessment = false;
                this.dataStore.newExistingAssessment = false;
                Toastify({
                    text: "Success! Boxer is Saved.",
                    duration: 10000,
                    newWindow: true,
                    close: true,
                    gravity: "bottom", // `top` or `bottom`
                    positionLeft: false, // `true` or `false`
                    backgroundColor: "linear-gradient(to bottom, #0174DF, #0080FF);",
                    stopOnFocus: true // Prevents dismissing of toast on hover
                }).showToast();
            });
        //======== Parkinson Symptoms Route ========//
        this.routes.get('#parkinsonSymptoms')
            .setBeforeRender(() => {
                if(this.dataStore.newFighterEnrollment || (!this.dataStore.newFighterEnrollment && this.dataStore.addAssessment && this.dataStore.newExistingAssessment)) this.dataStore.fighterModel.editable = true;

                if(!this.dataStore.newFighterEnrollment && this.dataStore.addAssessment && !this.dataStore.newExistingAssessment) this.dataStore.fighterModel.editable = false;
            })
            .setDataHive(
                {
                    personalInfo:  this.dataStore.fighterModel.personalInformationModel,
                    parkinsonSymptoms: this.dataStore.fighterModel.parkinsonSymptomsModel,
                    fighterModel: this.dataStore.fighterModel,
                    newFighterEnrollment: this.dataStore.newFighterEnrollment,
                    addAssessment: this.dataStore.addAssessment
                })
            .setCallback('getSymptomFields', () => {
                this.fireEvent('retrieveSymptomFields');
            });

        //======== Parkinsons Medications Route ========//
        this.routes.get('#parkinsonsMedications')
            .setBeforeRender(() => {
                if(this.dataStore.newFighterEnrollment || (!this.dataStore.newFighterEnrollment && this.dataStore.addAssessment && this.dataStore.newExistingAssessment)) this.dataStore.fighterModel.editable = true;

                if(!this.dataStore.newFighterEnrollment && this.dataStore.addAssessment && !this.dataStore.newExistingAssessment) this.dataStore.fighterModel.editable = false;
            })
            .setDataHive(
                {
                    personalInfo:  this.dataStore.fighterModel.personalInformationModel,
                    parkinsonsMedications: this.dataStore.fighterModel.parkinsonsMedicationsModel,
                    fighterModel: this.dataStore.fighterModel,
                    newFighterEnrollment: this.dataStore.newFighterEnrollment,
                    newExistingAssessment: this.dataStore.newExistingAssessment,
                    addAssessment: this.dataStore.addAssessment
                })
            .setCallback('getParkMeds', () => {
                this.fireEvent('retrieveParkMedFields');
            });

        //======== PDQ Route ========//
        this.routes.get('#pdq')
            .setDataHive(
                {
                    personalInfo:  this.dataStore.fighterModel.personalInformationModel,
                    newFighterEnrollment: this.dataStore.newFighterEnrollment
                });
        this.routes.get('#pdq39Form')
            .setDataHive({
                personalInfo:  this.dataStore.fighterModel.personalInformationModel,
                pdq: this.dataStore.fighterModel.pdqModel,
                pdqQuestions: this.dataStore.pdqQuestions,
                intakeDate: this.dataStore.fighterModel.intakeDate
            })
            .setCallback('savePDQ', (value) => {
                this.fireEvent("savePDQ", value);
            });
        this.routes.get('#pdq39QuickForm')
            .setBeforeRender(() => {
                if(this.dataStore.addAssessment) this.dataStore.fighterModel.editable = true;
            })
            .setDataHive({
                personalInfo:  this.dataStore.fighterModel.personalInformationModel,
                pdq: this.dataStore.fighterModel.pdqModel,
                pdqQuestions: this.dataStore.pdqQuestions,
                newExistingAssessment: this.dataStore.newExistingAssessment,
                addAssessment: this.dataStore.addAssessment,
                intakeDate: this.dataStore.fighterModel.intakeDate
            })
            .setCallback('savePDQ', (value) => {
                this.fireEvent("savePDQ", value);
            });


        //======== Personal Information Route ========//
        this.routes.get('#personalInformation')
            .setBeforeRender(() => {
                if(this.dataStore.newFighterEnrollment || (!this.dataStore.newFighterEnrollment && this.dataStore.addAssessment && this.dataStore.newExistingAssessment)) this.dataStore.fighterModel.editable = true;

                if(!this.dataStore.newFighterEnrollment && this.dataStore.addAssessment && !this.dataStore.newExistingAssessment) this.dataStore.fighterModel.editable = false;
            })
            .setDataHive(
                {
                    personalInfo: this.dataStore.fighterModel.personalInformationModel,
                    affiliates: Object.keys(this.dataStore.coachModel.affiliateLocationsObject),
                    fighterModel: this.dataStore.fighterModel,
                    newFighterEnrollment: this.dataStore.newFighterEnrollment,
                    addAssessment: this.dataStore.addAssessment,
                    affiliate: this.dataStore.coachModel.affiliateLocation.affiliate_id,
                    locations: this.dataStore.coachModel.affiliateLocationsObject[this.dataStore.coachModel.affiliateLocation.affiliate_id],
                    coachLocation: this.dataStore.coachModel.affiliateLocation.locationName,
                    affiliateLocationsObject: this.dataStore.coachModel.affiliateLocationsObject,
                    dataStore: this.dataStore
                })
            .setCallback('saveImgToDatabase', (imageURi) =>
            {
                this.fireEvent('imageTaken', imageURi);
            })
            .setCallback('updateFighter', (data) => {
                this.fireEvent('updateFighterExplicit', data);
            })
            .setCallback('updateAffiliateLocation', (affiliate, location) => {
                this.dataStore.coachModel.affiliateLocation = this.dataStore.coachModel.affiliateLocations.find((affiliateLocation) => {
                    return affiliateLocation.locationName === location && affiliateLocation.affiliate_id === affiliate;
                });
            });

        //======== Physical Assessments Route ========//
        this.routes.get('#physicalAssessment')
            .setDataHive(
                {
                    personalInfo:  this.dataStore.fighterModel.personalInformationModel,
                    newFighterEnrollment: this.dataStore.newFighterEnrollment
                });
        this.routes.get('#paLongForm')
            .setDataHive({
                physicalAssessments: this.dataStore.fighterModel.physicalAssessmentModel,
                physicalAssessmentInfo: this.dataStore.physicalAssessmentInfo,
                intakeDate: this.dataStore.fighterModel.intakeDate
            })
            .setCallback('savePA', (value) => {
                this.fireEvent('savePA', value);
            });
        this.routes.get('#paQuickForm')
            .setBeforeRender(() => {
                if(this.dataStore.addAssessment) this.dataStore.fighterModel.editable = true;
            })
            .setDataHive({
                physicalAssessments: this.dataStore.fighterModel.physicalAssessmentModel,
                physicalAssessmentInfo: this.dataStore.physicalAssessmentInfo,
                newExistingAssessment: this.dataStore.newExistingAssessment,
                intakeDate: this.dataStore.fighterModel.intakeDate,
                addAssessment: this.dataStore.addAssessment
            })
            .setCallback('savePA', (value) => {
                this.fireEvent('savePA', value);
            });
        this.routes.get('#coachLogin')
            .setDataHive({
                totalNumOfBoxers: this.dataStore.totalNumOfBoxers
            })
            .setCallback('attemptLogin', (credentials) => {
                this.fireEvent('attemptLogin', credentials);
            })
            .setCallback('getLocations', (affiliate) => {
                this.fireEvent('getLocations', affiliate);
            })
            .setCallback('getAffiliates', () => {
                this.fireEvent('getAffiliates');
            })
            .setCallback('getTotalNumOfBoxers', () => {
                this.fireEvent('getTotalNumOfBoxers');
            });

        this.routes.get('#pdqSummary')
            .setDataHive({
                fighterModel: this.dataStore.fighterModel,
                personalInfo: this.dataStore.fighterModel.personalInformationModel,
                newFighterEnrollment: this.dataStore.newFighterEnrollment,
                newExistingAssessment: this.dataStore.newExistingAssessment,
                addAssessment: this.dataStore.addAssessment
            })
            .setCallback('viewCompletePDQ', (date, routeName) =>
            {
                this.routerJS.redirect("#pdq39QuickForm");
                this.fireEvent('viewCompletePDQ', {pdqDate: date, requestingRoute: routeName})
            })
            .setCallback('addSinglePDQAssessment', () => {
                this.routerJS.redirect("#pdq39QuickForm");
                this.fireEvent('addSinglePDQAssessment');
            });

        this.routes.get('#paSummary')
            .setDataHive({
                fighterModel: this.dataStore.fighterModel,
                personalInfo: this.dataStore.fighterModel.personalInformationModel,
                newFighterEnrollment: this.dataStore.newFighterEnrollment,
                addAssessment: this.dataStore.addAssessment,
                newExistingAssessment: this.dataStore.newExistingAssessment
            })
            .setCallback('viewCompletePA', (paDate) =>
            {
                this.routerJS.redirect("#paQuickForm");
                this.fireEvent('populatePAForm', paDate)
            })
            .setCallback('addSinglePAAssessment', () => {
                this.routerJS.redirect("#paQuickForm");
                this.fireEvent('addSinglePAAssessment');
            });
        this.routes.get('#vitals')
            .setBeforeRender(() => {
                if(this.dataStore.addAssessment) this.dataStore.fighterModel.editable = true;
            })
            .setDataHive({
                vitals: this.dataStore.fighterModel.vitalsModel,
                personalInfo: this.dataStore.fighterModel.personalInformationModel,
                addAssessment: this.dataStore.addAssessment,
                intakeDate: this.dataStore.fighterModel.intakeDate
            })
            .setCallback('saveVitals', (value) => {
                this.fireEvent("saveVitals", value);
            })
            .setCallback('updateFighter', (data) => {
                this.fireEvent('updateFighterExplicit', data);
            });
        this.routes.get('#vitalSummary')
            .setDataHive({
                fighterModel: this.dataStore.fighterModel,
                personalInfo: this.dataStore.fighterModel.personalInformationModel,
                newFighterEnrollment: this.dataStore.newFighterEnrollment,
                newExistingAssessment: this.dataStore.newExistingAssessment,
                addAssessment: this.dataStore.addAssessment
            })
            .setCallback('addSingleVitalsAssessment', () => {
                this.routerJS.redirect("#vitals");
                this.fireEvent('addSingleVitalsAssessment');
            });
        this.routes.get('#assessmentHistory')
            .setDataHive({
                fighterModel: this.dataStore.fighterModel,
                personalInfo: this.dataStore.fighterModel.personalInformationModel,
                addAssessment: this.dataStore.addAssessment,
                newFighterEnrollment: this.dataStore.newFighterEnrollment
            })
            .setCallback('editAssessment', (assessmentType, assessmentDate) => {
                if(assessmentType === "pdq") {
                    this.routerJS.redirect("#pdq39QuickForm");
                    this.fireEvent("editPDQ", assessmentDate);
                }
                else if(assessmentType === "physicalTest") {
                    this.routerJS.redirect("#paQuickForm");
                    this.fireEvent("editPhysical", assessmentDate);
                }
                else if(assessmentType === "vitals") {
                    this.routerJS.redirect("#vitals");
                    this.fireEvent("editVitals", assessmentDate);
                }
            })
            .setCallback('savePA', (value) => {
                this.fireEvent('savePA', value);
            })
            .setCallback('saveVitals', (value) => {
                this.fireEvent("saveVitals", value);
            })
            .setCallback('savePDQ', (value) => {
                this.fireEvent("savePDQ", value);
            });
        this.routes.get('#directoryPDFReport')
            .setDataHive({
                fighterModel: this.dataStore.fighterModel,
                dataStore: this.dataStore
            })
            .setCallback('directoryReport', () => {
                this.routerJS.redirect('#directoryPDFReport');
                this.fireEvent("displayDirectoryReport", this.dataStore.directoryModel.getOriginalFightersArray());
            })
            .setCallback('assessmentReport', () => {
                this.routerJS.redirect('#directoryPDFReport');
                this.fireEvent("displayAssessmentReport", this.dataStore.directoryModel.getOriginalFightersArray());
            });
        this.routes.get('#boxerPDFReport')
            .setDataHive({
                dataStore: this.dataStore,
                fighterModel: this.fighterModel
            });
        this.routes.get('#aboutUs')
            .setDataHive({
            });
        this.routes.get('#kaephas')
            .setBeforeRender(() =>
                {
                    this.dataStore.directoryModel.resetPage();
                    this.dataStore.newFighterEnrollment = false;
                    this.dataStore.addAssessment = false;
                    this.dataStore.newExistingAssessment = false;
                })
            .setDataHive(
                {
                    directory: this.dataStore.directoryModel,
                    location: this.dataStore.coachModel.affiliateLocation.locationName,
                    affiliate: this.dataStore.coachModel.affiliateLocation.affiliate_id,
                    affiliateLocation: this.dataStore.coachModel.affiliateLocation,
                    affiliateLocations: this.dataStore.coachModel.affiliateLocations,
                    affiliateLocationsObject: this.dataStore.coachModel.affiliateLocationsObject,
                    dataStore: this.dataStore
                });
    }

    /**
     * Event Dispatcher specific callbacks, such as hard coded reroutes, and other observer (subscriber) based actions
     * @private
     */
    _setupRouteViewCallbacks()
    {
        this.subscribeTo("APIController", "reroute", "rerouting", (data) => {
            this._reroute(data);
        });
        this.subscribeTo("APIController", "rerouteToPI", "reroutingtoPI", () => {
            this.routerJS.redirect("#personalInformation");
        });
        this.subscribeTo("APIController", "rerouteToSummary", "reroutingToSummary", () => {
            this.routerJS.redirect("#summary");
        });
        this._forEachRouteView((routeName, view) =>
        {
            this.routes.get(routeName)
                .setCallback('formSave', (event, model) =>
                {
                    this.fireEvent('formFieldSaved', {event, model});
                    this.fireEvent('uploadData', {event, model});
                })
                .setCallback('nextPage', (routeName) =>
                {
                    this.routerJS.redirect(`#${routeName}`);
                    this.fireEvent('routeChanged', {routeName});
                })
                .setCallback('clearData', () =>
                {
                    this.dataStore.fighterModel.clear();
                })
                .setCallback('logout', () =>
                {
                    this.dataStore.clear();
                    this._reroute('coachLogin');
                })
                .setCallback('changeEditStatus', (value) =>
                {
                    this.fireEvent('changingEditStatus', value);
                })
                .setCallback('closeSidebar', () =>
                {
                    this.fireEvent('closeSidebar'); //SidebarView
                })
                .setCallback('createNewFighter', (value) =>
                {
                    this.fireEvent("createNewFighter", value);
                })
                .setCallback('bwpReport', () => {
                    this.routerJS.redirect('#boxerPDFReport');
                    this.fireEvent("displayBwPReport", this.dataStore.fighterModel);
                })
                .setCallback('rsbReport', () => {
                    this.routerJS.redirect('#boxerPDFReport');
                    this.fireEvent("displayRSBReport", this.dataStore.fighterModel);
                })
                .setCallback('updateReassessmentDate', () =>
                {
                    const reassessmentDateOptions = {
                        "---": 0,
                        "1 Month": 1,
                        "3 Month": 3,
                        "6 Month": 6,
                        "12 Month": 12
                    };
                    const reDate = this.dataStore.fighterModel.coachObservationModel.reassessmentDateField;
                    let today = new Date(Date.now());
                    const sortedAssessmentDates = SummaryView.getSortedAssessmentDates(true, this.dataStore.fighterModel.pdqModel._pdqAssessments,
                        this.dataStore.fighterModel.physicalAssessmentModel._physicalAssessments, this.dataStore.fighterModel.vitalsModel._vitalsAssessment);
                    if(sortedAssessmentDates && sortedAssessmentDates.length > 0) {
                        today = new Date(sortedAssessmentDates[sortedAssessmentDates.length - 1]);
                    }
                    const todayMonth = today.getMonth();
                    today.setMonth(todayMonth + reassessmentDateOptions[reDate]);
                    this.dataStore.fighterModel.coachObservationModel.reassessmentDate = today.toInputString();
                    this.fireEvent('updateFighterExplicit', {"coachObservation.reassessmentDate": today.toInputString()});
                })
                .setCallback('addAssessment', (obj) =>
                {
                    const firstName = this.dataStore.fighterModel.personalInformationModel.firstName;
                    const lastName = this.dataStore.fighterModel.personalInformationModel.lastName;

                    const beginAssessmentModal = new ModalComponent({
                        footer: true,
                        stickFooter: false,
                        closeMethods: ['button']
                    }).setContent(`<div>
                        <h3>${this.dataStore.newFighterEnrollment
                        ? "Begin an Assessment"
                        : obj.newExistingAssessment
                            ? "Add Previous Assessment"
                            : "Add New Assessment"} for ${firstName + " " + lastName}</h3>
                        <hr>
                        <h5>Please ${this.dataStore.newFighterEnrollment ? "confirm" : "set"} the assessment intake date:</h5>
                        <h5 id="dateError"></h5>
                        <div class="row">
                            <div class="col-5 col-sm-6 col-md-5 col-lg-4 col-xl-3">
                                ${new InputComponent()
                        .setId('intakeDate')
                        .setClasses('form-control')
                        .setName('intakeDate')
                        .setType('date')
                        .setValue(this.dataStore.fighterModel.intakeDate ? new Date(this.dataStore.fighterModel.intakeDate).toInputString() : new Date().toDateInputValue())
                        .setPlaceholder('mm/dd/yyyy')
                        .setLabel('')
                        ._html()}
                            </div>
                        </div>
                    </div>`).setFooterButtons([{
                        label: "Let's Begin",
                        cssClass: 'tingle-btn tingle-btn--primary',
                        callback: () => {
                            const intakeDate = new Date(document.querySelector('#intakeDate').value);

                            if(!intakeDate.isValid()) {
                                document.querySelector("#dateError").innerHTML = `<strong style="color:red;">You need to enter a valid date.</strong>`
                            } else {
                                beginAssessmentModal.closeModal();

                                this.dataStore.fighterModel.intakeDate = intakeDate.toInputString();
                                this.dataStore.addAssessment = true;
                                this.dataStore.newExistingAssessment = obj.newExistingAssessment;
                                if(!this.dataStore.newFighterEnrollment) {
                                    this._reroute('assessmentHistory');
                                } else {
                                    this._reroute('vitals');
                                }
                            }
                        }
                    }]).openModal();
                })
                .setAfterRender((contentView, dataHive) => {
                    //excluding vitals, quick pdq, and quick pa cause it varies on many factors
                    const editableRoutesArray = ["#personalInformation", "#emergencyContact", "#parkinsonSymptoms",
                        "#parkinsonsMedications", "#healthConditions", "#coachPage", "#waivers"];
                    if(editableRoutesArray.includes(routeName)) View.disableFormFields(contentView, this.dataStore.fighterModel.editable);
                });
        });
    }

    /**
     * Redirects the app to a specific route
     * @param {string} route - Route name to be redirected to, i.e. personalInformation
     * @private
     */
    _reroute(route)
    {
        this.routerJS.redirect(`#${route}`);
    }

    /**
     * Ensures each route is up to date, executing and rendering them.
     * @private
     */
    _startRoutes()
    {
        this.routes.forEach((route, routeName) =>
        {
            this.routerJS.addRoute(routeName, () =>
            {
                // Need to make sure the routes are alwyas up to date
                // each render, for example when datastore is cleared
                // then the datahives need to be reset with a new reference
                // to the inner models that have been recreated
                this._setupRoutesActions();
                route.executeAndRender();
            });
        });
    }

    /**
     * Calls the given function on each route view in routes
     * @param {function} action - action to be taken on each route view
     * @private
     */
    _forEachRouteView(action)
    {
        for(const routeName in routeConfig)
        {
            action(routeName, routeConfig[routeName]);
        }
    }

    /**
     * Create a new route
     * @returns {Route} - new route object
     * @private
     */
    _createRoute()
    {
        return new Route(this.contentContainer, this.sidebarContainer, this.dataStore);
    }
}