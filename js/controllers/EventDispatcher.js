/**
 * @author Jacob Landowski
 * @author Tyler Bezera
 * @author Cynthia Pham
 * 1/30/2019
 */

'use strict';

/**
 * Class responsible for dispatching events, those that extend this class can subscribe to each other
 * to see events that are fired using this class.
 */
class EventDispatcher
{
    /**
     * Firing an event both creates it, and notifies any observers (subscribers) that said event has been triggered
     * @param {string} eventName - Name of the event
     * @param {object} data - Any data to be passed to observers (subscribers) for processing or use
     */
    fireEvent(eventName, data={})
    {
        this._getEvent(eventName).notify(data, this);
    }

    /**
     * Subscribing to a class, allows an observer (subscriber) to watch for an event fired
     * @param {string} className - Class name subscribing to
     * @param {string} eventName - Name of the event subscribing to
     * @param {string} subscriptionName - Name of this subscription
     * @param {function} callback - the observer defined function, to be called when the event that is being subscribed to
     * is fired.
     */
    subscribeTo(className, eventName, subscriptionName, callback)
    {
        EventDispatcher.unsubscribeFrom(className, eventName, subscriptionName);
        this._getEvent(eventName, className).subscribe(subscriptionName, callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} className - Class name to unsubscribe from
     * @param {string} eventName - Event name to unsubscribe from
     * @param {string} subscriptionName - Subscription name to unsubscribe from
     */
    static unsubscribeFrom(className, eventName, subscriptionName)
    {
        const classEvents = EventDispatcher.events.get(className);

        if(classEvents && classEvents.get(eventName))
        {
            classEvents.get(eventName).unsubscribe(subscriptionName);
        }
    }

    /**
     * Creates and adds an event to a class events map
     * @param {string} eventName - Name of the event
     * @param {string} className - Name of the class this event belongs to
     * @private
     */
    _initEvent(eventName, className)
    {
        const classEvents = this._getClassEventsMap(className);

        if(!classEvents.get(eventName))
        {
            classEvents.set(eventName, new Event(eventName))
        }
    }

    /**
     * Retrieve an event from specified class, creates an event if it doesn't exist
     * @param {string} eventName - Name of the event to retrieve
     * @param {string} className - Name of class that the event belongs to
     * @returns {Event} - The event object from the class map
     * @private
     */
    _getEvent(eventName, className = "")
    {
        const classEvents = this._getClassEventsMap(className);
        this._initEvent(eventName, className);

        return classEvents.get(eventName);
    }

    /**
     *
     * @param {string} className - Name of the class we are getting the map for
     * @returns {Map<String, Event>} - Map of Event names to Event
     * @private
     */
    _getClassEventsMap(className)
    {
        if(!className) className = this.constructor.name;

        EventDispatcher._initClassEventsMap(className);

        return EventDispatcher.events.get(className);
    }

    /**
     * Create and ensure a class name has a map set
     * @param {string} className - Name of class for the events map to belong to
     * @private
     */
    static _initClassEventsMap(className)
    {
        if(!EventDispatcher.events.get(className))
        {
            EventDispatcher.events.set(className, new Map());
        }
    }
}

/**
 * An event has a name, and a map of it's subscribers
 */
class Event
{
    /**
     * Creates a new event, making new map of subscribers
     * @param {string} name - name of this event
     */
    constructor(name)
    {
        this.name = name;
        this.subscribers = new Map();
    }

    /**
     * Adds an observer (subscriber) to the subscribers map
     * @param {string} subscriptionName - Subscription name
     * @param {function} callback - Function that will be called when this event is fired
     */
    subscribe(subscriptionName, callback)
    {
        if(this.subscribers.get(subscriptionName))
        {
            throw new Error(`Tried to subscribe to the ${this.name} Event with already existing key: ${subscriptionName}`);
        }

        this.subscribers.set(subscriptionName, callback);
    }

    /**
     * Removes an observer (subscriber) from this event
     * @param {string} subscriptionName - Name of subscription
     */
    unsubscribe(subscriptionName)
    {
        if(!this.subscribers.delete(subscriptionName))
        {
            throw new Error(`Tried to unsubscribe from the ${this.name} Event with non-existing key: ${subscriptionName}`);
        }
    }

    /**
     * Called when this event is fired, to let our observers (subscribers) know
     * @param {object} data - Data passed to the fireEvent method
     * @param {object} owner - A reference to to owner (EventDispatcher)
     */
    notify(data, owner)
    {
        this.subscribers.forEach((subscription) => 
        {
            subscription(data, owner);
        });
    }
}

EventDispatcher.events = new Map();
export default EventDispatcher;