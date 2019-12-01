/**
 * @author Tyler Bezera
 * @author Cynthia Pham
 */


"use strict";

import PersonalInformationModel from "../models/PersonalInformationModel"
import EmergencyContactModel from "../models/EmergencyContactModel";
import ParkinsonSymptomsModel from "../models/ParkinsonSymptomsModel";
import HealthAndHeartModel from "../models/HealthAndHeartModel";
import ParkinsonsMedicationsModel from "../models/ParkinsonsMedicationsModel";
import PhysicalAssessmentModel from "./PhysicalAssessmentModel";
import PDQModel from "../models/PDQModel";
import CoachObservationModel from "../models/CoachObservationModel";
import WaiversModel from "../models/WaiversModel";
import Model from "./Model";
import VitalsModel from "./VitalsModel";

/**
 * Fighter Model, contains a reference to each of the different model classes used by the fighter
 */
export default class FighterModel extends Model
{
    /**
     * Init's a new fighter model, creating new models for each of the models it contains
     * Init editable value to false
     */
    constructor()
    {
        super();
        this.clear();
        this.editable = false;
        this._setupSubscriptions();
    }

    /**
     * Returns if fighter's information is editable as boolean value
     * @returns {boolean}
     */
    getEditStatus()
    {
        return this.editable;
    }

    /**
     * Sets fighter's information to read/edit mode to boolean value
     * @param {boolean} value - if fighter's information can be edited
     */
    setEditStatus(value)
    {
        this.editable = value;
    }

    /**
     * Sets up observer (subscriber) based actions
     * @private
     */
    _setupSubscriptions()
    {
        this.subscribeTo("RouteController", "changingEditStatus",
            "changingEditStatus", (value) => {
                this.setEditStatus(value);
            });
    }

    /**
     * Creates a new model for each of the models it contains, clearing out the Fighter Model.
     */
    clear()
    {
        this.personalInformationModel = new PersonalInformationModel();
        this.emergencyContactModel = new EmergencyContactModel();
        this.parkinsonSymptomsModel = new ParkinsonSymptomsModel();
        this.healthAndHeartModel = new HealthAndHeartModel();
        this.parkinsonsMedicationsModel = new ParkinsonsMedicationsModel();
        this.pdqModel = new PDQModel();
        this.physicalAssessmentModel = new PhysicalAssessmentModel();
        this.vitalsModel = new VitalsModel();
        this.coachObservationModel = new CoachObservationModel();
        this.waiversModel = new WaiversModel();
        this._paAssessmentDates = [];
        this._pdqAssessmentDates = [];
        this._vitalAssessmentDates = [];
        this.intakeDate = null;
    }

    /**
     * The Fighter Model in JSON format, for use as server transfer
     * @returns {{healthAndHeart: {health, heart}, emergencyContact: ({zipCode: number, phone: {primaryPhone: string, secondaryPhone: string}, city: string, contactName: string, state: string, relationship: string, email: string}|{zipCode, phone, city, contactName, state, relationship, email}), parkinsonsMedications: {mirapexER, benztropineCogentin, requipXL, ropiniroleRequip, trihexyphenidyl, apokynApomorphine, carbidopaLevodopaCRSinemetCR, amantadine, rotigotineExelon, pramipexoleMirapex, entacaponeComtan, duopa, rasagilineAzilect, selegilineEldepryl, stalevo, safinamideXadago, carbidopaLevodopaSinemet, rytary, amantadineERGocovri}, personalInformation: {firstName, lastName, zipCode, image, address, gender, city, phone, state, birthDate, email, activeFlag}, pdq: map, physicalAssessments: *, parkinsonSymptoms: {visionImpairment, deepBrainStim, difficultConcentrate, assistiveDevice, diagnosisDate, slowMovement, fatigue, posturalChanges, tremors, fallsMonth, neurologist, firstSymptomsDate, depression, difficultPosition, balanceLoss, dizzyUnsteady}}}
     */
    serialize() {
        super.serialize();

        return {
            personalInformation: this.personalInformationModel.serialize(),
            emergencyContact: this.emergencyContactModel.serialize(),
            parkinsonSymptoms: this.parkinsonSymptomsModel.serialize(),
            healthAndHeart: this.healthAndHeartModel.serialize(),
            parkinsonsMedications: this.parkinsonsMedicationsModel.serialize(),
            coachObservation: this.coachObservationModel.serialize(),
            pdq: this.pdqModel.serialize(),
            physicalAssessments: this.physicalAssessmentModel.serialize(),
            vitals: this.vitalsModel.serialize(),
            waivers: this.waiversModel.serialize()
        };
    }

    /**
     * Takes a JSON representation of the fighter model, and save it's fields to this object.
     * @param {FighterModel} fighterModel - JSON representation of fighter model
     */
    deserialize(fighterModel) {
        super.deserialize();
        console.log(fighterModel);

        this.personalInformationModel.deserialize(fighterModel.personalInformation);
        this.emergencyContactModel.deserialize(fighterModel.emergencyContact);
        this.parkinsonSymptomsModel.deserialize(fighterModel.parkinsonSymptoms);
        this.healthAndHeartModel.deserialize(fighterModel.healthAndHeart);
        this.parkinsonsMedicationsModel.deserialize(fighterModel.parkinsonsMedications);
        this.coachObservationModel.deserialize(fighterModel.coachObservation);
        this.pdqModel.deserialize(fighterModel.pdq);
        this.physicalAssessmentModel.deserialize(fighterModel.physicalAssessments);
        this.waiversModel.deserialize(fighterModel.waivers);
        this.vitalsModel.deserialize(fighterModel.vitals);
    }
}