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
export default class kaephas extends View {
    constructor(datahive, callbacks ) {
        super(datahive, callbacks);
        this.directory = datahive.directory;
        this.fighters = this.directory.getOriginalFightersArray();
        console.log("Constructor: ");
        console.log(this.fighters);

        this.active = [];
        this.inactive = [];
        for(let i = 0; i < this.fighters.length; i++) {
            let fighter = this.fighters[i];
            if(fighter.activeFlag) {
                this.active.push(fighter.name);
            } else {
                this.inactive.push(fighter.name);
            }
        }
    }

    _html() {
        let activePeople = "";
        let inactivePeople = "";

        for (let i = 0; i < this.active.length; i++) {
            activePeople += this.active[i] + ", ";
        }
        for (let i = 0; i < this.inactive.length; i++) {
            inactivePeople += this.inactive[i] + ", ";
        }

        let allFighters = this.getAges();
        let activeTotals = [];
        let inactiveTotals = [];
        console.log("Age info?");
        for (let i = 0; i < allFighters.length; i++) {
            activeTotals[i] = 0;
            inactiveTotals[i] = 0;
            console.log(allFighters[i]);
            let ageGroup = allFighters[i];
            for (let j = 0; j < allFighters[i].length; j++) {
                if(ageGroup[j].active) {
                    console.log("i j");
                    console.log(ageGroup[j]);
                    activeTotals[i]++;
                } else {
                    inactiveTotals[i]++;
                }
            }
        }
        console.log("Active totals");
        console.log(activeTotals);
        console.log("Inactive totals");
        console.log(inactiveTotals);


        return `
            <div class="container">
                <h1>Boxers: ${this.fighters.length}</h1>
                <h2>Active: ${this.active.length}</h2>
                <h2>Inactive ${this.inactive.length}</h2>
                <div class="row">
                    <div class="col-3">
                        <ul class="list-group">
                            <li class="list-group-item font-weight-bold">Age Groups</li>
                            <li class="list-group-item">< 50</li>
                            <li class="list-group-item">50-59</li>
                            <li class="list-group-item">60-69</li>
                            <li class="list-group-item">70-79</li>
                            <li class="list-group-item">80-89</li>
                            <li class="list-group-item">> 90</li>
                        </ul>
                    </div>
                    <div class="col-3">
                        <ul>
                            <li class="list-group-item font-weight-bold">Active</li>
                            <li class="list-group-item">${activeTotals[0]}</li>
                            <li class="list-group-item">${activeTotals[1]}</li>
                            <li class="list-group-item">${activeTotals[2]}</li>
                            <li class="list-group-item">${activeTotals[3]}</li>
                            <li class="list-group-item">${activeTotals[4]}</li>
                            <li class="list-group-item">${activeTotals[5]}</li>
                        </ul>
                    </div>
                    <div class="col-3">
                        <ul>
                            <li class="list-group-item font-weight-bold">Inactive</li>
                            <li class="list-group-item font-weight-bold">${inactiveTotals[0]}</li>
                            <li class="list-group-item">${inactiveTotals[1]}</li>
                            <li class="list-group-item">${inactiveTotals[2]}</li>
                            <li class="list-group-item">${inactiveTotals[3]}</li>
                            <li class="list-group-item">${inactiveTotals[4]}</li>
                            <li class="list-group-item">${inactiveTotals[5]}</li>
                        </ul>
                    </div>
                    <div class="col-3">
                        <ul>
                            <li class="list-group-item font-weight-bold">All</li>
                            <li class="list-group-item">${activeTotals[0] + inactiveTotals[0]}</li>
                            <li class="list-group-item">${activeTotals[1] + inactiveTotals[1]}</li>
                            <li class="list-group-item">${activeTotals[2] + inactiveTotals[2]}</li>
                            <li class="list-group-item">${activeTotals[3] + inactiveTotals[3]}</li>
                            <li class="list-group-item">${activeTotals[4] + inactiveTotals[4]}</li>
                            <li class="list-group-item">${activeTotals[5] + inactiveTotals[5]}</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    getAges() {
        let lessFifty = [];
        let fiftyNine = [];
        let sixtyNine = [];
        let seventyNine = [];
        let eightyNine = [];
        let ninetyPlus = [];

        for (let i = 0; i < this.fighters.length; i++) {
            let fighter = this.fighters[i];
            if(fighter.age < 50) {
                lessFifty.push({"name": fighter.name, "age": fighter.age, "active": fighter.activeFlag});
            } else if(fighter.age < 60) {
                fiftyNine.push({"name": fighter.name, "age": fighter.age, "active": fighter.activeFlag});
            } else if(fighter.age < 70) {
                sixtyNine.push({"name": fighter.name, "age": fighter.age, "active": fighter.activeFlag});
            } else if(fighter.age < 80) {
                seventyNine.push({"name": fighter.name, "age": fighter.age, "active": fighter.activeFlag});
            } else if(fighter.age < 90) {
                eightyNine.push({"name": fighter.name, "age": fighter.age, "active": fighter.activeFlag});
            } else {
                ninetyPlus.push({"name": fighter.name, "age": fighter.age, "active": fighter.activeFlag});
            }
        }

        let allFighters = [];
        allFighters.push(lessFifty, fiftyNine, sixtyNine, seventyNine, eightyNine, ninetyPlus);
        return allFighters;

    }
}