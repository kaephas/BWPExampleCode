/**
 * Waivers page, displays the following: media release waiver - allows RSB to publish or broadcast fighter's
 * image/likeness and/or name for promotional purposes associated with Rock Steady Boxing, research release waiver
 * - allows RSB to use fighter's data for research and analytical purposes, and privacy policy - regards the collection,
 * use, and disclosure of personal data
 * @author Cynthia Pham
 * @author Tyler Bezera
 * 2/25/19
 * Waivers.js
 */

'use strict';

import View from './View.js';
import CheckBoxComponent from './components/CheckBoxComponent';
import ToggleSwitchComponent from "./components/ToggleSwitchComponent";
import ModalComponent from "./components/ModalComponent";
import PALongView from "./physicalAssessment/PALongView";
import Toastify from "toastify-js";

/**
 * View class for the Waivers, handles template and rendering for waivers page.
 */
export default class WaiversView extends View
{
    /**
     * WaiversView constructor builds the View
     * @constructor
     * @param {object} dataHive - DataStore object connected to this View
     * @param {function} callbacks - Function pointers to the callbacks on this View
     */
    constructor(dataHive, callbacks)
    {
        super(dataHive, callbacks);
        this.waivers = dataHive.waivers;
        this.personalInfo = dataHive.personalInfo;
        this.newFighterEnrollment = dataHive.newFighterEnrollment;

        if(this.newFighterEnrollment) {
            this._buttonHTML = `<button id="saveWaivers" class="btn-rsb float-right">Complete &nbsp;<i
                            class="fas fa-arrow-right"></i></button>`;
        }
        else {
            this._buttonHTML = `<button id="saveWaivers" class="btn-rsb float-left"><i
                            class="fas fa-arrow-left"></i>&nbsp;Boxer Profile</button>`;
            this._toggleSwitch = new ToggleSwitchComponent().setId('editModeSwitch').setValue(this.dataHive.fighterModel.getEditStatus())._html();
        }
    }

    /**
     * Calls event handler and callback functions after page has rendered.  Assists with saving fighter's opt in/out
     * to privacy policy
     */
    postRenderSetup()
    {
        const privacyPolicyCheckbox = this.el.querySelector('input#signedPrivacyPolicy');
        if(!this.newFighterEnrollment && privacyPolicyCheckbox.checked) privacyPolicyCheckbox.disabled = true;

        privacyPolicyCheckbox.onchange = () => {
            if(privacyPolicyCheckbox.checked) {
                this.waivers.signedPrivacyPolicy = "true";
                this.waivers.signedDate = new Date();
                this.callbacks.updateFighter({"waivers.signedPrivacyPolicy": "true"});
                this.callbacks.updateFighter({"waivers.signedDate": this.waivers.signedDate});
            }
        };

        this.el.querySelector('button#saveWaivers').onclick = () => {
            if(!privacyPolicyCheckbox.checked) {
                const errorModal = new ModalComponent({
                    footer: true,
                    stickFooter: false,
                    closeMethods: ['button']
                }).setContent(`<div>
                <h3>You'll need to agree to the Private Policy to continue.</h3>
                </div>`).setFooterButtons([{
                    label: "OK",
                    cssClass: 'tingle-btn tingle-btn--primary',
                    callback: () => {
                        errorModal.closeModal();
                    }
                }]).openModal();
            } else {
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
                this.callbacks.endEnrollment();
                this.callbacks.nextPage("summary");
            }
        }
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
                ${this._toggleSwitch ? this._toggleSwitch : ""}
                <div class="card-title">
                    <span style="font-weight:bold;">Waivers</span> - Please read the following waivers carefully.
                </div>
                <hr>
                <form id="waivers" class="modern-form editableForm" data-model="waiversModel">
                    <div class="card-title" style="font-weight:bold;">Media Release</div>
                    <div class="card-text mb-3">
                        I, <span>${this.personalInfo.firstName} ${this.personalInfo.lastName}</span>, grant Boxers with 
                        Parkinson’s (BwP) permission to publish or broadcast my image/likeness and/or name for general 
                        purposes such as on websites, on Facebook, in brochures or on flyers associated with Boxers 
                        with Parkinson’s or the Boxers with Parkinson’s Project.  My image, likeness or name will not 
                        be used for paid advertising or direct marketing purposes without my express permission. 
                        <div class="ml-2 mt-2 mb-3">
                            ${new CheckBoxComponent()
            .setId('signedMediaRelease')
            .setName('signedMediaRelease')
            .setLabel(`<span style="font-weight:bold;">I have read and accept to the media release agreement</span>`)
            .setValue(this.waivers.signedMediaRelease)
            ._html()}
                        </div>
                        <div class="ml-2 mt-2 mb-3">
                            ${new CheckBoxComponent()
            .setId('optOutMediaRelease')
            .setName('optOutMediaRelease')
            .setLabel(`<span style="font-weight:bold;">I wish to opt out of the media release agreement</span>`)
            .setValue(this.waivers.optOutMediaRelease)
            ._html()}
                        </div>
                    </div>
                    <div class="card-title" style="font-weight:bold;">Research Release</div>
                    <div class="card-text mb-3">
                        I, ${this.personalInfo.firstName} ${this.personalInfo.lastName}, understand that my fighter 
                        information and data may be used by Boxers with Parkinson’s, the Boxers with Parkinson’s 
                        Project, and select authorized outside groups and organizations for Parkinson’s research and 
                        analytical purposes. I agree to allow my general, symptom, medicine, medical history, 
                        assessment and other non-identifying information to be used for research and analytical 
                        purposes.  When my information is part of an authorized search or report by an outside group 
                        or organization, my name will not be displayed and a unique control ID will be substituted. 
                        Outside groups or organizations will not be allowed to search by name and additional personal 
                        information such as address, phone, email and birthdate will not be displayed, reported, 
                        shared, sold, leased, given or exported s stipulated in the Boxers with Parkinson’s Privacy 
                        Policy. 
                        <div class="ml-2 mt-2 mb-3">
                            ${new CheckBoxComponent()
            .setId('signedResearchParticipationAgreement')
            .setName('signedResearchParticipationAgreement')
            .setLabel(`<span style="font-weight:bold;">I have read and accept to the research participation agreement</span>`)
            .setValue(this.waivers.signedResearchParticipationAgreement)
            ._html()}
                        </div>
                        <div class="ml-2 mt-2 mb-3">
                            ${new CheckBoxComponent()
            .setId('optOutResearchParticipationAgreement')
            .setName('optOutResearchParticipationAgreement')
            .setLabel(`<span style="font-weight:bold;">I wish to opt out of the research participation agreement</span>`)
            .setValue(this.waivers.optOutResearchParticipationAgreement)
            ._html()}
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="card card-shadow mt-2" style="border: solid 2px #dedede">
            <div class="card-body">
                <div class="card-title">
                    <span style="font-weight:bold;">Privacy Policy</span> - Please indicate that you have read and agree
                    to BwP Project's Privacy Policy.
                </div>
                <hr> 
                <div style="height:200px;width:100%;overflow:auto;background-color:#3e403d;color:white;
                scrollbar-base-color:#45464a;font-family:sans-serif;padding:20px;">
                    <p>Effective date: November 1, 2019</p>
                    <hr style="background:white;">
                    <p class="mt-2">Boxers with Parkinson’s, a Washington non-profit association and research project 
                    ("us", "we", or "our") operates the Boxers with Parkinson’s website and the Boxers with Parkinson’s 
                    Project mobile application (collectively, the "Services").  This page details our policies 
                    regarding the collection, use, and disclosure of personal data (including personal health information 
                    (“PHI”) and personal identification information (“PII”) as defined by the Health Insurance 
                    Portability and Accountability Act (“HIPAA”) when you use our Services and the choices you have 
                    made associated with that data.</p>
                    <p class="mt-2">We offer the Services as part of the Boxing with Parkinson’s Project (“BwP Project”), 
                    which is a national Parkinson’s patient registry and research project. If you have authorized us to 
                    share your PHI with the BwP Project, your PHI will be used exclusively by us and select, authorized 
                    third parties for that purpose only.</p>
                    <ul>
                        <li>•\tIf you choose not to have your PHI be included in the BwP Project, your PHI will only be 
                        used for the Services to better serve you in your individual boxing as exercise therapy for 
                        Parkinson’s at the local BwP Member level.</li>
                        <li>You must opt in to have your PHI be part of the BwP Project and can opt out at any time.</li>
                        <li>•\tIf you opt in to participate in the BwP Project, your PII will be hidden from all outside 
                        groups and organizations including researchers/analysts as governed by the system user permission 
                        controls.  For BwP Project research purposes, users are given a unique control ID and this is 
                        their only identifying information.</li>
                    </ul>
                    
                    <h3 class="mt-2">Information Collection And Use</h3>
                    <p class="mt-2">We collect several different types of information as described below (collectively 
                    “Personal Data”) for various purposes to provide and improve our Services. Your individual Data will 
                    never be used for paid advertising or marketing purposes and your Data is not available for sale or 
                    lease, nor will it be shared with any outside companies or organizations for commercial purposes 
                    without your express permission and consent.</p>
                    
                    <h5 class="mt-2">Personal Data</h5>
                    <p class="mt-2">While using our Services, we ask you to provide us with certain personally identifiable 
                    information that can be used to contact or identify you ("PII"), including your first and last name, 
                    email address, phone number, address, city, state, zip code, birthdate, emergency contact and more. 
                    In addition, we ask for information on your personal medical conditions (“PHI”), including Parkinson’s 
                    and other conditions and medications. Your PHI is required to better serve you in your individual 
                    boxing exercise therapy workouts as well as in the national research BwP Project if you choose to 
                    share your PHI with the BwP Project.</p>

                    <h5 class="mt-2">Usage Data</h5>
                    <p class="mt-2">We may also collect information that your browser sends whenever you visit our Service or 
                    when you access the Service by or through a mobile device ("Usage Data"). This Usage Data may include 
                    information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser 
                    version, the pages of our Service that you visit, the time and date of your visit, the time spent on 
                    those pages, unique device identifiers and other diagnostic data.</p>

                    <p class="mt-2">When you access the Service by or through a mobile device, this Usage Data may include 
                    information such as the type of mobile device you use, your mobile device unique ID, the IP address of 
                    your mobile device, your mobile operating system, the type of mobile Internet browser you use, unique 
                    device identifiers and other diagnostic data.</p>

                    <h5 class="mt-2">Tracking & Cookies Data</h5>
                    <p class="mt-2">We use cookies and similar tracking technologies to track the activity on our Service and 
                    hold certain information. Cookies are files with small amount of data which may include an anonymous 
                    unique identifier. Cookies are sent to your browser from a website and stored on your device. Tracking 
                    technologies also used are beacons, tags, and scripts to collect and track information and to improve 
                    and analyze our Service. You can instruct your browser to refuse all cookies or to indicate when a cookie 
                    is being sent. However, if you do not accept cookies, you may not be able to use some portions of our 
                    Service.</p>

                    <h5 class="mt-2">Examples of Cookies we use:</h5>
                    <ul>
                        <li><span style="font-weight:bold;">Session Cookies.</span> We use Session Cookies to operate our Service.</li>
                        <li><span style="font-weight:bold;">Preference Cookies.</span> We use Preference Cookies to remember your preferences and various settings.</li>
                        <li><span style="font-weight:bold;">Security Cookies.</span> We use Security Cookies for security purposes.</li>
                    </ul>

                    <h3 class="mt-2">Use of Data</h3>
                    <p class="mt-2">Boxers with Parkinson’s Project uses the collected data for various purposes:</p>
                    <ul>
                        <li>To provide and maintain the Service</li>
                        <li>To notify you about changes to our Service</li>
                        <li>To allow you to participate in interactive features of our Service</li>
                        <li>To provide customer care and support</li>
                        <li>To provide analysis or valuable information so that we can improve the Service</li>
                        <li>To monitor the usage of the Service</li>
                        <li>To detect, prevent and address technical issues, abuse or inappropriate usage, and, when authorized by the user,
                        in Parkinson’s research and analysis consistent with the stated purposes of the BwP Project and within the 
                        guidelines stated in this document. Use by outside organizations will be through our proprietary and secure 
                        research portal where we control their access and permissions at all times.</li>
                    </ul>

                    <h5 class="mt-2">Prohibited uses of the data:</h5>
                    <ul>
                        <li>Advertising or marketing to users inside the website or app.</li>
                        <li>Your Data will not be sold, shared, leased or given as a list to any outside company or 
                        organization for any non-research purpose such as advertising or marketing products or services 
                        to the users.</li>
                        <li>Your Data will not be exported or transferred in a readable file format to any outside 
                        organization wherein we lose control of the uses of that Data.</li>
                    </ul>

                    <h3 class="mt-2">Transfer Of Data</h3>
                    <p class="mt-2">Your Data, may be transferred to or maintained on computers/servers located outside of your 
                    state, province, country or other governmental jurisdiction where the data protection laws may differ than 
                    those from your jurisdiction. If you are located outside the United States and choose to provide information 
                    to us, please note that we transfer the Data, to the United States and process it there. Your consent to this 
                    Privacy Policy followed by your submission of such Your Data represents your agreement to that transfer.</p>

                    <p class="mt-2">Your Data, may be transferred to or maintained on computers/servers located outside of your 
                    state, province, country or other governmental jurisdiction where the data protection laws may differ than 
                    those from your jurisdiction. If you are located outside the United States and choose to provide information 
                    to us, please note that we transfer the Data, to the United States and process it there. Your consent to this 
                    Privacy Policy followed by your submission of such Your Data represents your agreement to that transfer.</p>

                    <h3 class="mt-2">Disclosure Of Data</h3>
                    <p class="mt-2">We may disclose Your Data in the good faith belief that such action is necessary to:</p>
                    <ul>
                        <li>To comply with a legal obligation</li>
                        <li>To protect and defend the rights or property of BwP Project</li>
                        <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
                        <li>To protect the personal safety of users of the Service or the public</li>
                        <li>To protect against legal liability.</li>
                    </ul>

                    <h3 class="mt-2">Security Of Data</h3>
                    <p class="mt-2">The security of Your Data is important to us, but no method of transmission over the Internet, 
                    or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect 
                    your Personal Data, we cannot guarantee its absolute security. Our systems are hosted and maintained in Class A 
                    network control centers and use state of the art security services. Back up is provided on a daily basis.</p>

                    <h3 class="mt-2">Service Providers</h3>
                    <p class="mt-2">We employ third party companies and individuals to facilitate our Services ("Service Providers"), 
                    to provide the Services on our behalf, to perform Service-related services or to assist us in analyzing how our 
                    Services are used. These third parties have access to Your Data only to perform these tasks on our behalf and 
                    are obligated not to disclose or use it for any other purpose.</p>

                    <h5 class="mt-2">Analytics</h5>
                    <p class="mt-2">We will use third-party Service Providers to monitor and analyze the use of our Services. These 
                    Service Providers are not permitted to view individual record data but to monitor traffic and overall system 
                    usage and performance. One such service is Google Analytics.</p>  

                    <ul><li>Google Analytics is a web analytics service offered by Google that tracks and reports 
                    website traffic. Google uses the data collected to track and monitor the use of our Service. 
                    This data is shared with other Google services. Google may use the collected data to contextualize 
                    and personalize the ads of its own advertising network.  For more information on the privacy 
                    practices of Google, please visit the Google Privacy & Terms web page: 
                    https://policies.google.com/privacy?hl=en</li></ul>

                    <h3 class="mt-2">Links To Other Sites</h3>
                    <p class="mt-2">Our Service may contain links to other sites that are not operated by us. If you click on a third 
                    party link, you will be directed to that third party's site. We strongly advise you to review the Privacy 
                    Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy 
                    policies or practices of any third party sites or services.</p>

                    <h3 class="mt-2">Children's Privacy</h3>
                    <p class="mt-2">Our Service does not address anyone under the age of 18 ("Children"). We do not knowingly collect 
                    personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are 
                    aware that your Children has provided us with Personal Data, please contact us. If we become aware that we have 
                    collected Personal Data from children without verification of parental consent, we take steps to remove that 
                    information from our servers.</p>

                    <h3 class="mt-2">Changes To This Privacy Policy</h3>
                    <p class="mt-2">We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
                    the new Privacy Policy on this page. We will let you know via email and/or a prominent notice on our Service, 
                    prior to the change becoming effective and update the "effective date" at the top of this Privacy Policy. You 
                    are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are 
                    effective when they are posted on this page.</p>

                    <h3 class="mt-2">Contact Us</h3>
                    <p class="mt-2">If you have any questions about this Privacy Policy, please visit www.BwPProject.com or contact us:</p>
                    <ul>
                        <li>Learn More:  BwPProject.com</li>
                        <li>By email: fight@RockSteadyBoxingSKC.com</li>
                        <li>By mail: 12898 SE 225th Ct, Kent, WA 98031</li>
                        <li>By phone: 425-830-4472</li>
                    </ul> 
                </div>
                <div class="mt-3 mb-3">
                    ${new CheckBoxComponent()
            .setId('signedPrivacyPolicy')
            .setName('signedPrivacyPolicy')
            .setLabel(`<span style="font-weight:bold;">I, ${this.personalInfo.firstName} ${this.personalInfo.lastName}, confirm
                    that I have read and agree to the Privacy Policy on ${PALongView.displayDateFromDate(this.waivers.signedDate.toDateInputValue())}</span>`)
            .setValue(this.waivers.signedPrivacyPolicy)
            ._html()}
                </div>
            </div>
            <div class="card-footer">
                ${this._buttonHTML}
            </div>
        </div>
    </div>`;
    }
};
