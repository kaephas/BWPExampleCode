/**
 * @author Tyler Bezera
 * @author Cynthia Pham
 */

"use strict";

import Model from "./Model";

/**
 * Model class for Directory, featuring previously used fields
 */
export default class DirectoryModel extends Model
{
    /**
     * Constructs a new DirectoryModel
     */
    constructor()
    {
        super();
        this._filterBy = "None";
        this._originalFightersArray = [];
        this._filteredFightersArray = [];
        this._numOfBoxersPerPage = 20;
        this._currentDirectoryPage = 1;
        this.BETWEEN_NUMS_LIMIT = 1;
        this.END_NUMS_LIMIT = 5;
        this.resetDirectory();
    }

    /**
     * Resets all the settings of directory
     */
    resetDirectory()
    {
        this._originalFightersArray = [];
        this._filteredFightersArray = [];
        this._numOfBoxersPerPage = 20;
        this._filterBy = "None";
        this._currentDirectoryPage = 1;
    }

    /**
     * Resets the current page to the beginning (1)
     */
    resetPage()
    {
        this._currentDirectoryPage = 1;
    }

    /**
     * Pushes current page back one page.
     */
    prevPage()
    {
        if(this._currentDirectoryPage > 1) this._currentDirectoryPage--;
        else this._currentDirectoryPage = 1;
    }

    /**
     * Increment the current page to the next one.
     */
    nextPage() {
        this._currentDirectoryPage++;
        this._ensureCurrentDirectoryPage();
    }

    /**
     * Returns the current page on the directory table
     * @return {number} current page on directory
     */
    get currentDirectoryPage() {
        return this._currentDirectoryPage;
    }

    /**
     * Sets the directory page. Ensures that the page is within the pagination numbers.
     * @param number
     */
    setPage(number) {
        if(number > 0) this._currentDirectoryPage = number;
        this._ensureCurrentDirectoryPage();
    }

    /**
     * Calculates startFighterIndex by using current directory page and selected number of boxers per page. Calculates
     * endFighterIndex by using startFighterIndex and selected number of boxers per page.
     * Generates and returns a copy of fighters array that starts and ends with specified indexes.
     * @return {Array} returns a copy of fighters array that starts and ends with specified indexes.
     * @private
     */
    createSplicedFightersArray() {
        const startFighterIndex = (this.currentDirectoryPage - 1) * this.numOfBoxersPerPage;
        const endFighterIndex = startFighterIndex + (this.numOfBoxersPerPage - 1);
        return this.filteredFightersArray.slice(startFighterIndex, endFighterIndex + 1); //add one to include last fighter
    }

    /**
     * Returns the start fighter position that's currently displayed on the directory table
     * @return {number} - first fighter's position
     */
    get firstFighterPositionOnPage() {
        if(this.currentDirectoryPage === 1) return 1;
        else return ((this.currentDirectoryPage - 1) * this.numOfBoxersPerPage) + 1;
    }

    /**
     * Returns the last fighter position that's currently displayed on the directory table
     * @return {number} - last fighter's position
     */
    get lastFighterPositionOnPage() {
        const lastFighter = this.currentDirectoryPage * this.numOfBoxersPerPage;
        if(lastFighter > this.getTotalNumFilteredFighters()) return this.getTotalNumFilteredFighters();
        else return lastFighter;
    }

    /**
     * Returns the total number of fighters after filtration.
     * @return {number} - total number of fighters in array
     */
    getTotalNumFilteredFighters() {
        return this.filteredFightersArray.length;
    }

    /**
     * Calculates the largest pagination according to number of total fighters and selected number of boxers per page.
     * @return {number} - largest pagination number on nav bar
     */
    calculateLargestPagination() {
        const totalFighters = this.getTotalNumFilteredFighters();
        return Math.ceil(totalFighters / this.numOfBoxersPerPage);
    }

    /**
     * Returns six pagination numbers according to the current directory page and the largest pagination number.
     * -1 is considered first ellipsis. 0 is considered last ellipsis.
     */
    getPaginationArray() {
        const largestPagination = this.calculateLargestPagination();
        const paginationArray = [];
        this._ensureCurrentDirectoryPage();

        if(this.currentDirectoryPage <= 4) {
            paginationArray.push(2,3,4,5,0);
        } else if(this.currentDirectoryPage >= largestPagination - 3) {
            paginationArray.push(-1);
            for(let i = largestPagination - this.END_NUMS_LIMIT; i < largestPagination; i++) {
                paginationArray.push(i);
            }
        } else {
            paginationArray.push(-1);
            for(let i = this.currentDirectoryPage - this.BETWEEN_NUMS_LIMIT; i <= this.currentDirectoryPage + this.BETWEEN_NUMS_LIMIT; i++) {
                paginationArray.push(i);
            }
            paginationArray.push(0);
        }
        return paginationArray;
    }

    /**
     * Ensures that the current directory page isn't greater than the largest possible pagination nav number. If greater,
     * it sets the page to the pagination number.
     * @private
     */
    _ensureCurrentDirectoryPage() {
        const largestPagination = this.calculateLargestPagination();
        if(this.currentDirectoryPage > largestPagination) this._currentDirectoryPage = largestPagination;
    }

    /**
     * Getter for original fighters array
     * @return {Array} - fighter's array
     */
    getOriginalFightersArray() {
       return Array.from(this._originalFightersArray, obj => Object.assign({}, obj));
    }

    /**
     * Setter for original fighters array
     * @param {Array} originalFightersArray - fighter's array
     */
    set originalFightersArray(originalFightersArray) {
        this._originalFightersArray = originalFightersArray;
    }

    /**
     * Getter for filtered fighters array from selected filters from directory view page
     * @return {Array} - fighter's array
     */
    get filteredFightersArray() {
        return Array.from(this._filteredFightersArray);
    }

    /**
     * Setter for filtered fighter's array
     * @param {Array} filteredFightersArray - fighter's array
     */
    set filteredFightersArray(filteredFightersArray) {
        this._filteredFightersArray = filteredFightersArray;
    }

    /**
     * Returns the selected number of boxers displayed on directory table
     * @return {number} selected number of boxers per page on directory
     */
    get numOfBoxersPerPage() {
        return this._numOfBoxersPerPage;
    }

    /**
     * Sets the number of boxers displayed on directory table. Ensures that the current directory page is
     * within the pagination number range.
     * @param num
     */
    set numOfBoxersPerPage(num) {
        this._numOfBoxersPerPage = num;
        this._ensureCurrentDirectoryPage();
    }

    /**
     * Returns the selected filter by option
     * @return {String} filter option 'None', 'Gender - Male', 'Gender - Female', "Upcoming Birthdays", "Upcoming Assessments", "Overdue Assessments"
     */
    get filterBy() {
        return this._filterBy;
    }

    /**
     * Sets the filter by option that is used to filter fighters in directory table
     * @param {String} text - filter option 'None', 'Gender - Male', 'Gender - Female', "Upcoming Birthdays", "Upcoming Assessments", "Overdue Assessments"
     */
    set filterBy(text) {
        this._filterBy = text;
    }





}