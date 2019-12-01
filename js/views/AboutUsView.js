/**
 * About Us page that will be available to see from the directory short nav list
 * @author Cynthia Pham
 * 8/23/2019
 * AboutUsView.js
 */

import View from "./View";

/**
 * View class for the About Us page.
 */
export default class AboutUsView extends View {

    /**
     * AboutUsView constructor builds the View. Generates the page for the about us
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks) {
        super(dataHive, callbacks);
    }

    /**
     * Method that compiles template
     *
     * @returns {string} template for the about us page
     * @private method used for rendering
     */
    _html() {
        return `
        <div class="card card-shadow ml-3 mr-3" style="border: solid 2px #dedede">
                <div class="card-title pt-5 pl-5 pr-5" style="font-weight: bold;">
                    <span class="h2">About Us</span>
                </div>
                <div class="card-body pl-5 pr-5 pb-5">
                    <p>Boxers with Parkinson&rsquo;s is a non-profit association whose members are the owners of 
                    boxing-themed programs as exercise therapy for people with Parkinson&rsquo;s.  The focus of the 
                    association is to serve the members and their individual boxers while collecting data to enable 
                    the largest study on the impact of exercise on Parkinson&rsquo;s symptoms ever conducted.</p>
                    <br>
                    <p>One service of Boxers with Parkinson&rsquo;s is the BwP Project, a research study on exercise and 
                    Parkinson&rsquo;s.  Elements include the standardization of intake and reassessment procedures, the 
                    collection of data in a centralized cloud-based service, an app to administer the program and, 
                    a research portal to analyze the data.</p>
                    <br>
                    <p>Partners in the development of the service include Microsoft, prototyping and inclusion 
                    in their Hackathon, 2017; Green River College, Software Development Student Project 2017, 2018, 
                    2019; and, consulting neurologist and movement specialist, Dr. Jennifer Davis, UW Medicine, 
                    Valley Medical Center.  A huge thanks to the fighters at Rock Steady Boxing South King County 
                    for their participation in the Beta testing stage of the roll out.</p>
                    <br>
                    <p>Boxers with Parkinson&rsquo;s Board of Directors are all Boxers with Parkinson&rsquo;s.  The association 
                    executive director is Lorie Rubenser, bwpexec@gmail.com.</p>
                    <br>
                    <p>A development grant was provided by Rotary Club of Kent, WA.  Additional funding was provided 
                    by Rock Steady Boxers through a Rock Steady Sweaty Bucks grant and from Friends of Rock Steady 
                    through a GoFundMe campaign and direct donations.</p>
                    <br>
                    <p>To learn more or to make a donation, please visit www.BwPProject.com.</p>
                    <hr style="border-bottom:4px double #333;">
                    <br>
                    <p>Thanks, Mike.</p>
                </div>
            </div>`;
    }
}
