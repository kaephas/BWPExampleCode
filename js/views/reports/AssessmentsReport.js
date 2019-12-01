import SummaryView from "../SummaryView";
import PALongView from "../physicalAssessment/PALongView";

const AssessmentsReportGenerator = (fightersObject) => {
    let returnString = "";
    for (let [assessmentTitle, fighters] of Object.entries(fightersObject)) {
        returnString += `<h2>${assessmentTitle}${fighters.length > 0 ? `<span class="float-right mt-3 h6">${fighters.length} boxer${fighters.length > 1 ? "s" : ""}</span>` : ""}</h2>
                                <ul class="list-group list-group-flush mb-3">`;
        if(fighters.length > 0) {
            //sort by reassessment first, then name
            let sortedFighters = fighters.sort((first, second) => {
                return new Date(first.reassessmentDate) - new Date(second.reassessmentDate) || first.name - second.name;
            });
            sortedFighters.forEach((fighter) => {
                let lastAssessmentDate = SummaryView.getSortedAssessmentDates(false, fighter.pdq,
                    fighter.physicalAssessments, fighter.vitals);
                if(lastAssessmentDate.length > 0 && lastAssessmentDate[0]) lastAssessmentDate = lastAssessmentDate[0];
                returnString += `<li class="list-group-item">
                                    <div class="row">
                                        <div class="col-12">
                                            <div class="row">
                                                <div class="col-4">${fighter.name}<br><i class="fas fa-map-marker-alt mr-2"></i>${fighter.location}</div>
                                                <div class="col-4"><span class="float-left">Reassessment</span><i class="far fa-calendar-alt mr-2 ml-2"></i> ${lastAssessmentDate ? PALongView.displayFullDateFromDate(fighter.reassessmentDate) : "N/A"}</div>
                                                <div class="col-4"><span class="float-left">Last Assessment</span> <i class="far fa-calendar-alt mr-2 ml-2"></i> ${PALongView.displayFullDateFromDate(lastAssessmentDate)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </li>`;
            });

        } else returnString += '<li class="list-group-item text-center">NO BOXERS FOUND</li>';
        returnString += `</ul>`;
    }
    return returnString;
};

export default AssessmentsReportGenerator;