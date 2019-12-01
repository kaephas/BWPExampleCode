/**
 * Routes page assigns the View and SidebarView pages in specified route.
 * @author Jacob Landowski
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 5/16/19
 * DirectoryView.js
 */

'use strict';

import AssessmentHistoryView from './views/AssessmentHistoryView';
import CoachPageView from './views/CoachPageView';
import DirectoryView from './views/DirectoryView';
import EmergencyContactView from './views/EmergencyContactView';
import HealthConditionsView from './views/HealthConditionsView';
import ParkinsonSymptomsView from './views/SymptomsChecklistView';
import ParkinsonsMedicationView from './views/ParkinsonsMedicationView';
import PersonalInformationView from './views/PersonalInformationView';
import PDQView from './views/pdq/PDQView';
import PDQ39View from "./views/pdq/PDQ39View";
import PDQ39QuickView from "./views/pdq/PDQ39QuickView";
import PAView from "./views/physicalAssessment/PAView";
import PALongView from "./views/physicalAssessment/PALongView";
import PAQuickView from "./views/physicalAssessment/PAQuickView";
import CoachLogInView from "./views/CoachLogInView";
import SummaryView from "./views/SummaryView";
import { DirectoryMenuView, CoachLoginMenuView, GeneralMenuView } from "./views/SidebarMenus";
import PDQSummaryView from "./views/pdq/PDQSummaryView";
import PASummaryView from "./views/physicalAssessment/PASummaryView";
import WaiversView from './views/WaiversView';
import VitalsView from "./views/vitals/VitalsView";
import VitalSummaryView from "./views/vitals/VitalSummaryView";
import PDFReportView from "./views/reports/PDFReportView";
import AboutUsView from "./views/AboutUsView";
import kaephas from "./views/kaephas";

/**
 * JS object that defines the content (View) and sidebar (SidebarView) pages for each route in the app.
 */
export default {
    '#coachPage':
        {
            content: CoachPageView,
            sidebar: GeneralMenuView
        },
    '#summary':
        {
            content: SummaryView,
            sidebar: GeneralMenuView
        },
    '#assessmentHistory':
        {
            content: AssessmentHistoryView,
            sidebar: GeneralMenuView
        },
    '#directory':
        {
            content: DirectoryView,
            sidebar: DirectoryMenuView
        },

    '#emergencyContact':
        {
            content: EmergencyContactView,
            sidebar: GeneralMenuView
        },

    '#healthConditions':
        {
            content: HealthConditionsView,
            sidebar: GeneralMenuView
        },

    '#parkinsonSymptoms':
        {
            content: ParkinsonSymptomsView,
            sidebar: GeneralMenuView
        },

    '#parkinsonsMedications':
        {
            content: ParkinsonsMedicationView,
            sidebar: GeneralMenuView
        },

    '#pdq':
        {
            content: PDQView,
            sidebar: GeneralMenuView
        },
    '#pdq39Form':
        {
            content: PDQ39View,
            sidebar: GeneralMenuView
        },
    '#pdq39QuickForm':
        {
            content: PDQ39QuickView,
            sidebar: GeneralMenuView
        },

    '#physicalAssessment':
        {
            content: PAView,
            sidebar: GeneralMenuView
        },

    '#paQuickForm':
        {
            content: PAQuickView,
            sidebar: GeneralMenuView
        },

    '#paLongForm':
        {
            content: PALongView,
            sidebar: GeneralMenuView
        },

    '#personalInformation':
        {
            content: PersonalInformationView,
            sidebar: GeneralMenuView
        },

    '#waivers':
        {
            content: WaiversView,
            sidebar: GeneralMenuView
        },

    '#coachLogin':
        {
            content: CoachLogInView,
            sidebar: CoachLoginMenuView
        },
    '#pdqSummary':
        {
            content: PDQSummaryView,
            sidebar: GeneralMenuView
        },
    '#paSummary':
        {
            content: PASummaryView,
            sidebar: GeneralMenuView
        },
    '#vitals':
        {
            content: VitalsView,
            sidebar: GeneralMenuView
        },
    '#vitalSummary':
        {
            content: VitalSummaryView,
            sidebar: GeneralMenuView
        },
    '#directoryPDFReport':
        {
            content: PDFReportView,
            sidebar: DirectoryMenuView
        },
    '#boxerPDFReport':
        {
            content: PDFReportView,
            sidebar: GeneralMenuView
        },
    '#aboutUs':
        {
            content: AboutUsView,
            sidebar: DirectoryMenuView
        },
    '#kaephas':
        {
            content: kaephas,
            sidebar: GeneralMenuView
        }
}