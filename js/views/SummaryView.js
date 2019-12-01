/**
 * Fighter Summary Page, shown first when you click on an existing fighter. Used to get an overview of fighter,
 * display important information and quick access to edit.
 * @author Tyler Bezera
 * 5/2/19
 * SummaryView.js
 *
 * @version 2.0
 * @author Kaephas
 * @author Cody
 * @author Vera
 * @author David
 * 11/30/2019
 */


"use strict";


import View from "./View";
import BadgerAccordion from 'badger-accordion';
import HealthKeywords from '../../resources/healthKeywords';
import Toastify from "toastify-js";
import AssessmentHistoryView from "./AssessmentHistoryView";
import PALongView from "./physicalAssessment/PALongView";
import VitalsModel from "../models/VitalsModel";
import PDQModel from "../models/PDQModel";
import {parseString} from "loader-utils";
import { pathToFileURL } from "url";

/**
 * View class for the Summary, handles template and rendering for the summary page.
 */
export default class SummaryView extends View{

    /**
     * SummaryView constructor builds the View. Constructs the summaries for recent PDQ/PA assessments.
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callBacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callBacks) {
        super(dataHive, callBacks);
        this.fighterModel = this.dataHive.fighterModel;
        this.fighterImg = this.dataHive.fighterImg;
        this.newFighterEnrollment = dataHive.newFighterEnrollment;
        this.addAssessment = dataHive.addAssessment;

        this._parkSymptomsString = this._setupStringFromModel(this.dataHive.fighterModel.parkinsonSymptomsModel.serialize());
        this._parkMedicationsString = this._setupStringFromModel(this.dataHive.fighterModel.parkinsonsMedicationsModel.serialize());
        this._generalHealthString = this._setupStringFromModel(this.dataHive.fighterModel.healthAndHeartModel.serialize());
        this._summarizedPDQ = SummaryView.summarizePDQsToList(this.fighterModel.pdqModel.serialize(), this.fighterModel, this.addAssessment);
        this._summarizedPA = SummaryView.summarizePAToListObject(this.fighterModel.physicalAssessmentModel.serialize(), this.fighterModel);
        this._summarizedGeneral = SummaryView.summarizeGeneral(this.fighterModel.pdqModel.serialize(), this.fighterModel.physicalAssessmentModel.serialize(), this.fighterModel.vitalsModel.serialize().vitalsAssessment, this.fighterModel);
        this._sortedAssessmentDates = SummaryView.getSortedAssessmentDates(true, this.fighterModel.pdqModel.serialize(), this.fighterModel.physicalAssessmentModel.serialize(), this.fighterModel.vitalsModel._vitalsAssessment);
    }

    /**
     * Pulls data from fighter's model object and returns HTML string with their corresponding pretty data names.
     * @param serializedModel
     * @returns {string}
     * @private
     */
    _setupStringFromModel(serializedModel)
    {
        let returnString = '';
        Object.keys(serializedModel).forEach((item) => {
            if(serializedModel[item] instanceof Object){
                Object.keys(serializedModel[item]).forEach((innerItem) => {
                    if(typeof serializedModel[item][innerItem] === "boolean"){
                        if(serializedModel[item][innerItem] === true){
                            returnString += `<h5>${HealthKeywords[item][innerItem]}</h5>`;
                        }
                    }
                });
            } else {
                if(serializedModel[item] === true){
                    returnString += `<h5>${HealthKeywords[item]}</h5>`
                }
            }
        });

        return returnString;
    }

    /**
     * Calls event handler and callback functions after page has rendered.  Assists with viewing specific PDQ/PA
     * assessments and/or parkinson's medications/symptoms/health conditions.
     */
    postRenderSetup()
    {
        const accordionDomNode = this.el.querySelectorAll('.js-badger-accordion');
        Array.from(accordionDomNode).forEach((accord) => {
            const accorda = new BadgerAccordion(accord);
        });
        this.el.addEventListener(("click"), (el) => {
            if(el.target.querySelector("i")) {
                if(el.target.querySelector("i").classList.contains("fa-arrow-alt-circle-down")){
                    el.target.querySelector("i").classList.remove("fa-arrow-alt-circle-down");
                    el.target.querySelector("i").classList.add("fa-arrow-alt-circle-up");
                }
                else if(el.target.querySelector("i").classList.contains("fa-arrow-alt-circle-up")) {
                    el.target.querySelector("i").classList.remove("fa-arrow-alt-circle-up");
                    el.target.querySelector("i").classList.add("fa-arrow-alt-circle-down");
                }
            }
        });

        this.el.querySelectorAll(".viewPDQButton").forEach((viewPDQButton) => {
            viewPDQButton.onclick = () => {
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
                this.callbacks.viewCompletePDQ(viewPDQButton.dataset.pdqDate, "summary");
            }
        });
    }

    /**
     * Static method that takes Date object, calculates, and returns fighter's age.
     * @param {Date} dateString - fighter's birthdate
     * @returns {number} - fighter's age according to birthdate
     */
    static calculateAge(dateString){
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
        }
        return age;
    }

    /**
     * Receives taken physical assessments/pdq(s). Calculates and returns Mobility/Daily Living, Cognition/Communication,
     * Cognition/Emotional/Stigma, BWP, and Fall Risk Scores
     * @param {Map} pdqAssessmentMap - a Map object that contains PDQ dates taken as keys and array of PDQ answers as values
     * @param {Map} paAssessmentMap - a Map object that contains PA dates taken as keys and array of PA scores as values
     * @param {Map} vitalAssessmentMap - a Map object that contains Vitals dates taken as keys and array of weight value and exercise objects
     * @param {FighterModel} fighterModel - reference to fighterModel object
     * @returns {string} - HTML string
     */
    static summarizeGeneral(pdqAssessmentMap, paAssessmentMap, vitalAssessmentMap, fighterModel)
    {
        //get unique dates
        const datesSet = new Set();
        const pdqAssessDates = SummaryView.getDisplayAssessDates(pdqAssessmentMap);

        pdqAssessDates.forEach((date) => {
            if(pdqAssessDates.includes(date) && SummaryView.getDisplayAssessDates(vitalAssessmentMap).includes(date) &&
                SummaryView.getDisplayAssessDates(paAssessmentMap).includes(date))
            {
                datesSet.add(date);
            }
        });

        const generalAssessmentDates = Array.from(datesSet);
        let assessments = {assessment1: [], assessment2: []};

        let generalLists = '';
        for(let i = 0; i < generalAssessmentDates.length; i++) {
            let date = generalAssessmentDates[i];
            let pdqAssessmentData = pdqAssessmentMap.get(date);
            let paAssessmentData = paAssessmentMap.get(date);
            let vitalAssessmentData = vitalAssessmentMap.get(date);
            let assessmentDate = SummaryView.miniDateFromDate(date);
            pdqAssessmentData = fighterModel.pdqModel.pdqAssessmentScore(pdqAssessmentData);
            paAssessmentData = fighterModel.physicalAssessmentModel.paAssessmentScore(paAssessmentData, fighterModel.personalInformationModel.gender, SummaryView.calculateAge(fighterModel.personalInformationModel.birthDate));
            let weight = vitalAssessmentData.weight;
            let BMI = ((vitalAssessmentData.weight || fighterModel.vitalsModel.weight) && fighterModel.personalInformationModel.height)
                                            ? VitalsModel.calculateBMI(vitalAssessmentData.weight ? vitalAssessmentData.weight : fighterModel.vitalsModel.weight, fighterModel.personalInformationModel.height)
                                            : "N/A";
            let BwPScores = SummaryView.calculateBwPScores(pdqAssessmentData, paAssessmentData);
            let FallRisk = (() => {
                if(paAssessmentData.Score >= 77){
                    return "Low";
                } else if(paAssessmentData.Score >= 63) {
                    return "Mid";
                } else {
                    return "High";
                }
            })();

            if(generalAssessmentDates.length > 1) {
                if(i === 0)
                    assessments.assessment1.push(weight, BMI, BwPScores.MD, BwPScores.CC, BwPScores.CES, BwPScores.PAS, BwPScores.BWP, FallRisk);
                else if(i === generalAssessmentDates.length - 1)
                    assessments.assessment2.push(weight, BMI, BwPScores.MD, BwPScores.CC, BwPScores.CES, BwPScores.PAS, BwPScores.BWP, FallRisk);
            }

            generalLists += `
                <div class="col-2">
                    <span class="font-weight-bold">${assessmentDate}</span>
                        <ul class="list-unstyled">
                            <li class="">${weight ? weight : "N/A"}</li>
                            <li class="">${BMI}</li>
                            <li class="">${BwPScores.MD}</li>
                            <li class="">${BwPScores.CC}</li>
                            <li class="">${BwPScores.CES}</li>
                            <li class="">${BwPScores.PAS}</li>
                            <li class="">${BwPScores.MD === 0 ? "N/A" : BwPScores.BWP}</li>
                            <li class="">${FallRisk}</li>
                        </ul>
                </div>
            `;
        }

        if(generalAssessmentDates.length > 1) {
            const generalTrends = SummaryView.getAssessmentSummaryTrends(assessments);
            generalLists += `
                    <div class="col-2" >
                        <span class="font-weight-bold">Trend</span>
                        <ul class="list-unstyled">`
                        + generalTrends + `
                        </ul>
                    </div>`;
        }
        
        return generalLists;
    }

    /**
     * Calculates PDQ Scores, including the overall BwP Score
     * @param {object} pdqAssessmentData - object of pdq assessment scores determined by pdqModel's pdqAssessmentScore method
     * @param {object} paAssessmentData - object of pa scores determined by physicalAssessmentModel's paAsssessmentScore method
     * @return {{CC: number, CES: number, PAS: number, MD: number, BWP: number}}
     */
    static calculateBwPScores(pdqAssessmentData, paAssessmentData) {
        let MD = Math.floor((Number(pdqAssessmentData.Mobility) + pdqAssessmentData.DailyLiving)/2);
        let CC = Math.floor((Number(pdqAssessmentData.Cognition) + pdqAssessmentData.Communication)/2);
        let CES = Math.floor((Number(pdqAssessmentData.Cognition) + pdqAssessmentData.Emotional + pdqAssessmentData.Stigma)/3);
        let PAS = Math.floor(Number(Number(paAssessmentData["Score"]) + Number(paAssessmentData['S2SScore']) + Number(paAssessmentData['UpScore'])) / 3);
        let BWP = Math.floor(Number(MD + CC + CES + PAS) / 4);
        return { MD: MD, CC: CC, CES: CES, PAS: PAS, BWP: BWP };
    }

    /**
     * Static method summarizes the PA scores for each physical assessment in list form.
     * @param {Map} assessment - a Map object that contains PA dates taken as keys and array of PA scores as values
     * @param {FighterModel} fighterModel - a fighter model object
     * @returns {Object} - HTML string
     */
    static summarizePAToListObject(assessment, fighterModel)
    {
        const assessmentDates = Array.from(assessment.keys());
        SummaryView.sortAssessmentDateArray(assessmentDates);

        let paDisplayAssessmentDates = assessmentDates.length <= 3 ? assessmentDates : [assessmentDates[0], assessmentDates[assessmentDates.length - 2], assessmentDates[assessmentDates.length - 1]];

        const paObject = {
            paList: "",
            upNGo: "",
            s2s: "",
            fabTrends: "",
            upNGoTrends: "",
            s2sTrends: ""
        };

        let fabAssessments = {assessment1: [], assessment2: []};
        let s2sAssessments = {assessment1: [], assessment2: []};
        let tugAssessments = {assessment1: [], assessment2: []};
        fighterModel._paAssessmentDates = Array.from(paDisplayAssessmentDates);
        for(let i = 0; i < paDisplayAssessmentDates.length; i++) {
            let value = paDisplayAssessmentDates[i];
            let assessmentData = assessment.get(value);
            assessmentData = fighterModel.physicalAssessmentModel.paAssessmentScore(assessmentData, fighterModel.personalInformationModel.gender, SummaryView.calculateAge(fighterModel.personalInformationModel.birthDate));
            let assessmentDate = SummaryView.miniDateFromDate(value);
            if(paDisplayAssessmentDates.length > 1) {
                if(i === 0)  {
                    fabAssessments.assessment1.push(assessmentData["Bal 2 Ft"], assessmentData["Pencil"], assessmentData["360"],
                        assessmentData["Steps"], assessmentData["Bench"], assessmentData["Heel Toe"], assessmentData["1 Leg"],
                        assessmentData["Foam"], assessmentData["2 Ft Jump"], assessmentData["Inches"], assessmentData["Head Turns"],
                        assessmentData["Fall Back"], assessmentData["Score"]);
                    s2sAssessments.assessment1.push(assessmentData["Sit to Stand"], assessmentData["Target"], assessmentData["S2SScore"]);
                    tugAssessments.assessment1.push(assessmentData["Up and Go"], assessmentData["UpScore"]);
                } else if(i === paDisplayAssessmentDates.length - 1) {
                    fabAssessments.assessment2.push(assessmentData["Bal 2 Ft"], assessmentData["Pencil"], assessmentData["360"],
                        assessmentData["Steps"], assessmentData["Bench"], assessmentData["Heel Toe"], assessmentData["1 Leg"],
                        assessmentData["Foam"], assessmentData["2 Ft Jump"], assessmentData["Inches"], assessmentData["Head Turns"],
                        assessmentData["Fall Back"], assessmentData["Score"]);
                    s2sAssessments.assessment2.push(assessmentData["Sit to Stand"], assessmentData["Target"], assessmentData["S2SScore"]);
                    tugAssessments.assessment2.push(assessmentData["Up and Go"], assessmentData["UpScore"]);
                }
            }

            paObject.paList += `
                <div class="col-2">
                    <span class="font-weight-bold">${assessmentDate}</span>
                        <ul class="list-unstyled">
                            <li class="">${assessmentData["Bal 2 Ft"]}</li>
                            <li class="">${assessmentData["Pencil"]}</li>
                            <li class="">${assessmentData["360"]}</li>
                            <li class="">${assessmentData["Steps"]}</li>
                            <li class="">${assessmentData["Bench"]}</li>
                            <li class="">${assessmentData["Heel Toe"]}</li>
                            <li class="">${assessmentData["1 Leg"]}</li>
                            <li class="">${assessmentData["Foam"]}</li>
                            <li class="">${assessmentData["2 Ft Jump"]}</li>
                            <li class="">${assessmentData["Inches"]}</li>
                            <li class="">${assessmentData["Head Turns"]}</li>
                            <li class="">${assessmentData["Fall Back"]}</li>
                            <li class="">${assessmentData["Score"]}</li>
                        </ul>
                </div>
            `;

            paObject.upNGo += `
                <div class="col-2">
                        <ul class="list-unstyled">
                            <li class="">${assessmentData["Up and Go"]}</li>
                            <li class="">${assessmentData["UpScore"]}</li>
                        </ul>
                </div>
            `;

            paObject.s2s += `
                <div class="col-2">
                        <ul class="list-unstyled">
                            <li class="">${assessmentData["Sit to Stand"]}</li>
                            <li class="">${assessmentData["Target"]}</li>
                            <li class="">${assessmentData["S2SScore"]}</li>
                        </ul>
                </div>
            `;
        }

        const paTrends = SummaryView.getPATrends(fabAssessments, s2sAssessments, tugAssessments);

        console.log(paTrends);

        if(paTrends.FAB.length > 0) {
            paObject.fabTrends = `
                <div class="col-2">
                    <span class="font-weight-bold">Trend</span>
                    <ul class="list-unstyled">` +
                        paTrends.FAB +
                    `</ul>
                </div>`;
        }

        if(paTrends.S2S.length > 0) {
            paObject.s2sTrends = `
                <div class="col-2">
                    <ul class="list-unstyled">` +
                        paTrends.S2S +
                    `</ul>
                </div>`;
        }

        if(paTrends.TUG.length > 0) {
            paObject.upNGoTrends = `
                <div class="col-2">
                    <ul class="list-unstyled">` +
                        paTrends.TUG +
                    `</ul>
                </div>`;
        }

        return paObject;
    }

    /**
     * Static method that returns date as a string in MM/YY format.
     * @param {Date} date - the assessment date
     * @returns {string} - HTML string in MM/YY format
     */
    static miniDateFromDate(date)
    {
        let splitDate = date.toString().split("-");
        let year = splitDate[0].charAt(2) + splitDate[0].charAt(3);
        return `${splitDate[1]}/${year}`;
    }

    /**
     * Static method summarizes the PDQ scores for each PDQ category in list form.
     * @param {Map} assessmentMap - a Map object that contains pdq dates taken as keys and array of PDQ answers as values
     * @param {boolean} hideViewBtnBoolean - whether to hide the  view button that is added for coaches to click and view an individual pdq
     * @param {FighterModel} fighterModel - a fighter model object
     * @returns {string} - HTML string
     */
    static summarizePDQsToList(assessmentMap, fighterModel, hideViewBtnBoolean=true)
    {
        const assessmentDates = Array.from(assessmentMap.keys());
        SummaryView.sortAssessmentDateArray(assessmentDates);

        let assessments = {assessment1: [], assessment2: []};
        let pdqSecs = {pdq1: 0, pdq2: 0};
        let pdqDisplayAssessmentDates = assessmentDates.length <= 3 ? assessmentDates : [assessmentDates[0], assessmentDates[assessmentDates.length - 2], assessmentDates[assessmentDates.length - 1]];
        let pdqList = "";

        fighterModel._pdqAssessmentDates = Array.from(pdqDisplayAssessmentDates);
        for(let i = 0; i < pdqDisplayAssessmentDates.length; i++) {
            let value = pdqDisplayAssessmentDates[i];
            let assessmentData = assessmentMap.get(value);
            let assessmentDate = SummaryView.miniDateFromDate(value);
            assessmentData = fighterModel.pdqModel.pdqAssessmentScore(assessmentData);
            const totalPDQTime = fighterModel.pdqModel.getTotalPDQTime(value);
            //const pdqTimeScore = (totalPDQTime > 0) ? fighterModel.pdqModel.getPDQTimeScore(totalPDQTime) : 0;
            if(pdqDisplayAssessmentDates.length > 1) {
                if(i === 0)  {
                    assessments.assessment1.push(assessmentData.Mobility, assessmentData.DailyLiving,
                        assessmentData.Emotional, assessmentData.Stigma, assessmentData.Social, assessmentData.Cognition,
                        assessmentData.Communication, assessmentData.Body);
                    pdqSecs.pdq1 = totalPDQTime;
                } else if(i === pdqDisplayAssessmentDates.length - 1) {
                    assessments.assessment2.push(assessmentData.Mobility, assessmentData.DailyLiving,
                        assessmentData.Emotional, assessmentData.Stigma, assessmentData.Social, assessmentData.Cognition,
                        assessmentData.Communication, assessmentData.Body);
                    pdqSecs.pdq2 = totalPDQTime;
                }
            }
            pdqList += `
                <div class="col-2" >
                    ${hideViewBtnBoolean ? "" : `<button class="viewPDQButton btn-rsb" data-pdq-date="${value}" 
                    style="border:none;background:none;"><i class="fas fa-search fa-sm mr-1" style="color:#0174DF; 
                    font-size:25px;"></i></button>`}
                    <span class="font-weight-bold" style="display:block;">${assessmentDate}</span>
                        <ul class="list-unstyled">
                            <li class="">${totalPDQTime === 0 ? "N/A" : PDQModel.formatTotalPDQTime(totalPDQTime)}</li>
                            <li class="">${assessmentData.Mobility}</li>
                            <li class="">${assessmentData.DailyLiving}</li>
                            <li class="">${assessmentData.Emotional}</li>
                            <li class="">${assessmentData.Stigma}</li>
                            <li class="">${assessmentData.Social}</li>
                            <li class="">${assessmentData.Cognition}</li>
                            <li class="">${assessmentData.Communication}</li>
                            <li class="">${assessmentData.Body}</li>
                        </ul>
                </div>
            `;
        }

        const pdqTrends = SummaryView.getPDQTrends(assessments);
        let pdqTimeTrendListItem = '<li class=""></li>';
        // if(pdqSecs.pdq1 || pdqSecs.pdq2) {   // TODO: Fix spacing--doesn't match other columns
            if(pdqSecs.pdq1 && pdqSecs.pdq2) {  // TODO: confirm behavior (trying to remove trend showing if no original time set
            let pdqTimeTrend = Number(pdqSecs.pdq2) - Number(pdqSecs.pdq1);
            pdqTimeTrendListItem = `<li class="${pdqTimeTrend > 0 ? "text-danger" : pdqTimeTrend < 0 ? "text-success" : ""}">${pdqTimeTrend === 0 ? "---" : PDQModel.formatTotalPDQTime(pdqTimeTrend)}</li>`
        } else if (pdqSecs.pdq2) {
                pdqTimeTrendListItem = "---";
            }
        
        if(fighterModel._pdqAssessmentDates.length > 1) {
            pdqList += `
                    <div class="col-2" >
                    ${hideViewBtnBoolean ? "" : "<br>"}
                    <span class="font-weight-bold" ${hideViewBtnBoolean ? "" : `style="position:relative;top:5px";`}">Trend</span>
                        <ul class="list-unstyled"> 
                            ${pdqTimeTrendListItem}
                            ${pdqTrends}
                        </ul>
                    </div>`;
        }

        return pdqList;
    }

    static getPDQTrends(pdqAssessments) {
        let trendArray = SummaryView.calculateTrends(pdqAssessments);
        let first = [trendArray[0]];
        let second = [];
        for (let i = 1; i < trendArray.length; i++) {
            second.push(trendArray[i]);
        }
        let output = SummaryView.generateTrendListItems(first, false);
        return output + SummaryView.generateTrendListItems(second, true);
    }

    static getAssessmentSummaryTrends(assessments) {
        let trendArray = SummaryView.calculateTrends(assessments);
        console.log("line" + trendArray);
        let first = [trendArray[0], trendArray[1]];
        let second = [];

        for (let i = 2; i < trendArray.length; i++) {
            second.push(trendArray[i]);
        }

        let output = SummaryView.generateTrendListItems(first, false);
        return output + SummaryView.generateTrendListItems(second, true);
    }

    /**
     * @param {Object} fabAssessments
     * @param {Object} s2sAssessments
     * @param {Object} tugAssessments
     * @return {{S2S: string, FAB: string, TUG: string}}
     */
    static getPATrends(fabAssessments, s2sAssessments, tugAssessments) {
        let fabTrends = SummaryView.calculateTrends(fabAssessments);
        let s2sTrends = SummaryView.calculateTrends(s2sAssessments);
        let tugTrends = SummaryView.calculateTrends(tugAssessments);

        return {FAB: SummaryView.generateTrendListItems(fabTrends, true),
                S2S: SummaryView.generateTrendListItems(s2sTrends, true),
                TUG: SummaryView.generateTrendListItems(tugTrends, false, true)};
    }

    /**
     * Returns a list of trends improvements/losses comparing two assessment data. Assessment1 is the first assessment,
     * assessment2 is the most recent assessment.
     * @param {Object} assessments - {assessment1: [Array of assessment1 data], assessment2: [Array of assessment2 data]}
     * @returns {Array} - HTML string
     */
    static calculateTrends(assessments) {
        let trendArray = []; // TODO: check if assessment1 has no value
        if(assessments.assessment1.length > 0 && assessments.assessment2.length > 0) {
            for(let i = 0; i < assessments.assessment1.length; i++) {
                if(Number(assessments.assessment2[i] - assessments.assessment1[i]) === assessments.assessment2[i]) {
                    console.log("TREND CALC");
                    console.log("ASS 2[" + i + "]:" + assessments.assessment2[i]);
                    console.log("Trend should be ---");
                    trendArray.push(0);
                } else {
                    let trend = Number(assessments.assessment2[i]) - Number(assessments.assessment1[i]);
                    if (isNaN(trend)) trend = null;
                    if (trend !== null && trend.toString().includes('.')) trend = trend.toFixed(1);
                    trendArray.push(trend);
                }
                console.log(trendArray);
            }
        }
        return trendArray;
    }

    static generateTrendListItems(trendArray, positiveGoodBoolean, isTug) {
        let trendList = "";
        trendArray.forEach((trend) => {
            if(positiveGoodBoolean) trendList += `<li class="${trend < 0 ? "text-danger" : trend > 0 ? "text-success" : ""}">${trend === 0 ? "---" : trend === null ? "_" : `${Math.abs(trend)}<i class="fas fa-long-arrow-alt-${trend > 0 ? "up" : "down"}"></i>`}</li>`;
            else if(isTug) trendList += `<li class="${trend > 0 ? "text-success" : trend < 0 ? "text-success" : ""}">${trend === 0 ? "---" : trend === null ? "_" : `${Math.abs(trend)}<i class="fas fa-long-arrow-alt-${trend > 0 ? "up" : "down"}"></i>`}</li>`;
            else trendList += `<li class="${trend > 0 ? "text-danger" : trend < 0 ? "text-success" : ""}">${trend === 0 ? "---" : trend === null ? "_" : `${Math.abs(trend)}<i class="fas fa-long-arrow-alt-${trend > 0 ? "down" : "up"}"></i>`}</li>`;
        });
        return trendList;
    }

    /**
     * Gets the display assessment dates (first, second-to-last, last assessment
     * @param {Map} assessmentMap - a Map object that contains vitals dates taken as keys and array of assessment objects as values
     * @return {Array} array of assessment dates
     */
    static getDisplayAssessDates(assessmentMap) {
        const assessmentDates = Array.from(assessmentMap.keys());
        SummaryView.sortAssessmentDateArray(assessmentDates);

        return assessmentDates.length <= 3 ? assessmentDates : [assessmentDates[0], assessmentDates[assessmentDates.length - 2], assessmentDates[assessmentDates.length - 1]];
    }

    /**
     * Static method sorts an array according to their dates. Oldest date is sorted to the front of the array,
     * most recent date is sorted to the back.
     * @param {Array} assessmentArray - array of assessment dates
     */
    static sortAssessmentDateArray(assessmentArray)
    {
        assessmentArray.sort((first, second) => {
            let firstD = new Date(first);
            let secondD = new Date(second);
            return firstD.getTime() - secondD.getTime();
        });
    }

    /**
     * Calls static method to get sorted assessment dates from vitals, pdq, and pa
     * @param {boolean} ascendingBoolean - true if sorting from oldest to recent; false if sorting from recent to oldest
     * @param {Map} pdqMap - map that holds key/value pair of date/taken pdq assessments
     * @param {Map} paMap - map that holds key/value pair of date/taken physical assessments
     * @param {Map} vitalsMap - map that holds key/value pair of date/taken vital assessments
     * @return {Array} array of sorted assessment dates
     */
    static getSortedAssessmentDates(ascendingBoolean, pdqMap = new Map(), paMap = new Map(), vitalsMap = new Map()) {
        const assessmentDates = AssessmentHistoryView.getAllAssessDatesArray(pdqMap, paMap, vitalsMap);
        AssessmentHistoryView.sortAssessmentDateArray(assessmentDates, ascendingBoolean);
        return assessmentDates;
    }

    /**
     * Returns TWET Level
     * @param {Map} vitalsMap - map of vitals assessments
     * @return {string} - string of TWET level
     */
    static getTWETLevel(vitalsMap) {
        const recentTWETScore = SummaryView.getTWETScore(vitalsMap);
        return VitalsModel.getTWETLevel(recentTWETScore.TotalTWET);
    }

    /**
     * Returns recent TWET Score
     * @param {Map} vitalsMap - map of vitals assessments
     * @return {{BoxingTWET, TotalTWET}} TWET Scores in object
     */
    static getTWETScore(vitalsMap) {
        const vitalsDatesArray = SummaryView.getDisplayAssessDates(vitalsMap);
        const recentVitalsDate = vitalsDatesArray[vitalsDatesArray.length - 1];
        if(vitalsMap.get(recentVitalsDate) && vitalsMap.get(recentVitalsDate).exercises) return VitalsModel.calculateTWET(vitalsMap.get(recentVitalsDate).exercises);
        else return VitalsModel.calculateTWET(vitalsMap.get(recentVitalsDate));

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
            <div class="card card-shadow" style="border: solid 2px #dedede">
                <div class="card-body">
                    <div class="card-title" style="font-weight: bold">
                        Boxer Profile - ${this.fighterModel.personalInformationModel.firstName} ${this.fighterModel.personalInformationModel.lastName}
                    </div>
                    <div class="row mb-2">
                        <div class="col-6 col-sm-5 col-md-4 col-lg-3">
                            <div>
                                <img id="fighterImage" src="${this.fighterImg.length > 0 ? this.fighterImg : 'img/boxer.jpg'}" alt="Fighter Image" class="img-thumbnail"/>
                            </div>
                        </div>
                        <div class="col-6 col-sm-7 col-md-5">
                           <ul class="list-unstyled">
                                <li class=""><strong>Age: </strong>${this.fighterModel.personalInformationModel.birthDate ? SummaryView.calculateAge(this.fighterModel.personalInformationModel.birthDate) : "N/A"}</li>
                                <li class=""><strong>Diagnosed: </strong>${this.fighterModel.parkinsonSymptomsModel.diagnosisDate ? PALongView.displayMonthYearFromDate(this.fighterModel.parkinsonSymptomsModel.diagnosisDate) : "N/A"}</li>
                                <li class=""><strong>Birthday: </strong>${this.fighterModel.personalInformationModel.birthDate ? PALongView.displayFullDateFromDate(this.fighterModel.personalInformationModel.birthDate) : "N/A"}</li>
                                <li class=""><strong>Joined</strong><span><a role="button" style="font-size:18px;" data-tippy-content='
                                                        <p class="m-2">Join date is determined by the boxer&#39;s first assessment.</p>'
                                                        <i class="fas fa-lg fa-info-circle ml-1"></i></a>
                                                    </span>: ${(this._sortedAssessmentDates && this._sortedAssessmentDates.length > 0) ? PALongView.displayFullDateFromDate(this._sortedAssessmentDates[0]) : "N/A"}</li>
                                <li class=""><strong>Next Assessment</strong><span><a role="button" style="font-size:18px;" data-tippy-content='
                                                        <p class="m-2">By default, the re-assessment date is determined from the boxer&#39;s most recent assessment and the selected re-assessment interval on the coach&#39;s page.</p>'
                                                        <i class="fas fa-lg fa-info-circle ml-1"></i></a>
                                                    </span>: ${PALongView.displayFullDateFromDate(new Date(this.fighterModel.coachObservationModel.reassessmentDate).toInputString())}</li>
                                <li class=""><strong>TWET: </strong>${SummaryView.getTWETLevel(this.fighterModel.vitalsModel._vitalsAssessment)}, <strong>Total: </strong>${SummaryView.getTWETScore(this.fighterModel.vitalsModel._vitalsAssessment).TotalTWET}
                                            <strong>Boxing: </strong>${SummaryView.getTWETScore(this.fighterModel.vitalsModel._vitalsAssessment).BoxingTWET}</li>
                                <li class=""><strong>BwP Level: </strong>${this.fighterModel.coachObservationModel.rsbLevel ? this.fighterModel.coachObservationModel.rsbLevel : "N/A"}</li>
                           </ul>
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-12 ml-0">
                            <div class="card card-shadow card-border">
                                    <div class="card-body">  
                                    <div class="row">
                                        <div class="col-4">
                                        <span class="font-weight-bold">Date:</span>
                                            <ul class="list-unstyled">
                                            <li class="">Weight</li>
                                            <li class="">BMI</li>
                                            <li class="">M & DL</li>
                                            <li class="">C & C</li>
                                            <li class="">Outlook</li>
                                            <li class="">Physical</li>
                                            <li class="">BwP Score</li>
                                            <li class="">Fall Risk</li>
                                            </ul>
                                        </div>
                                        ${this._summarizedGeneral}
                                    </div>
                               </div>
                           </div>
                           </div>
                           </div>
                           <div class="row">
                           <div class="col-12">
                                <div class="card card-shadow card-border">
                                    <div class="card-body">
                                    <div class="card-title font-weight-bold">PDQ Scores by Category</div>   
                                    <div class="row">
                                        <div class="col-4">
                                        ${!this.addAssessment ? "<br>" : ""}
                                        <span class="font-weight-bold">Date:</span>
                                            <ul class="list-unstyled">
                                                <li class="">PDQ Time (M:SS)</li>
                                                <li class="">Mobility</li>
                                                <li class="">Daily Living</li>
                                                <li class="">Emotional</li>
                                                <li class="">Stigma</li>
                                                <li class="">Social</li>
                                                <li class="">Cognition</li>
                                                <li class="">Communication</li>
                                                <li class="">Body</li>
                                            </ul>
                                        </div>
                                        ${this._summarizedPDQ}
                                    </div>
                               </div>
                           </div>
                           </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-12">
                            <div class="card card-shadow card-border">
                                    <div class="card-body">
                                    <div class="card-title font-weight-bold">Fullerton Advanced Balance</div>   
                                    <div class="row">
                                        <div class="col-4">
                                        <span class="font-weight-bold">Date:</span>
                                            <ul class="list-unstyled">
                                                <li class="">Bal 2 Ft</li>
                                                <li class="">Pencil</li>
                                                <li class="">360</li>
                                                <li class="ml-1" style="color: gold;">Steps</li>
                                                <li class="">Bench</li>
                                                <li class="">Heel Toe</li>
                                                <li class="">1 Leg</li>
                                                <li class="">Foam</li>
                                                <li class="">Standing Jump (T2T)</li>
                                                <li class="ml-1" style="color: gold;">Inches</li>
                                                <li class="">Head Turns</li>
                                                <li class="">Fall Back</li>
                                                <li class="">Score</li>
                                            </ul>
                                        </div>
                                        ${this._summarizedPA.paList}
                                        ${this._summarizedPA.fabTrends}
                                    </div>
                                    <div class="card-title font-weight-bold">Timed Up & Go</div> 
                                        <div class="row">
                                            <div class="col-4">
                                                <ul class="list-unstyled">
                                                    <li class="">Time</li>
                                                    <li class="">Score</li>
                                                </ul>
                                            </div>
                                             ${this._summarizedPA.upNGo}
                                             ${this._summarizedPA.upNGoTrends}
                                        </div>
                                        <div class="card-title font-weight-bold">Sit to Stand</div>   
                                        <div class="row">
                                            <div class="col-4">
                                                <ul class="list-unstyled">
                                                    <li class="">You</li>
                                                    <li class="">Target</li>
                                                    <li class="">Score</li>
                                                </ul>
                                            </div>
                                             ${this._summarizedPA.s2s}
                                             ${this._summarizedPA.s2sTrends}
                                        </div>
                                    </div>
                               </div>
                           </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                    <dl class="js-badger-accordion card card-shadow">
                                        <dt class="badger-accordion__header">
                                            <button class="js-badger-accordion-header btn btn-rsb summaryBtn w-100">
                                                <i class="fas fasSummary fa-arrow-alt-circle-down float-left mr-2"></i><span class="float-left font-weight-bold">General </span>
                                            </button>
                                        </dt>
                                        <dd class="badger-accordion__panel js-badger-accordion-panel card-body">
                                            <div class="js-badger-accordion-panel-inner">
                                                <h5>First Symptoms: ${this.fighterModel.parkinsonSymptomsModel.firstSymptomsDate ? PALongView.displayMonthYearFromDate(this.fighterModel.parkinsonSymptomsModel.firstSymptomsDate) : "N/A"}</h5>
                                                <h5>Fighter Intensity: ${this.fighterModel.coachObservationModel.boxerIntensity}</h5>
                                                <br>
                                                <br>
                                                ${this._generalHealthString}
                                            </div>
                                        </dd>
                                   </dl>
                                   <dl class="js-badger-accordion card card-shadow">
                                        <dt class="badger-accordion__header">
                                            <button class="js-badger-accordion-header summaryBtn btn btn-rsb w-100">
                                                <i class="fas fasSummary fa-arrow-alt-circle-down float-left mr-2"></i><span class="float-left font-weight-bold">PD Symptoms </span>
                                            </button>
                                        </dt>
                                        <dd class="badger-accordion__panel js-badger-accordion-panel card-body">
                                            <div class="js-badger-accordion-panel-inner">
                                                ${this._parkSymptomsString}
                                            </div>
                                        </dd>
                                   </dl>
                                   <dl class="js-badger-accordion card card-shadow">
                                        <dt class="badger-accordion__header">
                                            <button class="js-badger-accordion-header summaryBtn btn btn-rsb w-100">
                                                <i class="fas fasSummary fa-arrow-alt-circle-down float-left mr-2"></i><span class="float-left font-weight-bold">PD Medications </span>
                                            </button>
                                        </dt>
                                        <dd class="badger-accordion__panel js-badger-accordion-panel card-body">
                                            <div class="js-badger-accordion-panel-inner">
                                                ${this._parkMedicationsString}
                                            </div>
                                        </dd>
                                   </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
