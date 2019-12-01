/**
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 1/17/2019
 * Parkinsons Medications Model
 */


"use strict";

import Model from "./Model";

/**
 * Parkinson's Symptoms Model, stores the Parkinson's symptoms that the fighter has
 */
export default class ParkinsonSymptomsModel extends Model{

    /**
     * Init symptoms fields to boolean value.
     * Dates, and neurologist are set to empty.
     * Multi symptoms (tremors, postural changes, and assistive devices) fields are set to an instance of its
     * corresponding class.
     *
     */
    constructor(){
        super();
        this._tremors = new Tremors();
        this._posturalChanges = new PosturalChanges();
        this._assistiveDevice = new AssistiveDevice();
        this._balanceLoss = false;
        this._difficultConcentrate = false;
        this._deepBrainStim = false;
        this._dizzyUnsteady = false;
        this._difficultPosition = false;
        this._visionImpairment = false;
        this._slowMovement = false;
        this._fatigue = false;
        this._depression = false;
        this._armSwing = false;
        this._neurologist = "";
        this._firstSymptomsDate = "2018-06-15";
        this._diagnosisDate = "2018-06-15";
        this.dyskinesia = false;
        this.dystonia = false;
        this.hypophonia = false;
        this.bradykinesia = false;
        this._difficultRising = false;
        this._festination = false;
    }

    /**
     * Serializes this object to JSON
     * @returns {{visionImpairment: boolean, deepBrainStim: boolean, difficultConcentrate: boolean,
     * assistiveDevice: AssistiveDevice(), diagnosisDate: Date || "", slowMovement: boolean, fatigue: boolean,
     * posturalChanges: PosturalChanges(), tremors: Tremors(), neurologist: string || "",
     * firstSymptomsDate: Date || "", depression: boolean, difficultPosition: boolean, balanceLoss: boolean,
     * dizzyUnsteady: boolean}}
     */
    serialize() {
        super.serialize();
        return {
            tremors: this.tremors.serialize(),
            posturalChanges: this.posturalChanges.serialize(),
            assistiveDevice: this.assistiveDevice.serialize(),
            balanceLoss: this.balanceLoss,
            difficultConcentrate: this.difficultConcentrate,
            deepBrainStim: this.deepBrainStim,
            dizzyUnsteady: this.dizzyUnsteady,
            difficultPosition: this.difficultPosition,
            visionImpairment: this.visionImpairment,
            slowMovement: this.slowMovement,
            fatigue: this.fatigue,
            depression: this.depression,
            neurologist: this.neurologist,
            firstSymptomsDate: this.firstSymptomsDate,
            diagnosisDate: this.diagnosisDate,
            dyskinesia: this.dyskinesia,
            dystonia: this.dystonia,
            hypophonia: this.hypophonia,
            bradykinesia: this.bradykinesia,
            armSwing: this.armSwing,
            difficultRising: this.difficultRising,
            festination: this.festination
        }
    }

    /**
     * Deserialize this object from JSON.
     * @param {ParkinsonSymptomsModel} from - JSON object of this
*/
    deserialize(from) {
        super.deserialize();
        if(!from)
            return;
        Object.keys(from).forEach((key) => {
            if(from[key] && typeof from[key] === 'object') {
                Object.keys(from[key]).forEach((field) => {
                    this[key][field] = from[key][field];
                });
            } else if ((key === 'firstSymptomsDate' || key === 'diagnosisDate') && from[key]) {
                const split = from[key].split('-');
                this[key] = `${split[1]}/${split[2].slice(0, 2)}/${split[0]}`;
            } else {
                this[key] = from[key];
            }
        });
    }

    /**
     * Returns instance of Tremors class that hold boolean values for symptoms
     * (leftHand, rightHand, head, other)
     * @returns {Tremors} - Tremor class
     */
    get tremors() {
        return this._tremors;
    }

    /**
     * Sets tremors field with instance of Tremors class
     * @param {Tremors} value - Tremor class
     */
    set tremors(value) {
        this._tremors = value;
    }

    /**
     * Returns instance of PosturalChanges class that holds boolean values for postural changes symptoms
     * (stoop, shuffle, other)
     * @returns {PosturalChanges} - PosturalChanges class
     */
    get posturalChanges() {
        return this._posturalChanges;
    }

    /**
     * Sets posturalChanges field with instance of PosturalChanges class
     * @param {PosturalChanges} value - PosturalChanges class
     */
    set posturalChanges(value) {
        this._posturalChanges = value;
    }

    /**
     * Loss of balance
     * @returns {boolean} - true if fighter has symptom, false if not
     */
    get balanceLoss() {
        return this._balanceLoss;
    }

    /**
     * Sets loss of balance to boolean value
     * @param {boolean} value - true if fighter has symptom, false if not
     */
    set balanceLoss(value) {
        this._balanceLoss = value;
    }

    /**
     * Difficulty concentrating or focusing
     * @returns {boolean} - true if fighter has symptom, false if not
     */
    get difficultConcentrate() {
        return this._difficultConcentrate;
    }

    /**
     * Sets difficulty concentrating/focusing to boolean value
     * @param {boolean} value - true if fighter has symptom, false if not
     */
    set difficultConcentrate(value) {
        this._difficultConcentrate = value;
    }

    /**
     * Returns instance of AssistiveDevice class that holds boolean values for assistive devices used by fighter
     * (walker, caregiver, wheelchair, other, cane)
     * @returns {AssistiveDevice}
     */
    get assistiveDevice() {
        return this._assistiveDevice;
    }

    /**
     * Sets assistiveDevice field with instance of AssistiveDevice class
     * @param {AssistiveDevice} value
     */
    set assistiveDevice(value) {
        this._assistiveDevice = value;
    }

    /**
     * Deep brain stimulation
     * @returns {boolean} - true if fighter has symptom, false if not
     */
    get deepBrainStim() {
        return this._deepBrainStim;
    }

    /**
     * Sets deep brain stimulation to boolean value
     * @param {boolean} value - true if fighter has symptom, false if not
     */
    set deepBrainStim(value) {
        this._deepBrainStim = value;
    }

    /**
     * Feel dizzy or unsteady with sudden movements
     * @returns {boolean} - true if fighter has symptom, false if not
     */
    get dizzyUnsteady() {
        return this._dizzyUnsteady;
    }

    /**
     * Sets dizzy or unsteady to boolean value
     * @param {boolean} value - true if fighter has symptom, false if not
     */
    set dizzyUnsteady(value) {
        this._dizzyUnsteady = value;
    }

    /**
     * Had difficulty getting down or rising from seating or lying position
     * @returns {boolean} - true if fighter has symptom, false if not
     */
    get difficultPosition() {
        return this._difficultPosition;
    }

    /**
     * Sets difficultPosition to boolean value
     * @param {boolean} value - true if fighter has symptom, false if not
     */
    set difficultPosition(value) {
        this._difficultPosition = value;
    }

    /**
     * Vision impairment
     * @returns {boolean} - true if fighter has symptom, false if not
     */
    get visionImpairment() {
        return this._visionImpairment;
    }

    /**
     * Sets vision impairment to boolean value
     * @param {boolean} value - true if fighter has symptom, false if not
     */
    set visionImpairment(value) {
        this._visionImpairment = value;
    }

    /**
     * Slowness of movement
     * @returns {boolean} - true if fighter has symptom, false if not
     */
    get slowMovement() {
        return this._slowMovement;
    }

    /**
     * Sets slow movement to boolean value
     * @param {boolean} value - true if fighter has symptom, false if not
     */
    set slowMovement(value) {
        this._slowMovement = value;
    }

    /**
     * Fatigue
     * @returns {boolean}  - true if fighter has symptom, false if not
     */
    get fatigue() {
        return this._fatigue;
    }

    /**
     * Sets fatigue to boolean value
     * @param {boolean} value - true if fighter has symptom, false if not
     */
    set fatigue(value) {
        this._fatigue = value;
    }

    /**
     * Depression
     * @returns {boolean} - true if fighter has symptom, false if not
     */
    get depression() {
        return this._depression;
    }

    /**
     * Sets depression to boolean value
     * @param {boolean} value - true if fighter has symptom, false if not
     */
    set depression(value) {
        this._depression = value;
    }

    /**
     * Sets no/reduced arm swing to boolean value
     * @param {boolean} value - true if the fighter has symptom, false if not
     */
    set armSwing(value) {
        this._armSwing = value;
    }

    /**
     * Returns if fighter has no/reduced arm swing symptom
     * @returns {boolean} value - true if the fighter has symptom, false if not
     */
    get armSwing() {
        return this._armSwing;
    }

    /**
     * Sets difficulty rising from chair or bed to boolean value
     * @param {boolean} value - true if the fighter has symptom, false if not
     */
    set difficultRising(value) {
        this._difficultRising = value;
    }

    /**
     * Returns if fighter has difficulty rising from chair or bed symptom
     * @returns {boolean} value - true if the fighter has symptom, false if not
     */
    get difficultRising() {
        return this._difficultRising;
    }

    /**
     * Festination
     * @returns {boolean}  - true if fighter has symptom, false if not
     */
    get festination() {
        return this._festination;
    }

    /**
     * Sets festination to boolean value
     * @param {boolean} value - true if fighter has symptom, false if not
     */
    set festination(value) {
        this._festination = value;
    }

    /**
     * Name of fighter's neurologist
     * @returns {string} - neurologist's name
     */
    get neurologist() {
        return this._neurologist;
    }

    /**
     * Sets name of neurologist
     * @param {string} value - neurologist's name
     */
    set neurologist(value) {
        this._neurologist = value;
    }

    /**
     * Date when fighter first experienced Parkinson's symptoms.
     *
     * When firstSymptomsDate is filled from form and saved to ParkinsonSymptomsModel, value is a string in MM/dd/yyyy format.
     * If diagnosisDate value is pulled from database (backend) and saved to ParkinsonSymptomsModel, it is a Date object.
     *
     * @returns {Date} if value was recently pulled from database (backend)
     *  || {string} if value was recently saved from ParkinsonSymptoms View page
     */
    get firstSymptomsDate() {
        return this._firstSymptomsDate;
    }

    /**
     * Sets date when fighter first experienced Parkinson's symptoms
     *
     * Value can either be JS date object or string as long as string is in following formats:
     *      - ISO Date (yyyy-MM-dd) e.g. "2015-03-25"
     *      - Short Date (MM/dd/yyyy) e.g "03/25/2015"
     *      - Long Date e.g. "Mar 25 2015" or "25 Mar 2015"
     * When sent to database, value will be saved as Date object on the backend
     *
     * @param {Date || string} value
     */
    set firstSymptomsDate(value) {
        this._firstSymptomsDate = value;
    }

    /**
     * Date when fighter was diagnosed with Parkinson's disease
     *
     * When diagnosisDate is filled from form and saved to ParkinsonSymptomsModel, value is a string in MM/dd/yyyy format.
     * If diagnosisDate value is pulled from database (backend) and saved to ParkinsonSymptomsModel, it is a Date object.
     *
     * @returns {Date} if value was recently pulled from database (backend)
     *  || {string} if value was recently saved from ParkinsonSymptoms View page
     */
    get diagnosisDate() {
        return this._diagnosisDate;
    }

    /**
     * Date when fighter was diagnosed with Parkinson's disease
     *
     * Value can either be JS date object or string as long as string is in following formats:
     *      - ISO Date (yyyy-MM-dd) e.g. "2015-03-25"
     *      - Short Date (MM/dd/yyyy) e.g "03/25/2015"
     *      - Long Date e.g. "Mar 25 2015" or "25 Mar 2015"
     * When sent to database, value will be saved as Date object on the backend
     *
     * @returns {Date || string}
     */
    set diagnosisDate(value) {
        this._diagnosisDate = value;
    }
}

/**
 * AssistiveDevice class is used by ParkinsonSymptomsModel class to set and get assistiveDevice boolean fields
 */
class AssistiveDevice extends Model{

    /**
     * Init assistiveDevice fields to boolean value
     */
    constructor(){
        super();
        this._walker = false;
        this._wheelchair = false;
        this._caregiver = false;
        this._cane = false;
        this._other = false;
        this._scooter = false;
    }

    /**
     * Serializes this object to JSON
     * @returns {{wheelchair: boolean, other: boolean, caregiver: boolean, cane: boolean, walker: boolean}}
     */
    serialize() {
        super.serialize();
        return{
            walker: this.walker,
            wheelchair: this.wheelchair,
            caregiver: this.caregiver,
            cane: this.cane,
            other: this.other,
            scooter: this.scooter
        }
    }

    /**
     * Whether fighter uses walker
     * @returns {boolean} - true if fighter uses device, false if not
     */
    get walker() {
        return this._walker;
    }

    /**
     * Sets walker field to boolean value
     * @param {boolean} value - true if fighter uses device, false if not
     */
    set walker(value) {
        this._walker = value;
    }

    /**
     * Whether fighter uses wheelchair
     * @returns {boolean} true if fighter uses device, false if not
     */
    get wheelchair() {
        return this._wheelchair;
    }

    /**
     * Sets wheelchair field to boolean value
     * @param {boolean} value - true if fighter uses device, false if not
     */
    set wheelchair(value) {
        this._wheelchair = value;
    }

    /**
     * Whether fighter uses caregiver
     * @returns {boolean} true if fighter uses assistance, false if not
     */
    get caregiver() {
        return this._caregiver;
    }

    /**
     * Sets caregiver field to boolean value
     * @param {boolean} value - true if fighter uses device, false if not
     */
    set caregiver(value) {
        this._caregiver = value;
    }

    /**
     * Whether fighter uses cane
     * @returns {boolean} true if fighter uses device, false if not
     */
    get cane() {
        return this._cane;
    }

    /**
     * Sets cane field to boolean value
     * @param {boolean} value - true if fighter uses device, false if not
     */
    set cane(value) {
        this._cane = value;
    }

    /**
     * Whether fighter uses other assistive device
     * @returns {boolean} true if fighter uses device, false if not
     */
    get other() {
        return this._other;
    }

    /**
     * Sets other field to boolean value
     * @param {boolean} value - true if fighter uses other devices, false if not
     */
    set other(value) {
        this._other = value;
    }

    /**
     * Whether fighter uses a scooter
     * @returns {boolean} true if fighter uses a scooter, false if not
     */
    get scooter() {
        return this._scooter;
    }

    /**
     * Sets scooter field to boolean value
     * @param {boolean} value - true if fighter uses a scooter, false if not
     */
    set scooter(value) {
        this._scooter = value;
    }
}

/**
 * PosturalChanges class is used by ParkinsonSymptomsModel class to set and get posturalChanges boolean fields
 */
class PosturalChanges extends Model{

    /**
     * Init PosturalChanges fields to boolean value
     */
    constructor(){
        super();
        this._stoop = false;
        this._shuffle = false;
        this._other = false;
    }

    /**
     * Serializes this object to JSON
     * @returns {{other: boolean, stoop: boolean, shuffle: boolean}}
     */
    serialize() {
        super.serialize();
        return {
            stoop: this.stoop,
            shuffle: this.shuffle,
            other: this.other
        }
    }

    /**
     * Whether fighter has stoop postural changes
     * @returns {boolean} - true if fighter has symptom, false if not
     */
    get stoop() {
        return this._stoop;
    }

    /**
     * Sets stoop field to boolean field
     * @param {boolean} value - true if fighter has symptom, false if not
     */
    set stoop(value) {
        this._stoop = value;
    }

    /**
     * Whether fighter has shuffle postural changes
     * @returns {boolean} - true if fighter has symptom, false if not
     */
    get shuffle() {
        return this._shuffle;
    }

    /**
     * Sets shuffle field to boolean field
     * @param {boolean} value - true if fighter has symptom, false if not
     */
    set shuffle(value) {
        this._shuffle = value;
    }

    /**
     * Whether fighter has other postural changes
     * @returns {boolean} - true if fighter has other postural changes, false if not
     */
    get other() {
        return this._other;
    }

    /**
     * Sets other field to boolean field
     * @param {boolean} value - true if fighter has other postural changes, false if not
     */
    set other(value) {
        this._other = value;
    }
}

/**
 * Tremors class is used by ParkinsonSymptomsModel class to set and get tremor boolean fields
 */
class Tremors extends Model{

    /**
     * Init Tremors fields to boolean value
     */
    constructor(){
        super();
        this._handLeft = false;
        this._handRight = false;
        this._head = false;
        this._essential = false;
        this._other = false;
    }

    /**
     * Serializes this object to JSON
     * @returns {{head: boolean, other: boolean, handLeft: boolean, handRight: boolean}}
     */
    serialize() {
        super.serialize();
        return {
            handLeft: this.handLeft,
            handRight: this.handRight,
            head: this.head,
            essential: this.essential,
            other: this.other
        };
    }

    /**
     * Whether fighter has left hand tremors
     * @returns {boolean} true if fighter has symptoms, false if not
     */
    get handLeft() {
        return this._handLeft;
    }

    /**
     * Sets handLeft field to boolean field
     * @param {boolean} value - true if fighter has symptom, false if not
     */
    set handLeft(value) {
        this._handLeft = value;
    }

    /**
     * Whether fighter has right hand tremors
     * @returns {boolean} true if fighter has symptom, false if not
     */
    get handRight() {
        return this._handRight;
    }

    /**
     * Sets handRight field to boolean field
     * @param {boolean} value - true if fighter has symptom, false if not
     */
    set handRight(value) {
        this._handRight = value;
    }

    /**
     * Whether fighter has head tremors
     * @returns {boolean} true if fighter has symptom, false if not
     */
    get head() {
        return this._head;
    }

    /**
     * Sets head field to boolean field
     * @param {boolean} value - true if fighter has symptom, false if not
     */
    set head(value) {
        this._head = value;
    }

    /**
     * Whether fighter has essential tremors
     * @returns {boolean} true if fighter has symptoms, false if not
     */
    get essential() {
        return this._essential;
    }

    /**
     * Sets essential field to boolean field
     * @param {boolean} value - true if fighter has symptom, false if not
     */
    set essential(value) {
        this._essential = value;
    }

    /**
     * Whether fighter has other tremors
     * @returns {boolean} true if fighter has other tremors, false if not
     */
    get other() {
        return this._other;
    }

    /**
     * Sets other field to boolean field
     * @param {boolean} value - true if fighter has other tremors, false if not
     */
    set other(value) {
        this._other = value;
    }
}