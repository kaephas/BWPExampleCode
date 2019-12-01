import SummaryView from "../SummaryView";
import PALongView from "../physicalAssessment/PALongView";

const BwPAssessmentReportGenerator = (fighterModel, hideFooterBoolean) => {
    const summarizedPDQ = SummaryView.summarizePDQsToList(fighterModel.pdqModel.serialize(), fighterModel, true);
    const summarizedPA = SummaryView.summarizePAToListObject(fighterModel.physicalAssessmentModel.serialize(), fighterModel);
    const summarizedGeneral = SummaryView.summarizeGeneral(fighterModel.pdqModel.serialize(), fighterModel.physicalAssessmentModel.serialize(), fighterModel.vitalsModel.serialize().vitalsAssessment, fighterModel);
    const sortedAssessmentDates = SummaryView.getSortedAssessmentDates(true, fighterModel.pdqModel.serialize(), fighterModel.physicalAssessmentModel.serialize(), fighterModel.vitalsModel.serialize().vitalsAssessment);
    return `<div class="row mb-2">
                <div class="col-6 col-sm-5 col-md-4 col-lg-3">
                    <div>
                        <img id="fighterImage" src="${fighterModel.personalInformationModel.image.length > 0 ? fighterModel.personalInformationModel.image : `${cordova.file.applicationDirectory}www/img/300x300.png`}" alt="Fighter Image" class="img-thumbnail"/>
                    </div>
                </div>
                <div class="col-6 col-sm-7 col-md-5">
                    <ul class="list-unstyled">
                        <li class=""><strong>Age: </strong>${fighterModel.personalInformationModel.birthDate ? SummaryView.calculateAge(fighterModel.personalInformationModel.birthDate) : "N/A"}</li>
                        <li class=""><strong>Diagnosed: </strong>${fighterModel.parkinsonSymptomsModel.diagnosisDate ? PALongView.displayMonthYearFromDate(fighterModel.parkinsonSymptomsModel.diagnosisDate) : "N/A"}</li>
                        <li class=""><strong>Birthday: </strong>${fighterModel.personalInformationModel.birthDate ? PALongView.displayFullDateFromDate(fighterModel.personalInformationModel.birthDate) : "N/A"}</li>
                        <li class=""><strong>Joined: </strong>${(sortedAssessmentDates && sortedAssessmentDates.length > 0) ? PALongView.displayFullDateFromDate(sortedAssessmentDates[0]) : "N/A"}</li>
                        <li class=""><strong>Next Assessment: </strong>${PALongView.displayFullDateFromDate(new Date(fighterModel.coachObservationModel.reassessmentDate).toInputString())}</li>
                        <li class=""><strong>TWET: </strong>${SummaryView.getTWETLevel(fighterModel.vitalsModel._vitalsAssessment)}, <strong>Total: </strong>${SummaryView.getTWETScore(fighterModel.vitalsModel._vitalsAssessment).TotalTWET}
                                            <strong>Boxing: </strong>${SummaryView.getTWETScore(fighterModel.vitalsModel._vitalsAssessment).BoxingTWET}</li>
                        <li class=""><strong>BwP Level: </strong>${fighterModel.coachObservationModel.rsbLevel ? fighterModel.coachObservationModel.rsbLevel : "N/A"}</li>
                    </ul>
                </div>
            </div>
            <div class="row mb-2">
                <div class="col-12 ml-0">
                    <div class="card card-shadow card-border">
                        <div class="card-body">
                            <div class="card-title font-weight-bold">Assessment Summary</div>
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
                                ${summarizedGeneral}
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
                                ${summarizedPDQ}
                            </div>
                        </div>
                        ${hideFooterBoolean ? "" : `<div class="card-footer text-center">CONFIDENTIAL (c) 2019 Boxers with Parkinson's</div>`}
                    </div>
                </div>
            </div>
            <div class="row mt-3" style="page-break-before:always">
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
                                ${summarizedPA.paList}
                                ${summarizedPA.fabTrends}
                            </div>
                            <div class="card-title font-weight-bold">Timed Up & Go</div> 
                                <div class="row">
                                    <div class="col-4">
                                        <ul class="list-unstyled">
                                            <li class="">Time</li>
                                            <li class="">Score</li>
                                        </ul>
                                    </div>
                                    ${summarizedPA.upNGo}
                                    ${summarizedPA.upNGoTrends}
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
                                    ${summarizedPA.s2s}
                                    ${summarizedPA.s2sTrends}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-12">
                        <div class="card card-shadow card-border">
                            <div class="card-body">
                                <p class="mb-3">Scoring:  All scoring normalized using a 100-point scale.  Scores are for this boxer 
                                and should not be used to compare one boxer to another.</p>
                                <p class="mb-3">TWET: Typical Week Exercise Therapy.  The TWET total weighs a boxer&rsquo;s exercise activities 
                                for a typical week based on comparative intensity and average time.  3 Hours boxing is generates more 
                                more dopamine and brain cells than 5 hours gardening or walking.  Target score should be 10 or more.</p>
                                <p class="mb-3">Weight and BMI.  Because poor balance is a critical PD symptom, weight and where you carry 
                                your weight can effect balance and your ability to prevent falls.</p>
                                <p class="mb-3">Standing Jump:  For consistency, BwPP measures toe to toe.  A boxer who has a 10 inch 
                                foot jumps 11 inches toe to toe.  That would be 1 inch toe to heel.  Their nose moved 11 inches.  Toe to 
                                heel scores a 2 and toe to toe scores a 3.    If the Boxer jumps 21 inches toe to toe, that is 11 inches 
                                toe to heel and scores a 3 whereas toe to toe is a 4.</p>
                            </div>
                            ${hideFooterBoolean ? "" : `<div class="card-footer text-center">CONFIDENTIAL (c) 2019 Boxers with Parkinson's</div>`}
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
};

export default BwPAssessmentReportGenerator;