/**
 * Directory page, displays all of the fighters within the coach's affiliate with filter, sort, and search abilities
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 5/16/19
 * DirectoryView.js
 */

"use strict";

import View from './View.js';
import Toastify from "toastify-js";
import SelectComponent from "./components/SelectComponent"
import InputComponent from "./components/InputComponent";
import PALongView from "./physicalAssessment/PALongView";
import {objToStrMap} from "../helpers/MapUtilites";
import SummaryView from "./SummaryView";

/**
 * View class for Directory, handles template, hooks to data and rendering.
 */
export default class DirectoryView extends View
{
    /**
     * DirectoryView constructor builds the View
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks)
    {
        super(dataHive, callbacks);
        this.callbacks.changeEditStatus(false);
        this.callbacks.retrieveFighters();
        this.directory = dataHive.directory;
        this._setupSubscriptions();
        this._filterOptions = ["None", "Boxer Anniversaries", "Gender - Male", "Gender - Female", "Inactive Boxers",
                               "Overdue Assessments", "Upcoming Birthdays", "Upcoming Assessments"];
        this._perPageOptions = ["8", "20", "40", "80", "120"];
        this._numOfColumns = 4;
    }

    /**
     * Event thrown when View has finished rendering
     */
    postRenderSetup()
    {
        this.el.querySelector('#viewLocation').onchange = (e) => {
            const location = e.target.options[e.target.selectedIndex].text;
            this.dataHive.location = location;
            Toastify({
                text: `Switching to Location - ${location}`,
                duration: 1700,
                newWindow: true,
                close: true,
                gravity: "bottom", // `top` or `bottom`
                positionLeft: false, // `true` or `false`
                backgroundColor: "linear-gradient(to bottom, #0174DF, #0080FF);",
                stopOnFocus: true // Prevents dismissing of toast on hover
            }).showToast();
            this._updateAffiliateAndDirectory(this.dataHive.affiliate);
        };

        this.el.querySelector('#viewAffiliate').onchange = (e) => {
            const affiliate = e.target.options[e.target.selectedIndex].text;
            this.dataHive.affiliate = affiliate;
            Toastify({
                text: `Switching to Member - ${affiliate}`,
                duration: 1700,
                newWindow: true,
                close: true,
                gravity: "bottom", // `top` or `bottom`
                positionLeft: false, // `true` or `false`
                backgroundColor: "linear-gradient(to bottom, #0174DF, #0080FF);",
                stopOnFocus: true // Prevents dismissing of toast on hover
            }).showToast();
            this._updateAffiliateAndDirectory(affiliate);
        };

        this.el.querySelector('#perPageDropdown').onchange = (e) => {
            this.dataHive.directory.numOfBoxersPerPage = Number(e.target.options[e.target.selectedIndex].text);
            this._createFighterTable();
            this._createPagination();
        };

        this.el.querySelector('#filterBy').onchange = (e) => {
            this.dataHive.directory.filterBy = e.target.options[e.target.selectedIndex].text;
            this._updateFighters();
        };

        this.el.querySelector('#search').onkeyup = () => {
            this._updateFighters();
        }
    }

    /**
     * Sets up subscriptions to class events.
     * Creates table after APIController fires event when fighters are retrieved from database
     * @private method to set up subscriptions
     */
    _setupSubscriptions()
    {
        this.subscribeTo(
            "APIController",
            "directoryInfo",
            "directoryInfo", (data) =>
            {
                this.dataTable = this.el.querySelector("#boxerDirectory");
                this.pagination = this.el.querySelector('ul.pagination');
                this.paginationText = this.el.querySelector("#displayText");
                // this._applyDirectoryTableObserver(this.dataTable);

                let fighters = data.fighters;
                for(let fighter of fighters) {
                    if(fighter.reassessmentDate) fighter.reassessmentDate = new Date(fighter.reassessmentDate).toInputString();
                    if(fighter.birthDate) fighter.birthDate = new Date(fighter.birthDate).toInputString();
                    fighter.vitals = !fighter.vitals ? new Map() : objToStrMap(fighter.vitals);
                    fighter.physicalAssessments = !fighter.physicalAssessments ? new Map() : objToStrMap(fighter.physicalAssessments);
                    fighter.pdq = !fighter.pdq ? new Map() : objToStrMap(fighter.pdq);
                }
                this.directory.originalFightersArray = fighters;
                this._updateFighters();
            });
    }

    /**
     * If coach chooses different affiliate, it will update in the coach model and changes the directory to the affiliate selected
     * @param {String} affiliate - affiliate name
     * @private
     */
    _updateAffiliateAndDirectory(affiliate) {
        // Gets and updates location value
        const locationInput = this.el.querySelector('#viewLocation');
        const affiliateLocationNames = this.dataHive.affiliateLocationsObject[affiliate];
        const location = affiliateLocationNames.includes(locationInput.value) ? locationInput.value : affiliateLocationNames[0];
        this.dataHive.location = location;

        // Updates affiliate location in coach model.
        this.dataHive.dataStore.coachModel.affiliateLocation = this.dataHive.dataStore.coachModel.affiliateLocations.find((affiliateLocation) => {
            return (affiliateLocation.affiliate_id === this.dataHive.affiliate && affiliateLocation.locationName === this.dataHive.location);
        });

        // Updates select location options
        locationInput.innerHTML = affiliateLocationNames.map((affiliateLocation) => {
            return `<option value="${affiliateLocation}" ${affiliateLocation === location ? "selected" : ""}>${affiliateLocation}</option>`;
        }).join('');
        locationInput.value = location;

        // Updates fighter directory table
        this.callbacks.retrieveFighters();
    }

    /**
     * Updates the fighter's table and pagination nav bar
     * @private
     */
    _updateFighters() {
        this._filterFightersArray();
        this._createFighterTable();
        this._createPagination();
    }

    /**
     * Filters fighter using the selected options (filter by, exclude inactive boxers, search bar, and location)
     * @private
     */
    _filterFightersArray() {
        let fightersArray = this.directory.getOriginalFightersArray();
        const filterDropdownOption = this.el.querySelector('#filterBy').value;
        let search = this.el.querySelector('#search').value;
        if(search.length > 0) search = search.trim().toLowerCase();

        //if functions returns true, fighter is included (not filtered out)
        const filterFunctions = {
            "None": (fighter) => {
                return fighter.activeFlag;
            },
            "Gender - Male": (fighter) => {
                return (fighter.gender === "Male" || fighter.gender === "M") && fighter.activeFlag;
            },
            "Gender - Female": (fighter) => {
                return (fighter.gender === "Female" || fighter.gender === "F") && fighter.activeFlag;
            },
            "Upcoming Birthdays": (fighter) => {
                const birthDay = new Date(fighter.birthDate);
                const today = new Date(Date.now());
                birthDay.setFullYear(today.getFullYear());
                const sevenDaysBefore = new Date(today);
                const sevenDaysAfter = new Date(today);
                sevenDaysAfter.setDate(today.getDate() + 7);
                sevenDaysBefore.setDate(today.getDate() - 7);
                return sevenDaysBefore.valueOf() <= birthDay.valueOf() && birthDay.valueOf() <= sevenDaysAfter.valueOf() && fighter.activeFlag;
            },
            "Upcoming Assessments": (fighter) => {
                const reassessment = new Date(fighter.reassessmentDate);
                const today = new Date(Date.now());
                const fortyFiveDays = new Date(today).setDate(today.getDate() + 45);
                return reassessment.valueOf() >= today.valueOf() && reassessment.valueOf() <= fortyFiveDays.valueOf() && fighter.activeFlag;
            },
            "Overdue Assessments": (fighter) => {
                const reassessment = new Date(fighter.reassessmentDate);
                const today = new Date(Date.now());
                const sixMonths = new Date(today).setMonth(today.getMonth() - 6);
                return reassessment.valueOf() <= sixMonths.valueOf() && fighter.activeFlag;
            },
            "Inactive Boxers": (fighter) => {
                return !fighter.activeFlag;
            },
            "Boxer Anniversaries": (fighter) => {
                let firstAssessment = new Date(SummaryView.getSortedAssessmentDates(true, fighter.pdq, fighter.physicalAssessments, fighter.vitals)[0]);
                if(!firstAssessment.isValid()) return false;
                const today = new Date(Date.now());
                const sevenDaysBefore = new Date(today);
                const sevenDaysAfter = new Date(today);
                sevenDaysAfter.setDate(today.getDate() + 7);
                sevenDaysBefore.setDate(today.getDate() - 7);
                if(sevenDaysBefore.valueOf() <= firstAssessment.valueOf() && firstAssessment.valueOf() <= sevenDaysAfter.valueOf()) return false;
                firstAssessment.setFullYear(today.getFullYear());
                return sevenDaysBefore.valueOf() <= firstAssessment.valueOf() && firstAssessment.valueOf() <= sevenDaysAfter.valueOf() && fighter.activeFlag;
            }
        };

        fightersArray = fightersArray.filter((fighter) => {
            let bool = true;

            if(fighter.affiliateName !== this.dataHive.affiliate || fighter.location !== this.dataHive.location) bool = false;

            if(!filterFunctions[filterDropdownOption](fighter)) bool = false;

            if(search.length > 0) {
                let found = false;
                if(fighter.name.toLowerCase().includes(search) || fighter.affiliateName.toLowerCase().includes(search) ||
                    fighter.location.toLowerCase().includes(search) || fighter.city.toLowerCase().includes(search)) found = true;
                if(!found) bool = false;
            }
            return bool;
        });

        this.directory.resetPage();
        this.directory.filteredFightersArray = fightersArray;
    }

    /**
     * Generates fighter table
     * @private
     */
    _createFighterTable() {
        while (this.dataTable.childNodes.length) {
            this.dataTable.removeChild(this.dataTable.childNodes[0]);
        }

        const fighters = this.directory.createSplicedFightersArray();
        if(fighters.length > 0) {
            this._addFighterCellsToDatatable(fighters);
        } else {
            const tbody = document.createElement("tbody");
            tbody.innerHTML = '<tr><td align="center">No boxers to be found</td></tr>';
            this.dataTable.appendChild(tbody);
        }

        this._applyEventOnFighterCells();
    }

    /**
     * Loops through fighters array and adds to table in matrix form
     * @param {Array} fightersArray - array that holds fighter data object
     * @private
     */
    _addFighterCellsToDatatable(fightersArray) {
        let fighterIndex = 0;
        for(let i = 0; i < Math.ceil(fightersArray.length / this._numOfColumns); i++) {
            const row = document.createElement("tr");
            for(let j = 0; j < this._numOfColumns; j++) {
                const cell = document.createElement("td");
                cell.setAttribute("align", "center");
                cell.style.width = "25%";
                if(fightersArray[fighterIndex]) {
                    cell.innerHTML = `<span style="display:none;" data-id="${fightersArray[fighterIndex].id}"></span>
                        <img src="${fightersArray[fighterIndex].image ? fightersArray[fighterIndex].image : "./img/Boxer.jpg"}" alt="fighterThumbnail" 
                        aria-describedby="pictureInfo" height="100" width="100"><br>${fightersArray[fighterIndex].name}`;
                    const text = document.createElement("p");
                    text.innerHTML = this._getFighterAdditionalText(fightersArray[fighterIndex++]);
                    cell.appendChild(text);
                }
                row.appendChild(cell);
            }
            this.dataTable.appendChild(row);
        }
    }

    /**
     * According to the filter option, this returns the additional text that will be displayed before the fighter's name
     * @param {Object} fighter - fighter data
     * @return {String} text that will be displayed in the fighter's cell, below their name
     * @private
     */
    _getFighterAdditionalText(fighter) {
        const filterBy = this.dataHive.directory.filterBy;
        if(filterBy === "Upcoming Birthdays") return `<i class="fas fa-birthday-cake mr-2"></i>${PALongView.displayMonthDayFromDate(fighter.birthDate)}`;
        else if(filterBy === "Upcoming Assessments" || filterBy === "Overdue Assessments") return `<i class="fas fa-hourglass-half mr-2"></i> ${PALongView.displayDateFromDate(fighter.reassessmentDate)}`;
        else return "";
    }

    /**
     * Applies click event listener on each fighter cells to call retrieveFighter event
     * @private
     */
    _applyEventOnFighterCells() {
        const fighterCells = this.el.querySelectorAll('#boxerDirectory td');
        fighterCells.forEach((fighterCell) => {
            fighterCell.addEventListener('click', () => {
                const fighterID = fighterCell.querySelector('span').dataset.id;
                this.callbacks.clearData();
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
                this.callbacks.retrieveFighter(fighterID);
            });
        });
    }

    /**
     * Event fires when directory table has addedNodes mutations
     * @param directoryNode
     * @private
     */
    _applyDirectoryTableObserver(directoryNode) {
        const observer = new MutationObserver((mutationsList) => {
            const foundAddedNodes = mutationsList.find((mutations) => {
                return mutations.addedNodes.length > 0;
            });
            if(foundAddedNodes) Toastify({
                                    text: "Boxer Directory Loaded",
                                    duration: 2500,
                                    newWindow: true,
                                    close: true,
                                    gravity: "bottom", // `top` or `bottom`
                                    positionLeft: false, // `true` or `false`
                                    backgroundColor: "linear-gradient(to bottom, #0174DF, #0080FF);",
                                    stopOnFocus: true // Prevents dismissing of toast on hover
                                }).showToast();
        });

        observer.observe(directoryNode, {childList: true, subtree: true});
    }

    /**
     * Creates pagination nav list items according to the number of boxers per page and total number of fighters
     * @private
     */
    _createPagination() {
        this.paginationText.innerText = "";
        while (this.pagination.childNodes.length) {
            this.pagination.removeChild(this.pagination.childNodes[0]);
        }

        const totalFighters = this.directory.getTotalNumFilteredFighters();
        if(totalFighters > 0) {
            this.paginationText.innerText =
                `Displaying ${this.dataHive.directory.firstFighterPositionOnPage} to ${this.dataHive.directory.lastFighterPositionOnPage} of ${totalFighters} ${totalFighters === 1 ? "boxer" : "boxers"}`;
            const largestPagination = this.directory.calculateLargestPagination();
            let paginationHTML = {
                prev: "",
                firstNum: "",
                firstEllipsis: "",
                betweenNums: "",
                lastEllipsis: "",
                lastNum: "",
                next: ""
            };

            if(largestPagination > 1) {
                paginationHTML.prev = '<li class="page-item"><a class="page-link" data-pagination="prev">Prev</a></li>';
                paginationHTML.next = '<li class="page-item"><a class="page-link" data-pagination="next">Next</a></li>';
                paginationHTML.firstNum = '<li class="page-item"><a class="page-link" data-pagination="1">1</a></li>';
                paginationHTML.lastNum = `<li class="page-item"><a class="page-link" data-pagination="${largestPagination}">${largestPagination}</a></li>`;

                if(largestPagination > 7) {
                    const paginationArray = this.directory.getPaginationArray();
                    for(let number of paginationArray) {
                        if(number === -1) paginationHTML.firstEllipsis = `<li class="page-item disabled"><a class="page-link">...</a></li>`;
                        else if (number === 0) paginationHTML.lastEllipsis = `<li class="page-item disabled"><a class="page-link">...</a></li>`;
                        else paginationHTML.betweenNums += `<li class="page-item"><a class="page-link" data-pagination="${number}">${number}</a></li>`;
                    }
                } else {
                    for(let i = 2; i < largestPagination; i++) {
                        paginationHTML.betweenNums += `<li class="page-item"><a class="page-link" data-pagination="${i}">${i}</a></li>`;
                    }
                }
            }
            this.pagination.innerHTML = Object.values(paginationHTML).join("");
            this._applyActiveStateOnPagination();
            this._applyEventOnPagination();
        }
    }

    /**
     * Makes the pagination nav with current index active
     * @private
     */
    _applyActiveStateOnPagination() {
        if(this.el.querySelector('li.page-item.active')) this.el.querySelector('li.page-item.active').classList.remove("active");
        const selectedPaginationNum = this.el.querySelector('a.page-link[data-pagination="' + this.dataHive.directory.currentDirectoryPage + '"]');
        if(selectedPaginationNum) selectedPaginationNum.closest('li.page-item').classList.add("active");
    }

    /**
     * Applies click event on pagination nav buttons to update currentDirectoryPage and datatable
     * @private
     */
    _applyEventOnPagination() {
        const paginationButtons = this.el.querySelectorAll('a.page-link[data-pagination]');
        paginationButtons.forEach((button) => {
            button.onclick = (event) => {
                const paginationText = event.target.dataset.pagination;
                if(paginationText === "prev") this.directory.prevPage();
                else if(paginationText === "next") this.directory.nextPage();
                else this.directory.setPage(Number(paginationText));

                this._createFighterTable();
                this._createPagination();
            }
        });
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
                    <div class="card-title pb-3" style="font-weight: bold;">
                        <span>Boxer Directory</span>
                        <span class="float-right"><h4>
                            ${ new SelectComponent(Object.keys(this.dataHive.affiliateLocationsObject))
                            .setId('viewAffiliate')
                            .setClasses('form-control')
                            .setName('viewAffiliate')
                            .setValue(this.dataHive.affiliate)
                            .setLabel("")
                            ._html()}</h4>
                        </span>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-6"><h4>
                         ${ new SelectComponent(this.dataHive.affiliateLocationsObject[this.dataHive.affiliate])
                            .setId('viewLocation')
                            .setClasses('form-control')
                            .setName('viewLocation')
                            .setValue(this.dataHive.location)
                            .setLabel(`Viewing results at location`)
                            ._html()}</h4></div>
                         <div class="col-6">
                            <h4>
                                ${new SelectComponent(this._filterOptions)
                                    .setId('filterBy')
                                    .setClasses('form-control')
                                    .setName('filterBy')
                                    .setValue(this.dataHive.directory.filterBy)
                                    .setLabel('Filtering Results by')
                                    ._html()}
                            </h4>
                         </div>
                    </div> 
                    <div class="row mb-2">
                        <div class="col-4 col-md-3 col-xl-2">
                            <h4>
                            ${new SelectComponent(this._perPageOptions)
                                .setId('perPageDropdown')
                                .setClasses('form-control')
                                .setName('perPageDropdown')
                                .setValue(this.dataHive.directory.numOfBoxersPerPage)
                                .setLabel('Boxers Per Page')
                                ._html()}
                            </h4>
                        </div>
                        <div class="col-6 col-lg-5 col-xl-4">
                            <h4>
                            ${new InputComponent()
                                .setId('search')
                                .setClasses('form-control')
                                .setName('search')
                                .setValue("")
                                .setLabel('Search')
                                .setPlaceholder("Search by name...")
                                ._html()}
                            </h4>
                        </div>
                    </div>               
                    <div class="row mb-3">
                        <div class="col-12">
                            <table id="boxerDirectory" class="table table-striped table-bordered" style="width:100%">
                            </table>
                        </div>
                        <div class="col-12">
                            <span class="float-right mr-2 mt-1" id="displayText" style="font-size:14px;"></span>
                            <nav aria-label="Page navigation">
                                <ul class="pagination"></ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }
};
