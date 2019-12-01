/**
 * @author Tyler Bezera
 * @author Cynthia Pham
 */

import EventDispatcher from "./EventDispatcher";

/**
 * Camera Controller facilitates connections and methods to device camera
 */
export default class CameraController extends EventDispatcher
{

    /**
     * Constructor for Camera Controller, takes in an optional width and height
     * @param {number} width - image width
     * @param {number} height - image height
     */
    constructor(width = 300, height = 250) {
        super();
        this.IMAGE_WIDTH = width;
        this.IMAGE_HEIGHT = height;
    }

    /**
     * Opens the native device's camera, allowing the user to take an image
     * @param {string} selector - selector for an html tag, i.e. #picture
     */
    openCamera(selector) {

        const srcType = Camera.PictureSourceType.CAMERA;
        const options = this._setOptions(srcType);

        options.targetHeight = 250;
        options.targetWidth = 300;

        console.log('getPicture');
        navigator.camera.getPicture((imageURi) => {
            this.fireEvent('imageTaken', imageURi);
            this._displayImage(imageURi, selector);

        }, (error) => {
            console.log("Unable to obtain picture: " + error);
        }, options);
    }

    /**
     * Returns an object with camera settings
     * @param {number} srcType - source from where the image is coming from, either the gallery or camera.
     * @returns {{sourceType: number, correctOrientation: boolean, allowEdit: boolean, encodingType: number, destinationType: number, mediaType: number, quality: number}}
     * @private
     */
    _setOptions(srcType) {
        return ({
            // Some common settings are 20, 50, and 100
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            // In this app, dynamically set the picture source, Camera or photo gallery
            sourceType: srcType,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            allowEdit: true,
            correctOrientation: true  //Corrects Android orientation quirks
        });
    }


    /**
     * Displays the image to given selector element, formatting the image to the correct format.
     * @param {binary} imgURi - the binary representation of the image
     * @param {string} selector - selector for an html tag, i.e. #picture
     * @private
     */
    _displayImage(imgURi, selector) {
        const src = "data:image/jpeg;base64," + imgURi;
        console.debug('image is going to be displayed');

        document.querySelector(selector).src = src;
    }
}


