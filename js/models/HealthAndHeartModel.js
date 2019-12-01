/**
 * @author Jen Shin
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 1/18/2019
 * Health and Heart Model
 */
import Model from "./Model";

/**
 * Health and Heart model, stores medical fields related to health and heart conditions
 */
export default class HealthAndHeartModel extends Model{

    /**
     * Sets all fields to false, so we don't deal with nulls and force them to be Booleans
     */
    constructor() {
        super();
        this.health = {
            arthritis: false,
            hypertension: false,
            asthma: false,
            blindness: false,
            cancer: false,
            chronicBronchitis: false,
            dementia: false,
            diabetes: false,
            epilepsy: false,
            multipleSclerosis: false,
            osteoporosis: false,
            stroke: false,
            kidneyDisease: false,
            allergy: false,
            alzheimers: false,
            anemia: false,
            anxiety: false,
            bursitisAndTendonitis: false,
            digestiveDisorders: false,
            fatigue: false,
            headaches: false,
            hearingLoss: false,
            lungDisease: false,
            memoryLoss: false,
            painGeneralized: false,
            sleepDisorders: false,
            stress: false,
            thyroidDisorders: false,
            pregnant: false,
            sciatica: false,
            seizures: false,
            breathlessness: false,
            chestDiscomfort: false,
            burningCrampLegs: false,
            highCholesterol: false,
            hipReplacement: false,
            kneeReplacement: false,
            rotatorCuffInjury: false,
            lowBloodPressure: false,
            painKnee: false
        };

        this.heart = {
            heartAttack: false,
            heartSurgery: false,
            cardiacCoronary: false,
            angiplasty: false,
            pacemaker: false,
            heartValveDisease: false,
            heartFailure: false,
            rhythmDisturb: false,
            heartTransplant: false,
            congenitalHeartDisease: false
        }
    }

    /**
     * Serialize's this object to JSON
     * @returns {{health: object, heart: object}}
     */
    serialize() {
        super.serialize();
        return {
            health: this.health,
            heart: this.heart
        };
    }

    /**
     * Deserialize this object from JSON
     * @param {HealthAndHeartModel} from - JSON object of this
     */
    deserialize(from) {
        super.deserialize();
        if(!from)
            return;
        Object.keys(from).forEach((key) => {
            Object.keys(from[key]).forEach((field) => {
                this[key][field] = from[key][field];
            });
        });
    }
}