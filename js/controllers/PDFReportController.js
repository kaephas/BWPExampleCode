/**
 * Class to handle PDF creation and sharing via print and email.
 * @author Cynthia Pham
 * PDFReportController.js
 */

import pdf from "../../../plugins/cordova-pdf-generator/www/pdf";

"use strict";

/**
 * PDFReportController facilitates connections and methods to the pdf reporter and email plugins so users are
 * able to create PDF files and share them via printer and email.
 */
export default class PDFReportController
{

    /**
     * Constructor for PDF Report Controller, takes in an optional documentSize and landscape
     * @param {String} documentSize - optional parameter ("A3", "A4", "A5") for document size
     * @param {String} orientation - optional parameter for orientation of document ("portrait", "landscape")
     */
    constructor(documentSize = "A4", orientation = "portrait") {
        this.options = {
            documentSize: documentSize,
            orientation: orientation,
            fileName: ""
        };
        this._content = "";
    }

    /**
     * Sets the content of the PDF file, the html that would shown in the generated PDF file
     * @param {string} content - html string of content to be displayed //i.e `<h1>Welcome</h1>`
     * @returns {PDFReportController} for method chaining...
     */
    setContent(content) {
        console.log(content);
        const htmlTagRegex = /(\<\w*)((\s\/\>)|(.*\<\/\w*\>))/ig;
        if(!htmlTagRegex.test(content))
            throw new Error("PDFReportController requires content to be in a HTML file format.");
        this._content = content;
        return this;
    }

    /**
     * Sets the name of the PDF file
     * @param {string} fileName - name of the PDF file
     * @returns {PDFReportController} for method chaining..
     */
    setFileName(fileName) {
        const pdfExtRegex = /.pdf$/gi;
        const fileNameRegex = /([^a-z0-9]+)/gi;
        this.options.fileName = fileName.trim().replace(pdfExtRegex, "").replace(fileNameRegex, "_");
        return this;
    }

    /**
     * Generates PDF file and opens options to user to either download or print PDF file
     */
    generateSharePDF() {
        if(!this._content)
            throw new Error("PDFReportController requires content to generate a PDF file.");
        if(!this.options.fileName)
            throw new Error("PDFReportController requires file name to generate a PDF file.");

        this.options.type = 'share';
        pdf.fromData('<head><title>PDF Report</title><link rel="stylesheet" href="file:///android_asset/www/css/bootstrap.css"></head><body>' + this._content + '</body>', this.options)
            .then((stats)=> console.log("pdf generated"))
            .catch((err)=>console.log(err));
    }

    /**
     * Generates PDF file and opens selected email (outlook, gmail, etc) app to send PDF
     * @param {Array} emailRecipients - array of emails that we want to send to
     * @param {String} subject - what would show up in the email's subject line
     */
    generateEmailPDF(emailRecipients = [], subject = "") {
        if(!this._content)
            throw new Error("PDFReportController requires content to generate a PDF file.");
        if(!this.options.fileName)
            throw new Error("PDFReportController requires file name to generate a PDF file.");

        this.options.type = 'base64';
        pdf.fromData('<head><title>PDF Report</title><link rel="stylesheet" href="file:///android_asset/www/css/bootstrap.css"></head><body>' + this._content + '</body>', this.options)
            .then((base64) => {
                cordova.plugins.email.open({
                    to:          emailRecipients,
                    subject:     subject,
                    attachments: ['base64:' + this.options.fileName + '.pdf//' + base64]
                });
            })
            .catch((err)=> console.log(err));
    }


}