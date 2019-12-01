/**
 * @author: Tyler Bezera
 * Generators used for code generation
 */

"use strict";

import CheckBoxComponent from "../views/components/CheckBoxComponent";

/**
 * Formats form fields into two column rows, returning an HTML string
 * @param {Array<CheckBoxComponent>} fieldComponents - an array of checkbox components
 * @returns {string|string}
 */
export const twoColumnRowFormatter = (fieldComponents) => {
    let fieldComponentsHTML = '';
    for(let i = 0; i < fieldComponents.length - 1; i = i + 2){
        fieldComponentsHTML += `<div class="row mb-3">
            <div class="col-6">
            ${fieldComponents[i]._html()}
            </div>
            <div class="col-6">
            ${fieldComponents[i + 1]._html()}
            </div>
            </div>`;
    }
    return fieldComponentsHTML;
};

/**
 * Formats forms fields into one column, returning an HTML string
 * @param {Array<CheckBoxComponent>} fieldComponents - an array of checkbox components
 * @returns {string|string}
 */
export const oneColumnRowFormatter = (fieldComponents) => {
    let fieldComponentsHTML = '';

    for(let i = 0; i < fieldComponents.length; i++) {
        fieldComponentsHTML += `
            <div class="row mb-3">
                <div class="col-12">
                    ${fieldComponents[i]._html()}
                </div>
            </div>`;
    }
    return fieldComponentsHTML;
};

/**
 * Formats form fields into a single row, returns an HTML string
 * @param {Array<CheckBoxComponent> }fieldComponents - an array of checkbox components
 * @returns {string}
 */
export const oneRowFormatter = (fieldComponents) => {
    let fieldComponentsHTML = `
            <div class="row mb-3">
                <div class="col-12">`;

    for(let i = 0; i < fieldComponents.length; i++) {
        fieldComponentsHTML += fieldComponents[i]._html();
    }

    fieldComponentsHTML += `</div></div>`;

    return fieldComponentsHTML;
};

/**
 * Generates two column form from array of fields
 * @param {Array<Object>} fieldList - an array of objects from the database
 * @param {String} formName - name of form this belongs
 * @param {String} modelReference - name of model this belongs to
 * @param {Function} rowFormatter - format for HTML
 * @param {Number} columns - number of columns
 * @returns {string|string}
 */
export function generateHTMLfromDatabaseFieldList(fieldList, formName, modelReference, rowFormatter = twoColumnRowFormatter) {
    const fieldComponents = [];

    fieldList.forEach((field) => {
        const component = new CheckBoxComponent()
            .setId(field.field.dbLabel)
            .setName(formName ? formName : field.field.dbLabel)
            .setData('field', formName ? field.field.dbLabel : "")
            .setLabel(field.field.viewLabel)
            .setValue(formName ? modelReference[formName][field.field.dbLabel] : modelReference[field.field.dbLabel]);
        fieldComponents.push(component);
    });

    console.log(fieldComponents);
    fieldComponents.sort((field, fieldOther) => {
        return field._id.localeCompare(fieldOther._id);
    });

    return rowFormatter(fieldComponents);
}