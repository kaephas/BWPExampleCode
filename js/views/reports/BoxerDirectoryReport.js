import SummaryView from "../SummaryView";
import PALongView from "../physicalAssessment/PALongView";

const DirectoryReportGenerator = (fightersObject, fighterModel) => {
    let returnString = "";
    for (let [location, fighters] of Object.entries(fightersObject)) {
        returnString += `<h1>${location}${fighters.length > 0 ? `<span class="float-right mt-4 h6">${fighters.length} boxer${fighters.length > 1 ? "s" : ""}</span>` : ""}</h1>
                                <ul class="list-group list-group-flush mb-5">`;
        if(fighters.length > 0) {
            fighters.forEach((fighter) => {
                fighter.image = `<img src="${fighter.image ? fighter.image : `${cordova.file.applicationDirectory}www/img/user.jpg`}" alt="fighterThumbnail" aria-describedby="pictureInfo" height="55" width="55">`;
                if(!fighter.birthDate) {
                    fighter.birthDate = "N/A";
                    fighter.age = "N/A";
                } else fighter.birthDate = PALongView.displayFullDateFromDate(new Date(fighter.birthDate).toInputString());
                if(fighter.reassessmentDate) fighter.reassessmentDate = PALongView.displayFullDateFromDate(new Date(fighter.reassessmentDate).toInputString());
                else fighter.reassessmentDate = "N/A";
                let pdqLastDate = SummaryView.getDisplayAssessDates(fighter.pdq);
                pdqLastDate = pdqLastDate[pdqLastDate.length - 1];
                let BwPScore = 0;
                if(pdqLastDate && fighter.physicalAssessments.has(pdqLastDate)) {
                    let paAssessmentData = fighter.physicalAssessments.get(pdqLastDate);
                    paAssessmentData = fighterModel.physicalAssessmentModel.paAssessmentScore(paAssessmentData, fighter.gender, SummaryView.calculateAge(fighter.birthDate));
                    let pdqAssessmentData = fighter.pdq.get(pdqLastDate);
                    pdqAssessmentData = fighterModel.pdqModel.pdqAssessmentScore(pdqAssessmentData);
                    BwPScore = SummaryView.calculateBwPScores(pdqAssessmentData, paAssessmentData).BWP;
                }
                returnString += `<li class="list-group-item">
                                        <div class="row">
                                            <div class="col-1 pl-0">
                                                ${fighter.image}
                                            </div>
                                            <div class="col-11">
                                                <div class="row">
                                                    <div class="col-5 col-sm-4">${fighter.name}, ${fighter.age}</div>
                                                    <div class="col-4"><i class="fas fa-birthday-cake mr-2 mt-1"></i> ${fighter.birthDate}</div>
                                                    <div class="col-4"><i class="fas fa-hourglass-half mr-2 mt-1"></i> ${fighter.reassessmentDate}</div>
                                                    <div class="col-4">BWP: (Lvl) ${fighter.rsbLevel}, (S) ${BwPScore ? BwPScore : "N/A"}</div>
                                                    <div class="col-4">TWET: ${fighter.vitals.size > 0 ? SummaryView.getTWETScore(fighter.vitals).TotalTWET : "N/A"}</div>
                                                    <div class="col-4"><i class="fas fa-home mt-1 mr-2"></i>${fighter.city ? fighter.city : "N/A"}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>`;
            });

        } else returnString += '<li class="list-group-item text-center">NO BOXERS FOUND IN THIS LOCATION</li>';
        returnString += `</ul>`;
    }
    return returnString;
};

export default DirectoryReportGenerator;