/**
 * @author Jacob Landowski
 * @author Cynthia Pham
 * @author Tyler Bezera
 * 1/15/19
 */

'use strict';


import EventDispatcher from '../controllers/EventDispatcher.js';
import DirectoryModel from './DirectoryModel';
import FighterModel from "./FighterModel";
import CoachModel from "./CoachModel";
import PersonalInformationModel from "./PersonalInformationModel";
import EmergencyContactModel from "./EmergencyContactModel";
import ParkinsonSymptomsModel from "./ParkinsonSymptomsModel";
import HealthAndHeartModel from "./HealthAndHeartModel";
import ParkinsonsMedicationsModel from "./ParkinsonsMedicationsModel";
import PDQModel from "./PDQModel";
import PhysicalAssessmentModel from "./PhysicalAssessmentModel";
import VitalsModel from "./VitalsModel";
import CoachObservationModel from "./CoachObservationModel";
import WaiversModel from "./WaiversModel";

/**
 * DataStore model is the live DataHive for the app, and stores the working fighter and the current directory listing
 */
export default class DataStore extends EventDispatcher
{
    /**
     * Creates new models and subscribes to the EventDispatcher
     */
    constructor() 
    {
        super();
        this.fighterModel = new FighterModel();
        this.directoryModel = new DirectoryModel();
        this.coachModel = new CoachModel();
        this.pdqQuestions = null;
        this.physicalAssessmentInfo = null;
        this.newFighterEnrollment = false;
        this.addAssessment = false;
        this.newExistingAssessment = false;
        this._setupSubscriptions();
    }

    /**
     * Creates a new model for each of the models it contains, clearing out the Fighter Model.
     */
    clear()
    {
        this.fighterModel = new FighterModel();
        this.directoryModel = new DirectoryModel();
        this.coachModel = new CoachModel();
        this.pdqQuestions = null;
        this.physicalAssessmentInfo = null;
        this.newFighterEnrollment = false;
        this.addAssessment = false;
        this.newExistingAssessment = false;
    }

    /**
     * Saves a single field in a model
     *
     * @param {object} event - HTML element that the field belongs to
     * @param {string} model - name of model such as personalInformation
     */
    saveField(event, model) 
    {
        if(event.target.dataset.field){
            this.fighterModel[model][event.target.name][event.target.dataset.field] = event.target.value;
        } else if(event.target.classList.contains("existPDQInfo"))
        {
            this.fighterModel.pdqModel.addPdqQuestion(event.target.name, event.target.value);
        } else {
            this.fighterModel[model][event.target.name] = event.target.value;
        }


    }

    /**
     * An EventDispatcher used method
     * @private
     */
    _setupSubscriptions()
    {
        this.subscribeTo('RouteController', 'formFieldSaved', 
        'saveField', (data) => 
        {
            this.saveField(data.event, data.model);
        });
    }
}