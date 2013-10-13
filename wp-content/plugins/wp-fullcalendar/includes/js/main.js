/*

 FullCalendar v1.5.4
 http://arshaw.com/fullcalendar/

 Use fullcalendar.css for basic styling.
 For event drag & drop, requires jQuery UI draggable.
 For event resizing, requires jQuery UI resizable.

 Copyright (c) 2011 Adam Shaw
 Dual licensed under the MIT and GPL licenses, located in
 MIT-LICENSE.txt and GPL-LICENSE.txt respectively.

 Date: Tue Sep 4 23:38:33 2012 -0700

/**
 * @preserve
 * FullCalendar v1.5.4
 * http://arshaw.com/fullcalendar/
 *
 * Use fullcalendar.css for basic styling.
 * For event drag & drop, requires jQuery UI draggable.
 * For event resizing, requires jQuery UI resizable.
 *
 * Copyright (c) 2011 Adam Shaw
 * Dual licensed under the MIT and GPL licenses, located in
 * MIT-LICENSE.txt and GPL-LICENSE.txt respectively.
 *
 * Date: Tue Sep 4 23:38:33 2012 -0700
 *
 */
 
(function($, undefined) {


var defaults = {

    // display
    defaultView: 'month',
    aspectRatio: 1.35,
    header: {
        left: 'title',
        center: '',
        right: 'today prev,next'
    },
    weekends: true,
    
    // editing
    //editable: false,
    //disableDragging: false,
    //disableResizing: false,
    
    allDayDefault: true,
    ignoreTimezone: true,
    
    // event ajax
    lazyFetching: true,
    startParam: 'start',
    endParam: 'end',
    
    // time formats
    titleFormat: {
        month: 'MMMM yyyy',
        week: "MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}",
        day: 'dddd, MMM d, yyyy'
    },
    columnFormat: {
        month: 'ddd',
        week: 'ddd M/d',
        day: 'dddd M/d'
    },
    timeFormat: { // for event elements
        '': 'h(:mm)t' // default
    },
    
    // locale
    isRTL: false,
    firstDay: 0,
    monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    buttonText: {
        prev: '&nbsp;&#9668;&nbsp;',
        next: '&nbsp;&#9658;&nbsp;',
        prevYear: '&nbsp;&lt;&lt;&nbsp;',
        nextYear: '&nbsp;&gt;&gt;&nbsp;',
        today: 'today',
        month: 'month',
        week: 'week',
        day: 'day'
    },
    
    // jquery-ui theming
    theme: false,
    buttonIcons: {
        prev: 'circle-triangle-w',
        next: 'circle-triangle-e'
    },
    
    //selectable: false,
    unselectAuto: true,
    
    dropAccept: '*'
    
};

// right-to-left defaults
var rtlDefaults = {
    header: {
        left: 'next,prev today',
        center: '',
        right: 'title'
    },
    buttonText: {
        prev: '&nbsp;&#9658;&nbsp;',
        next: '&nbsp;&#9668;&nbsp;',
        prevYear: '&nbsp;&gt;&gt;&nbsp;',
        nextYear: '&nbsp;&lt;&lt;&nbsp;'
    },
    buttonIcons: {
        prev: 'circle-triangle-e',
        next: 'circle-triangle-w'
    }
};



var fc = $.fullCalendar = { version: "1.5.4" };
var fcViews = fc.views = {};


$.fn.fullCalendar = function(options) {


    // method calling
    if (typeof options == 'string') {
        var args = Array.prototype.slice.call(arguments, 1);
        var res;
        this.each(function() {
            var calendar = $.data(this, 'fullCalendar');
            if (calendar && $.isFunction(calendar[options])) {
                var r = calendar[options].apply(calendar, args);
                if (res === undefined) {
                    res = r;
                }
                if (options == 'destroy') {
                    $.removeData(this, 'fullCalendar');
                }
            }
        });
        if (res !== undefined) {
            return res;
        }
        return this;
    }
    
    
    // would like to have this logic in EventManager, but needs to happen before options are recursively extended
    var eventSources = options.eventSources || [];
    delete options.eventSources;
    if (options.events) {
        eventSources.push(options.events);
        delete options.events;
    }
    

    options = $.extend(true, {},
        defaults,
        (options.isRTL || options.isRTL===undefined && defaults.isRTL) ? rtlDefaults : {},
        options
    );
    
    
    this.each(function(i, _element) {
        var element = $(_element);
        var calendar = new Calendar(element, options, eventSources);
        element.data('fullCalendar', calendar); // TODO: look into memory leak implications
        calendar.render();
    });
    
    
    return this;
    
};


// function for adding/overriding defaults
function setDefaults(d) {
    $.extend(true, defaults, d);
}



 
function Calendar(element, options, eventSources) {
    var t = this;
    
    
    // exports
    t.options = options;
    t.render = render;
    t.destroy = destroy;
    t.refetchEvents = refetchEvents;
    t.reportEvents = reportEvents;
    t.reportEventChange = reportEventChange;
    t.rerenderEvents = rerenderEvents;
    t.changeView = changeView;
    t.select = select;
    t.unselect = unselect;
    t.prev = prev;
    t.next = next;
    t.prevYear = prevYear;
    t.nextYear = nextYear;
    t.today = today;
    t.gotoDate = gotoDate;
    t.incrementDate = incrementDate;
    t.formatDate = function(format, date) { return formatDate(format, date, options) };
    t.formatDates = function(format, date1, date2) { return formatDates(format, date1, date2, options) };
    t.getDate = getDate;
    t.getView = getView;
    t.option = option;
    t.trigger = trigger;
    
    
    // imports
    EventManager.call(t, options, eventSources);
    var isFetchNeeded = t.isFetchNeeded;
    var fetchEvents = t.fetchEvents;
    
    
    // locals
    var _element = element[0];
    var header;
    var headerElement;
    var content;
    var tm; // for making theme classes
    var currentView;
    var viewInstances = {};
    var elementOuterWidth;
    var suggestedViewHeight;
    var absoluteViewElement;
    var resizeUID = 0;
    var ignoreWindowResize = 0;
    var date = new Date();
    var events = [];
    var _dragElement;
    
    
    
    /* Main Rendering
    -----------------------------------------------------------------------------*/
    
    
    setYMD(date, options.year, options.month, options.date);
    
    
    function render(inc) {
        if (!content) {
            initialRender();
        }else{
            calcSize();
            markSizesDirty();
            markEventsDirty();
            renderView(inc);
        }
    }
    
    
    function initialRender() {
        tm = options.theme ? 'ui' : 'fc';
        element.addClass('fc');
        if (options.isRTL) {
            element.addClass('fc-rtl');
        }
        if (options.theme) {
            element.addClass('ui-widget');
        }
        content = $("<div class='fc-content' style='position:relative'/>")
            .prependTo(element);
        header = new Header(t, options);
        headerElement = header.render();
        if (headerElement) {
            element.prepend(headerElement);
        }
        changeView(options.defaultView);
        $(window).resize(windowResize);
        // needed for IE in a 0x0 iframe, b/c when it is resized, never triggers a windowResize
        if (!bodyVisible()) {
            lateRender();
        }
    }
    
    
    // called when we know the calendar couldn't be rendered when it was initialized,
    // but we think it's ready now
    function lateRender() {
        setTimeout(function() { // IE7 needs this so dimensions are calculated correctly
            if (!currentView.start && bodyVisible()) { // !currentView.start makes sure this never happens more than once
                renderView();
            }
        },0);
    }
    
    
    function destroy() {
        $(window).unbind('resize', windowResize);
        header.destroy();
        content.remove();
        element.removeClass('fc fc-rtl ui-widget');
    }
    
    
    
    function elementVisible() {
        return _element.offsetWidth !== 0;
    }
    
    
    function bodyVisible() {
        return $('body')[0].offsetWidth !== 0;
    }
    
    
    
    /* View Rendering
    -----------------------------------------------------------------------------*/
    
    // TODO: improve view switching (still weird transition in IE, and FF has whiteout problem)
    
    function changeView(newViewName) {
        if (!currentView || newViewName != currentView.name) {
            ignoreWindowResize++; // because setMinHeight might change the height before render (and subsequently setSize) is reached

            unselect();
            
            var oldView = currentView;
            var newViewElement;
                
            if (oldView) {
                (oldView.beforeHide || noop)(); // called before changing min-height. if called after, scroll state is reset (in Opera)
                setMinHeight(content, content.height());
                oldView.element.hide();
            }else{
                setMinHeight(content, 1); // needs to be 1 (not 0) for IE7, or else view dimensions miscalculated
            }
            content.css('overflow', 'hidden');
            
            currentView = viewInstances[newViewName];
            if (currentView) {
                currentView.element.show();
            }else{
                currentView = viewInstances[newViewName] = new fcViews[newViewName](
                    newViewElement = absoluteViewElement =
                        $("<div class='fc-view fc-view-" + newViewName + "' style='position:absolute'/>")
                            .appendTo(content),
                    t // the calendar object
                );
            }
            
            if (oldView) {
                header.deactivateButton(oldView.name);
            }
            header.activateButton(newViewName);
            
            renderView(); // after height has been set, will make absoluteViewElement's position=relative, then set to null
            
            content.css('overflow', '');
            if (oldView) {
                setMinHeight(content, 1);
            }
            
            if (!newViewElement) {
                (currentView.afterShow || noop)(); // called after setting min-height/overflow, so in final scroll state (for Opera)
            }
            
            ignoreWindowResize--;
        }
    }
    
    
    
    function renderView(inc) {
        if (elementVisible()) {
            ignoreWindowResize++; // because renderEvents might temporarily change the height before setSize is reached

            unselect();
            
            if (suggestedViewHeight === undefined) {
                calcSize();
            }
            
            var forceEventRender = false;
            if (!currentView.start || inc || date < currentView.start || date >= currentView.end) {
                // view must render an entire new date range (and refetch/render events)
                currentView.render(date, inc || 0); // responsible for clearing events
                setSize(true);
                forceEventRender = true;
            }
            else if (currentView.sizeDirty) {
                // view must resize (and rerender events)
                currentView.clearEvents();
                setSize();
                forceEventRender = true;
            }
            else if (currentView.eventsDirty) {
                currentView.clearEvents();
                forceEventRender = true;
            }
            currentView.sizeDirty = false;
            currentView.eventsDirty = false;
            updateEvents(forceEventRender);
            
            elementOuterWidth = element.outerWidth();
            
            header.updateTitle(currentView.title);
            var today = new Date();
            if (today >= currentView.start && today < currentView.end) {
                header.disableButton('today');
            }else{
                header.enableButton('today');
            }
            
            ignoreWindowResize--;
            currentView.trigger('viewDisplay', _element);
        }
    }
    
    
    
    /* Resizing
    -----------------------------------------------------------------------------*/
    
    
    function updateSize() {
        markSizesDirty();
        if (elementVisible()) {
            calcSize();
            setSize();
            unselect();
            currentView.clearEvents();
            currentView.renderEvents(events);
            currentView.sizeDirty = false;
        }
    }
    
    
    function markSizesDirty() {
        $.each(viewInstances, function(i, inst) {
            inst.sizeDirty = true;
        });
    }
    
    
    function calcSize() {
        if (options.contentHeight) {
            suggestedViewHeight = options.contentHeight;
        }
        else if (options.height) {
            suggestedViewHeight = options.height - (headerElement ? headerElement.height() : 0) - vsides(content);
        }
        else {
            suggestedViewHeight = Math.round(content.width() / Math.max(options.aspectRatio, .5));
        }
    }
    
    
    function setSize(dateChanged) { // todo: dateChanged?
        ignoreWindowResize++;
        currentView.setHeight(suggestedViewHeight, dateChanged);
        if (absoluteViewElement) {
            absoluteViewElement.css('position', 'relative');
            absoluteViewElement = null;
        }
        currentView.setWidth(content.width(), dateChanged);
        ignoreWindowResize--;
    }
    
    
    function windowResize() {
        if (!ignoreWindowResize) {
            if (currentView.start) { // view has already been rendered
                var uid = ++resizeUID;
                setTimeout(function() { // add a delay
                    if (uid == resizeUID && !ignoreWindowResize && elementVisible()) {
                        if (elementOuterWidth != (elementOuterWidth = element.outerWidth())) {
                            ignoreWindowResize++; // in case the windowResize callback changes the height
                            updateSize();
                            currentView.trigger('windowResize', _element);
                            ignoreWindowResize--;
                        }
                    }
                }, 200);
            }else{
                // calendar must have been initialized in a 0x0 iframe that has just been resized
                lateRender();
            }
        }
    }
    
    
    
    /* Event Fetching/Rendering
    -----------------------------------------------------------------------------*/
    
    
    // fetches events if necessary, rerenders events if necessary (or if forced)
    function updateEvents(forceRender) {
        if (!options.lazyFetching || isFetchNeeded(currentView.visStart, currentView.visEnd)) {
            refetchEvents();
        }
        else if (forceRender) {
            rerenderEvents();
        }
    }
    
    
    function refetchEvents() {
        fetchEvents(currentView.visStart, currentView.visEnd); // will call reportEvents
    }
    
    
    // called when event data arrives
    function reportEvents(_events) {
        events = _events;
        rerenderEvents();
    }
    
    
    // called when a single event's data has been changed
    function reportEventChange(eventID) {
        rerenderEvents(eventID);
    }
    
    
    // attempts to rerenderEvents
    function rerenderEvents(modifiedEventID) {
        markEventsDirty();
        if (elementVisible()) {
            currentView.clearEvents();
            currentView.renderEvents(events, modifiedEventID);
            currentView.eventsDirty = false;
        }
    }
    
    
    function markEventsDirty() {
        $.each(viewInstances, function(i, inst) {
            inst.eventsDirty = true;
        });
    }
    


    /* Selection
    -----------------------------------------------------------------------------*/
    

    function select(start, end, allDay) {
        currentView.select(start, end, allDay===undefined ? true : allDay);
    }
    

    function unselect() { // safe to be called before renderView
        if (currentView) {
            currentView.unselect();
        }
    }
    
    
    
    /* Date
    -----------------------------------------------------------------------------*/
    
    
    function prev() {
        renderView(-1);
    }
    
    
    function next() {
        renderView(1);
    }
    
    
    function prevYear() {
        addYears(date, -1);
        renderView();
    }
    
    
    function nextYear() {
        addYears(date, 1);
        renderView();
    }
    
    
    function today() {
        date = new Date();
        renderView();
    }
    
    
    function gotoDate(year, month, dateOfMonth) {
        if (year instanceof Date) {
            date = cloneDate(year); // provided 1 argument, a Date
        }else{
            setYMD(date, year, month, dateOfMonth);
        }
        renderView();
    }
    
    
    function incrementDate(years, months, days) {
        if (years !== undefined) {
            addYears(date, years);
        }
        if (months !== undefined) {
            addMonths(date, months);
        }
        if (days !== undefined) {
            addDays(date, days);
        }
        renderView();
    }
    
    
    function getDate() {
        return cloneDate(date);
    }
    
    
    
    /* Misc
    -----------------------------------------------------------------------------*/
    
    
    function getView() {
        return currentView;
    }
    
    
    function option(name, value) {
        if (value === undefined) {
            return options[name];
        }
        if (name == 'height' || name == 'contentHeight' || name == 'aspectRatio') {
            options[name] = value;
            updateSize();
        }
    }
    
    
    function trigger(name, thisObj) {
        if (options[name]) {
            return options[name].apply(
                thisObj || _element,
                Array.prototype.slice.call(arguments, 2)
            );
        }
    }
    
    
    
    /* External Dragging
    ------------------------------------------------------------------------*/
    
    if (options.droppable) {
        $(document)
            .bind('dragstart', function(ev, ui) {
                var _e = ev.target;
                var e = $(_e);
                if (!e.parents('.fc').length) { // not already inside a calendar
                    var accept = options.dropAccept;
                    if ($.isFunction(accept) ? accept.call(_e, e) : e.is(accept)) {
                        _dragElement = _e;
                        currentView.dragStart(_dragElement, ev, ui);
                    }
                }
            })
            .bind('dragstop', function(ev, ui) {
                if (_dragElement) {
                    currentView.dragStop(_dragElement, ev, ui);
                    _dragElement = null;
                }
            });
    }
    

}

function Header(calendar, options) {
    var t = this;
    
    
    // exports
    t.render = render;
    t.destroy = destroy;
    t.updateTitle = updateTitle;
    t.activateButton = activateButton;
    t.deactivateButton = deactivateButton;
    t.disableButton = disableButton;
    t.enableButton = enableButton;
    
    
    // locals
    var element = $([]);
    var tm;
    


    function render() {
        tm = options.theme ? 'ui' : 'fc';
        var sections = options.header;
        if (sections) {
            element = $("<table class='fc-header' style='width:100%'/>")
                .append(
                    $("<tr/>")
                        .append(renderSection('left'))
                        .append(renderSection('center'))
                        .append(renderSection('right'))
                );
            return element;
        }
    }
    
    
    function destroy() {
        element.remove();
    }
    
    
    function renderSection(position) {
        var e = $("<td class='fc-header-" + position + "'/>");
        var buttonStr = options.header[position];
        if (buttonStr) {
            $.each(buttonStr.split(' '), function(i) {
                if (i > 0) {
                    e.append("<span class='fc-header-space'/>");
                }
                var prevButton;
                $.each(this.split(','), function(j, buttonName) {
                    if (buttonName == 'title') {
                        e.append("<span class='fc-header-title'><h2>&nbsp;</h2></span>");
                        if (prevButton) {
                            prevButton.addClass(tm + '-corner-right');
                        }
                        prevButton = null;
                    }else{
                        var buttonClick;
                        if (calendar[buttonName]) {
                            buttonClick = calendar[buttonName]; // calendar method
                        }
                        else if (fcViews[buttonName]) {
                            buttonClick = function() {
                                button.removeClass(tm + '-state-hover'); // forget why
                                calendar.changeView(buttonName);
                            };
                        }
                        if (buttonClick) {
                            var icon = options.theme ? smartProperty(options.buttonIcons, buttonName) : null; // why are we using smartProperty here?
                            var text = smartProperty(options.buttonText, buttonName); // why are we using smartProperty here?
                            var button = $(
                                "<span class='fc-button fc-button-" + buttonName + " " + tm + "-state-default'>" +
                                    "<span class='fc-button-inner'>" +
                                        "<span class='fc-button-content'>" +
                                            (icon ?
                                                "<span class='fc-icon-wrap'>" +
                                                    "<span class='ui-icon ui-icon-" + icon + "'/>" +
                                                "</span>" :
                                                text
                                                ) +
                                        "</span>" +
                                        "<span class='fc-button-effect'><span></span></span>" +
                                    "</span>" +
                                "</span>"
                            );
                            if (button) {
                                button
                                    .click(function() {
                                        if (!button.hasClass(tm + '-state-disabled')) {
                                            buttonClick();
                                        }
                                    })
                                    .mousedown(function() {
                                        button
                                            .not('.' + tm + '-state-active')
                                            .not('.' + tm + '-state-disabled')
                                            .addClass(tm + '-state-down');
                                    })
                                    .mouseup(function() {
                                        button.removeClass(tm + '-state-down');
                                    })
                                    .hover(
                                        function() {
                                            button
                                                .not('.' + tm + '-state-active')
                                                .not('.' + tm + '-state-disabled')
                                                .addClass(tm + '-state-hover');
                                        },
                                        function() {
                                            button
                                                .removeClass(tm + '-state-hover')
                                                .removeClass(tm + '-state-down');
                                        }
                                    )
                                    .appendTo(e);
                                if (!prevButton) {
                                    button.addClass(tm + '-corner-left');
                                }
                                prevButton = button;
                            }
                        }
                    }
                });
                if (prevButton) {
                    prevButton.addClass(tm + '-corner-right');
                }
            });
        }
        return e;
    }
    
    
    function updateTitle(html) {
        element.find('h2')
            .html(html);
    }
    
    
    function activateButton(buttonName) {
        element.find('span.fc-button-' + buttonName)
            .addClass(tm + '-state-active');
    }
    
    
    function deactivateButton(buttonName) {
        element.find('span.fc-button-' + buttonName)
            .removeClass(tm + '-state-active');
    }
    
    
    function disableButton(buttonName) {
        element.find('span.fc-button-' + buttonName)
            .addClass(tm + '-state-disabled');
    }
    
    
    function enableButton(buttonName) {
        element.find('span.fc-button-' + buttonName)
            .removeClass(tm + '-state-disabled');
    }


}

fc.sourceNormalizers = [];
fc.sourceFetchers = [];

var ajaxDefaults = {
    dataType: 'json',
    cache: false
};

var eventGUID = 1;


function EventManager(options, _sources) {
    var t = this;
    
    
    // exports
    t.isFetchNeeded = isFetchNeeded;
    t.fetchEvents = fetchEvents;
    t.addEventSource = addEventSource;
    t.removeEventSource = removeEventSource;
    t.updateEvent = updateEvent;
    t.renderEvent = renderEvent;
    t.removeEvents = removeEvents;
    t.clientEvents = clientEvents;
    t.normalizeEvent = normalizeEvent;
    
    
    // imports
    var trigger = t.trigger;
    var getView = t.getView;
    var reportEvents = t.reportEvents;
    
    
    // locals
    var stickySource = { events: [] };
    var sources = [ stickySource ];
    var rangeStart, rangeEnd;
    var currentFetchID = 0;
    var pendingSourceCnt = 0;
    var loadingLevel = 0;
    var cache = [];
    
    
    for (var i=0; i<_sources.length; i++) {
        _addEventSource(_sources[i]);
    }
    
    
    
    /* Fetching
    -----------------------------------------------------------------------------*/
    
    
    function isFetchNeeded(start, end) {
        return !rangeStart || start < rangeStart || end > rangeEnd;
    }
    
    
    function fetchEvents(start, end) {
        rangeStart = start;
        rangeEnd = end;
        cache = [];
        var fetchID = ++currentFetchID;
        var len = sources.length;
        pendingSourceCnt = len;
        for (var i=0; i<len; i++) {
            fetchEventSource(sources[i], fetchID);
        }
    }
    
    
    function fetchEventSource(source, fetchID) {
        _fetchEventSource(source, function(events) {
            if (fetchID == currentFetchID) {
                if (events) {
                    for (var i=0; i<events.length; i++) {
                        events[i].source = source;
                        normalizeEvent(events[i]);
                    }
                    cache = cache.concat(events);
                }
                pendingSourceCnt--;
                if (!pendingSourceCnt) {
                    reportEvents(cache);
                }
            }
        });
    }
    
    
    function _fetchEventSource(source, callback) {
        var i;
        var fetchers = fc.sourceFetchers;
        var res;
        for (i=0; i<fetchers.length; i++) {
            res = fetchers[i](source, rangeStart, rangeEnd, callback);
            if (res === true) {
                // the fetcher is in charge. made its own async request
                return;
            }
            else if (typeof res == 'object') {
                // the fetcher returned a new source. process it
                _fetchEventSource(res, callback);
                return;
            }
        }
        var events = source.events;
        if (events) {
            if ($.isFunction(events)) {
                pushLoading();
                events(cloneDate(rangeStart), cloneDate(rangeEnd), function(events) {
                    callback(events);
                    popLoading();
                });
            }
            else if ($.isArray(events)) {
                callback(events);
            }
            else {
                callback();
            }
        }else{
            var url = source.url;
            if (url) {
                var success = source.success;
                var error = source.error;
                var complete = source.complete;
                var data = $.extend({}, source.data || {});
                var startParam = firstDefined(source.startParam, options.startParam);
                var endParam = firstDefined(source.endParam, options.endParam);
                if (startParam) {
                    data[startParam] = Math.round(+rangeStart / 1000);
                }
                if (endParam) {
                    data[endParam] = Math.round(+rangeEnd / 1000);
                }
                pushLoading();
                $.ajax($.extend({}, ajaxDefaults, source, {
                    data: data,
                    success: function(events) {
                        events = events || [];
                        var res = applyAll(success, this, arguments);
                        if ($.isArray(res)) {
                            events = res;
                        }
                        callback(events);
                    },
                    error: function() {
                        applyAll(error, this, arguments);
                        callback();
                    },
                    complete: function() {
                        applyAll(complete, this, arguments);
                        popLoading();
                    }
                }));
            }else{
                callback();
            }
        }
    }
    
    
    
    /* Sources
    -----------------------------------------------------------------------------*/
    

    function addEventSource(source) {
        source = _addEventSource(source);
        if (source) {
            pendingSourceCnt++;
            fetchEventSource(source, currentFetchID); // will eventually call reportEvents
        }
    }
    
    
    function _addEventSource(source) {
        if ($.isFunction(source) || $.isArray(source)) {
            source = { events: source };
        }
        else if (typeof source == 'string') {
            source = { url: source };
        }
        if (typeof source == 'object') {
            normalizeSource(source);
            sources.push(source);
            return source;
        }
    }
    

    function removeEventSource(source) {
        sources = $.grep(sources, function(src) {
            return !isSourcesEqual(src, source);
        });
        // remove all client events from that source
        cache = $.grep(cache, function(e) {
            return !isSourcesEqual(e.source, source);
        });
        reportEvents(cache);
    }
    
    
    
    /* Manipulation
    -----------------------------------------------------------------------------*/
    
    
    function updateEvent(event) { // update an existing event
        var i, len = cache.length, e,
            defaultEventEnd = getView().defaultEventEnd, // getView???
            startDelta = event.start - event._start,
            endDelta = event.end ?
                (event.end - (event._end || defaultEventEnd(event))) // event._end would be null if event.end
                : 0;                                                      // was null and event was just resized
        for (i=0; i<len; i++) {
            e = cache[i];
            if (e._id == event._id && e != event) {
                e.start = new Date(+e.start + startDelta);
                if (event.end) {
                    if (e.end) {
                        e.end = new Date(+e.end + endDelta);
                    }else{
                        e.end = new Date(+defaultEventEnd(e) + endDelta);
                    }
                }else{
                    e.end = null;
                }
                e.title = event.title;
                e.url = event.url;
                e.allDay = event.allDay;
                e.className = event.className;
                e.editable = event.editable;
                e.color = event.color;
                e.backgroudColor = event.backgroudColor;
                e.borderColor = event.borderColor;
                e.textColor = event.textColor;
                normalizeEvent(e);
            }
        }
        normalizeEvent(event);
        reportEvents(cache);
    }
    
    
    function renderEvent(event, stick) {
        normalizeEvent(event);
        if (!event.source) {
            if (stick) {
                stickySource.events.push(event);
                event.source = stickySource;
            }
            cache.push(event);
        }
        reportEvents(cache);
    }
    
    
    function removeEvents(filter) {
        if (!filter) { // remove all
            cache = [];
            // clear all array sources
            for (var i=0; i<sources.length; i++) {
                if ($.isArray(sources[i].events)) {
                    sources[i].events = [];
                }
            }
        }else{
            if (!$.isFunction(filter)) { // an event ID
                var id = filter + '';
                filter = function(e) {
                    return e._id == id;
                };
            }
            cache = $.grep(cache, filter, true);
            // remove events from array sources
            for (var i=0; i<sources.length; i++) {
                if ($.isArray(sources[i].events)) {
                    sources[i].events = $.grep(sources[i].events, filter, true);
                }
            }
        }
        reportEvents(cache);
    }
    
    
    function clientEvents(filter) {
        if ($.isFunction(filter)) {
            return $.grep(cache, filter);
        }
        else if (filter) { // an event ID
            filter += '';
            return $.grep(cache, function(e) {
                return e._id == filter;
            });
        }
        return cache; // else, return all
    }
    
    
    
    /* Loading State
    -----------------------------------------------------------------------------*/
    
    
    function pushLoading() {
        if (!loadingLevel++) {
            trigger('loading', null, true);
        }
    }
    
    
    function popLoading() {
        if (!--loadingLevel) {
            trigger('loading', null, false);
        }
    }
    
    
    
    /* Event Normalization
    -----------------------------------------------------------------------------*/
    
    
    function normalizeEvent(event) {
        var source = event.source || {};
        var ignoreTimezone = firstDefined(source.ignoreTimezone, options.ignoreTimezone);
        event._id = event._id || (event.id === undefined ? '_fc' + eventGUID++ : event.id + '');
        if (event.date) {
            if (!event.start) {
                event.start = event.date;
            }
            delete event.date;
        }
        event._start = cloneDate(event.start = parseDate(event.start, ignoreTimezone));
        event.end = parseDate(event.end, ignoreTimezone);
        if (event.end && event.end <= event.start) {
            event.end = null;
        }
        event._end = event.end ? cloneDate(event.end) : null;
        if (event.allDay === undefined) {
            event.allDay = firstDefined(source.allDayDefault, options.allDayDefault);
        }
        if (event.className) {
            if (typeof event.className == 'string') {
                event.className = event.className.split(/\s+/);
            }
        }else{
            event.className = [];
        }
        // TODO: if there is no start date, return false to indicate an invalid event
    }
    
    
    
    /* Utils
    ------------------------------------------------------------------------------*/
    
    
    function normalizeSource(source) {
        if (source.className) {
            // TODO: repeat code, same code for event classNames
            if (typeof source.className == 'string') {
                source.className = source.className.split(/\s+/);
            }
        }else{
            source.className = [];
        }
        var normalizers = fc.sourceNormalizers;
        for (var i=0; i<normalizers.length; i++) {
            normalizers[i](source);
        }
    }
    
    
    function isSourcesEqual(source1, source2) {
        return source1 && source2 && getSourcePrimitive(source1) == getSourcePrimitive(source2);
    }
    
    
    function getSourcePrimitive(source) {
        return ((typeof source == 'object') ? (source.events || source.url) : '') || source;
    }


}


fc.addDays = addDays;
fc.cloneDate = cloneDate;
fc.parseDate = parseDate;
fc.parseISO8601 = parseISO8601;
fc.parseTime = parseTime;
fc.formatDate = formatDate;
fc.formatDates = formatDates;



/* Date Math
-----------------------------------------------------------------------------*/

var dayIDs = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    DAY_MS = 86400000,
    HOUR_MS = 3600000,
    MINUTE_MS = 60000;
    

function addYears(d, n, keepTime) {
    d.setFullYear(d.getFullYear() + n);
    if (!keepTime) {
        clearTime(d);
    }
    return d;
}


function addMonths(d, n, keepTime) { // prevents day overflow/underflow
    if (+d) { // prevent infinite looping on invalid dates
        var m = d.getMonth() + n,
            check = cloneDate(d);
        check.setDate(1);
        check.setMonth(m);
        d.setMonth(m);
        if (!keepTime) {
            clearTime(d);
        }
        while (d.getMonth() != check.getMonth()) {
            d.setDate(d.getDate() + (d < check ? 1 : -1));
        }
    }
    return d;
}


function addDays(d, n, keepTime) { // deals with daylight savings
    if (+d) {
        var dd = d.getDate() + n,
            check = cloneDate(d);
        check.setHours(9); // set to middle of day
        check.setDate(dd);
        d.setDate(dd);
        if (!keepTime) {
            clearTime(d);
        }
        fixDate(d, check);
    }
    return d;
}


function fixDate(d, check) { // force d to be on check's YMD, for daylight savings purposes
    if (+d) { // prevent infinite looping on invalid dates
        while (d.getDate() != check.getDate()) {
            d.setTime(+d + (d < check ? 1 : -1) * HOUR_MS);
        }
    }
}


function addMinutes(d, n) {
    d.setMinutes(d.getMinutes() + n);
    return d;
}


function clearTime(d) {
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0); 
    d.setMilliseconds(0);
    return d;
}


function cloneDate(d, dontKeepTime) {
    if (dontKeepTime) {
        return clearTime(new Date(+d));
    }
    return new Date(+d);
}


function zeroDate() { // returns a Date with time 00:00:00 and dateOfMonth=1
    var i=0, d;
    do {
        d = new Date(1970, i++, 1);
    } while (d.getHours()); // != 0
    return d;
}


function skipWeekend(date, inc, excl) {
    inc = inc || 1;
    while (!date.getDay() || (excl && date.getDay()==1 || !excl && date.getDay()==6)) {
        addDays(date, inc);
    }
    return date;
}


function dayDiff(d1, d2) { // d1 - d2
    return Math.round((cloneDate(d1, true) - cloneDate(d2, true)) / DAY_MS);
}


function setYMD(date, y, m, d) {
    if (y !== undefined && y != date.getFullYear()) {
        date.setDate(1);
        date.setMonth(0);
        date.setFullYear(y);
    }
    if (m !== undefined && m != date.getMonth()) {
        date.setDate(1);
        date.setMonth(m);
    }
    if (d !== undefined) {
        date.setDate(d);
    }
}



/* Date Parsing
-----------------------------------------------------------------------------*/


function parseDate(s, ignoreTimezone) { // ignoreTimezone defaults to true
    if (typeof s == 'object') { // already a Date object
        return s;
    }
    if (typeof s == 'number') { // a UNIX timestamp
        return new Date(s * 1000);
    }
    if (typeof s == 'string') {
        if (s.match(/^\d+(\.\d+)?$/)) { // a UNIX timestamp
            return new Date(parseFloat(s) * 1000);
        }
        if (ignoreTimezone === undefined) {
            ignoreTimezone = true;
        }
        return parseISO8601(s, ignoreTimezone) || (s ? new Date(s) : null);
    }
    // TODO: never return invalid dates (like from new Date(<string>)), return null instead
    return null;
}


function parseISO8601(s, ignoreTimezone) { // ignoreTimezone defaults to false
    // derived from http://delete.me.uk/2005/03/iso8601.html
    // TODO: for a know glitch/feature, read tests/issue_206_parseDate_dst.html
    var m = s.match(/^([0-9]{4})(-([0-9]{2})(-([0-9]{2})([T ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2})(:?([0-9]{2}))?))?)?)?)?$/);
    if (!m) {
        return null;
    }
    var date = new Date(m[1], 0, 1);
    if (ignoreTimezone || !m[13]) {
        var check = new Date(m[1], 0, 1, 9, 0);
        if (m[3]) {
            date.setMonth(m[3] - 1);
            check.setMonth(m[3] - 1);
        }
        if (m[5]) {
            date.setDate(m[5]);
            check.setDate(m[5]);
        }
        fixDate(date, check);
        if (m[7]) {
            date.setHours(m[7]);
        }
        if (m[8]) {
            date.setMinutes(m[8]);
        }
        if (m[10]) {
            date.setSeconds(m[10]);
        }
        if (m[12]) {
            date.setMilliseconds(Number("0." + m[12]) * 1000);
        }
        fixDate(date, check);
    }else{
        date.setUTCFullYear(
            m[1],
            m[3] ? m[3] - 1 : 0,
            m[5] || 1
        );
        date.setUTCHours(
            m[7] || 0,
            m[8] || 0,
            m[10] || 0,
            m[12] ? Number("0." + m[12]) * 1000 : 0
        );
        if (m[14]) {
            var offset = Number(m[16]) * 60 + (m[18] ? Number(m[18]) : 0);
            offset *= m[15] == '-' ? 1 : -1;
            date = new Date(+date + (offset * 60 * 1000));
        }
    }
    return date;
}


function parseTime(s) { // returns minutes since start of day
    if (typeof s == 'number') { // an hour
        return s * 60;
    }
    if (typeof s == 'object') { // a Date object
        return s.getHours() * 60 + s.getMinutes();
    }
    var m = s.match(/(\d+)(?::(\d+))?\s*(\w+)?/);
    if (m) {
        var h = parseInt(m[1], 10);
        if (m[3]) {
            h %= 12;
            if (m[3].toLowerCase().charAt(0) == 'p') {
                h += 12;
            }
        }
        return h * 60 + (m[2] ? parseInt(m[2], 10) : 0);
    }
}



/* Date Formatting
-----------------------------------------------------------------------------*/
// TODO: use same function formatDate(date, [date2], format, [options])


function formatDate(date, format, options) {
    return formatDates(date, null, format, options);
}


function formatDates(date1, date2, format, options) {
    options = options || defaults;
    var date = date1,
        otherDate = date2,
        i, len = format.length, c,
        i2, formatter,
        res = '';
    for (i=0; i<len; i++) {
        c = format.charAt(i);
        if (c == "'") {
            for (i2=i+1; i2<len; i2++) {
                if (format.charAt(i2) == "'") {
                    if (date) {
                        if (i2 == i+1) {
                            res += "'";
                        }else{
                            res += format.substring(i+1, i2);
                        }
                        i = i2;
                    }
                    break;
                }
            }
        }
        else if (c == '(') {
            for (i2=i+1; i2<len; i2++) {
                if (format.charAt(i2) == ')') {
                    var subres = formatDate(date, format.substring(i+1, i2), options);
                    if (parseInt(subres.replace(/\D/, ''), 10)) {
                        res += subres;
                    }
                    i = i2;
                    break;
                }
            }
        }
        else if (c == '[') {
            for (i2=i+1; i2<len; i2++) {
                if (format.charAt(i2) == ']') {
                    var subformat = format.substring(i+1, i2);
                    var subres = formatDate(date, subformat, options);
                    if (subres != formatDate(otherDate, subformat, options)) {
                        res += subres;
                    }
                    i = i2;
                    break;
                }
            }
        }
        else if (c == '{') {
            date = date2;
            otherDate = date1;
        }
        else if (c == '}') {
            date = date1;
            otherDate = date2;
        }
        else {
            for (i2=len; i2>i; i2--) {
                if (formatter = dateFormatters[format.substring(i, i2)]) {
                    if (date) {
                        res += formatter(date, options);
                    }
                    i = i2 - 1;
                    break;
                }
            }
            if (i2 == i) {
                if (date) {
                    res += c;
                }
            }
        }
    }
    return res;
};


var dateFormatters = {
    s   : function(d)   { return d.getSeconds() },
    ss  : function(d)   { return zeroPad(d.getSeconds()) },
    m   : function(d)   { return d.getMinutes() },
    mm  : function(d)   { return zeroPad(d.getMinutes()) },
    h   : function(d)   { return d.getHours() % 12 || 12 },
    hh  : function(d)   { return zeroPad(d.getHours() % 12 || 12) },
    H   : function(d)   { return d.getHours() },
    HH  : function(d)   { return zeroPad(d.getHours()) },
    d   : function(d)   { return d.getDate() },
    dd  : function(d)   { return zeroPad(d.getDate()) },
    ddd : function(d,o) { return o.dayNamesShort[d.getDay()] },
    dddd: function(d,o) { return o.dayNames[d.getDay()] },
    M   : function(d)   { return d.getMonth() + 1 },
    MM  : function(d)   { return zeroPad(d.getMonth() + 1) },
    MMM : function(d,o) { return o.monthNamesShort[d.getMonth()] },
    MMMM: function(d,o) { return o.monthNames[d.getMonth()] },
    yy  : function(d)   { return (d.getFullYear()+'').substring(2) },
    yyyy: function(d)   { return d.getFullYear() },
    t   : function(d)   { return d.getHours() < 12 ? 'a' : 'p' },
    tt  : function(d)   { return d.getHours() < 12 ? 'am' : 'pm' },
    T   : function(d)   { return d.getHours() < 12 ? 'A' : 'P' },
    TT  : function(d)   { return d.getHours() < 12 ? 'AM' : 'PM' },
    u   : function(d)   { return formatDate(d, "yyyy-MM-dd'T'HH:mm:ss'Z'") },
    S   : function(d)   {
        var date = d.getDate();
        if (date > 10 && date < 20) {
            return 'th';
        }
        return ['st', 'nd', 'rd'][date%10-1] || 'th';
    }
};



fc.applyAll = applyAll;


/* Event Date Math
-----------------------------------------------------------------------------*/


function exclEndDay(event) {
    if (event.end) {
        return _exclEndDay(event.end, event.allDay);
    }else{
        return addDays(cloneDate(event.start), 1);
    }
}


function _exclEndDay(end, allDay) {
    end = cloneDate(end);
    return allDay || end.getHours() || end.getMinutes() ? addDays(end, 1) : clearTime(end);
}


function segCmp(a, b) {
    return (b.msLength - a.msLength) * 100 + (a.event.start - b.event.start);
}


function segsCollide(seg1, seg2) {
    return seg1.end > seg2.start && seg1.start < seg2.end;
}



/* Event Sorting
-----------------------------------------------------------------------------*/


// event rendering utilities
function sliceSegs(events, visEventEnds, start, end) {
    var segs = [],
        i, len=events.length, event,
        eventStart, eventEnd,
        segStart, segEnd,
        isStart, isEnd;
    for (i=0; i<len; i++) {
        event = events[i];
        eventStart = event.start;
        eventEnd = visEventEnds[i];
        if (eventEnd > start && eventStart < end) {
            if (eventStart < start) {
                segStart = cloneDate(start);
                isStart = false;
            }else{
                segStart = eventStart;
                isStart = true;
            }
            if (eventEnd > end) {
                segEnd = cloneDate(end);
                isEnd = false;
            }else{
                segEnd = eventEnd;
                isEnd = true;
            }
            segs.push({
                event: event,
                start: segStart,
                end: segEnd,
                isStart: isStart,
                isEnd: isEnd,
                msLength: segEnd - segStart
            });
        }
    }
    return segs.sort(segCmp);
}


// event rendering calculation utilities
function stackSegs(segs) {
    var levels = [],
        i, len = segs.length, seg,
        j, collide, k;
    for (i=0; i<len; i++) {
        seg = segs[i];
        j = 0; // the level index where seg should belong
        while (true) {
            collide = false;
            if (levels[j]) {
                for (k=0; k<levels[j].length; k++) {
                    if (segsCollide(levels[j][k], seg)) {
                        collide = true;
                        break;
                    }
                }
            }
            if (collide) {
                j++;
            }else{
                break;
            }
        }
        if (levels[j]) {
            levels[j].push(seg);
        }else{
            levels[j] = [seg];
        }
    }
    return levels;
}



/* Event Element Binding
-----------------------------------------------------------------------------*/


function lazySegBind(container, segs, bindHandlers) {
    container.unbind('mouseover').mouseover(function(ev) {
        var parent=ev.target, e,
            i, seg;
        while (parent != this) {
            e = parent;
            parent = parent.parentNode;
        }
        if ((i = e._fci) !== undefined) {
            e._fci = undefined;
            seg = segs[i];
            bindHandlers(seg.event, seg.element, seg);
            $(ev.target).trigger(ev);
        }
        ev.stopPropagation();
    });
}



/* Element Dimensions
-----------------------------------------------------------------------------*/


function setOuterWidth(element, width, includeMargins) {
    for (var i=0, e; i<element.length; i++) {
        e = $(element[i]);
        e.width(Math.max(0, width - hsides(e, includeMargins)));
    }
}


function setOuterHeight(element, height, includeMargins) {
    for (var i=0, e; i<element.length; i++) {
        e = $(element[i]);
        e.height(Math.max(0, height - vsides(e, includeMargins)));
    }
}


function hsides(element, includeMargins) {
    return hpadding(element) + hborders(element) + (includeMargins ? hmargins(element) : 0);
}


function hpadding(element) {
    return (parseFloat($.css(element[0], 'paddingLeft', true)) || 0) +
           (parseFloat($.css(element[0], 'paddingRight', true)) || 0);
}


function hmargins(element) {
    return (parseFloat($.css(element[0], 'marginLeft', true)) || 0) +
           (parseFloat($.css(element[0], 'marginRight', true)) || 0);
}


function hborders(element) {
    return (parseFloat($.css(element[0], 'borderLeftWidth', true)) || 0) +
           (parseFloat($.css(element[0], 'borderRightWidth', true)) || 0);
}


function vsides(element, includeMargins) {
    return vpadding(element) +  vborders(element) + (includeMargins ? vmargins(element) : 0);
}


function vpadding(element) {
    return (parseFloat($.css(element[0], 'paddingTop', true)) || 0) +
           (parseFloat($.css(element[0], 'paddingBottom', true)) || 0);
}


function vmargins(element) {
    return (parseFloat($.css(element[0], 'marginTop', true)) || 0) +
           (parseFloat($.css(element[0], 'marginBottom', true)) || 0);
}


function vborders(element) {
    return (parseFloat($.css(element[0], 'borderTopWidth', true)) || 0) +
           (parseFloat($.css(element[0], 'borderBottomWidth', true)) || 0);
}


function setMinHeight(element, height) {
    height = (typeof height == 'number' ? height + 'px' : height);
    element.each(function(i, _element) {
        _element.style.cssText += ';min-height:' + height + ';_height:' + height;
        // why can't we just use .css() ? i forget
    });
}



/* Misc Utils
-----------------------------------------------------------------------------*/


//TODO: arraySlice
//TODO: isFunction, grep ?


function noop() { }


function cmp(a, b) {
    return a - b;
}


function arrayMax(a) {
    return Math.max.apply(Math, a);
}


function zeroPad(n) {
    return (n < 10 ? '0' : '') + n;
}


function smartProperty(obj, name) { // get a camel-cased/namespaced property of an object
    if (obj[name] !== undefined) {
        return obj[name];
    }
    var parts = name.split(/(?=[A-Z])/),
        i=parts.length-1, res;
    for (; i>=0; i--) {
        res = obj[parts[i].toLowerCase()];
        if (res !== undefined) {
            return res;
        }
    }
    return obj[''];
}


function htmlEscape(s) {
    return s.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#039;')
        .replace(/"/g, '&quot;')
        .replace(/\n/g, '<br />');
}


function cssKey(_element) {
    return _element.id + '/' + _element.className + '/' + _element.style.cssText.replace(/(^|;)\s*(top|left|width|height)\s*:[^;]*/ig, '');
}


function disableTextSelection(element) {
    element
        .attr('unselectable', 'on')
        .css('MozUserSelect', 'none')
        .bind('selectstart.ui', function() { return false; });
}


/*
function enableTextSelection(element) {
    element
        .attr('unselectable', 'off')
        .css('MozUserSelect', '')
        .unbind('selectstart.ui');
}
*/


function markFirstLast(e) {
    e.children()
        .removeClass('fc-first fc-last')
        .filter(':first-child')
            .addClass('fc-first')
        .end()
        .filter(':last-child')
            .addClass('fc-last');
}


function setDayID(cell, date) {
    cell.each(function(i, _cell) {
        _cell.className = _cell.className.replace(/^fc-\w*/, 'fc-' + dayIDs[date.getDay()]);
        // TODO: make a way that doesn't rely on order of classes
    });
}


function getSkinCss(event, opt) {
    var source = event.source || {};
    var eventColor = event.color;
    var sourceColor = source.color;
    var optionColor = opt('eventColor');
    var backgroundColor =
        event.backgroundColor ||
        eventColor ||
        source.backgroundColor ||
        sourceColor ||
        opt('eventBackgroundColor') ||
        optionColor;
    var borderColor =
        event.borderColor ||
        eventColor ||
        source.borderColor ||
        sourceColor ||
        opt('eventBorderColor') ||
        optionColor;
    var textColor =
        event.textColor ||
        source.textColor ||
        opt('eventTextColor');
    var statements = [];
    if (backgroundColor) {
        statements.push('background-color:' + backgroundColor);
    }
    if (borderColor) {
        statements.push('border-color:' + borderColor);
    }
    if (textColor) {
        statements.push('color:' + textColor);
    }
    return statements.join(';');
}


function applyAll(functions, thisObj, args) {
    if ($.isFunction(functions)) {
        functions = [ functions ];
    }
    if (functions) {
        var i;
        var ret;
        for (i=0; i<functions.length; i++) {
            ret = functions[i].apply(thisObj, args) || ret;
        }
        return ret;
    }
}


function firstDefined() {
    for (var i=0; i<arguments.length; i++) {
        if (arguments[i] !== undefined) {
            return arguments[i];
        }
    }
}


fcViews.month = MonthView;

function MonthView(element, calendar) {
    var t = this;
    
    
    // exports
    t.render = render;
    
    
    // imports
    BasicView.call(t, element, calendar, 'month');
    var opt = t.opt;
    var renderBasic = t.renderBasic;
    var formatDate = calendar.formatDate;
    
    
    
    function render(date, delta) {
        if (delta) {
            addMonths(date, delta);
            date.setDate(1);
        }
        var start = cloneDate(date, true);
        start.setDate(1);
        var end = addMonths(cloneDate(start), 1);
        var visStart = cloneDate(start);
        var visEnd = cloneDate(end);
        var firstDay = opt('firstDay');
        var nwe = opt('weekends') ? 0 : 1;
        if (nwe) {
            skipWeekend(visStart);
            skipWeekend(visEnd, -1, true);
        }
        addDays(visStart, -((visStart.getDay() - Math.max(firstDay, nwe) + 7) % 7));
        addDays(visEnd, (7 - visEnd.getDay() + Math.max(firstDay, nwe)) % 7);
        var rowCnt = Math.round((visEnd - visStart) / (DAY_MS * 7));
        if (opt('weekMode') == 'fixed') {
            addDays(visEnd, (6 - rowCnt) * 7);
            rowCnt = 6;
        }
        t.title = formatDate(start, opt('titleFormat'));
        t.start = start;
        t.end = end;
        t.visStart = visStart;
        t.visEnd = visEnd;
        renderBasic(6, rowCnt, nwe ? 5 : 7, true);
    }
    
    
}

fcViews.basicWeek = BasicWeekView;

function BasicWeekView(element, calendar) {
    var t = this;
    
    
    // exports
    t.render = render;
    
    
    // imports
    BasicView.call(t, element, calendar, 'basicWeek');
    var opt = t.opt;
    var renderBasic = t.renderBasic;
    var formatDates = calendar.formatDates;
    
    
    
    function render(date, delta) {
        if (delta) {
            addDays(date, delta * 7);
        }
        var start = addDays(cloneDate(date), -((date.getDay() - opt('firstDay') + 7) % 7));
        var end = addDays(cloneDate(start), 7);
        var visStart = cloneDate(start);
        var visEnd = cloneDate(end);
        var weekends = opt('weekends');
        if (!weekends) {
            skipWeekend(visStart);
            skipWeekend(visEnd, -1, true);
        }
        t.title = formatDates(
            visStart,
            addDays(cloneDate(visEnd), -1),
            opt('titleFormat')
        );
        t.start = start;
        t.end = end;
        t.visStart = visStart;
        t.visEnd = visEnd;
        renderBasic(1, 1, weekends ? 7 : 5, false);
    }
    
    
}

fcViews.basicDay = BasicDayView;

//TODO: when calendar's date starts out on a weekend, shouldn't happen


function BasicDayView(element, calendar) {
    var t = this;
    
    
    // exports
    t.render = render;
    
    
    // imports
    BasicView.call(t, element, calendar, 'basicDay');
    var opt = t.opt;
    var renderBasic = t.renderBasic;
    var formatDate = calendar.formatDate;
    
    
    
    function render(date, delta) {
        if (delta) {
            addDays(date, delta);
            if (!opt('weekends')) {
                skipWeekend(date, delta < 0 ? -1 : 1);
            }
        }
        t.title = formatDate(date, opt('titleFormat'));
        t.start = t.visStart = cloneDate(date, true);
        t.end = t.visEnd = addDays(cloneDate(t.start), 1);
        renderBasic(1, 1, 1, false);
    }
    
    
}

setDefaults({
    weekMode: 'fixed'
});


function BasicView(element, calendar, viewName) {
    var t = this;
    
    
    // exports
    t.renderBasic = renderBasic;
    t.setHeight = setHeight;
    t.setWidth = setWidth;
    t.renderDayOverlay = renderDayOverlay;
    t.defaultSelectionEnd = defaultSelectionEnd;
    t.renderSelection = renderSelection;
    t.clearSelection = clearSelection;
    t.reportDayClick = reportDayClick; // for selection (kinda hacky)
    t.dragStart = dragStart;
    t.dragStop = dragStop;
    t.defaultEventEnd = defaultEventEnd;
    t.getHoverListener = function() { return hoverListener };
    t.colContentLeft = colContentLeft;
    t.colContentRight = colContentRight;
    t.dayOfWeekCol = dayOfWeekCol;
    t.dateCell = dateCell;
    t.cellDate = cellDate;
    t.cellIsAllDay = function() { return true };
    t.allDayRow = allDayRow;
    t.allDayBounds = allDayBounds;
    t.getRowCnt = function() { return rowCnt };
    t.getColCnt = function() { return colCnt };
    t.getColWidth = function() { return colWidth };
    t.getDaySegmentContainer = function() { return daySegmentContainer };
    
    
    // imports
    View.call(t, element, calendar, viewName);
    OverlayManager.call(t);
    SelectionManager.call(t);
    BasicEventRenderer.call(t);
    var opt = t.opt;
    var trigger = t.trigger;
    var clearEvents = t.clearEvents;
    var renderOverlay = t.renderOverlay;
    var clearOverlays = t.clearOverlays;
    var daySelectionMousedown = t.daySelectionMousedown;
    var formatDate = calendar.formatDate;
    
    
    // locals
    
    var head;
    var headCells;
    var body;
    var bodyRows;
    var bodyCells;
    var bodyFirstCells;
    var bodyCellTopInners;
    var daySegmentContainer;
    
    var viewWidth;
    var viewHeight;
    var colWidth;
    
    var rowCnt, colCnt;
    var coordinateGrid;
    var hoverListener;
    var colContentPositions;
    
    var rtl, dis, dit;
    var firstDay;
    var nwe;
    var tm;
    var colFormat;
    
    
    
    /* Rendering
    ------------------------------------------------------------*/
    
    
    disableTextSelection(element.addClass('fc-grid'));
    
    
    function renderBasic(maxr, r, c, showNumbers) {
        rowCnt = r;
        colCnt = c;
        updateOptions();
        var firstTime = !body;
        if (firstTime) {
            buildSkeleton(maxr, showNumbers);
        }else{
            clearEvents();
        }
        updateCells(firstTime);
    }
    
    
    
    function updateOptions() {
        rtl = opt('isRTL');
        if (rtl) {
            dis = -1;
            dit = colCnt - 1;
        }else{
            dis = 1;
            dit = 0;
        }
        firstDay = opt('firstDay');
        nwe = opt('weekends') ? 0 : 1;
        tm = opt('theme') ? 'ui' : 'fc';
        colFormat = opt('columnFormat');
    }
    
    
    
    function buildSkeleton(maxRowCnt, showNumbers) {
        var s;
        var headerClass = tm + "-widget-header";
        var contentClass = tm + "-widget-content";
        var i, j;
        var table;
        
        s =
            "<table class='fc-border-separate' style='width:100%' cellspacing='0'>" +
            "<thead>" +
            "<tr>";
        for (i=0; i<colCnt; i++) {
            s +=
                "<th class='fc- " + headerClass + "'/>"; // need fc- for setDayID
        }
        s +=
            "</tr>" +
            "</thead>" +
            "<tbody>";
        for (i=0; i<maxRowCnt; i++) {
            s +=
                "<tr class='fc-week" + i + "'>";
            for (j=0; j<colCnt; j++) {
                s +=
                    "<td class='fc- " + contentClass + " fc-day" + (i*colCnt+j) + "'>" + // need fc- for setDayID
                    "<div>" +
                    (showNumbers ?
                        "<div class='fc-day-number'/>" :
                        ''
                        ) +
                    "<div class='fc-day-content'>" +
                    "<div style='position:relative'>&nbsp;</div>" +
                    "</div>" +
                    "</div>" +
                    "</td>";
            }
            s +=
                "</tr>";
        }
        s +=
            "</tbody>" +
            "</table>";
        table = $(s).appendTo(element);
        
        head = table.find('thead');
        headCells = head.find('th');
        body = table.find('tbody');
        bodyRows = body.find('tr');
        bodyCells = body.find('td');
        bodyFirstCells = bodyCells.filter(':first-child');
        bodyCellTopInners = bodyRows.eq(0).find('div.fc-day-content div');
        
        markFirstLast(head.add(head.find('tr'))); // marks first+last tr/th's
        markFirstLast(bodyRows); // marks first+last td's
        bodyRows.eq(0).addClass('fc-first'); // fc-last is done in updateCells
        
        dayBind(bodyCells);
        
        daySegmentContainer =
            $("<div style='position:absolute;z-index:8;top:0;left:0'/>")
                .appendTo(element);
    }
    
    
    
    function updateCells(firstTime) {
        var dowDirty = firstTime || rowCnt == 1; // could the cells' day-of-weeks need updating?
        var month = t.start.getMonth();
        var today = clearTime(new Date());
        var cell;
        var date;
        var row;
    
        if (dowDirty) {
            headCells.each(function(i, _cell) {
                cell = $(_cell);
                date = indexDate(i);
                cell.html(formatDate(date, colFormat));
                setDayID(cell, date);
            });
        }
        
        bodyCells.each(function(i, _cell) {
            cell = $(_cell);
            date = indexDate(i);
            if (date.getMonth() == month) {
                cell.removeClass('fc-other-month');
            }else{
                cell.addClass('fc-other-month');
            }
            if (+date == +today) {
                cell.addClass(tm + '-state-highlight fc-today');
            }else{
                cell.removeClass(tm + '-state-highlight fc-today');
            }
            cell.find('div.fc-day-number').text(date.getDate());
            if (dowDirty) {
                setDayID(cell, date);
            }
        });
        
        bodyRows.each(function(i, _row) {
            row = $(_row);
            if (i < rowCnt) {
                row.show();
                if (i == rowCnt-1) {
                    row.addClass('fc-last');
                }else{
                    row.removeClass('fc-last');
                }
            }else{
                row.hide();
            }
        });
    }
    
    
    
    function setHeight(height) {
        viewHeight = height;
        
        var bodyHeight = viewHeight - head.height();
        var rowHeight;
        var rowHeightLast;
        var cell;
            
        if (opt('weekMode') == 'variable') {
            rowHeight = rowHeightLast = Math.floor(bodyHeight / (rowCnt==1 ? 2 : 6));
        }else{
            rowHeight = Math.floor(bodyHeight / rowCnt);
            rowHeightLast = bodyHeight - rowHeight * (rowCnt-1);
        }
        
        bodyFirstCells.each(function(i, _cell) {
            if (i < rowCnt) {
                cell = $(_cell);
                setMinHeight(
                    cell.find('> div'),
                    (i==rowCnt-1 ? rowHeightLast : rowHeight) - vsides(cell)
                );
            }
        });
        
    }
    
    
    function setWidth(width) {
        viewWidth = width;
        colContentPositions.clear();
        colWidth = Math.floor(viewWidth / colCnt);
        setOuterWidth(headCells.slice(0, -1), colWidth);
    }
    
    
    
    /* Day clicking and binding
    -----------------------------------------------------------*/
    
    
    function dayBind(days) {
        days.click(dayClick)
            .mousedown(daySelectionMousedown);
    }
    
    
    function dayClick(ev) {
        if (!opt('selectable')) { // if selectable, SelectionManager will worry about dayClick
            var index = parseInt(this.className.match(/fc\-day(\d+)/)[1]); // TODO: maybe use .data
            var date = indexDate(index);
            trigger('dayClick', this, date, true, ev);
        }
    }
    
    
    
    /* Semi-transparent Overlay Helpers
    ------------------------------------------------------*/
    
    
    function renderDayOverlay(overlayStart, overlayEnd, refreshCoordinateGrid) { // overlayEnd is exclusive
        if (refreshCoordinateGrid) {
            coordinateGrid.build();
        }
        var rowStart = cloneDate(t.visStart);
        var rowEnd = addDays(cloneDate(rowStart), colCnt);
        for (var i=0; i<rowCnt; i++) {
            var stretchStart = new Date(Math.max(rowStart, overlayStart));
            var stretchEnd = new Date(Math.min(rowEnd, overlayEnd));
            if (stretchStart < stretchEnd) {
                var colStart, colEnd;
                if (rtl) {
                    colStart = dayDiff(stretchEnd, rowStart)*dis+dit+1;
                    colEnd = dayDiff(stretchStart, rowStart)*dis+dit+1;
                }else{
                    colStart = dayDiff(stretchStart, rowStart);
                    colEnd = dayDiff(stretchEnd, rowStart);
                }
                dayBind(
                    renderCellOverlay(i, colStart, i, colEnd-1)
                );
            }
            addDays(rowStart, 7);
            addDays(rowEnd, 7);
        }
    }
    
    
    function renderCellOverlay(row0, col0, row1, col1) { // row1,col1 is inclusive
        var rect = coordinateGrid.rect(row0, col0, row1, col1, element);
        return renderOverlay(rect, element);
    }
    
    
    
    /* Selection
    -----------------------------------------------------------------------*/
    
    
    function defaultSelectionEnd(startDate, allDay) {
        return cloneDate(startDate);
    }
    
    
    function renderSelection(startDate, endDate, allDay) {
        renderDayOverlay(startDate, addDays(cloneDate(endDate), 1), true); // rebuild every time???
    }
    
    
    function clearSelection() {
        clearOverlays();
    }
    
    
    function reportDayClick(date, allDay, ev) {
        var cell = dateCell(date);
        var _element = bodyCells[cell.row*colCnt + cell.col];
        trigger('dayClick', _element, date, allDay, ev);
    }
    
    
    
    /* External Dragging
    -----------------------------------------------------------------------*/
    
    
    function dragStart(_dragElement, ev, ui) {
        hoverListener.start(function(cell) {
            clearOverlays();
            if (cell) {
                renderCellOverlay(cell.row, cell.col, cell.row, cell.col);
            }
        }, ev);
    }
    
    
    function dragStop(_dragElement, ev, ui) {
        var cell = hoverListener.stop();
        clearOverlays();
        if (cell) {
            var d = cellDate(cell);
            trigger('drop', _dragElement, d, true, ev, ui);
        }
    }
    
    
    
    /* Utilities
    --------------------------------------------------------*/
    
    
    function defaultEventEnd(event) {
        return cloneDate(event.start);
    }
    
    
    coordinateGrid = new CoordinateGrid(function(rows, cols) {
        var e, n, p;
        headCells.each(function(i, _e) {
            e = $(_e);
            n = e.offset().left;
            if (i) {
                p[1] = n;
            }
            p = [n];
            cols[i] = p;
        });
        p[1] = n + e.outerWidth();
        bodyRows.each(function(i, _e) {
            if (i < rowCnt) {
                e = $(_e);
                n = e.offset().top;
                if (i) {
                    p[1] = n;
                }
                p = [n];
                rows[i] = p;
            }
        });
        p[1] = n + e.outerHeight();
    });
    
    
    hoverListener = new HoverListener(coordinateGrid);
    
    
    colContentPositions = new HorizontalPositionCache(function(col) {
        return bodyCellTopInners.eq(col);
    });
    
    
    function colContentLeft(col) {
        return colContentPositions.left(col);
    }
    
    
    function colContentRight(col) {
        return colContentPositions.right(col);
    }
    
    
    
    
    function dateCell(date) {
        return {
            row: Math.floor(dayDiff(date, t.visStart) / 7),
            col: dayOfWeekCol(date.getDay())
        };
    }
    
    
    function cellDate(cell) {
        return _cellDate(cell.row, cell.col);
    }
    
    
    function _cellDate(row, col) {
        return addDays(cloneDate(t.visStart), row*7 + col*dis+dit);
        // what about weekends in middle of week?
    }
    
    
    function indexDate(index) {
        return _cellDate(Math.floor(index/colCnt), index%colCnt);
    }
    
    
    function dayOfWeekCol(dayOfWeek) {
        return ((dayOfWeek - Math.max(firstDay, nwe) + colCnt) % colCnt) * dis + dit;
    }
    
    
    
    
    function allDayRow(i) {
        return bodyRows.eq(i);
    }
    
    
    function allDayBounds(i) {
        return {
            left: 0,
            right: viewWidth
        };
    }
    
    
}

function BasicEventRenderer() {
    var t = this;
    
    
    // exports
    t.renderEvents = renderEvents;
    t.compileDaySegs = compileSegs; // for DayEventRenderer
    t.clearEvents = clearEvents;
    t.bindDaySeg = bindDaySeg;
    
    
    // imports
    DayEventRenderer.call(t);
    var opt = t.opt;
    var trigger = t.trigger;
    //var setOverflowHidden = t.setOverflowHidden;
    var isEventDraggable = t.isEventDraggable;
    var isEventResizable = t.isEventResizable;
    var reportEvents = t.reportEvents;
    var reportEventClear = t.reportEventClear;
    var eventElementHandlers = t.eventElementHandlers;
    var showEvents = t.showEvents;
    var hideEvents = t.hideEvents;
    var eventDrop = t.eventDrop;
    var getDaySegmentContainer = t.getDaySegmentContainer;
    var getHoverListener = t.getHoverListener;
    var renderDayOverlay = t.renderDayOverlay;
    var clearOverlays = t.clearOverlays;
    var getRowCnt = t.getRowCnt;
    var getColCnt = t.getColCnt;
    var renderDaySegs = t.renderDaySegs;
    var resizableDayEvent = t.resizableDayEvent;
    
    
    
    /* Rendering
    --------------------------------------------------------------------*/
    
    
    function renderEvents(events, modifiedEventId) {
        reportEvents(events);
        renderDaySegs(compileSegs(events), modifiedEventId);
    }
    
    
    function clearEvents() {
        reportEventClear();
        getDaySegmentContainer().empty();
    }
    
    
    function compileSegs(events) {
        var rowCnt = getRowCnt(),
            colCnt = getColCnt(),
            d1 = cloneDate(t.visStart),
            d2 = addDays(cloneDate(d1), colCnt),
            visEventsEnds = $.map(events, exclEndDay),
            i, row,
            j, level,
            k, seg,
            segs=[];
        for (i=0; i<rowCnt; i++) {
            row = stackSegs(sliceSegs(events, visEventsEnds, d1, d2));
            for (j=0; j<row.length; j++) {
                level = row[j];
                for (k=0; k<level.length; k++) {
                    seg = level[k];
                    seg.row = i;
                    seg.level = j; // not needed anymore
                    segs.push(seg);
                }
            }
            addDays(d1, 7);
            addDays(d2, 7);
        }
        return segs;
    }
    
    
    function bindDaySeg(event, eventElement, seg) {
        if (isEventDraggable(event)) {
            draggableDayEvent(event, eventElement);
        }
        if (seg.isEnd && isEventResizable(event)) {
            resizableDayEvent(event, eventElement, seg);
        }
        eventElementHandlers(event, eventElement);
            // needs to be after, because resizableDayEvent might stopImmediatePropagation on click
    }
    
    
    
    /* Dragging
    ----------------------------------------------------------------------------*/
    
    
    function draggableDayEvent(event, eventElement) {
        var hoverListener = getHoverListener();
        var dayDelta;
        eventElement.draggable({
            zIndex: 9,
            delay: 50,
            opacity: opt('dragOpacity'),
            revertDuration: opt('dragRevertDuration'),
            start: function(ev, ui) {
                trigger('eventDragStart', eventElement, event, ev, ui);
                hideEvents(event, eventElement);
                hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
                    eventElement.draggable('option', 'revert', !cell || !rowDelta && !colDelta);
                    clearOverlays();
                    if (cell) {
                        //setOverflowHidden(true);
                        dayDelta = rowDelta*7 + colDelta * (opt('isRTL') ? -1 : 1);
                        renderDayOverlay(
                            addDays(cloneDate(event.start), dayDelta),
                            addDays(exclEndDay(event), dayDelta)
                        );
                    }else{
                        //setOverflowHidden(false);
                        dayDelta = 0;
                    }
                }, ev, 'drag');
            },
            stop: function(ev, ui) {
                hoverListener.stop();
                clearOverlays();
                trigger('eventDragStop', eventElement, event, ev, ui);
                if (dayDelta) {
                    eventDrop(this, event, dayDelta, 0, event.allDay, ev, ui);
                }else{
                    eventElement.css('filter', ''); // clear IE opacity side-effects
                    showEvents(event, eventElement);
                }
                //setOverflowHidden(false);
            }
        });
    }


}

fcViews.agendaWeek = AgendaWeekView;

function AgendaWeekView(element, calendar) {
    var t = this;
    
    
    // exports
    t.render = render;
    
    
    // imports
    AgendaView.call(t, element, calendar, 'agendaWeek');
    var opt = t.opt;
    var renderAgenda = t.renderAgenda;
    var formatDates = calendar.formatDates;
    
    
    
    function render(date, delta) {
        if (delta) {
            addDays(date, delta * 7);
        }
        var start = addDays(cloneDate(date), -((date.getDay() - opt('firstDay') + 7) % 7));
        var end = addDays(cloneDate(start), 7);
        var visStart = cloneDate(start);
        var visEnd = cloneDate(end);
        var weekends = opt('weekends');
        if (!weekends) {
            skipWeekend(visStart);
            skipWeekend(visEnd, -1, true);
        }
        t.title = formatDates(
            visStart,
            addDays(cloneDate(visEnd), -1),
            opt('titleFormat')
        );
        t.start = start;
        t.end = end;
        t.visStart = visStart;
        t.visEnd = visEnd;
        renderAgenda(weekends ? 7 : 5);
    }
    

}

fcViews.agendaDay = AgendaDayView;

function AgendaDayView(element, calendar) {
    var t = this;
    
    
    // exports
    t.render = render;
    
    
    // imports
    AgendaView.call(t, element, calendar, 'agendaDay');
    var opt = t.opt;
    var renderAgenda = t.renderAgenda;
    var formatDate = calendar.formatDate;
    
    
    
    function render(date, delta) {
        if (delta) {
            addDays(date, delta);
            if (!opt('weekends')) {
                skipWeekend(date, delta < 0 ? -1 : 1);
            }
        }
        var start = cloneDate(date, true);
        var end = addDays(cloneDate(start), 1);
        t.title = formatDate(date, opt('titleFormat'));
        t.start = t.visStart = start;
        t.end = t.visEnd = end;
        renderAgenda(1);
    }
    

}

setDefaults({
    allDaySlot: true,
    allDayText: 'all-day',
    firstHour: 6,
    slotMinutes: 30,
    defaultEventMinutes: 120,
    axisFormat: 'h(:mm)tt',
    timeFormat: {
        agenda: 'h:mm{ - h:mm}'
    },
    dragOpacity: {
        agenda: .5
    },
    minTime: 0,
    maxTime: 24
});


// TODO: make it work in quirks mode (event corners, all-day height)
// TODO: test liquid width, especially in IE6


function AgendaView(element, calendar, viewName) {
    var t = this;
    
    
    // exports
    t.renderAgenda = renderAgenda;
    t.setWidth = setWidth;
    t.setHeight = setHeight;
    t.beforeHide = beforeHide;
    t.afterShow = afterShow;
    t.defaultEventEnd = defaultEventEnd;
    t.timePosition = timePosition;
    t.dayOfWeekCol = dayOfWeekCol;
    t.dateCell = dateCell;
    t.cellDate = cellDate;
    t.cellIsAllDay = cellIsAllDay;
    t.allDayRow = getAllDayRow;
    t.allDayBounds = allDayBounds;
    t.getHoverListener = function() { return hoverListener };
    t.colContentLeft = colContentLeft;
    t.colContentRight = colContentRight;
    t.getDaySegmentContainer = function() { return daySegmentContainer };
    t.getSlotSegmentContainer = function() { return slotSegmentContainer };
    t.getMinMinute = function() { return minMinute };
    t.getMaxMinute = function() { return maxMinute };
    t.getBodyContent = function() { return slotContent }; // !!??
    t.getRowCnt = function() { return 1 };
    t.getColCnt = function() { return colCnt };
    t.getColWidth = function() { return colWidth };
    t.getSlotHeight = function() { return slotHeight };
    t.defaultSelectionEnd = defaultSelectionEnd;
    t.renderDayOverlay = renderDayOverlay;
    t.renderSelection = renderSelection;
    t.clearSelection = clearSelection;
    t.reportDayClick = reportDayClick; // selection mousedown hack
    t.dragStart = dragStart;
    t.dragStop = dragStop;
    
    
    // imports
    View.call(t, element, calendar, viewName);
    OverlayManager.call(t);
    SelectionManager.call(t);
    AgendaEventRenderer.call(t);
    var opt = t.opt;
    var trigger = t.trigger;
    var clearEvents = t.clearEvents;
    var renderOverlay = t.renderOverlay;
    var clearOverlays = t.clearOverlays;
    var reportSelection = t.reportSelection;
    var unselect = t.unselect;
    var daySelectionMousedown = t.daySelectionMousedown;
    var slotSegHtml = t.slotSegHtml;
    var formatDate = calendar.formatDate;
    
    
    // locals
    
    var dayTable;
    var dayHead;
    var dayHeadCells;
    var dayBody;
    var dayBodyCells;
    var dayBodyCellInners;
    var dayBodyFirstCell;
    var dayBodyFirstCellStretcher;
    var slotLayer;
    var daySegmentContainer;
    var allDayTable;
    var allDayRow;
    var slotScroller;
    var slotContent;
    var slotSegmentContainer;
    var slotTable;
    var slotTableFirstInner;
    var axisFirstCells;
    var gutterCells;
    var selectionHelper;
    
    var viewWidth;
    var viewHeight;
    var axisWidth;
    var colWidth;
    var gutterWidth;
    var slotHeight; // TODO: what if slotHeight changes? (see issue 650)
    var savedScrollTop;
    
    var colCnt;
    var slotCnt;
    var coordinateGrid;
    var hoverListener;
    var colContentPositions;
    var slotTopCache = {};
    
    var tm;
    var firstDay;
    var nwe;            // no weekends (int)
    var rtl, dis, dit;  // day index sign / translate
    var minMinute, maxMinute;
    var colFormat;
    

    
    /* Rendering
    -----------------------------------------------------------------------------*/
    
    
    disableTextSelection(element.addClass('fc-agenda'));
    
    
    function renderAgenda(c) {
        colCnt = c;
        updateOptions();
        if (!dayTable) {
            buildSkeleton();
        }else{
            clearEvents();
        }
        updateCells();
    }
    
    
    
    function updateOptions() {
        tm = opt('theme') ? 'ui' : 'fc';
        nwe = opt('weekends') ? 0 : 1;
        firstDay = opt('firstDay');
        if (rtl = opt('isRTL')) {
            dis = -1;
            dit = colCnt - 1;
        }else{
            dis = 1;
            dit = 0;
        }
        minMinute = parseTime(opt('minTime'));
        maxMinute = parseTime(opt('maxTime'));
        colFormat = opt('columnFormat');
    }
    
    
    
    function buildSkeleton() {
        var headerClass = tm + "-widget-header";
        var contentClass = tm + "-widget-content";
        var s;
        var i;
        var d;
        var maxd;
        var minutes;
        var slotNormal = opt('slotMinutes') % 15 == 0;
        
        s =
            "<table style='width:100%' class='fc-agenda-days fc-border-separate' cellspacing='0'>" +
            "<thead>" +
            "<tr>" +
            "<th class='fc-agenda-axis " + headerClass + "'>&nbsp;</th>";
        for (i=0; i<colCnt; i++) {
            s +=
                "<th class='fc- fc-col" + i + ' ' + headerClass + "'/>"; // fc- needed for setDayID
        }
        s +=
            "<th class='fc-agenda-gutter " + headerClass + "'>&nbsp;</th>" +
            "</tr>" +
            "</thead>" +
            "<tbody>" +
            "<tr>" +
            "<th class='fc-agenda-axis " + headerClass + "'>&nbsp;</th>";
        for (i=0; i<colCnt; i++) {
            s +=
                "<td class='fc- fc-col" + i + ' ' + contentClass + "'>" + // fc- needed for setDayID
                "<div>" +
                "<div class='fc-day-content'>" +
                "<div style='position:relative'>&nbsp;</div>" +
                "</div>" +
                "</div>" +
                "</td>";
        }
        s +=
            "<td class='fc-agenda-gutter " + contentClass + "'>&nbsp;</td>" +
            "</tr>" +
            "</tbody>" +
            "</table>";
        dayTable = $(s).appendTo(element);
        dayHead = dayTable.find('thead');
        dayHeadCells = dayHead.find('th').slice(1, -1);
        dayBody = dayTable.find('tbody');
        dayBodyCells = dayBody.find('td').slice(0, -1);
        dayBodyCellInners = dayBodyCells.find('div.fc-day-content div');
        dayBodyFirstCell = dayBodyCells.eq(0);
        dayBodyFirstCellStretcher = dayBodyFirstCell.find('> div');
        
        markFirstLast(dayHead.add(dayHead.find('tr')));
        markFirstLast(dayBody.add(dayBody.find('tr')));
        
        axisFirstCells = dayHead.find('th:first');
        gutterCells = dayTable.find('.fc-agenda-gutter');
        
        slotLayer =
            $("<div style='position:absolute;z-index:2;left:0;width:100%'/>")
                .appendTo(element);
                
        if (opt('allDaySlot')) {
        
            daySegmentContainer =
                $("<div style='position:absolute;z-index:8;top:0;left:0'/>")
                    .appendTo(slotLayer);
        
            s =
                "<table style='width:100%' class='fc-agenda-allday' cellspacing='0'>" +
                "<tr>" +
                "<th class='" + headerClass + " fc-agenda-axis'>" + opt('allDayText') + "</th>" +
                "<td>" +
                "<div class='fc-day-content'><div style='position:relative'/></div>" +
                "</td>" +
                "<th class='" + headerClass + " fc-agenda-gutter'>&nbsp;</th>" +
                "</tr>" +
                "</table>";
            allDayTable = $(s).appendTo(slotLayer);
            allDayRow = allDayTable.find('tr');
            
            dayBind(allDayRow.find('td'));
            
            axisFirstCells = axisFirstCells.add(allDayTable.find('th:first'));
            gutterCells = gutterCells.add(allDayTable.find('th.fc-agenda-gutter'));
            
            slotLayer.append(
                "<div class='fc-agenda-divider " + headerClass + "'>" +
                "<div class='fc-agenda-divider-inner'/>" +
                "</div>"
            );
            
        }else{
        
            daySegmentContainer = $([]); // in jQuery 1.4, we can just do $()
        
        }
        
        slotScroller =
            $("<div style='position:absolute;width:100%;overflow-x:hidden;overflow-y:auto'/>")
                .appendTo(slotLayer);
                
        slotContent =
            $("<div style='position:relative;width:100%;overflow:hidden'/>")
                .appendTo(slotScroller);
                
        slotSegmentContainer =
            $("<div style='position:absolute;z-index:8;top:0;left:0'/>")
                .appendTo(slotContent);
        
        s =
            "<table class='fc-agenda-slots' style='width:100%' cellspacing='0'>" +
            "<tbody>";
        d = zeroDate();
        maxd = addMinutes(cloneDate(d), maxMinute);
        addMinutes(d, minMinute);
        slotCnt = 0;
        for (i=0; d < maxd; i++) {
            minutes = d.getMinutes();
            s +=
                "<tr class='fc-slot" + i + ' ' + (!minutes ? '' : 'fc-minor') + "'>" +
                "<th class='fc-agenda-axis " + headerClass + "'>" +
                ((!slotNormal || !minutes) ? formatDate(d, opt('axisFormat')) : '&nbsp;') +
                "</th>" +
                "<td class='" + contentClass + "'>" +
                "<div style='position:relative'>&nbsp;</div>" +
                "</td>" +
                "</tr>";
            addMinutes(d, opt('slotMinutes'));
            slotCnt++;
        }
        s +=
            "</tbody>" +
            "</table>";
        slotTable = $(s).appendTo(slotContent);
        slotTableFirstInner = slotTable.find('div:first');
        
        slotBind(slotTable.find('td'));
        
        axisFirstCells = axisFirstCells.add(slotTable.find('th:first'));
    }
    
    
    
    function updateCells() {
        var i;
        var headCell;
        var bodyCell;
        var date;
        var today = clearTime(new Date());
        for (i=0; i<colCnt; i++) {
            date = colDate(i);
            headCell = dayHeadCells.eq(i);
            headCell.html(formatDate(date, colFormat));
            bodyCell = dayBodyCells.eq(i);
            if (+date == +today) {
                bodyCell.addClass(tm + '-state-highlight fc-today');
            }else{
                bodyCell.removeClass(tm + '-state-highlight fc-today');
            }
            setDayID(headCell.add(bodyCell), date);
        }
    }
    
    
    
    function setHeight(height, dateChanged) {
        if (height === undefined) {
            height = viewHeight;
        }
        viewHeight = height;
        slotTopCache = {};
    
        var headHeight = dayBody.position().top;
        var allDayHeight = slotScroller.position().top; // including divider
        var bodyHeight = Math.min( // total body height, including borders
            height - headHeight,   // when scrollbars
            slotTable.height() + allDayHeight + 1 // when no scrollbars. +1 for bottom border
        );
        
        dayBodyFirstCellStretcher
            .height(bodyHeight - vsides(dayBodyFirstCell));
        
        slotLayer.css('top', headHeight);
        
        slotScroller.height(bodyHeight - allDayHeight - 1);
        
        slotHeight = slotTableFirstInner.height() + 1; // +1 for border
        
        if (dateChanged) {
            resetScroll();
        }
    }
    
    
    
    function setWidth(width) {
        viewWidth = width;
        colContentPositions.clear();
        
        axisWidth = 0;
        setOuterWidth(
            axisFirstCells
                .width('')
                .each(function(i, _cell) {
                    axisWidth = Math.max(axisWidth, $(_cell).outerWidth());
                }),
            axisWidth
        );
        
        var slotTableWidth = slotScroller[0].clientWidth; // needs to be done after axisWidth (for IE7)
        //slotTable.width(slotTableWidth);
        
        gutterWidth = slotScroller.width() - slotTableWidth;
        if (gutterWidth) {
            setOuterWidth(gutterCells, gutterWidth);
            gutterCells
                .show()
                .prev()
                .removeClass('fc-last');
        }else{
            gutterCells
                .hide()
                .prev()
                .addClass('fc-last');
        }
        
        colWidth = Math.floor((slotTableWidth - axisWidth) / colCnt);
        setOuterWidth(dayHeadCells.slice(0, -1), colWidth);
    }
    


    function resetScroll() {
        var d0 = zeroDate();
        var scrollDate = cloneDate(d0);
        scrollDate.setHours(opt('firstHour'));
        var top = timePosition(d0, scrollDate) + 1; // +1 for the border
        function scroll() {
            slotScroller.scrollTop(top);
        }
        scroll();
        setTimeout(scroll, 0); // overrides any previous scroll state made by the browser
    }
    
    
    function beforeHide() {
        savedScrollTop = slotScroller.scrollTop();
    }
    
    
    function afterShow() {
        slotScroller.scrollTop(savedScrollTop);
    }
    
    
    
    /* Slot/Day clicking and binding
    -----------------------------------------------------------------------*/
    

    function dayBind(cells) {
        cells.click(slotClick)
            .mousedown(daySelectionMousedown);
    }


    function slotBind(cells) {
        cells.click(slotClick)
            .mousedown(slotSelectionMousedown);
    }
    
    
    function slotClick(ev) {
        if (!opt('selectable')) { // if selectable, SelectionManager will worry about dayClick
            var col = Math.min(colCnt-1, Math.floor((ev.pageX - dayTable.offset().left - axisWidth) / colWidth));
            var date = colDate(col);
            var rowMatch = this.parentNode.className.match(/fc-slot(\d+)/); // TODO: maybe use data
            if (rowMatch) {
                var mins = parseInt(rowMatch[1]) * opt('slotMinutes');
                var hours = Math.floor(mins/60);
                date.setHours(hours);
                date.setMinutes(mins%60 + minMinute);
                trigger('dayClick', dayBodyCells[col], date, false, ev);
            }else{
                trigger('dayClick', dayBodyCells[col], date, true, ev);
            }
        }
    }
    
    
    
    /* Semi-transparent Overlay Helpers
    -----------------------------------------------------*/
    

    function renderDayOverlay(startDate, endDate, refreshCoordinateGrid) { // endDate is exclusive
        if (refreshCoordinateGrid) {
            coordinateGrid.build();
        }
        var visStart = cloneDate(t.visStart);
        var startCol, endCol;
        if (rtl) {
            startCol = dayDiff(endDate, visStart)*dis+dit+1;
            endCol = dayDiff(startDate, visStart)*dis+dit+1;
        }else{
            startCol = dayDiff(startDate, visStart);
            endCol = dayDiff(endDate, visStart);
        }
        startCol = Math.max(0, startCol);
        endCol = Math.min(colCnt, endCol);
        if (startCol < endCol) {
            dayBind(
                renderCellOverlay(0, startCol, 0, endCol-1)
            );
        }
    }
    
    
    function renderCellOverlay(row0, col0, row1, col1) { // only for all-day?
        var rect = coordinateGrid.rect(row0, col0, row1, col1, slotLayer);
        return renderOverlay(rect, slotLayer);
    }
    

    function renderSlotOverlay(overlayStart, overlayEnd) {
        var dayStart = cloneDate(t.visStart);
        var dayEnd = addDays(cloneDate(dayStart), 1);
        for (var i=0; i<colCnt; i++) {
            var stretchStart = new Date(Math.max(dayStart, overlayStart));
            var stretchEnd = new Date(Math.min(dayEnd, overlayEnd));
            if (stretchStart < stretchEnd) {
                var col = i*dis+dit;
                var rect = coordinateGrid.rect(0, col, 0, col, slotContent); // only use it for horizontal coords
                var top = timePosition(dayStart, stretchStart);
                var bottom = timePosition(dayStart, stretchEnd);
                rect.top = top;
                rect.height = bottom - top;
                slotBind(
                    renderOverlay(rect, slotContent)
                );
            }
            addDays(dayStart, 1);
            addDays(dayEnd, 1);
        }
    }
    
    
    
    /* Coordinate Utilities
    -----------------------------------------------------------------------------*/
    
    
    coordinateGrid = new CoordinateGrid(function(rows, cols) {
        var e, n, p;
        dayHeadCells.each(function(i, _e) {
            e = $(_e);
            n = e.offset().left;
            if (i) {
                p[1] = n;
            }
            p = [n];
            cols[i] = p;
        });
        p[1] = n + e.outerWidth();
        if (opt('allDaySlot')) {
            e = allDayRow;
            n = e.offset().top;
            rows[0] = [n, n+e.outerHeight()];
        }
        var slotTableTop = slotContent.offset().top;
        var slotScrollerTop = slotScroller.offset().top;
        var slotScrollerBottom = slotScrollerTop + slotScroller.outerHeight();
        function constrain(n) {
            return Math.max(slotScrollerTop, Math.min(slotScrollerBottom, n));
        }
        for (var i=0; i<slotCnt; i++) {
            rows.push([
                constrain(slotTableTop + slotHeight*i),
                constrain(slotTableTop + slotHeight*(i+1))
            ]);
        }
    });
    
    
    hoverListener = new HoverListener(coordinateGrid);
    
    
    colContentPositions = new HorizontalPositionCache(function(col) {
        return dayBodyCellInners.eq(col);
    });
    
    
    function colContentLeft(col) {
        return colContentPositions.left(col);
    }
    
    
    function colContentRight(col) {
        return colContentPositions.right(col);
    }
    
    
    
    
    function dateCell(date) { // "cell" terminology is now confusing
        return {
            row: Math.floor(dayDiff(date, t.visStart) / 7),
            col: dayOfWeekCol(date.getDay())
        };
    }
    
    
    function cellDate(cell) {
        var d = colDate(cell.col);
        var slotIndex = cell.row;
        if (opt('allDaySlot')) {
            slotIndex--;
        }
        if (slotIndex >= 0) {
            addMinutes(d, minMinute + slotIndex * opt('slotMinutes'));
        }
        return d;
    }
    
    
    function colDate(col) { // returns dates with 00:00:00
        return addDays(cloneDate(t.visStart), col*dis+dit);
    }
    
    
    function cellIsAllDay(cell) {
        return opt('allDaySlot') && !cell.row;
    }
    
    
    function dayOfWeekCol(dayOfWeek) {
        return ((dayOfWeek - Math.max(firstDay, nwe) + colCnt) % colCnt)*dis+dit;
    }
    
    
    
    
    // get the Y coordinate of the given time on the given day (both Date objects)
    function timePosition(day, time) { // both date objects. day holds 00:00 of current day
        day = cloneDate(day, true);
        if (time < addMinutes(cloneDate(day), minMinute)) {
            return 0;
        }
        if (time >= addMinutes(cloneDate(day), maxMinute)) {
            return slotTable.height();
        }
        var slotMinutes = opt('slotMinutes'),
            minutes = time.getHours()*60 + time.getMinutes() - minMinute,
            slotI = Math.floor(minutes / slotMinutes),
            slotTop = slotTopCache[slotI];
        if (slotTop === undefined) {
            slotTop = slotTopCache[slotI] = slotTable.find('tr:eq(' + slotI + ') td div')[0].offsetTop; //.position().top; // need this optimization???
        }
        return Math.max(0, Math.round(
            slotTop - 1 + slotHeight * ((minutes % slotMinutes) / slotMinutes)
        ));
    }
    
    
    function allDayBounds() {
        return {
            left: axisWidth,
            right: viewWidth - gutterWidth
        }
    }
    
    
    function getAllDayRow(index) {
        return allDayRow;
    }
    
    
    function defaultEventEnd(event) {
        var start = cloneDate(event.start);
        if (event.allDay) {
            return start;
        }
        return addMinutes(start, opt('defaultEventMinutes'));
    }
    
    
    
    /* Selection
    ---------------------------------------------------------------------------------*/
    
    
    function defaultSelectionEnd(startDate, allDay) {
        if (allDay) {
            return cloneDate(startDate);
        }
        return addMinutes(cloneDate(startDate), opt('slotMinutes'));
    }
    
    
    function renderSelection(startDate, endDate, allDay) { // only for all-day
        if (allDay) {
            if (opt('allDaySlot')) {
                renderDayOverlay(startDate, addDays(cloneDate(endDate), 1), true);
            }
        }else{
            renderSlotSelection(startDate, endDate);
        }
    }
    
    
    function renderSlotSelection(startDate, endDate) {
        var helperOption = opt('selectHelper');
        coordinateGrid.build();
        if (helperOption) {
            var col = dayDiff(startDate, t.visStart) * dis + dit;
            if (col >= 0 && col < colCnt) { // only works when times are on same day
                var rect = coordinateGrid.rect(0, col, 0, col, slotContent); // only for horizontal coords
                var top = timePosition(startDate, startDate);
                var bottom = timePosition(startDate, endDate);
                if (bottom > top) { // protect against selections that are entirely before or after visible range
                    rect.top = top;
                    rect.height = bottom - top;
                    rect.left += 2;
                    rect.width -= 5;
                    if ($.isFunction(helperOption)) {
                        var helperRes = helperOption(startDate, endDate);
                        if (helperRes) {
                            rect.position = 'absolute';
                            rect.zIndex = 8;
                            selectionHelper = $(helperRes)
                                .css(rect)
                                .appendTo(slotContent);
                        }
                    }else{
                        rect.isStart = true; // conside rect a "seg" now
                        rect.isEnd = true;   //
                        selectionHelper = $(slotSegHtml(
                            {
                                title: '',
                                start: startDate,
                                end: endDate,
                                className: ['fc-select-helper'],
                                editable: false
                            },
                            rect
                        ));
                        selectionHelper.css('opacity', opt('dragOpacity'));
                    }
                    if (selectionHelper) {
                        slotBind(selectionHelper);
                        slotContent.append(selectionHelper);
                        setOuterWidth(selectionHelper, rect.width, true); // needs to be after appended
                        setOuterHeight(selectionHelper, rect.height, true);
                    }
                }
            }
        }else{
            renderSlotOverlay(startDate, endDate);
        }
    }
    
    
    function clearSelection() {
        clearOverlays();
        if (selectionHelper) {
            selectionHelper.remove();
            selectionHelper = null;
        }
    }
    
    
    function slotSelectionMousedown(ev) {
        if (ev.which == 1 && opt('selectable')) { // ev.which==1 means left mouse button
            unselect(ev);
            var dates;
            hoverListener.start(function(cell, origCell) {
                clearSelection();
                if (cell && cell.col == origCell.col && !cellIsAllDay(cell)) {
                    var d1 = cellDate(origCell);
                    var d2 = cellDate(cell);
                    dates = [
                        d1,
                        addMinutes(cloneDate(d1), opt('slotMinutes')),
                        d2,
                        addMinutes(cloneDate(d2), opt('slotMinutes'))
                    ].sort(cmp);
                    renderSlotSelection(dates[0], dates[3]);
                }else{
                    dates = null;
                }
            }, ev);
            $(document).one('mouseup', function(ev) {
                hoverListener.stop();
                if (dates) {
                    if (+dates[0] == +dates[1]) {
                        reportDayClick(dates[0], false, ev);
                    }
                    reportSelection(dates[0], dates[3], false, ev);
                }
            });
        }
    }
    
    
    function reportDayClick(date, allDay, ev) {
        trigger('dayClick', dayBodyCells[dayOfWeekCol(date.getDay())], date, allDay, ev);
    }
    
    
    
    /* External Dragging
    --------------------------------------------------------------------------------*/
    
    
    function dragStart(_dragElement, ev, ui) {
        hoverListener.start(function(cell) {
            clearOverlays();
            if (cell) {
                if (cellIsAllDay(cell)) {
                    renderCellOverlay(cell.row, cell.col, cell.row, cell.col);
                }else{
                    var d1 = cellDate(cell);
                    var d2 = addMinutes(cloneDate(d1), opt('defaultEventMinutes'));
                    renderSlotOverlay(d1, d2);
                }
            }
        }, ev);
    }
    
    
    function dragStop(_dragElement, ev, ui) {
        var cell = hoverListener.stop();
        clearOverlays();
        if (cell) {
            trigger('drop', _dragElement, cellDate(cell), cellIsAllDay(cell), ev, ui);
        }
    }


}

function AgendaEventRenderer() {
    var t = this;
    
    
    // exports
    t.renderEvents = renderEvents;
    t.compileDaySegs = compileDaySegs; // for DayEventRenderer
    t.clearEvents = clearEvents;
    t.slotSegHtml = slotSegHtml;
    t.bindDaySeg = bindDaySeg;
    
    
    // imports
    DayEventRenderer.call(t);
    var opt = t.opt;
    var trigger = t.trigger;
    //var setOverflowHidden = t.setOverflowHidden;
    var isEventDraggable = t.isEventDraggable;
    var isEventResizable = t.isEventResizable;
    var eventEnd = t.eventEnd;
    var reportEvents = t.reportEvents;
    var reportEventClear = t.reportEventClear;
    var eventElementHandlers = t.eventElementHandlers;
    var setHeight = t.setHeight;
    var getDaySegmentContainer = t.getDaySegmentContainer;
    var getSlotSegmentContainer = t.getSlotSegmentContainer;
    var getHoverListener = t.getHoverListener;
    var getMaxMinute = t.getMaxMinute;
    var getMinMinute = t.getMinMinute;
    var timePosition = t.timePosition;
    var colContentLeft = t.colContentLeft;
    var colContentRight = t.colContentRight;
    var renderDaySegs = t.renderDaySegs;
    var resizableDayEvent = t.resizableDayEvent; // TODO: streamline binding architecture
    var getColCnt = t.getColCnt;
    var getColWidth = t.getColWidth;
    var getSlotHeight = t.getSlotHeight;
    var getBodyContent = t.getBodyContent;
    var reportEventElement = t.reportEventElement;
    var showEvents = t.showEvents;
    var hideEvents = t.hideEvents;
    var eventDrop = t.eventDrop;
    var eventResize = t.eventResize;
    var renderDayOverlay = t.renderDayOverlay;
    var clearOverlays = t.clearOverlays;
    var calendar = t.calendar;
    var formatDate = calendar.formatDate;
    var formatDates = calendar.formatDates;
    
    
    
    /* Rendering
    ----------------------------------------------------------------------------*/
    

    function renderEvents(events, modifiedEventId) {
        reportEvents(events);
        var i, len=events.length,
            dayEvents=[],
            slotEvents=[];
        for (i=0; i<len; i++) {
            if (events[i].allDay) {
                dayEvents.push(events[i]);
            }else{
                slotEvents.push(events[i]);
            }
        }
        if (opt('allDaySlot')) {
            renderDaySegs(compileDaySegs(dayEvents), modifiedEventId);
            setHeight(); // no params means set to viewHeight
        }
        renderSlotSegs(compileSlotSegs(slotEvents), modifiedEventId);
    }
    
    
    function clearEvents() {
        reportEventClear();
        getDaySegmentContainer().empty();
        getSlotSegmentContainer().empty();
    }
    
    
    function compileDaySegs(events) {
        var levels = stackSegs(sliceSegs(events, $.map(events, exclEndDay), t.visStart, t.visEnd)),
            i, levelCnt=levels.length, level,
            j, seg,
            segs=[];
        for (i=0; i<levelCnt; i++) {
            level = levels[i];
            for (j=0; j<level.length; j++) {
                seg = level[j];
                seg.row = 0;
                seg.level = i; // not needed anymore
                segs.push(seg);
            }
        }
        return segs;
    }
    
    
    function compileSlotSegs(events) {
        var colCnt = getColCnt(),
            minMinute = getMinMinute(),
            maxMinute = getMaxMinute(),
            d = addMinutes(cloneDate(t.visStart), minMinute),
            visEventEnds = $.map(events, slotEventEnd),
            i, col,
            j, level,
            k, seg,
            segs=[];
        for (i=0; i<colCnt; i++) {
            col = stackSegs(sliceSegs(events, visEventEnds, d, addMinutes(cloneDate(d), maxMinute-minMinute)));
            countForwardSegs(col);
            for (j=0; j<col.length; j++) {
                level = col[j];
                for (k=0; k<level.length; k++) {
                    seg = level[k];
                    seg.col = i;
                    seg.level = j;
                    segs.push(seg);
                }
            }
            addDays(d, 1, true);
        }
        return segs;
    }
    
    
    function slotEventEnd(event) {
        if (event.end) {
            return cloneDate(event.end);
        }else{
            return addMinutes(cloneDate(event.start), opt('defaultEventMinutes'));
        }
    }
    
    
    // renders events in the 'time slots' at the bottom
    
    function renderSlotSegs(segs, modifiedEventId) {
    
        var i, segCnt=segs.length, seg,
            event,
            classes,
            top, bottom,
            colI, levelI, forward,
            leftmost,
            availWidth,
            outerWidth,
            left,
            html='',
            eventElements,
            eventElement,
            triggerRes,
            vsideCache={},
            hsideCache={},
            key, val,
            contentElement,
            height,
            slotSegmentContainer = getSlotSegmentContainer(),
            rtl, dis, dit,
            colCnt = getColCnt();
            
        if (rtl = opt('isRTL')) {
            dis = -1;
            dit = colCnt - 1;
        }else{
            dis = 1;
            dit = 0;
        }
            
        // calculate position/dimensions, create html
        for (i=0; i<segCnt; i++) {
            seg = segs[i];
            event = seg.event;
            top = timePosition(seg.start, seg.start);
            bottom = timePosition(seg.start, seg.end);
            colI = seg.col;
            levelI = seg.level;
            forward = seg.forward || 0;
            leftmost = colContentLeft(colI*dis + dit);
            availWidth = colContentRight(colI*dis + dit) - leftmost;
            availWidth = Math.min(availWidth-6, availWidth*.95); // TODO: move this to CSS
            if (levelI) {
                // indented and thin
                outerWidth = availWidth / (levelI + forward + 1);
            }else{
                if (forward) {
                    // moderately wide, aligned left still
                    outerWidth = ((availWidth / (forward + 1)) - (12/2)) * 2; // 12 is the predicted width of resizer =
                }else{
                    // can be entire width, aligned left
                    outerWidth = availWidth;
                }
            }
            left = leftmost +                                  // leftmost possible
                (availWidth / (levelI + forward + 1) * levelI) // indentation
                * dis + (rtl ? availWidth - outerWidth : 0);   // rtl
            seg.top = top;
            seg.left = left;
            seg.outerWidth = outerWidth;
            seg.outerHeight = bottom - top;
            html += slotSegHtml(event, seg);
        }
        slotSegmentContainer[0].innerHTML = html; // faster than html()
        eventElements = slotSegmentContainer.children();
        
        // retrieve elements, run through eventRender callback, bind event handlers
        for (i=0; i<segCnt; i++) {
            seg = segs[i];
            event = seg.event;
            eventElement = $(eventElements[i]); // faster than eq()
            triggerRes = trigger('eventRender', event, event, eventElement);
            if (triggerRes === false) {
                eventElement.remove();
            }else{
                if (triggerRes && triggerRes !== true) {
                    eventElement.remove();
                    eventElement = $(triggerRes)
                        .css({
                            position: 'absolute',
                            top: seg.top,
                            left: seg.left
                        })
                        .appendTo(slotSegmentContainer);
                }
                seg.element = eventElement;
                if (event._id === modifiedEventId) {
                    bindSlotSeg(event, eventElement, seg);
                }else{
                    eventElement[0]._fci = i; // for lazySegBind
                }
                reportEventElement(event, eventElement);
            }
        }
        
        lazySegBind(slotSegmentContainer, segs, bindSlotSeg);
        
        // record event sides and title positions
        for (i=0; i<segCnt; i++) {
            seg = segs[i];
            if (eventElement = seg.element) {
                val = vsideCache[key = seg.key = cssKey(eventElement[0])];
                seg.vsides = val === undefined ? (vsideCache[key] = vsides(eventElement, true)) : val;
                val = hsideCache[key];
                seg.hsides = val === undefined ? (hsideCache[key] = hsides(eventElement, true)) : val;
                contentElement = eventElement.find('div.fc-event-content');
                if (contentElement.length) {
                    seg.contentTop = contentElement[0].offsetTop;
                }
            }
        }
        
        // set all positions/dimensions at once
        for (i=0; i<segCnt; i++) {
            seg = segs[i];
            if (eventElement = seg.element) {
                eventElement[0].style.width = Math.max(0, seg.outerWidth - seg.hsides) + 'px';
                height = Math.max(0, seg.outerHeight - seg.vsides);
                eventElement[0].style.height = height + 'px';
                event = seg.event;
                if (seg.contentTop !== undefined && height - seg.contentTop < 10) {
                    // not enough room for title, put it in the time header
                    eventElement.find('div.fc-event-time')
                        .text(formatDate(event.start, opt('timeFormat')) + ' - ' + event.title);
                    eventElement.find('div.fc-event-title')
                        .remove();
                }
                trigger('eventAfterRender', event, event, eventElement);
            }
        }
                    
    }
    
    
    function slotSegHtml(event, seg) {
        var html = "<";
        var url = event.url;
        var skinCss = getSkinCss(event, opt);
        var skinCssAttr = (skinCss ? " style='" + skinCss + "'" : '');
        var classes = ['fc-event', 'fc-event-skin', 'fc-event-vert'];
        if (isEventDraggable(event)) {
            classes.push('fc-event-draggable');
        }
        if (seg.isStart) {
            classes.push('fc-corner-top');
        }
        if (seg.isEnd) {
            classes.push('fc-corner-bottom');
        }
        classes = classes.concat(event.className);
        if (event.source) {
            classes = classes.concat(event.source.className || []);
        }
        if (url) {
            html += "a href='" + htmlEscape(event.url) + "'";
        }else{
            html += "div";
        }
        html +=
            " class='" + classes.join(' ') + "'" +
            " style='position:absolute;z-index:8;top:" + seg.top + "px;left:" + seg.left + "px;" + skinCss + "'" +
            ">" +
            "<div class='fc-event-inner fc-event-skin'" + skinCssAttr + ">" +
            "<div class='fc-event-head fc-event-skin'" + skinCssAttr + ">" +
            "<div class='fc-event-time'>" +
            htmlEscape(formatDates(event.start, event.end, opt('timeFormat'))) +
            "</div>" +
            "</div>" +
            "<div class='fc-event-content'>" +
            "<div class='fc-event-title'>" +
            htmlEscape(event.title) +
            "</div>" +
            "<div class='fc-event-image' align='center'><img style='height:67px' src='" +
            event.post_image[0] +
            "'></div>" +
            "</div>" +
            "<div class='fc-event-bg'></div>" +
            "</div>"; // close inner
        if (seg.isEnd && isEventResizable(event)) {
            html +=
                "<div class='ui-resizable-handle ui-resizable-s'>=</div>";
        }
        html +=
            "</" + (url ? "a" : "div") + ">";
        return html;
    }
    
    
    function bindDaySeg(event, eventElement, seg) {
        if (isEventDraggable(event)) {
            draggableDayEvent(event, eventElement, seg.isStart);
        }
        if (seg.isEnd && isEventResizable(event)) {
            resizableDayEvent(event, eventElement, seg);
        }
        eventElementHandlers(event, eventElement);
            // needs to be after, because resizableDayEvent might stopImmediatePropagation on click
    }
    
    
    function bindSlotSeg(event, eventElement, seg) {
        var timeElement = eventElement.find('div.fc-event-time');
        if (isEventDraggable(event)) {
            draggableSlotEvent(event, eventElement, timeElement);
        }
        if (seg.isEnd && isEventResizable(event)) {
            resizableSlotEvent(event, eventElement, timeElement);
        }
        eventElementHandlers(event, eventElement);
    }
    
    
    
    /* Dragging
    -----------------------------------------------------------------------------------*/
    
    
    // when event starts out FULL-DAY
    
    function draggableDayEvent(event, eventElement, isStart) {
        var origWidth;
        var revert;
        var allDay=true;
        var dayDelta;
        var dis = opt('isRTL') ? -1 : 1;
        var hoverListener = getHoverListener();
        var colWidth = getColWidth();
        var slotHeight = getSlotHeight();
        var minMinute = getMinMinute();
        eventElement.draggable({
            zIndex: 9,
            opacity: opt('dragOpacity', 'month'), // use whatever the month view was using
            revertDuration: opt('dragRevertDuration'),
            start: function(ev, ui) {
                trigger('eventDragStart', eventElement, event, ev, ui);
                hideEvents(event, eventElement);
                origWidth = eventElement.width();
                hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
                    clearOverlays();
                    if (cell) {
                        //setOverflowHidden(true);
                        revert = false;
                        dayDelta = colDelta * dis;
                        if (!cell.row) {
                            // on full-days
                            renderDayOverlay(
                                addDays(cloneDate(event.start), dayDelta),
                                addDays(exclEndDay(event), dayDelta)
                            );
                            resetElement();
                        }else{
                            // mouse is over bottom slots
                            if (isStart) {
                                if (allDay) {
                                    // convert event to temporary slot-event
                                    eventElement.width(colWidth - 10); // don't use entire width
                                    setOuterHeight(
                                        eventElement,
                                        slotHeight * Math.round(
                                            (event.end ? ((event.end - event.start) / MINUTE_MS) : opt('defaultEventMinutes'))
                                            / opt('slotMinutes')
                                        )
                                    );
                                    eventElement.draggable('option', 'grid', [colWidth, 1]);
                                    allDay = false;
                                }
                            }else{
                                revert = true;
                            }
                        }
                        revert = revert || (allDay && !dayDelta);
                    }else{
                        resetElement();
                        //setOverflowHidden(false);
                        revert = true;
                    }
                    eventElement.draggable('option', 'revert', revert);
                }, ev, 'drag');
            },
            stop: function(ev, ui) {
                hoverListener.stop();
                clearOverlays();
                trigger('eventDragStop', eventElement, event, ev, ui);
                if (revert) {
                    // hasn't moved or is out of bounds (draggable has already reverted)
                    resetElement();
                    eventElement.css('filter', ''); // clear IE opacity side-effects
                    showEvents(event, eventElement);
                }else{
                    // changed!
                    var minuteDelta = 0;
                    if (!allDay) {
                        minuteDelta = Math.round((eventElement.offset().top - getBodyContent().offset().top) / slotHeight)
                            * opt('slotMinutes')
                            + minMinute
                            - (event.start.getHours() * 60 + event.start.getMinutes());
                    }
                    eventDrop(this, event, dayDelta, minuteDelta, allDay, ev, ui);
                }
                //setOverflowHidden(false);
            }
        });
        function resetElement() {
            if (!allDay) {
                eventElement
                    .width(origWidth)
                    .height('')
                    .draggable('option', 'grid', null);
                allDay = true;
            }
        }
    }
    
    
    // when event starts out IN TIMESLOTS
    
    function draggableSlotEvent(event, eventElement, timeElement) {
        var origPosition;
        var allDay=false;
        var dayDelta;
        var minuteDelta;
        var prevMinuteDelta;
        var dis = opt('isRTL') ? -1 : 1;
        var hoverListener = getHoverListener();
        var colCnt = getColCnt();
        var colWidth = getColWidth();
        var slotHeight = getSlotHeight();
        eventElement.draggable({
            zIndex: 9,
            scroll: false,
            grid: [colWidth, slotHeight],
            axis: colCnt==1 ? 'y' : false,
            opacity: opt('dragOpacity'),
            revertDuration: opt('dragRevertDuration'),
            start: function(ev, ui) {
                trigger('eventDragStart', eventElement, event, ev, ui);
                hideEvents(event, eventElement);
                origPosition = eventElement.position();
                minuteDelta = prevMinuteDelta = 0;
                hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
                    eventElement.draggable('option', 'revert', !cell);
                    clearOverlays();
                    if (cell) {
                        dayDelta = colDelta * dis;
                        if (opt('allDaySlot') && !cell.row) {
                            // over full days
                            if (!allDay) {
                                // convert to temporary all-day event
                                allDay = true;
                                timeElement.hide();
                                eventElement.draggable('option', 'grid', null);
                            }
                            renderDayOverlay(
                                addDays(cloneDate(event.start), dayDelta),
                                addDays(exclEndDay(event), dayDelta)
                            );
                        }else{
                            // on slots
                            resetElement();
                        }
                    }
                }, ev, 'drag');
            },
            drag: function(ev, ui) {
                minuteDelta = Math.round((ui.position.top - origPosition.top) / slotHeight) * opt('slotMinutes');
                if (minuteDelta != prevMinuteDelta) {
                    if (!allDay) {
                        updateTimeText(minuteDelta);
                    }
                    prevMinuteDelta = minuteDelta;
                }
            },
            stop: function(ev, ui) {
                var cell = hoverListener.stop();
                clearOverlays();
                trigger('eventDragStop', eventElement, event, ev, ui);
                if (cell && (dayDelta || minuteDelta || allDay)) {
                    // changed!
                    eventDrop(this, event, dayDelta, allDay ? 0 : minuteDelta, allDay, ev, ui);
                }else{
                    // either no change or out-of-bounds (draggable has already reverted)
                    resetElement();
                    eventElement.css('filter', ''); // clear IE opacity side-effects
                    eventElement.css(origPosition); // sometimes fast drags make event revert to wrong position
                    updateTimeText(0);
                    showEvents(event, eventElement);
                }
            }
        });
        function updateTimeText(minuteDelta) {
            var newStart = addMinutes(cloneDate(event.start), minuteDelta);
            var newEnd;
            if (event.end) {
                newEnd = addMinutes(cloneDate(event.end), minuteDelta);
            }
            timeElement.text(formatDates(newStart, newEnd, opt('timeFormat')));
        }
        function resetElement() {
            // convert back to original slot-event
            if (allDay) {
                timeElement.css('display', ''); // show() was causing display=inline
                eventElement.draggable('option', 'grid', [colWidth, slotHeight]);
                allDay = false;
            }
        }
    }
    
    
    
    /* Resizing
    --------------------------------------------------------------------------------------*/
    
    
    function resizableSlotEvent(event, eventElement, timeElement) {
        var slotDelta, prevSlotDelta;
        var slotHeight = getSlotHeight();
        eventElement.resizable({
            handles: {
                s: 'div.ui-resizable-s'
            },
            grid: slotHeight,
            start: function(ev, ui) {
                slotDelta = prevSlotDelta = 0;
                hideEvents(event, eventElement);
                eventElement.css('z-index', 9);
                trigger('eventResizeStart', this, event, ev, ui);
            },
            resize: function(ev, ui) {
                // don't rely on ui.size.height, doesn't take grid into account
                slotDelta = Math.round((Math.max(slotHeight, eventElement.height()) - ui.originalSize.height) / slotHeight);
                if (slotDelta != prevSlotDelta) {
                    timeElement.text(
                        formatDates(
                            event.start,
                            (!slotDelta && !event.end) ? null : // no change, so don't display time range
                                addMinutes(eventEnd(event), opt('slotMinutes')*slotDelta),
                            opt('timeFormat')
                        )
                    );
                    prevSlotDelta = slotDelta;
                }
            },
            stop: function(ev, ui) {
                trigger('eventResizeStop', this, event, ev, ui);
                if (slotDelta) {
                    eventResize(this, event, 0, opt('slotMinutes')*slotDelta, ev, ui);
                }else{
                    eventElement.css('z-index', 8);
                    showEvents(event, eventElement);
                    // BUG: if event was really short, need to put title back in span
                }
            }
        });
    }
    

}


function countForwardSegs(levels) {
    var i, j, k, level, segForward, segBack;
    for (i=levels.length-1; i>0; i--) {
        level = levels[i];
        for (j=0; j<level.length; j++) {
            segForward = level[j];
            for (k=0; k<levels[i-1].length; k++) {
                segBack = levels[i-1][k];
                if (segsCollide(segForward, segBack)) {
                    segBack.forward = Math.max(segBack.forward||0, (segForward.forward||0)+1);
                }
            }
        }
    }
}




function View(element, calendar, viewName) {
    var t = this;
    
    
    // exports
    t.element = element;
    t.calendar = calendar;
    t.name = viewName;
    t.opt = opt;
    t.trigger = trigger;
    //t.setOverflowHidden = setOverflowHidden;
    t.isEventDraggable = isEventDraggable;
    t.isEventResizable = isEventResizable;
    t.reportEvents = reportEvents;
    t.eventEnd = eventEnd;
    t.reportEventElement = reportEventElement;
    t.reportEventClear = reportEventClear;
    t.eventElementHandlers = eventElementHandlers;
    t.showEvents = showEvents;
    t.hideEvents = hideEvents;
    t.eventDrop = eventDrop;
    t.eventResize = eventResize;
    // t.title
    // t.start, t.end
    // t.visStart, t.visEnd
    
    
    // imports
    var defaultEventEnd = t.defaultEventEnd;
    var normalizeEvent = calendar.normalizeEvent; // in EventManager
    var reportEventChange = calendar.reportEventChange;
    
    
    // locals
    var eventsByID = {};
    var eventElements = [];
    var eventElementsByID = {};
    var options = calendar.options;
    
    
    
    function opt(name, viewNameOverride) {
        var v = options[name];
        if (typeof v == 'object') {
            return smartProperty(v, viewNameOverride || viewName);
        }
        return v;
    }

    
    function trigger(name, thisObj) {
        return calendar.trigger.apply(
            calendar,
            [name, thisObj || t].concat(Array.prototype.slice.call(arguments, 2), [t])
        );
    }
    
    
    /*
    function setOverflowHidden(bool) {
        element.css('overflow', bool ? 'hidden' : '');
    }
    */
    
    
    function isEventDraggable(event) {
        return isEventEditable(event) && !opt('disableDragging');
    }
    
    
    function isEventResizable(event) { // but also need to make sure the seg.isEnd == true
        return isEventEditable(event) && !opt('disableResizing');
    }
    
    
    function isEventEditable(event) {
        return firstDefined(event.editable, (event.source || {}).editable, opt('editable'));
    }
    
    
    
    /* Event Data
    ------------------------------------------------------------------------------*/
    
    
    // report when view receives new events
    function reportEvents(events) { // events are already normalized at this point
        eventsByID = {};
        var i, len=events.length, event;
        for (i=0; i<len; i++) {
            event = events[i];
            if (eventsByID[event._id]) {
                eventsByID[event._id].push(event);
            }else{
                eventsByID[event._id] = [event];
            }
        }
    }
    
    
    // returns a Date object for an event's end
    function eventEnd(event) {
        return event.end ? cloneDate(event.end) : defaultEventEnd(event);
    }
    
    
    
    /* Event Elements
    ------------------------------------------------------------------------------*/
    
    
    // report when view creates an element for an event
    function reportEventElement(event, element) {
        eventElements.push(element);
        if (eventElementsByID[event._id]) {
            eventElementsByID[event._id].push(element);
        }else{
            eventElementsByID[event._id] = [element];
        }
    }
    
    
    function reportEventClear() {
        eventElements = [];
        eventElementsByID = {};
    }
    
    
    // attaches eventClick, eventMouseover, eventMouseout
    function eventElementHandlers(event, eventElement) {
        eventElement
            .click(function(ev) {
                if (!eventElement.hasClass('ui-draggable-dragging') &&
                    !eventElement.hasClass('ui-resizable-resizing')) {
                        return trigger('eventClick', this, event, ev);
                    }
            })
            .hover(
                function(ev) {
                    trigger('eventMouseover', this, event, ev);
                },
                function(ev) {
                    trigger('eventMouseout', this, event, ev);
                }
            );
        // TODO: don't fire eventMouseover/eventMouseout *while* dragging is occuring (on subject element)
        // TODO: same for resizing
    }
    
    
    function showEvents(event, exceptElement) {
        eachEventElement(event, exceptElement, 'show');
    }
    
    
    function hideEvents(event, exceptElement) {
        eachEventElement(event, exceptElement, 'hide');
    }
    
    
    function eachEventElement(event, exceptElement, funcName) {
        var elements = eventElementsByID[event._id],
            i, len = elements.length;
        for (i=0; i<len; i++) {
            if (!exceptElement || elements[i][0] != exceptElement[0]) {
                elements[i][funcName]();
            }
        }
    }
    
    
    
    /* Event Modification Reporting
    ---------------------------------------------------------------------------------*/
    
    
    function eventDrop(e, event, dayDelta, minuteDelta, allDay, ev, ui) {
        var oldAllDay = event.allDay;
        var eventId = event._id;
        moveEvents(eventsByID[eventId], dayDelta, minuteDelta, allDay);
        trigger(
            'eventDrop',
            e,
            event,
            dayDelta,
            minuteDelta,
            allDay,
            function() {
                // TODO: investigate cases where this inverse technique might not work
                moveEvents(eventsByID[eventId], -dayDelta, -minuteDelta, oldAllDay);
                reportEventChange(eventId);
            },
            ev,
            ui
        );
        reportEventChange(eventId);
    }
    
    
    function eventResize(e, event, dayDelta, minuteDelta, ev, ui) {
        var eventId = event._id;
        elongateEvents(eventsByID[eventId], dayDelta, minuteDelta);
        trigger(
            'eventResize',
            e,
            event,
            dayDelta,
            minuteDelta,
            function() {
                // TODO: investigate cases where this inverse technique might not work
                elongateEvents(eventsByID[eventId], -dayDelta, -minuteDelta);
                reportEventChange(eventId);
            },
            ev,
            ui
        );
        reportEventChange(eventId);
    }
    
    
    
    /* Event Modification Math
    ---------------------------------------------------------------------------------*/
    
    
    function moveEvents(events, dayDelta, minuteDelta, allDay) {
        minuteDelta = minuteDelta || 0;
        for (var e, len=events.length, i=0; i<len; i++) {
            e = events[i];
            if (allDay !== undefined) {
                e.allDay = allDay;
            }
            addMinutes(addDays(e.start, dayDelta, true), minuteDelta);
            if (e.end) {
                e.end = addMinutes(addDays(e.end, dayDelta, true), minuteDelta);
            }
            normalizeEvent(e, options);
        }
    }
    
    
    function elongateEvents(events, dayDelta, minuteDelta) {
        minuteDelta = minuteDelta || 0;
        for (var e, len=events.length, i=0; i<len; i++) {
            e = events[i];
            e.end = addMinutes(addDays(eventEnd(e), dayDelta, true), minuteDelta);
            normalizeEvent(e, options);
        }
    }
    

}

function DayEventRenderer() {
    var t = this;

    
    // exports
    t.renderDaySegs = renderDaySegs;
    t.resizableDayEvent = resizableDayEvent;
    
    
    // imports
    var opt = t.opt;
    var trigger = t.trigger;
    var isEventDraggable = t.isEventDraggable;
    var isEventResizable = t.isEventResizable;
    var eventEnd = t.eventEnd;
    var reportEventElement = t.reportEventElement;
    var showEvents = t.showEvents;
    var hideEvents = t.hideEvents;
    var eventResize = t.eventResize;
    var getRowCnt = t.getRowCnt;
    var getColCnt = t.getColCnt;
    var getColWidth = t.getColWidth;
    var allDayRow = t.allDayRow;
    var allDayBounds = t.allDayBounds;
    var colContentLeft = t.colContentLeft;
    var colContentRight = t.colContentRight;
    var dayOfWeekCol = t.dayOfWeekCol;
    var dateCell = t.dateCell;
    var compileDaySegs = t.compileDaySegs;
    var getDaySegmentContainer = t.getDaySegmentContainer;
    var bindDaySeg = t.bindDaySeg; //TODO: streamline this
    var formatDates = t.calendar.formatDates;
    var renderDayOverlay = t.renderDayOverlay;
    var clearOverlays = t.clearOverlays;
    var clearSelection = t.clearSelection;
    
    
    
    /* Rendering
    -----------------------------------------------------------------------------*/
    
    
    function renderDaySegs(segs, modifiedEventId) {
        var segmentContainer = getDaySegmentContainer();
        var rowDivs;
        var rowCnt = getRowCnt();
        var colCnt = getColCnt();
        var i = 0;
        var rowI;
        var levelI;
        var colHeights;
        var j;
        var segCnt = segs.length;
        var seg;
        var top;
        var k;
        segmentContainer[0].innerHTML = daySegHTML(segs); // faster than .html()
        daySegElementResolve(segs, segmentContainer.children());
        daySegElementReport(segs);
        daySegHandlers(segs, segmentContainer, modifiedEventId);
        daySegCalcHSides(segs);
        daySegSetWidths(segs);
        daySegCalcHeights(segs);
        rowDivs = getRowDivs();
        // set row heights, calculate event tops (in relation to row top)
        for (rowI=0; rowI<rowCnt; rowI++) {
            levelI = 0;
            colHeights = [];
            for (j=0; j<colCnt; j++) {
                colHeights[j] = 0;
            }
            while (i<segCnt && (seg = segs[i]).row == rowI) {
                // loop through segs in a row
                top = arrayMax(colHeights.slice(seg.startCol, seg.endCol));
                seg.top = top;
                top += seg.outerHeight;
                for (k=seg.startCol; k<seg.endCol; k++) {
                    colHeights[k] = top;
                }
                i++;
            }
            rowDivs[rowI].height(arrayMax(colHeights));
        }
        daySegSetTops(segs, getRowTops(rowDivs));
    }
    
    
    function renderTempDaySegs(segs, adjustRow, adjustTop) {
        var tempContainer = $("<div/>");
        var elements;
        var segmentContainer = getDaySegmentContainer();
        var i;
        var segCnt = segs.length;
        var element;
        tempContainer[0].innerHTML = daySegHTML(segs); // faster than .html()
        elements = tempContainer.children();
        segmentContainer.append(elements);
        daySegElementResolve(segs, elements);
        daySegCalcHSides(segs);
        daySegSetWidths(segs);
        daySegCalcHeights(segs);
        daySegSetTops(segs, getRowTops(getRowDivs()));
        elements = [];
        for (i=0; i<segCnt; i++) {
            element = segs[i].element;
            if (element) {
                if (segs[i].row === adjustRow) {
                    element.css('top', adjustTop);
                }
                elements.push(element[0]);
            }
        }
        return $(elements);
    }
    
    
    function daySegHTML(segs) { // also sets seg.left and seg.outerWidth
        var rtl = opt('isRTL');
        var i;
        var segCnt=segs.length;
        var seg;
        var event;
        var url;
        var classes;
        var bounds = allDayBounds();
        var minLeft = bounds.left;
        var maxLeft = bounds.right;
        var leftCol;
        var rightCol;
        var left;
        var right;
        var skinCss;
        var html = '';
        // calculate desired position/dimensions, create html
        for (i=0; i<segCnt; i++) {
            seg = segs[i];
            event = seg.event;

            classes = ['fc-event', 'fc-event-skin', 'fc-event-hori'];
            if (isEventDraggable(event)) {
                classes.push('fc-event-draggable');
            }
            if (rtl) {
                if (seg.isStart) {
                    classes.push('fc-corner-right');
                }
                if (seg.isEnd) {
                    classes.push('fc-corner-left');
                }
                leftCol = dayOfWeekCol(seg.end.getDay()-1);
                rightCol = dayOfWeekCol(seg.start.getDay());
                left = seg.isEnd ? colContentLeft(leftCol) : minLeft;
                right = seg.isStart ? colContentRight(rightCol) : maxLeft;
            }else{
                if (seg.isStart) {
                    classes.push('fc-corner-left');
                }
                if (seg.isEnd) {
                    classes.push('fc-corner-right');
                }
                leftCol = dayOfWeekCol(seg.start.getDay());
                rightCol = dayOfWeekCol(seg.end.getDay()-1);
                left = seg.isStart ? colContentLeft(leftCol) : minLeft;
                right = seg.isEnd ? colContentRight(rightCol) : maxLeft;
            }
            classes = classes.concat(event.className);
            if (event.source) {
                classes = classes.concat(event.source.className || []);
            }
            url = event.url;
            skinCss = getSkinCss(event, opt);
            if (url) {
                html += "<a href='" + htmlEscape(url) + "'";
            }else{
                html += "<div";
            }
            html +=
                " class='" + classes.join(' ') + "'" +
                " style='position:absolute;z-index:8;left:"+left+"px;" + skinCss + "'" +
                ">" +
                "<div" +
                " class='fc-event-inner fc-event-skin'" +
                (skinCss ? " style='" + skinCss + "'" : '') +
                ">";
            if (!event.allDay && seg.isStart) {
                html +=
                    "<span class='fc-event-time'>" +
                    htmlEscape(formatDates(event.start, event.end, opt('timeFormat'))) +
                    "</span>";
            }
            html +=
                "<span class='fc-event-title'>" + htmlEscape(event.title) + "</span>";
                if (event.post_image[0] == undefined){
                    html += "</div>";
                }
            if (event.post_image[0] != undefined){
                html +=
                    "<div class='fc-event-image' align='center'><img style='height:74px;' src='" + event.post_image[0] + "'></div>" +
                    "</div>";
            }
            if (seg.isEnd && isEventResizable(event)) {
                html +=
                    "<div class='ui-resizable-handle ui-resizable-" + (rtl ? 'w' : 'e') + "'>" +
                    "&nbsp;&nbsp;&nbsp;" + // makes hit area a lot better for IE6/7
                    "</div>";
            }
            html +=
                "</" + (url ? "a" : "div" ) + ">";
            seg.left = left;
            seg.outerWidth = right - left;
            seg.startCol = leftCol;
            seg.endCol = rightCol + 1; // needs to be exclusive
        }
        return html;
    }
    
    
    function daySegElementResolve(segs, elements) { // sets seg.element
        var i;
        var segCnt = segs.length;
        var seg;
        var event;
        var element;
        var triggerRes;
        for (i=0; i<segCnt; i++) {
            seg = segs[i];
            event = seg.event;
            element = $(elements[i]); // faster than .eq()
            triggerRes = trigger('eventRender', event, event, element);
            if (triggerRes === false) {
                element.remove();
            }else{
                if (triggerRes && triggerRes !== true) {
                    triggerRes = $(triggerRes)
                        .css({
                            position: 'absolute',
                            left: seg.left
                        });
                    element.replaceWith(triggerRes);
                    element = triggerRes;
                }
                seg.element = element;
            }
        }
    }
    
    
    function daySegElementReport(segs) {
        var i;
        var segCnt = segs.length;
        var seg;
        var element;
        for (i=0; i<segCnt; i++) {
            seg = segs[i];
            element = seg.element;
            if (element) {
                reportEventElement(seg.event, element);
            }
        }
    }
    
    
    function daySegHandlers(segs, segmentContainer, modifiedEventId) {
        var i;
        var segCnt = segs.length;
        var seg;
        var element;
        var event;
        // retrieve elements, run through eventRender callback, bind handlers
        for (i=0; i<segCnt; i++) {
            seg = segs[i];
            element = seg.element;
            if (element) {
                event = seg.event;
                if (event._id === modifiedEventId) {
                    bindDaySeg(event, element, seg);
                }else{
                    element[0]._fci = i; // for lazySegBind
                }
            }
        }
        lazySegBind(segmentContainer, segs, bindDaySeg);
    }
    
    
    function daySegCalcHSides(segs) { // also sets seg.key
        var i;
        var segCnt = segs.length;
        var seg;
        var element;
        var key, val;
        var hsideCache = {};
        // record event horizontal sides
        for (i=0; i<segCnt; i++) {
            seg = segs[i];
            element = seg.element;
            if (element) {
                key = seg.key = cssKey(element[0]);
                val = hsideCache[key];
                if (val === undefined) {
                    val = hsideCache[key] = hsides(element, true);
                }
                seg.hsides = val;
            }
        }
    }
    
    
    function daySegSetWidths(segs) {
        var i;
        var segCnt = segs.length;
        var seg;
        var element;
        for (i=0; i<segCnt; i++) {
            seg = segs[i];
            element = seg.element;
            if (element) {
                element[0].style.width = Math.max(0, seg.outerWidth - seg.hsides) + 'px';
            }
        }
    }
    
    
    function daySegCalcHeights(segs) {
        var i;
        var segCnt = segs.length;
        var seg;
        var element;
        var key, val;
        var vmarginCache = {};
        // record event heights
        for (i=0; i<segCnt; i++) {
            seg = segs[i];
            element = seg.element;
            if (element) {
                key = seg.key; // created in daySegCalcHSides
                val = vmarginCache[key];
                if (val === undefined) {
                    val = vmarginCache[key] = vmargins(element);
                }
                seg.outerHeight = element[0].offsetHeight + val;
            }
        }
    }
    
    
    function getRowDivs() {
        var i;
        var rowCnt = getRowCnt();
        var rowDivs = [];
        for (i=0; i<rowCnt; i++) {
            rowDivs[i] = allDayRow(i)
                .find('td:first div.fc-day-content > div'); // optimal selector?
        }
        return rowDivs;
    }
    
    
    function getRowTops(rowDivs) {
        var i;
        var rowCnt = rowDivs.length;
        var tops = [];
        for (i=0; i<rowCnt; i++) {
            tops[i] = rowDivs[i][0].offsetTop; // !!?? but this means the element needs position:relative if in a table cell!!!!
        }
        return tops;
    }
    
    
    function daySegSetTops(segs, rowTops) { // also triggers eventAfterRender
        var i;
        var segCnt = segs.length;
        var seg;
        var element;
        var event;
        for (i=0; i<segCnt; i++) {
            seg = segs[i];
            element = seg.element;
            if (element) {
                element[0].style.top = rowTops[seg.row] + (seg.top||0) + 'px';
                event = seg.event;
                trigger('eventAfterRender', event, event, element);
            }
        }
    }
    
    
    
    /* Resizing
    -----------------------------------------------------------------------------------*/
    
    
    function resizableDayEvent(event, element, seg) {
        var rtl = opt('isRTL');
        var direction = rtl ? 'w' : 'e';
        var handle = element.find('div.ui-resizable-' + direction);
        var isResizing = false;
        
        // TODO: look into using jquery-ui mouse widget for this stuff
        disableTextSelection(element); // prevent native <a> selection for IE
        element
            .mousedown(function(ev) { // prevent native <a> selection for others
                ev.preventDefault();
            })
            .click(function(ev) {
                if (isResizing) {
                    ev.preventDefault(); // prevent link from being visited (only method that worked in IE6)
                    ev.stopImmediatePropagation(); // prevent fullcalendar eventClick handler from being called
                                                   // (eventElementHandlers needs to be bound after resizableDayEvent)
                }
            });
        
        handle.mousedown(function(ev) {
            if (ev.which != 1) {
                return; // needs to be left mouse button
            }
            isResizing = true;
            var hoverListener = t.getHoverListener();
            var rowCnt = getRowCnt();
            var colCnt = getColCnt();
            var dis = rtl ? -1 : 1;
            var dit = rtl ? colCnt-1 : 0;
            var elementTop = element.css('top');
            var dayDelta;
            var helpers;
            var eventCopy = $.extend({}, event);
            var minCell = dateCell(event.start);
            clearSelection();
            $('body')
                .css('cursor', direction + '-resize')
                .one('mouseup', mouseup);
            trigger('eventResizeStart', this, event, ev);
            hoverListener.start(function(cell, origCell) {
                if (cell) {
                    var r = Math.max(minCell.row, cell.row);
                    var c = cell.col;
                    if (rowCnt == 1) {
                        r = 0; // hack for all-day area in agenda views
                    }
                    if (r == minCell.row) {
                        if (rtl) {
                            c = Math.min(minCell.col, c);
                        }else{
                            c = Math.max(minCell.col, c);
                        }
                    }
                    dayDelta = (r*7 + c*dis+dit) - (origCell.row*7 + origCell.col*dis+dit);
                    var newEnd = addDays(eventEnd(event), dayDelta, true);
                    if (dayDelta) {
                        eventCopy.end = newEnd;
                        var oldHelpers = helpers;
                        helpers = renderTempDaySegs(compileDaySegs([eventCopy]), seg.row, elementTop);
                        helpers.find('*').css('cursor', direction + '-resize');
                        if (oldHelpers) {
                            oldHelpers.remove();
                        }
                        hideEvents(event);
                    }else{
                        if (helpers) {
                            showEvents(event);
                            helpers.remove();
                            helpers = null;
                        }
                    }
                    clearOverlays();
                    renderDayOverlay(event.start, addDays(cloneDate(newEnd), 1)); // coordinate grid already rebuild at hoverListener.start
                }
            }, ev);
            
            function mouseup(ev) {
                trigger('eventResizeStop', this, event, ev);
                $('body').css('cursor', '');
                hoverListener.stop();
                clearOverlays();
                if (dayDelta) {
                    eventResize(this, event, dayDelta, 0, ev);
                    // event redraw will clear helpers
                }
                // otherwise, the drag handler already restored the old events
                
                setTimeout(function() { // make this happen after the element's click event
                    isResizing = false;
                },0);
            }
            
        });
    }
    

}

//BUG: unselect needs to be triggered when events are dragged+dropped

function SelectionManager() {
    var t = this;
    
    
    // exports
    t.select = select;
    t.unselect = unselect;
    t.reportSelection = reportSelection;
    t.daySelectionMousedown = daySelectionMousedown;
    
    
    // imports
    var opt = t.opt;
    var trigger = t.trigger;
    var defaultSelectionEnd = t.defaultSelectionEnd;
    var renderSelection = t.renderSelection;
    var clearSelection = t.clearSelection;
    
    
    // locals
    var selected = false;



    // unselectAuto
    if (opt('selectable') && opt('unselectAuto')) {
        $(document).mousedown(function(ev) {
            var ignore = opt('unselectCancel');
            if (ignore) {
                if ($(ev.target).parents(ignore).length) { // could be optimized to stop after first match
                    return;
                }
            }
            unselect(ev);
        });
    }
    

    function select(startDate, endDate, allDay) {
        unselect();
        if (!endDate) {
            endDate = defaultSelectionEnd(startDate, allDay);
        }
        renderSelection(startDate, endDate, allDay);
        reportSelection(startDate, endDate, allDay);
    }
    
    
    function unselect(ev) {
        if (selected) {
            selected = false;
            clearSelection();
            trigger('unselect', null, ev);
        }
    }
    
    
    function reportSelection(startDate, endDate, allDay, ev) {
        selected = true;
        trigger('select', null, startDate, endDate, allDay, ev);
    }
    
    
    function daySelectionMousedown(ev) { // not really a generic manager method, oh well
        var cellDate = t.cellDate;
        var cellIsAllDay = t.cellIsAllDay;
        var hoverListener = t.getHoverListener();
        var reportDayClick = t.reportDayClick; // this is hacky and sort of weird
        if (ev.which == 1 && opt('selectable')) { // which==1 means left mouse button
            unselect(ev);
            var _mousedownElement = this;
            var dates;
            hoverListener.start(function(cell, origCell) { // TODO: maybe put cellDate/cellIsAllDay info in cell
                clearSelection();
                if (cell && cellIsAllDay(cell)) {
                    dates = [ cellDate(origCell), cellDate(cell) ].sort(cmp);
                    renderSelection(dates[0], dates[1], true);
                }else{
                    dates = null;
                }
            }, ev);
            $(document).one('mouseup', function(ev) {
                hoverListener.stop();
                if (dates) {
                    if (+dates[0] == +dates[1]) {
                        reportDayClick(dates[0], true, ev);
                    }
                    reportSelection(dates[0], dates[1], true, ev);
                }
            });
        }
    }


}
 
function OverlayManager() {
    var t = this;
    
    
    // exports
    t.renderOverlay = renderOverlay;
    t.clearOverlays = clearOverlays;
    
    
    // locals
    var usedOverlays = [];
    var unusedOverlays = [];
    
    
    function renderOverlay(rect, parent) {
        var e = unusedOverlays.shift();
        if (!e) {
            e = $("<div class='fc-cell-overlay' style='position:absolute;z-index:3'/>");
        }
        if (e[0].parentNode != parent[0]) {
            e.appendTo(parent);
        }
        usedOverlays.push(e.css(rect).show());
        return e;
    }
    

    function clearOverlays() {
        var e;
        while (e = usedOverlays.shift()) {
            unusedOverlays.push(e.hide().unbind());
        }
    }


}

function CoordinateGrid(buildFunc) {

    var t = this;
    var rows;
    var cols;
    
    
    t.build = function() {
        rows = [];
        cols = [];
        buildFunc(rows, cols);
    };
    
    
    t.cell = function(x, y) {
        var rowCnt = rows.length;
        var colCnt = cols.length;
        var i, r=-1, c=-1;
        for (i=0; i<rowCnt; i++) {
            if (y >= rows[i][0] && y < rows[i][1]) {
                r = i;
                break;
            }
        }
        for (i=0; i<colCnt; i++) {
            if (x >= cols[i][0] && x < cols[i][1]) {
                c = i;
                break;
            }
        }
        return (r>=0 && c>=0) ? { row:r, col:c } : null;
    };
    
    
    t.rect = function(row0, col0, row1, col1, originElement) { // row1,col1 is inclusive
        var origin = originElement.offset();
        return {
            top: rows[row0][0] - origin.top,
            left: cols[col0][0] - origin.left,
            width: cols[col1][1] - cols[col0][0],
            height: rows[row1][1] - rows[row0][0]
        };
    };

}

function HoverListener(coordinateGrid) {


    var t = this;
    var bindType;
    var change;
    var firstCell;
    var cell;
    
    
    t.start = function(_change, ev, _bindType) {
        change = _change;
        firstCell = cell = null;
        coordinateGrid.build();
        mouse(ev);
        bindType = _bindType || 'mousemove';
        $(document).bind(bindType, mouse);
    };
    
    
    function mouse(ev) {
        _fixUIEvent(ev); // see below
        var newCell = coordinateGrid.cell(ev.pageX, ev.pageY);
        if (!newCell != !cell || newCell && (newCell.row != cell.row || newCell.col != cell.col)) {
            if (newCell) {
                if (!firstCell) {
                    firstCell = newCell;
                }
                change(newCell, firstCell, newCell.row-firstCell.row, newCell.col-firstCell.col);
            }else{
                change(newCell, firstCell);
            }
            cell = newCell;
        }
    }
    
    
    t.stop = function() {
        $(document).unbind(bindType, mouse);
        return cell;
    };
    
    
}



// this fix was only necessary for jQuery UI 1.8.16 (and jQuery 1.7 or 1.7.1)
// upgrading to jQuery UI 1.8.17 (and using either jQuery 1.7 or 1.7.1) fixed the problem
// but keep this in here for 1.8.16 users
// and maybe remove it down the line

function _fixUIEvent(event) { // for issue 1168
    if (event.pageX === undefined) {
        event.pageX = event.originalEvent.pageX;
        event.pageY = event.originalEvent.pageY;
    }
}
function HorizontalPositionCache(getElement) {

    var t = this,
        elements = {},
        lefts = {},
        rights = {};
        
    function e(i) {
        return elements[i] = elements[i] || getElement(i);
    }
    
    t.left = function(i) {
        return lefts[i] = lefts[i] === undefined ? e(i).position().left : lefts[i];
    };
    
    t.right = function(i) {
        return rights[i] = rights[i] === undefined ? t.left(i) + e(i).width() : rights[i];
    };
    
    t.clear = function() {
        elements = {};
        lefts = {};
        rights = {};
    };
    
}

})(jQuery);

/*(function(m,ma){function wb(a){m.extend(true,Ya,a)}function Yb(a,b,e){function d(k){if(E){u();q();na();S(k)}else f()}function f(){B=b.theme?"ui":"fc";a.addClass("fc");b.isRTL&&a.addClass("fc-rtl");b.theme&&a.addClass("ui-widget");E=m("<div class='fc-content' style='position:relative'/>").prependTo(a);C=new Zb(X,b);(P=C.render())&&a.prepend(P);y(b.defaultView);m(window).resize(oa);t()||g()}function g(){setTimeout(function(){!n.start&&t()&&S()},0)}function l(){m(window).unbind("resize",oa);C.destroy();
E.remove();a.removeClass("fc fc-rtl ui-widget")}function j(){return i.offsetWidth!==0}function t(){return m("body")[0].offsetWidth!==0}function y(k){if(!n||k!=n.name){F++;pa();var D=n,Z;if(D){(D.beforeHide||xb)();Za(E,E.height());D.element.hide()}else Za(E,1);E.css("overflow","hidden");if(n=Y[k])n.element.show();else n=Y[k]=new Ja[k](Z=s=m("<div class='fc-view fc-view-"+k+"' style='position:absolute'/>").appendTo(E),X);D&&C.deactivateButton(D.name);C.activateButton(k);S();E.css("overflow","");D&&
Za(E,1);Z||(n.afterShow||xb)();F--}}function S(k){if(j()){F++;pa();o===ma&&u();var D=false;if(!n.start||k||r<n.start||r>=n.end){n.render(r,k||0);fa(true);D=true}else if(n.sizeDirty){n.clearEvents();fa();D=true}else if(n.eventsDirty){n.clearEvents();D=true}n.sizeDirty=false;n.eventsDirty=false;ga(D);W=a.outerWidth();C.updateTitle(n.title);k=new Date;k>=n.start&&k<n.end?C.disableButton("today"):C.enableButton("today");F--;n.trigger("viewDisplay",i)}}function Q(){q();if(j()){u();fa();pa();n.clearEvents();
n.renderEvents(J);n.sizeDirty=false}}function q(){m.each(Y,function(k,D){D.sizeDirty=true})}function u(){o=b.contentHeight?b.contentHeight:b.height?b.height-(P?P.height():0)-Sa(E):Math.round(E.width()/Math.max(b.aspectRatio,0.5))}function fa(k){F++;n.setHeight(o,k);if(s){s.css("position","relative");s=null}n.setWidth(E.width(),k);F--}function oa(){if(!F)if(n.start){var k=++v;setTimeout(function(){if(k==v&&!F&&j())if(W!=(W=a.outerWidth())){F++;Q();n.trigger("windowResize",i);F--}},200)}else g()}function ga(k){if(!b.lazyFetching||
ya(n.visStart,n.visEnd))ra();else k&&da()}function ra(){K(n.visStart,n.visEnd)}function sa(k){J=k;da()}function ha(k){da(k)}function da(k){na();if(j()){n.clearEvents();n.renderEvents(J,k);n.eventsDirty=false}}function na(){m.each(Y,function(k,D){D.eventsDirty=true})}function ua(k,D,Z){n.select(k,D,Z===ma?true:Z)}function pa(){n&&n.unselect()}function U(){S(-1)}function ca(){S(1)}function ka(){gb(r,-1);S()}function qa(){gb(r,1);S()}function G(){r=new Date;S()}function p(k,D,Z){if(k instanceof Date)r=
N(k);else yb(r,k,D,Z);S()}function L(k,D,Z){k!==ma&&gb(r,k);D!==ma&&hb(r,D);Z!==ma&&ba(r,Z);S()}function c(){return N(r)}function z(){return n}function H(k,D){if(D===ma)return b[k];if(k=="height"||k=="contentHeight"||k=="aspectRatio"){b[k]=D;Q()}}function T(k,D){if(b[k])return b[k].apply(D||i,Array.prototype.slice.call(arguments,2))}var X=this;X.options=b;X.render=d;X.destroy=l;X.refetchEvents=ra;X.reportEvents=sa;X.reportEventChange=ha;X.rerenderEvents=da;X.changeView=y;X.select=ua;X.unselect=pa;
X.prev=U;X.next=ca;X.prevYear=ka;X.nextYear=qa;X.today=G;X.gotoDate=p;X.incrementDate=L;X.formatDate=function(k,D){return Oa(k,D,b)};X.formatDates=function(k,D,Z){return ib(k,D,Z,b)};X.getDate=c;X.getView=z;X.option=H;X.trigger=T;$b.call(X,b,e);var ya=X.isFetchNeeded,K=X.fetchEvents,i=a[0],C,P,E,B,n,Y={},W,o,s,v=0,F=0,r=new Date,J=[],M;yb(r,b.year,b.month,b.date);b.droppable&&m(document).bind("dragstart",function(k,D){var Z=k.target,ja=m(Z);if(!ja.parents(".fc").length){var ia=b.dropAccept;if(m.isFunction(ia)?
ia.call(Z,ja):ja.is(ia)){M=Z;n.dragStart(M,k,D)}}}).bind("dragstop",function(k,D){if(M){n.dragStop(M,k,D);M=null}})}function Zb(a,b){function e(){q=b.theme?"ui":"fc";if(b.header)return Q=m("<table class='fc-header' style='width:100%'/>").append(m("<tr/>").append(f("left")).append(f("center")).append(f("right")))}function d(){Q.remove()}function f(u){var fa=m("<td class='fc-header-"+u+"'/>");(u=b.header[u])&&m.each(u.split(" "),function(oa){oa>0&&fa.append("<span class='fc-header-space'/>");var ga;
m.each(this.split(","),function(ra,sa){if(sa=="title"){fa.append("<span class='fc-header-title'><h2>&nbsp;</h2></span>");ga&&ga.addClass(q+"-corner-right");ga=null}else{var ha;if(a[sa])ha=a[sa];else if(Ja[sa])ha=function(){na.removeClass(q+"-state-hover");a.changeView(sa)};if(ha){ra=b.theme?jb(b.buttonIcons,sa):null;var da=jb(b.buttonText,sa),na=m("<span class='fc-button fc-button-"+sa+" "+q+"-state-default'><span class='fc-button-inner'><span class='fc-button-content'>"+(ra?"<span class='fc-icon-wrap'><span class='ui-icon ui-icon-"+
ra+"'/></span>":da)+"</span><span class='fc-button-effect'><span></span></span></span></span>");if(na){na.click(function(){na.hasClass(q+"-state-disabled")||ha()}).mousedown(function(){na.not("."+q+"-state-active").not("."+q+"-state-disabled").addClass(q+"-state-down")}).mouseup(function(){na.removeClass(q+"-state-down")}).hover(function(){na.not("."+q+"-state-active").not("."+q+"-state-disabled").addClass(q+"-state-hover")},function(){na.removeClass(q+"-state-hover").removeClass(q+"-state-down")}).appendTo(fa);
ga||na.addClass(q+"-corner-left");ga=na}}}});ga&&ga.addClass(q+"-corner-right")});return fa}function g(u){Q.find("h2").html(u)}function l(u){Q.find("span.fc-button-"+u).addClass(q+"-state-active")}function j(u){Q.find("span.fc-button-"+u).removeClass(q+"-state-active")}function t(u){Q.find("span.fc-button-"+u).addClass(q+"-state-disabled")}function y(u){Q.find("span.fc-button-"+u).removeClass(q+"-state-disabled")}var S=this;S.render=e;S.destroy=d;S.updateTitle=g;S.activateButton=l;S.deactivateButton=
j;S.disableButton=t;S.enableButton=y;var Q=m([]),q}function $b(a,b){function e(c,z){return!ca||c<ca||z>ka}function d(c,z){ca=c;ka=z;L=[];c=++qa;G=z=U.length;for(var H=0;H<z;H++)f(U[H],c)}function f(c,z){g(c,function(H){if(z==qa){if(H){for(var T=0;T<H.length;T++){H[T].source=c;oa(H[T])}L=L.concat(H)}G--;G||ua(L)}})}function g(c,z){var H,T=Aa.sourceFetchers,X;for(H=0;H<T.length;H++){X=T[H](c,ca,ka,z);if(X===true)return;else if(typeof X=="object"){g(X,z);return}}if(H=c.events)if(m.isFunction(H)){u();
H(N(ca),N(ka),function(C){z(C);fa()})}else m.isArray(H)?z(H):z();else if(c.url){var ya=c.success,K=c.error,i=c.complete;H=m.extend({},c.data||{});T=Ta(c.startParam,a.startParam);X=Ta(c.endParam,a.endParam);if(T)H[T]=Math.round(+ca/1E3);if(X)H[X]=Math.round(+ka/1E3);u();m.ajax(m.extend({},ac,c,{data:H,success:function(C){C=C||[];var P=$a(ya,this,arguments);if(m.isArray(P))C=P;z(C)},error:function(){$a(K,this,arguments);z()},complete:function(){$a(i,this,arguments);fa()}}))}else z()}function l(c){if(c=
j(c)){G++;f(c,qa)}}function j(c){if(m.isFunction(c)||m.isArray(c))c={events:c};else if(typeof c=="string")c={url:c};if(typeof c=="object"){ga(c);U.push(c);return c}}function t(c){U=m.grep(U,function(z){return!ra(z,c)});L=m.grep(L,function(z){return!ra(z.source,c)});ua(L)}function y(c){var z,H=L.length,T,X=na().defaultEventEnd,ya=c.start-c._start,K=c.end?c.end-(c._end||X(c)):0;for(z=0;z<H;z++){T=L[z];if(T._id==c._id&&T!=c){T.start=new Date(+T.start+ya);T.end=c.end?T.end?new Date(+T.end+K):new Date(+X(T)+
K):null;T.title=c.title;T.url=c.url;T.allDay=c.allDay;T.className=c.className;T.editable=c.editable;T.color=c.color;T.backgroudColor=c.backgroudColor;T.borderColor=c.borderColor;T.textColor=c.textColor;oa(T)}}oa(c);ua(L)}function S(c,z){oa(c);if(!c.source){if(z){pa.events.push(c);c.source=pa}L.push(c)}ua(L)}function Q(c){if(c){if(!m.isFunction(c)){var z=c+"";c=function(T){return T._id==z}}L=m.grep(L,c,true);for(H=0;H<U.length;H++)if(m.isArray(U[H].events))U[H].events=m.grep(U[H].events,c,true)}else{L=
[];for(var H=0;H<U.length;H++)if(m.isArray(U[H].events))U[H].events=[]}ua(L)}function q(c){if(m.isFunction(c))return m.grep(L,c);else if(c){c+="";return m.grep(L,function(z){return z._id==c})}return L}function u(){p++||da("loading",null,true)}function fa(){--p||da("loading",null,false)}function oa(c){var z=c.source||{},H=Ta(z.ignoreTimezone,a.ignoreTimezone);c._id=c._id||(c.id===ma?"_fc"+bc++:c.id+"");if(c.date){if(!c.start)c.start=c.date;delete c.date}c._start=N(c.start=kb(c.start,H));c.end=kb(c.end,
H);if(c.end&&c.end<=c.start)c.end=null;c._end=c.end?N(c.end):null;if(c.allDay===ma)c.allDay=Ta(z.allDayDefault,a.allDayDefault);if(c.className){if(typeof c.className=="string")c.className=c.className.split(/\s+/)}else c.className=[]}function ga(c){if(c.className){if(typeof c.className=="string")c.className=c.className.split(/\s+/)}else c.className=[];for(var z=Aa.sourceNormalizers,H=0;H<z.length;H++)z[H](c)}function ra(c,z){return c&&z&&sa(c)==sa(z)}function sa(c){return(typeof c=="object"?c.events||
c.url:"")||c}var ha=this;ha.isFetchNeeded=e;ha.fetchEvents=d;ha.addEventSource=l;ha.removeEventSource=t;ha.updateEvent=y;ha.renderEvent=S;ha.removeEvents=Q;ha.clientEvents=q;ha.normalizeEvent=oa;var da=ha.trigger,na=ha.getView,ua=ha.reportEvents,pa={events:[]},U=[pa],ca,ka,qa=0,G=0,p=0,L=[];for(ha=0;ha<b.length;ha++)j(b[ha])}function gb(a,b,e){a.setFullYear(a.getFullYear()+b);e||Ka(a);return a}function hb(a,b,e){if(+a){b=a.getMonth()+b;var d=N(a);d.setDate(1);d.setMonth(b);a.setMonth(b);for(e||Ka(a);a.getMonth()!=
d.getMonth();)a.setDate(a.getDate()+(a<d?1:-1))}return a}function ba(a,b,e){if(+a){b=a.getDate()+b;var d=N(a);d.setHours(9);d.setDate(b);a.setDate(b);e||Ka(a);lb(a,d)}return a}function lb(a,b){if(+a)for(;a.getDate()!=b.getDate();)a.setTime(+a+(a<b?1:-1)*cc)}function xa(a,b){a.setMinutes(a.getMinutes()+b);return a}function Ka(a){a.setHours(0);a.setMinutes(0);a.setSeconds(0);a.setMilliseconds(0);return a}function N(a,b){if(b)return Ka(new Date(+a));return new Date(+a)}function zb(){var a=0,b;do b=new Date(1970,
a++,1);while(b.getHours());return b}function Fa(a,b,e){for(b=b||1;!a.getDay()||e&&a.getDay()==1||!e&&a.getDay()==6;)ba(a,b);return a}function Ca(a,b){return Math.round((N(a,true)-N(b,true))/Ab)}function yb(a,b,e,d){if(b!==ma&&b!=a.getFullYear()){a.setDate(1);a.setMonth(0);a.setFullYear(b)}if(e!==ma&&e!=a.getMonth()){a.setDate(1);a.setMonth(e)}d!==ma&&a.setDate(d)}function kb(a,b){if(typeof a=="object")return a;if(typeof a=="number")return new Date(a*1E3);if(typeof a=="string"){if(a.match(/^\d+(\.\d+)?$/))return new Date(parseFloat(a)*
1E3);if(b===ma)b=true;return Bb(a,b)||(a?new Date(a):null)}return null}function Bb(a,b){a=a.match(/^([0-9]{4})(-([0-9]{2})(-([0-9]{2})([T ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2})(:?([0-9]{2}))?))?)?)?)?$/);if(!a)return null;var e=new Date(a[1],0,1);if(b||!a[13]){b=new Date(a[1],0,1,9,0);if(a[3]){e.setMonth(a[3]-1);b.setMonth(a[3]-1)}if(a[5]){e.setDate(a[5]);b.setDate(a[5])}lb(e,b);a[7]&&e.setHours(a[7]);a[8]&&e.setMinutes(a[8]);a[10]&&e.setSeconds(a[10]);a[12]&&e.setMilliseconds(Number("0."+
a[12])*1E3);lb(e,b)}else{e.setUTCFullYear(a[1],a[3]?a[3]-1:0,a[5]||1);e.setUTCHours(a[7]||0,a[8]||0,a[10]||0,a[12]?Number("0."+a[12])*1E3:0);if(a[14]){b=Number(a[16])*60+(a[18]?Number(a[18]):0);b*=a[15]=="-"?1:-1;e=new Date(+e+b*60*1E3)}}return e}function mb(a){if(typeof a=="number")return a*60;if(typeof a=="object")return a.getHours()*60+a.getMinutes();if(a=a.match(/(\d+)(?::(\d+))?\s*(\w+)?/)){var b=parseInt(a[1],10);if(a[3]){b%=12;if(a[3].toLowerCase().charAt(0)=="p")b+=12}return b*60+(a[2]?parseInt(a[2],
10):0)}}function Oa(a,b,e){return ib(a,null,b,e)}function ib(a,b,e,d){d=d||Ya;var f=a,g=b,l,j=e.length,t,y,S,Q="";for(l=0;l<j;l++){t=e.charAt(l);if(t=="'")for(y=l+1;y<j;y++){if(e.charAt(y)=="'"){if(f){Q+=y==l+1?"'":e.substring(l+1,y);l=y}break}}else if(t=="(")for(y=l+1;y<j;y++){if(e.charAt(y)==")"){l=Oa(f,e.substring(l+1,y),d);if(parseInt(l.replace(/\D/,""),10))Q+=l;l=y;break}}else if(t=="[")for(y=l+1;y<j;y++){if(e.charAt(y)=="]"){t=e.substring(l+1,y);l=Oa(f,t,d);if(l!=Oa(g,t,d))Q+=l;l=y;break}}else if(t==
"{"){f=b;g=a}else if(t=="}"){f=a;g=b}else{for(y=j;y>l;y--)if(S=dc[e.substring(l,y)]){if(f)Q+=S(f,d);l=y-1;break}if(y==l)if(f)Q+=t}}return Q}function Ua(a){return a.end?ec(a.end,a.allDay):ba(N(a.start),1)}function ec(a,b){a=N(a);return b||a.getHours()||a.getMinutes()?ba(a,1):Ka(a)}function fc(a,b){return(b.msLength-a.msLength)*100+(a.event.start-b.event.start)}function Cb(a,b){return a.end>b.start&&a.start<b.end}function nb(a,b,e,d){var f=[],g,l=a.length,j,t,y,S,Q;for(g=0;g<l;g++){j=a[g];t=j.start;
y=b[g];if(y>e&&t<d){if(t<e){t=N(e);S=false}else{t=t;S=true}if(y>d){y=N(d);Q=false}else{y=y;Q=true}f.push({event:j,start:t,end:y,isStart:S,isEnd:Q,msLength:y-t})}}return f.sort(fc)}function ob(a){var b=[],e,d=a.length,f,g,l,j;for(e=0;e<d;e++){f=a[e];for(g=0;;){l=false;if(b[g])for(j=0;j<b[g].length;j++)if(Cb(b[g][j],f)){l=true;break}if(l)g++;else break}if(b[g])b[g].push(f);else b[g]=[f]}return b}function Db(a,b,e){a.unbind("mouseover").mouseover(function(d){for(var f=d.target,g;f!=this;){g=f;f=f.parentNode}if((f=
g._fci)!==ma){g._fci=ma;g=b[f];e(g.event,g.element,g);m(d.target).trigger(d)}d.stopPropagation()})}function Va(a,b,e){for(var d=0,f;d<a.length;d++){f=m(a[d]);f.width(Math.max(0,b-pb(f,e)))}}function Eb(a,b,e){for(var d=0,f;d<a.length;d++){f=m(a[d]);f.height(Math.max(0,b-Sa(f,e)))}}function pb(a,b){return gc(a)+hc(a)+(b?ic(a):0)}function gc(a){return(parseFloat(m.css(a[0],"paddingLeft",true))||0)+(parseFloat(m.css(a[0],"paddingRight",true))||0)}function ic(a){return(parseFloat(m.css(a[0],"marginLeft",
true))||0)+(parseFloat(m.css(a[0],"marginRight",true))||0)}function hc(a){return(parseFloat(m.css(a[0],"borderLeftWidth",true))||0)+(parseFloat(m.css(a[0],"borderRightWidth",true))||0)}function Sa(a,b){return jc(a)+kc(a)+(b?Fb(a):0)}function jc(a){return(parseFloat(m.css(a[0],"paddingTop",true))||0)+(parseFloat(m.css(a[0],"paddingBottom",true))||0)}function Fb(a){return(parseFloat(m.css(a[0],"marginTop",true))||0)+(parseFloat(m.css(a[0],"marginBottom",true))||0)}function kc(a){return(parseFloat(m.css(a[0],
"borderTopWidth",true))||0)+(parseFloat(m.css(a[0],"borderBottomWidth",true))||0)}function Za(a,b){b=typeof b=="number"?b+"px":b;a.each(function(e,d){d.style.cssText+=";min-height:"+b+";_height:"+b})}function xb(){}function Gb(a,b){return a-b}function Hb(a){return Math.max.apply(Math,a)}function Pa(a){return(a<10?"0":"")+a}function jb(a,b){if(a[b]!==ma)return a[b];b=b.split(/(?=[A-Z])/);for(var e=b.length-1,d;e>=0;e--){d=a[b[e].toLowerCase()];if(d!==ma)return d}return a[""]}function Qa(a){return a.replace(/&/g,
"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#039;").replace(/"/g,"&quot;").replace(/\n/g,"<br />")}function Ib(a){return a.id+"/"+a.className+"/"+a.style.cssText.replace(/(^|;)\s*(top|left|width|height)\s*:[^;]*ig,"")}function qb(a){a.attr("unselectable","on").css("MozUserSelect","none").bind("selectstart.ui",function(){return false})}function ab(a){a.children().removeClass("fc-first fc-last").filter(":first-child").addClass("fc-first").end().filter(":last-child").addClass("fc-last")}
function rb(a,b){a.each(function(e,d){d.className=d.className.replace(/^fc-\w*,"fc-"+lc[b.getDay()])})}function Jb(a,b){var e=a.source||{},d=a.color,f=e.color,g=b("eventColor"),l=a.backgroundColor||d||e.backgroundColor||f||b("eventBackgroundColor")||g;d=a.borderColor||d||e.borderColor||f||b("eventBorderColor")||g;a=a.textColor||e.textColor||b("eventTextColor");b=[];l&&b.push("background-color:"+l);d&&b.push("border-color:"+d);a&&b.push("color:"+a);return b.join(";")}function $a(a,b,e){if(m.isFunction(a))a=
[a];if(a){var d,f;for(d=0;d<a.length;d++)f=a[d].apply(b,e)||f;return f}}function Ta(){for(var a=0;a<arguments.length;a++)if(arguments[a]!==ma)return arguments[a]}function mc(a,b){function e(j,t){if(t){hb(j,t);j.setDate(1)}j=N(j,true);j.setDate(1);t=hb(N(j),1);var y=N(j),S=N(t),Q=f("firstDay"),q=f("weekends")?0:1;if(q){Fa(y);Fa(S,-1,true)}ba(y,-((y.getDay()-Math.max(Q,q)+7)%7));ba(S,(7-S.getDay()+Math.max(Q,q))%7);Q=Math.round((S-y)/(Ab*7));if(f("weekMode")=="fixed"){ba(S,(6-Q)*7);Q=6}d.title=l(j,
f("titleFormat"));d.start=j;d.end=t;d.visStart=y;d.visEnd=S;g(6,Q,q?5:7,true)}var d=this;d.render=e;sb.call(d,a,b,"month");var f=d.opt,g=d.renderBasic,l=b.formatDate}function nc(a,b){function e(j,t){t&&ba(j,t*7);j=ba(N(j),-((j.getDay()-f("firstDay")+7)%7));t=ba(N(j),7);var y=N(j),S=N(t),Q=f("weekends");if(!Q){Fa(y);Fa(S,-1,true)}d.title=l(y,ba(N(S),-1),f("titleFormat"));d.start=j;d.end=t;d.visStart=y;d.visEnd=S;g(1,1,Q?7:5,false)}var d=this;d.render=e;sb.call(d,a,b,"basicWeek");var f=d.opt,g=d.renderBasic,
l=b.formatDates}function oc(a,b){function e(j,t){if(t){ba(j,t);f("weekends")||Fa(j,t<0?-1:1)}d.title=l(j,f("titleFormat"));d.start=d.visStart=N(j,true);d.end=d.visEnd=ba(N(d.start),1);g(1,1,1,false)}var d=this;d.render=e;sb.call(d,a,b,"basicDay");var f=d.opt,g=d.renderBasic,l=b.formatDate}function sb(a,b,e){function d(w,I,R,V){v=I;F=R;f();(I=!C)?g(w,V):z();l(I)}function f(){if(k=L("isRTL")){D=-1;Z=F-1}else{D=1;Z=0}ja=L("firstDay");ia=L("weekends")?0:1;la=L("theme")?"ui":"fc";$=L("columnFormat")}function g(w,
I){var R,V=la+"-widget-header",ea=la+"-widget-content",aa;R="<table class='fc-border-separate' style='width:100%' cellspacing='0'><thead><tr>";for(aa=0;aa<F;aa++)R+="<th class='fc- "+V+"'/>";R+="</tr></thead><tbody>";for(aa=0;aa<w;aa++){R+="<tr class='fc-week"+aa+"'>";for(V=0;V<F;V++)R+="<td class='fc- "+ea+" fc-day"+(aa*F+V)+"'><div>"+(I?"<div class='fc-day-number'/>":"")+"<div class='fc-day-content'><div style='position:relative'>&nbsp;</div></div></div></td>";R+="</tr>"}R+="</tbody></table>";w=
m(R).appendTo(a);K=w.find("thead");i=K.find("th");C=w.find("tbody");P=C.find("tr");E=C.find("td");B=E.filter(":first-child");n=P.eq(0).find("div.fc-day-content div");ab(K.add(K.find("tr")));ab(P);P.eq(0).addClass("fc-first");y(E);Y=m("<div style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(a)}function l(w){var I=w||v==1,R=p.start.getMonth(),V=Ka(new Date),ea,aa,va;I&&i.each(function(wa,Ga){ea=m(Ga);aa=ca(wa);ea.html(ya(aa,$));rb(ea,aa)});E.each(function(wa,Ga){ea=m(Ga);aa=ca(wa);aa.getMonth()==
R?ea.removeClass("fc-other-month"):ea.addClass("fc-other-month");+aa==+V?ea.addClass(la+"-state-highlight fc-today"):ea.removeClass(la+"-state-highlight fc-today");ea.find("div.fc-day-number").text(aa.getDate());I&&rb(ea,aa)});P.each(function(wa,Ga){va=m(Ga);if(wa<v){va.show();wa==v-1?va.addClass("fc-last"):va.removeClass("fc-last")}else va.hide()})}function j(w){o=w;w=o-K.height();var I,R,V;if(L("weekMode")=="variable")I=R=Math.floor(w/(v==1?2:6));else{I=Math.floor(w/v);R=w-I*(v-1)}B.each(function(ea,
aa){if(ea<v){V=m(aa);Za(V.find("> div"),(ea==v-1?R:I)-Sa(V))}})}function t(w){W=w;M.clear();s=Math.floor(W/F);Va(i.slice(0,-1),s)}function y(w){w.click(S).mousedown(X)}function S(w){if(!L("selectable")){var I=parseInt(this.className.match(/fc\-day(\d+)/)[1]);I=ca(I);c("dayClick",this,I,true,w)}}function Q(w,I,R){R&&r.build();R=N(p.visStart);for(var V=ba(N(R),F),ea=0;ea<v;ea++){var aa=new Date(Math.max(R,w)),va=new Date(Math.min(V,I));if(aa<va){var wa;if(k){wa=Ca(va,R)*D+Z+1;aa=Ca(aa,R)*D+Z+1}else{wa=
Ca(aa,R);aa=Ca(va,R)}y(q(ea,wa,ea,aa-1))}ba(R,7);ba(V,7)}}function q(w,I,R,V){w=r.rect(w,I,R,V,a);return H(w,a)}function u(w){return N(w)}function fa(w,I){Q(w,ba(N(I),1),true)}function oa(){T()}function ga(w,I,R){var V=ua(w);c("dayClick",E[V.row*F+V.col],w,I,R)}function ra(w,I){J.start(function(R){T();R&&q(R.row,R.col,R.row,R.col)},I)}function sa(w,I,R){var V=J.stop();T();if(V){V=pa(V);c("drop",w,V,true,I,R)}}function ha(w){return N(w.start)}function da(w){return M.left(w)}function na(w){return M.right(w)}
function ua(w){return{row:Math.floor(Ca(w,p.visStart)/7),col:ka(w.getDay())}}function pa(w){return U(w.row,w.col)}function U(w,I){return ba(N(p.visStart),w*7+I*D+Z)}function ca(w){return U(Math.floor(w/F),w%F)}function ka(w){return(w-Math.max(ja,ia)+F)%F*D+Z}function qa(w){return P.eq(w)}function G(){return{left:0,right:W}}var p=this;p.renderBasic=d;p.setHeight=j;p.setWidth=t;p.renderDayOverlay=Q;p.defaultSelectionEnd=u;p.renderSelection=fa;p.clearSelection=oa;p.reportDayClick=ga;p.dragStart=ra;p.dragStop=
sa;p.defaultEventEnd=ha;p.getHoverListener=function(){return J};p.colContentLeft=da;p.colContentRight=na;p.dayOfWeekCol=ka;p.dateCell=ua;p.cellDate=pa;p.cellIsAllDay=function(){return true};p.allDayRow=qa;p.allDayBounds=G;p.getRowCnt=function(){return v};p.getColCnt=function(){return F};p.getColWidth=function(){return s};p.getDaySegmentContainer=function(){return Y};Kb.call(p,a,b,e);Lb.call(p);Mb.call(p);pc.call(p);var L=p.opt,c=p.trigger,z=p.clearEvents,H=p.renderOverlay,T=p.clearOverlays,X=p.daySelectionMousedown,
ya=b.formatDate,K,i,C,P,E,B,n,Y,W,o,s,v,F,r,J,M,k,D,Z,ja,ia,la,$;qb(a.addClass("fc-grid"));r=new Nb(function(w,I){var R,V,ea;i.each(function(aa,va){R=m(va);V=R.offset().left;if(aa)ea[1]=V;ea=[V];I[aa]=ea});ea[1]=V+R.outerWidth();P.each(function(aa,va){if(aa<v){R=m(va);V=R.offset().top;if(aa)ea[1]=V;ea=[V];w[aa]=ea}});ea[1]=V+R.outerHeight()});J=new Ob(r);M=new Pb(function(w){return n.eq(w)})}function pc(){function a(U,ca){S(U);ua(e(U),ca)}function b(){Q();ga().empty()}function e(U){var ca=da(),ka=
na(),qa=N(g.visStart);ka=ba(N(qa),ka);var G=m.map(U,Ua),p,L,c,z,H,T,X=[];for(p=0;p<ca;p++){L=ob(nb(U,G,qa,ka));for(c=0;c<L.length;c++){z=L[c];for(H=0;H<z.length;H++){T=z[H];T.row=p;T.level=c;X.push(T)}}ba(qa,7);ba(ka,7)}return X}function d(U,ca,ka){t(U)&&f(U,ca);ka.isEnd&&y(U)&&pa(U,ca,ka);q(U,ca)}function f(U,ca){var ka=ra(),qa;ca.draggable({zIndex:9,delay:50,opacity:l("dragOpacity"),revertDuration:l("dragRevertDuration"),start:function(G,p){j("eventDragStart",ca,U,G,p);fa(U,ca);ka.start(function(L,
c,z,H){ca.draggable("option","revert",!L||!z&&!H);ha();if(L){qa=z*7+H*(l("isRTL")?-1:1);sa(ba(N(U.start),qa),ba(Ua(U),qa))}else qa=0},G,"drag")},stop:function(G,p){ka.stop();ha();j("eventDragStop",ca,U,G,p);if(qa)oa(this,U,qa,0,U.allDay,G,p);else{ca.css("filter","");u(U,ca)}}})}var g=this;g.renderEvents=a;g.compileDaySegs=e;g.clearEvents=b;g.bindDaySeg=d;Qb.call(g);var l=g.opt,j=g.trigger,t=g.isEventDraggable,y=g.isEventResizable,S=g.reportEvents,Q=g.reportEventClear,q=g.eventElementHandlers,u=g.showEvents,
fa=g.hideEvents,oa=g.eventDrop,ga=g.getDaySegmentContainer,ra=g.getHoverListener,sa=g.renderDayOverlay,ha=g.clearOverlays,da=g.getRowCnt,na=g.getColCnt,ua=g.renderDaySegs,pa=g.resizableDayEvent}function qc(a,b){function e(j,t){t&&ba(j,t*7);j=ba(N(j),-((j.getDay()-f("firstDay")+7)%7));t=ba(N(j),7);var y=N(j),S=N(t),Q=f("weekends");if(!Q){Fa(y);Fa(S,-1,true)}d.title=l(y,ba(N(S),-1),f("titleFormat"));d.start=j;d.end=t;d.visStart=y;d.visEnd=S;g(Q?7:5)}var d=this;d.render=e;Rb.call(d,a,b,"agendaWeek");
var f=d.opt,g=d.renderAgenda,l=b.formatDates}function rc(a,b){function e(j,t){if(t){ba(j,t);f("weekends")||Fa(j,t<0?-1:1)}t=N(j,true);var y=ba(N(t),1);d.title=l(j,f("titleFormat"));d.start=d.visStart=t;d.end=d.visEnd=y;g(1)}var d=this;d.render=e;Rb.call(d,a,b,"agendaDay");var f=d.opt,g=d.renderAgenda,l=b.formatDate}function Rb(a,b,e){function d(h){Ba=h;f();v?P():g();l()}function f(){Wa=i("theme")?"ui":"fc";Sb=i("weekends")?0:1;Tb=i("firstDay");if(Ub=i("isRTL")){Ha=-1;Ia=Ba-1}else{Ha=1;Ia=0}La=mb(i("minTime"));
bb=mb(i("maxTime"));Vb=i("columnFormat")}function g(){var h=Wa+"-widget-header",O=Wa+"-widget-content",x,A,ta,za,Da,Ea=i("slotMinutes")%15==0;x="<table style='width:100%' class='fc-agenda-days fc-border-separate' cellspacing='0'><thead><tr><th class='fc-agenda-axis "+h+"'>&nbsp;</th>";for(A=0;A<Ba;A++)x+="<th class='fc- fc-col"+A+" "+h+"'/>";x+="<th class='fc-agenda-gutter "+h+"'>&nbsp;</th></tr></thead><tbody><tr><th class='fc-agenda-axis "+h+"'>&nbsp;</th>";for(A=0;A<Ba;A++)x+="<td class='fc- fc-col"+
A+" "+O+"'><div><div class='fc-day-content'><div style='position:relative'>&nbsp;</div></div></div></td>";x+="<td class='fc-agenda-gutter "+O+"'>&nbsp;</td></tr></tbody></table>";v=m(x).appendTo(a);F=v.find("thead");r=F.find("th").slice(1,-1);J=v.find("tbody");M=J.find("td").slice(0,-1);k=M.find("div.fc-day-content div");D=M.eq(0);Z=D.find("> div");ab(F.add(F.find("tr")));ab(J.add(J.find("tr")));aa=F.find("th:first");va=v.find(".fc-agenda-gutter");ja=m("<div style='position:absolute;z-index:2;left:0;width:100%'/>").appendTo(a);
if(i("allDaySlot")){ia=m("<div style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(ja);x="<table style='width:100%' class='fc-agenda-allday' cellspacing='0'><tr><th class='"+h+" fc-agenda-axis'>"+i("allDayText")+"</th><td><div class='fc-day-content'><div style='position:relative'/></div></td><th class='"+h+" fc-agenda-gutter'>&nbsp;</th></tr></table>";la=m(x).appendTo(ja);$=la.find("tr");q($.find("td"));aa=aa.add(la.find("th:first"));va=va.add(la.find("th.fc-agenda-gutter"));ja.append("<div class='fc-agenda-divider "+
h+"'><div class='fc-agenda-divider-inner'/></div>")}else ia=m([]);w=m("<div style='position:absolute;width:100%;overflow-x:hidden;overflow-y:auto'/>").appendTo(ja);I=m("<div style='position:relative;width:100%;overflow:hidden'/>").appendTo(w);R=m("<div style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(I);x="<table class='fc-agenda-slots' style='width:100%' cellspacing='0'><tbody>";ta=zb();za=xa(N(ta),bb);xa(ta,La);for(A=tb=0;ta<za;A++){Da=ta.getMinutes();x+="<tr class='fc-slot"+A+" "+
(!Da?"":"fc-minor")+"'><th class='fc-agenda-axis "+h+"'>"+(!Ea||!Da?s(ta,i("axisFormat")):"&nbsp;")+"</th><td class='"+O+"'><div style='position:relative'>&nbsp;</div></td></tr>";xa(ta,i("slotMinutes"));tb++}x+="</tbody></table>";V=m(x).appendTo(I);ea=V.find("div:first");u(V.find("td"));aa=aa.add(V.find("th:first"))}function l(){var h,O,x,A,ta=Ka(new Date);for(h=0;h<Ba;h++){A=ua(h);O=r.eq(h);O.html(s(A,Vb));x=M.eq(h);+A==+ta?x.addClass(Wa+"-state-highlight fc-today"):x.removeClass(Wa+"-state-highlight fc-today");
rb(O.add(x),A)}}function j(h,O){if(h===ma)h=Wb;Wb=h;ub={};var x=J.position().top,A=w.position().top;h=Math.min(h-x,V.height()+A+1);Z.height(h-Sa(D));ja.css("top",x);w.height(h-A-1);Xa=ea.height()+1;O&&y()}function t(h){Ga=h;cb.clear();Ma=0;Va(aa.width("").each(function(O,x){Ma=Math.max(Ma,m(x).outerWidth())}),Ma);h=w[0].clientWidth;if(vb=w.width()-h){Va(va,vb);va.show().prev().removeClass("fc-last")}else va.hide().prev().addClass("fc-last");db=Math.floor((h-Ma)/Ba);Va(r.slice(0,-1),db)}function y(){function h(){w.scrollTop(A)}
var O=zb(),x=N(O);x.setHours(i("firstHour"));var A=ca(O,x)+1;h();setTimeout(h,0)}function S(){Xb=w.scrollTop()}function Q(){w.scrollTop(Xb)}function q(h){h.click(fa).mousedown(W)}function u(h){h.click(fa).mousedown(H)}function fa(h){if(!i("selectable")){var O=Math.min(Ba-1,Math.floor((h.pageX-v.offset().left-Ma)/db)),x=ua(O),A=this.parentNode.className.match(/fc-slot(\d+)/);if(A){A=parseInt(A[1])*i("slotMinutes");var ta=Math.floor(A/60);x.setHours(ta);x.setMinutes(A%60+La);C("dayClick",M[O],x,false,
h)}else C("dayClick",M[O],x,true,h)}}function oa(h,O,x){x&&Na.build();var A=N(K.visStart);if(Ub){x=Ca(O,A)*Ha+Ia+1;h=Ca(h,A)*Ha+Ia+1}else{x=Ca(h,A);h=Ca(O,A)}x=Math.max(0,x);h=Math.min(Ba,h);x<h&&q(ga(0,x,0,h-1))}function ga(h,O,x,A){h=Na.rect(h,O,x,A,ja);return E(h,ja)}function ra(h,O){for(var x=N(K.visStart),A=ba(N(x),1),ta=0;ta<Ba;ta++){var za=new Date(Math.max(x,h)),Da=new Date(Math.min(A,O));if(za<Da){var Ea=ta*Ha+Ia;Ea=Na.rect(0,Ea,0,Ea,I);za=ca(x,za);Da=ca(x,Da);Ea.top=za;Ea.height=Da-za;u(E(Ea,
I))}ba(x,1);ba(A,1)}}function sa(h){return cb.left(h)}function ha(h){return cb.right(h)}function da(h){return{row:Math.floor(Ca(h,K.visStart)/7),col:U(h.getDay())}}function na(h){var O=ua(h.col);h=h.row;i("allDaySlot")&&h--;h>=0&&xa(O,La+h*i("slotMinutes"));return O}function ua(h){return ba(N(K.visStart),h*Ha+Ia)}function pa(h){return i("allDaySlot")&&!h.row}function U(h){return(h-Math.max(Tb,Sb)+Ba)%Ba*Ha+Ia}function ca(h,O){h=N(h,true);if(O<xa(N(h),La))return 0;if(O>=xa(N(h),bb))return V.height();
h=i("slotMinutes");O=O.getHours()*60+O.getMinutes()-La;var x=Math.floor(O/h),A=ub[x];if(A===ma)A=ub[x]=V.find("tr:eq("+x+") td div")[0].offsetTop;return Math.max(0,Math.round(A-1+Xa*(O%h/h)))}function ka(){return{left:Ma,right:Ga-vb}}function qa(){return $}function G(h){var O=N(h.start);if(h.allDay)return O;return xa(O,i("defaultEventMinutes"))}function p(h,O){if(O)return N(h);return xa(N(h),i("slotMinutes"))}function L(h,O,x){if(x)i("allDaySlot")&&oa(h,ba(N(O),1),true);else c(h,O)}function c(h,O){var x=
i("selectHelper");Na.build();if(x){var A=Ca(h,K.visStart)*Ha+Ia;if(A>=0&&A<Ba){A=Na.rect(0,A,0,A,I);var ta=ca(h,h),za=ca(h,O);if(za>ta){A.top=ta;A.height=za-ta;A.left+=2;A.width-=5;if(m.isFunction(x)){if(h=x(h,O)){A.position="absolute";A.zIndex=8;wa=m(h).css(A).appendTo(I)}}else{A.isStart=true;A.isEnd=true;wa=m(o({title:"",start:h,end:O,className:["fc-select-helper"],editable:false},A));wa.css("opacity",i("dragOpacity"))}if(wa){u(wa);I.append(wa);Va(wa,A.width,true);Eb(wa,A.height,true)}}}}else ra(h,
O)}function z(){B();if(wa){wa.remove();wa=null}}function H(h){if(h.which==1&&i("selectable")){Y(h);var O;Ra.start(function(x,A){z();if(x&&x.col==A.col&&!pa(x)){A=na(A);x=na(x);O=[A,xa(N(A),i("slotMinutes")),x,xa(N(x),i("slotMinutes"))].sort(Gb);c(O[0],O[3])}else O=null},h);m(document).one("mouseup",function(x){Ra.stop();if(O){+O[0]==+O[1]&&T(O[0],false,x);n(O[0],O[3],false,x)}})}}function T(h,O,x){C("dayClick",M[U(h.getDay())],h,O,x)}function X(h,O){Ra.start(function(x){B();if(x)if(pa(x))ga(x.row,
x.col,x.row,x.col);else{x=na(x);var A=xa(N(x),i("defaultEventMinutes"));ra(x,A)}},O)}function ya(h,O,x){var A=Ra.stop();B();A&&C("drop",h,na(A),pa(A),O,x)}var K=this;K.renderAgenda=d;K.setWidth=t;K.setHeight=j;K.beforeHide=S;K.afterShow=Q;K.defaultEventEnd=G;K.timePosition=ca;K.dayOfWeekCol=U;K.dateCell=da;K.cellDate=na;K.cellIsAllDay=pa;K.allDayRow=qa;K.allDayBounds=ka;K.getHoverListener=function(){return Ra};K.colContentLeft=sa;K.colContentRight=ha;K.getDaySegmentContainer=function(){return ia};
K.getSlotSegmentContainer=function(){return R};K.getMinMinute=function(){return La};K.getMaxMinute=function(){return bb};K.getBodyContent=function(){return I};K.getRowCnt=function(){return 1};K.getColCnt=function(){return Ba};K.getColWidth=function(){return db};K.getSlotHeight=function(){return Xa};K.defaultSelectionEnd=p;K.renderDayOverlay=oa;K.renderSelection=L;K.clearSelection=z;K.reportDayClick=T;K.dragStart=X;K.dragStop=ya;Kb.call(K,a,b,e);Lb.call(K);Mb.call(K);sc.call(K);var i=K.opt,C=K.trigger,
P=K.clearEvents,E=K.renderOverlay,B=K.clearOverlays,n=K.reportSelection,Y=K.unselect,W=K.daySelectionMousedown,o=K.slotSegHtml,s=b.formatDate,v,F,r,J,M,k,D,Z,ja,ia,la,$,w,I,R,V,ea,aa,va,wa,Ga,Wb,Ma,db,vb,Xa,Xb,Ba,tb,Na,Ra,cb,ub={},Wa,Tb,Sb,Ub,Ha,Ia,La,bb,Vb;qb(a.addClass("fc-agenda"));Na=new Nb(function(h,O){function x(eb){return Math.max(Ea,Math.min(tc,eb))}var A,ta,za;r.each(function(eb,uc){A=m(uc);ta=A.offset().left;if(eb)za[1]=ta;za=[ta];O[eb]=za});za[1]=ta+A.outerWidth();if(i("allDaySlot")){A=
$;ta=A.offset().top;h[0]=[ta,ta+A.outerHeight()]}for(var Da=I.offset().top,Ea=w.offset().top,tc=Ea+w.outerHeight(),fb=0;fb<tb;fb++)h.push([x(Da+Xa*fb),x(Da+Xa*(fb+1))])});Ra=new Ob(Na);cb=new Pb(function(h){return k.eq(h)})}function sc(){function a(o,s){sa(o);var v,F=o.length,r=[],J=[];for(v=0;v<F;v++)o[v].allDay?r.push(o[v]):J.push(o[v]);if(u("allDaySlot")){L(e(r),s);na()}g(d(J),s)}function b(){ha();ua().empty();pa().empty()}function e(o){o=ob(nb(o,m.map(o,Ua),q.visStart,q.visEnd));var s,v=o.length,
F,r,J,M=[];for(s=0;s<v;s++){F=o[s];for(r=0;r<F.length;r++){J=F[r];J.row=0;J.level=s;M.push(J)}}return M}function d(o){var s=z(),v=ka(),F=ca(),r=xa(N(q.visStart),v),J=m.map(o,f),M,k,D,Z,ja,ia,la=[];for(M=0;M<s;M++){k=ob(nb(o,J,r,xa(N(r),F-v)));vc(k);for(D=0;D<k.length;D++){Z=k[D];for(ja=0;ja<Z.length;ja++){ia=Z[ja];ia.col=M;ia.level=D;la.push(ia)}}ba(r,1,true)}return la}function f(o){return o.end?N(o.end):xa(N(o.start),u("defaultEventMinutes"))}function g(o,s){var v,F=o.length,r,J,M,k,D,Z,ja,ia,la,
$="",w,I,R={},V={},ea=pa(),aa;v=z();if(w=u("isRTL")){I=-1;aa=v-1}else{I=1;aa=0}for(v=0;v<F;v++){r=o[v];J=r.event;M=qa(r.start,r.start);k=qa(r.start,r.end);D=r.col;Z=r.level;ja=r.forward||0;ia=G(D*I+aa);la=p(D*I+aa)-ia;la=Math.min(la-6,la*0.95);D=Z?la/(Z+ja+1):ja?(la/(ja+1)-6)*2:la;Z=ia+la/(Z+ja+1)*Z*I+(w?la-D:0);r.top=M;r.left=Z;r.outerWidth=D;r.outerHeight=k-M;$+=l(J,r)}ea[0].innerHTML=$;w=ea.children();for(v=0;v<F;v++){r=o[v];J=r.event;$=m(w[v]);I=fa("eventRender",J,J,$);if(I===false)$.remove();
else{if(I&&I!==true){$.remove();$=m(I).css({position:"absolute",top:r.top,left:r.left}).appendTo(ea)}r.element=$;if(J._id===s)t(J,$,r);else $[0]._fci=v;ya(J,$)}}Db(ea,o,t);for(v=0;v<F;v++){r=o[v];if($=r.element){J=R[s=r.key=Ib($[0])];r.vsides=J===ma?(R[s]=Sa($,true)):J;J=V[s];r.hsides=J===ma?(V[s]=pb($,true)):J;s=$.find("div.fc-event-content");if(s.length)r.contentTop=s[0].offsetTop}}for(v=0;v<F;v++){r=o[v];if($=r.element){$[0].style.width=Math.max(0,r.outerWidth-r.hsides)+"px";R=Math.max(0,r.outerHeight-
r.vsides);$[0].style.height=R+"px";J=r.event;if(r.contentTop!==ma&&R-r.contentTop<10){$.find("div.fc-event-time").text(Y(J.start,u("timeFormat"))+" - "+J.title);$.find("div.fc-event-title").remove()}fa("eventAfterRender",J,J,$)}}}function l(o,s){var v="<",F=o.url,r=Jb(o,u),J=r?" style='"+r+"'":"",M=["fc-event","fc-event-skin","fc-event-vert"];oa(o)&&M.push("fc-event-draggable");s.isStart&&M.push("fc-corner-top");s.isEnd&&M.push("fc-corner-bottom");M=M.concat(o.className);if(o.source)M=M.concat(o.source.className||
[]);v+=F?"a href='"+Qa(o.url)+"'":"div";v+=" class='"+M.join(" ")+"' style='position:absolute;z-index:8;top:"+s.top+"px;left:"+s.left+"px;"+r+"'><div class='fc-event-inner fc-event-skin'"+J+"><div class='fc-event-head fc-event-skin'"+J+"><div class='fc-event-time'>"+Qa(W(o.start,o.end,u("timeFormat")))+"</div></div><div class='fc-event-content'><div class='fc-event-title'>"+Qa(o.title)+"</div></div><div class='fc-event-bg'></div></div>";if(s.isEnd&&ga(o))v+="<div class='ui-resizable-handle ui-resizable-s'>=</div>";
v+="</"+(F?"a":"div")+">";return v}function j(o,s,v){oa(o)&&y(o,s,v.isStart);v.isEnd&&ga(o)&&c(o,s,v);da(o,s)}function t(o,s,v){var F=s.find("div.fc-event-time");oa(o)&&S(o,s,F);v.isEnd&&ga(o)&&Q(o,s,F);da(o,s)}function y(o,s,v){function F(){if(!M){s.width(r).height("").draggable("option","grid",null);M=true}}var r,J,M=true,k,D=u("isRTL")?-1:1,Z=U(),ja=H(),ia=T(),la=ka();s.draggable({zIndex:9,opacity:u("dragOpacity","month"),revertDuration:u("dragRevertDuration"),start:function($,w){fa("eventDragStart",
s,o,$,w);i(o,s);r=s.width();Z.start(function(I,R,V,ea){B();if(I){J=false;k=ea*D;if(I.row)if(v){if(M){s.width(ja-10);Eb(s,ia*Math.round((o.end?(o.end-o.start)/wc:u("defaultEventMinutes"))/u("slotMinutes")));s.draggable("option","grid",[ja,1]);M=false}}else J=true;else{E(ba(N(o.start),k),ba(Ua(o),k));F()}J=J||M&&!k}else{F();J=true}s.draggable("option","revert",J)},$,"drag")},stop:function($,w){Z.stop();B();fa("eventDragStop",s,o,$,w);if(J){F();s.css("filter","");K(o,s)}else{var I=0;M||(I=Math.round((s.offset().top-
X().offset().top)/ia)*u("slotMinutes")+la-(o.start.getHours()*60+o.start.getMinutes()));C(this,o,k,I,M,$,w)}}})}function S(o,s,v){function F(I){var R=xa(N(o.start),I),V;if(o.end)V=xa(N(o.end),I);v.text(W(R,V,u("timeFormat")))}function r(){if(M){v.css("display","");s.draggable("option","grid",[$,w]);M=false}}var J,M=false,k,D,Z,ja=u("isRTL")?-1:1,ia=U(),la=z(),$=H(),w=T();s.draggable({zIndex:9,scroll:false,grid:[$,w],axis:la==1?"y":false,opacity:u("dragOpacity"),revertDuration:u("dragRevertDuration"),
start:function(I,R){fa("eventDragStart",s,o,I,R);i(o,s);J=s.position();D=Z=0;ia.start(function(V,ea,aa,va){s.draggable("option","revert",!V);B();if(V){k=va*ja;if(u("allDaySlot")&&!V.row){if(!M){M=true;v.hide();s.draggable("option","grid",null)}E(ba(N(o.start),k),ba(Ua(o),k))}else r()}},I,"drag")},drag:function(I,R){D=Math.round((R.position.top-J.top)/w)*u("slotMinutes");if(D!=Z){M||F(D);Z=D}},stop:function(I,R){var V=ia.stop();B();fa("eventDragStop",s,o,I,R);if(V&&(k||D||M))C(this,o,k,M?0:D,M,I,R);
else{r();s.css("filter","");s.css(J);F(0);K(o,s)}}})}function Q(o,s,v){var F,r,J=T();s.resizable({handles:{s:"div.ui-resizable-s"},grid:J,start:function(M,k){F=r=0;i(o,s);s.css("z-index",9);fa("eventResizeStart",this,o,M,k)},resize:function(M,k){F=Math.round((Math.max(J,s.height())-k.originalSize.height)/J);if(F!=r){v.text(W(o.start,!F&&!o.end?null:xa(ra(o),u("slotMinutes")*F),u("timeFormat")));r=F}},stop:function(M,k){fa("eventResizeStop",this,o,M,k);if(F)P(this,o,0,u("slotMinutes")*F,M,k);else{s.css("z-index",
8);K(o,s)}}})}var q=this;q.renderEvents=a;q.compileDaySegs=e;q.clearEvents=b;q.slotSegHtml=l;q.bindDaySeg=j;Qb.call(q);var u=q.opt,fa=q.trigger,oa=q.isEventDraggable,ga=q.isEventResizable,ra=q.eventEnd,sa=q.reportEvents,ha=q.reportEventClear,da=q.eventElementHandlers,na=q.setHeight,ua=q.getDaySegmentContainer,pa=q.getSlotSegmentContainer,U=q.getHoverListener,ca=q.getMaxMinute,ka=q.getMinMinute,qa=q.timePosition,G=q.colContentLeft,p=q.colContentRight,L=q.renderDaySegs,c=q.resizableDayEvent,z=q.getColCnt,
H=q.getColWidth,T=q.getSlotHeight,X=q.getBodyContent,ya=q.reportEventElement,K=q.showEvents,i=q.hideEvents,C=q.eventDrop,P=q.eventResize,E=q.renderDayOverlay,B=q.clearOverlays,n=q.calendar,Y=n.formatDate,W=n.formatDates}function vc(a){var b,e,d,f,g,l;for(b=a.length-1;b>0;b--){f=a[b];for(e=0;e<f.length;e++){g=f[e];for(d=0;d<a[b-1].length;d++){l=a[b-1][d];if(Cb(g,l))l.forward=Math.max(l.forward||0,(g.forward||0)+1)}}}}function Kb(a,b,e){function d(G,p){G=qa[G];if(typeof G=="object")return jb(G,p||e);
return G}function f(G,p){return b.trigger.apply(b,[G,p||da].concat(Array.prototype.slice.call(arguments,2),[da]))}function g(G){return j(G)&&!d("disableDragging")}function l(G){return j(G)&&!d("disableResizing")}function j(G){return Ta(G.editable,(G.source||{}).editable,d("editable"))}function t(G){U={};var p,L=G.length,c;for(p=0;p<L;p++){c=G[p];if(U[c._id])U[c._id].push(c);else U[c._id]=[c]}}function y(G){return G.end?N(G.end):na(G)}function S(G,p){ca.push(p);if(ka[G._id])ka[G._id].push(p);else ka[G._id]=
[p]}function Q(){ca=[];ka={}}function q(G,p){p.click(function(L){if(!p.hasClass("ui-draggable-dragging")&&!p.hasClass("ui-resizable-resizing"))return f("eventClick",this,G,L)}).hover(function(L){f("eventMouseover",this,G,L)},function(L){f("eventMouseout",this,G,L)})}function u(G,p){oa(G,p,"show")}function fa(G,p){oa(G,p,"hide")}function oa(G,p,L){G=ka[G._id];var c,z=G.length;for(c=0;c<z;c++)if(!p||G[c][0]!=p[0])G[c][L]()}function ga(G,p,L,c,z,H,T){var X=p.allDay,ya=p._id;sa(U[ya],L,c,z);f("eventDrop",
G,p,L,c,z,function(){sa(U[ya],-L,-c,X);pa(ya)},H,T);pa(ya)}function ra(G,p,L,c,z,H){var T=p._id;ha(U[T],L,c);f("eventResize",G,p,L,c,function(){ha(U[T],-L,-c);pa(T)},z,H);pa(T)}function sa(G,p,L,c){L=L||0;for(var z,H=G.length,T=0;T<H;T++){z=G[T];if(c!==ma)z.allDay=c;xa(ba(z.start,p,true),L);if(z.end)z.end=xa(ba(z.end,p,true),L);ua(z,qa)}}function ha(G,p,L){L=L||0;for(var c,z=G.length,H=0;H<z;H++){c=G[H];c.end=xa(ba(y(c),p,true),L);ua(c,qa)}}var da=this;da.element=a;da.calendar=b;da.name=e;da.opt=
d;da.trigger=f;da.isEventDraggable=g;da.isEventResizable=l;da.reportEvents=t;da.eventEnd=y;da.reportEventElement=S;da.reportEventClear=Q;da.eventElementHandlers=q;da.showEvents=u;da.hideEvents=fa;da.eventDrop=ga;da.eventResize=ra;var na=da.defaultEventEnd,ua=b.normalizeEvent,pa=b.reportEventChange,U={},ca=[],ka={},qa=b.options}function Qb(){function a(i,C){var P=z(),E=pa(),B=U(),n=0,Y,W,o=i.length,s,v;P[0].innerHTML=e(i);d(i,P.children());f(i);g(i,P,C);l(i);j(i);t(i);C=y();for(P=0;P<E;P++){Y=[];for(W=
0;W<B;W++)Y[W]=0;for(;n<o&&(s=i[n]).row==P;){W=Hb(Y.slice(s.startCol,s.endCol));s.top=W;W+=s.outerHeight;for(v=s.startCol;v<s.endCol;v++)Y[v]=W;n++}C[P].height(Hb(Y))}Q(i,S(C))}function b(i,C,P){var E=m("<div/>"),B=z(),n=i.length,Y;E[0].innerHTML=e(i);E=E.children();B.append(E);d(i,E);l(i);j(i);t(i);Q(i,S(y()));E=[];for(B=0;B<n;B++)if(Y=i[B].element){i[B].row===C&&Y.css("top",P);E.push(Y[0])}return m(E)}function e(i){var C=fa("isRTL"),P,E=i.length,B,n,Y,W;P=ka();var o=P.left,s=P.right,v,F,r,J,M,k=
"";for(P=0;P<E;P++){B=i[P];n=B.event;W=["fc-event","fc-event-skin","fc-event-hori"];ga(n)&&W.push("fc-event-draggable");if(C){B.isStart&&W.push("fc-corner-right");B.isEnd&&W.push("fc-corner-left");v=p(B.end.getDay()-1);F=p(B.start.getDay());r=B.isEnd?qa(v):o;J=B.isStart?G(F):s}else{B.isStart&&W.push("fc-corner-left");B.isEnd&&W.push("fc-corner-right");v=p(B.start.getDay());F=p(B.end.getDay()-1);r=B.isStart?qa(v):o;J=B.isEnd?G(F):s}W=W.concat(n.className);if(n.source)W=W.concat(n.source.className||
[]);Y=n.url;M=Jb(n,fa);k+=Y?"<a href='"+Qa(Y)+"'":"<div";k+=" class='"+W.join(" ")+"' style='position:absolute;z-index:8;left:"+r+"px;"+M+"'><div class='fc-event-inner fc-event-skin'"+(M?" style='"+M+"'":"")+">";if(!n.allDay&&B.isStart)k+="<span class='fc-event-time'>"+Qa(T(n.start,n.end,fa("timeFormat")))+"</span>";k+="<span class='fc-event-title'>"+Qa(n.title)+"</span></div>";if(B.isEnd&&ra(n))k+="<div class='ui-resizable-handle ui-resizable-"+(C?"w":"e")+"'>&nbsp;&nbsp;&nbsp;</div>";k+="</"+(Y?
"a":"div")+">";B.left=r;B.outerWidth=J-r;B.startCol=v;B.endCol=F+1}return k}function d(i,C){var P,E=i.length,B,n,Y;for(P=0;P<E;P++){B=i[P];n=B.event;Y=m(C[P]);n=oa("eventRender",n,n,Y);if(n===false)Y.remove();else{if(n&&n!==true){n=m(n).css({position:"absolute",left:B.left});Y.replaceWith(n);Y=n}B.element=Y}}}function f(i){var C,P=i.length,E,B;for(C=0;C<P;C++){E=i[C];(B=E.element)&&ha(E.event,B)}}function g(i,C,P){var E,B=i.length,n,Y,W;for(E=0;E<B;E++){n=i[E];if(Y=n.element){W=n.event;if(W._id===
P)H(W,Y,n);else Y[0]._fci=E}}Db(C,i,H)}function l(i){var C,P=i.length,E,B,n,Y,W={};for(C=0;C<P;C++){E=i[C];if(B=E.element){n=E.key=Ib(B[0]);Y=W[n];if(Y===ma)Y=W[n]=pb(B,true);E.hsides=Y}}}function j(i){var C,P=i.length,E,B;for(C=0;C<P;C++){E=i[C];if(B=E.element)B[0].style.width=Math.max(0,E.outerWidth-E.hsides)+"px"}}function t(i){var C,P=i.length,E,B,n,Y,W={};for(C=0;C<P;C++){E=i[C];if(B=E.element){n=E.key;Y=W[n];if(Y===ma)Y=W[n]=Fb(B);E.outerHeight=B[0].offsetHeight+Y}}}function y(){var i,C=pa(),
P=[];for(i=0;i<C;i++)P[i]=ca(i).find("td:first div.fc-day-content > div");return P}function S(i){var C,P=i.length,E=[];for(C=0;C<P;C++)E[C]=i[C][0].offsetTop;return E}function Q(i,C){var P,E=i.length,B,n;for(P=0;P<E;P++){B=i[P];if(n=B.element){n[0].style.top=C[B.row]+(B.top||0)+"px";B=B.event;oa("eventAfterRender",B,B,n)}}}function q(i,C,P){var E=fa("isRTL"),B=E?"w":"e",n=C.find("div.ui-resizable-"+B),Y=false;qb(C);C.mousedown(function(W){W.preventDefault()}).click(function(W){if(Y){W.preventDefault();
W.stopImmediatePropagation()}});n.mousedown(function(W){function o(ia){oa("eventResizeStop",this,i,ia);m("body").css("cursor","");s.stop();ya();k&&ua(this,i,k,0,ia);setTimeout(function(){Y=false},0)}if(W.which==1){Y=true;var s=u.getHoverListener(),v=pa(),F=U(),r=E?-1:1,J=E?F-1:0,M=C.css("top"),k,D,Z=m.extend({},i),ja=L(i.start);K();m("body").css("cursor",B+"-resize").one("mouseup",o);oa("eventResizeStart",this,i,W);s.start(function(ia,la){if(ia){var $=Math.max(ja.row,ia.row);ia=ia.col;if(v==1)$=0;
if($==ja.row)ia=E?Math.min(ja.col,ia):Math.max(ja.col,ia);k=$*7+ia*r+J-(la.row*7+la.col*r+J);la=ba(sa(i),k,true);if(k){Z.end=la;$=D;D=b(c([Z]),P.row,M);D.find("*").css("cursor",B+"-resize");$&&$.remove();na(i)}else if(D){da(i);D.remove();D=null}ya();X(i.start,ba(N(la),1))}},W)}})}var u=this;u.renderDaySegs=a;u.resizableDayEvent=q;var fa=u.opt,oa=u.trigger,ga=u.isEventDraggable,ra=u.isEventResizable,sa=u.eventEnd,ha=u.reportEventElement,da=u.showEvents,na=u.hideEvents,ua=u.eventResize,pa=u.getRowCnt,
U=u.getColCnt,ca=u.allDayRow,ka=u.allDayBounds,qa=u.colContentLeft,G=u.colContentRight,p=u.dayOfWeekCol,L=u.dateCell,c=u.compileDaySegs,z=u.getDaySegmentContainer,H=u.bindDaySeg,T=u.calendar.formatDates,X=u.renderDayOverlay,ya=u.clearOverlays,K=u.clearSelection}function Mb(){function a(Q,q,u){b();q||(q=j(Q,u));t(Q,q,u);e(Q,q,u)}function b(Q){if(S){S=false;y();l("unselect",null,Q)}}function e(Q,q,u,fa){S=true;l("select",null,Q,q,u,fa)}function d(Q){var q=f.cellDate,u=f.cellIsAllDay,fa=f.getHoverListener(),
oa=f.reportDayClick;if(Q.which==1&&g("selectable")){b(Q);var ga;fa.start(function(ra,sa){y();if(ra&&u(ra)){ga=[q(sa),q(ra)].sort(Gb);t(ga[0],ga[1],true)}else ga=null},Q);m(document).one("mouseup",function(ra){fa.stop();if(ga){+ga[0]==+ga[1]&&oa(ga[0],true,ra);e(ga[0],ga[1],true,ra)}})}}var f=this;f.select=a;f.unselect=b;f.reportSelection=e;f.daySelectionMousedown=d;var g=f.opt,l=f.trigger,j=f.defaultSelectionEnd,t=f.renderSelection,y=f.clearSelection,S=false;g("selectable")&&g("unselectAuto")&&m(document).mousedown(function(Q){var q=
g("unselectCancel");if(q)if(m(Q.target).parents(q).length)return;b(Q)})}function Lb(){function a(g,l){var j=f.shift();j||(j=m("<div class='fc-cell-overlay' style='position:absolute;z-index:3'/>"));j[0].parentNode!=l[0]&&j.appendTo(l);d.push(j.css(g).show());return j}function b(){for(var g;g=d.shift();)f.push(g.hide().unbind())}var e=this;e.renderOverlay=a;e.clearOverlays=b;var d=[],f=[]}function Nb(a){var b=this,e,d;b.build=function(){e=[];d=[];a(e,d)};b.cell=function(f,g){var l=e.length,j=d.length,
t,y=-1,S=-1;for(t=0;t<l;t++)if(g>=e[t][0]&&g<e[t][1]){y=t;break}for(t=0;t<j;t++)if(f>=d[t][0]&&f<d[t][1]){S=t;break}return y>=0&&S>=0?{row:y,col:S}:null};b.rect=function(f,g,l,j,t){t=t.offset();return{top:e[f][0]-t.top,left:d[g][0]-t.left,width:d[j][1]-d[g][0],height:e[l][1]-e[f][0]}}}function Ob(a){function b(j){xc(j);j=a.cell(j.pageX,j.pageY);if(!j!=!l||j&&(j.row!=l.row||j.col!=l.col)){if(j){g||(g=j);f(j,g,j.row-g.row,j.col-g.col)}else f(j,g);l=j}}var e=this,d,f,g,l;e.start=function(j,t,y){f=j;
g=l=null;a.build();b(t);d=y||"mousemove";m(document).bind(d,b)};e.stop=function(){m(document).unbind(d,b);return l}}function xc(a){if(a.pageX===ma){a.pageX=a.originalEvent.pageX;a.pageY=a.originalEvent.pageY}}function Pb(a){function b(l){return d[l]=d[l]||a(l)}var e=this,d={},f={},g={};e.left=function(l){return f[l]=f[l]===ma?b(l).position().left:f[l]};e.right=function(l){return g[l]=g[l]===ma?e.left(l)+b(l).width():g[l]};e.clear=function(){d={};f={};g={}}}var Ya={defaultView:"month",aspectRatio:1.35,
header:{left:"title",center:"",right:"today prev,next"},weekends:true,allDayDefault:true,ignoreTimezone:true,lazyFetching:true,startParam:"start",endParam:"end",titleFormat:{month:"MMMM yyyy",week:"MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}",day:"dddd, MMM d, yyyy"},columnFormat:{month:"ddd",week:"ddd M/d",day:"dddd M/d"},timeFormat:{"":"h(:mm)t"},isRTL:false,firstDay:0,monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan",
"Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],buttonText:{prev:"&nbsp;&#9668;&nbsp;",next:"&nbsp;&#9658;&nbsp;",prevYear:"&nbsp;&lt;&lt;&nbsp;",nextYear:"&nbsp;&gt;&gt;&nbsp;",today:"today",month:"month",week:"week",day:"day"},theme:false,buttonIcons:{prev:"circle-triangle-w",next:"circle-triangle-e"},unselectAuto:true,dropAccept:"*"},yc=
{header:{left:"next,prev today",center:"",right:"title"},buttonText:{prev:"&nbsp;&#9658;&nbsp;",next:"&nbsp;&#9668;&nbsp;",prevYear:"&nbsp;&gt;&gt;&nbsp;",nextYear:"&nbsp;&lt;&lt;&nbsp;"},buttonIcons:{prev:"circle-triangle-e",next:"circle-triangle-w"}},Aa=m.fullCalendar={version:"1.5.4"},Ja=Aa.views={};m.fn.fullCalendar=function(a){if(typeof a=="string"){var b=Array.prototype.slice.call(arguments,1),e;this.each(function(){var f=m.data(this,"fullCalendar");if(f&&m.isFunction(f[a])){f=f[a].apply(f,
b);if(e===ma)e=f;a=="destroy"&&m.removeData(this,"fullCalendar")}});if(e!==ma)return e;return this}var d=a.eventSources||[];delete a.eventSources;if(a.events){d.push(a.events);delete a.events}a=m.extend(true,{},Ya,a.isRTL||a.isRTL===ma&&Ya.isRTL?yc:{},a);this.each(function(f,g){f=m(g);g=new Yb(f,a,d);f.data("fullCalendar",g);g.render()});return this};Aa.sourceNormalizers=[];Aa.sourceFetchers=[];var ac={dataType:"json",cache:false},bc=1;Aa.addDays=ba;Aa.cloneDate=N;Aa.parseDate=kb;Aa.parseISO8601=
Bb;Aa.parseTime=mb;Aa.formatDate=Oa;Aa.formatDates=ib;var lc=["sun","mon","tue","wed","thu","fri","sat"],Ab=864E5,cc=36E5,wc=6E4,dc={s:function(a){return a.getSeconds()},ss:function(a){return Pa(a.getSeconds())},m:function(a){return a.getMinutes()},mm:function(a){return Pa(a.getMinutes())},h:function(a){return a.getHours()%12||12},hh:function(a){return Pa(a.getHours()%12||12)},H:function(a){return a.getHours()},HH:function(a){return Pa(a.getHours())},d:function(a){return a.getDate()},dd:function(a){return Pa(a.getDate())},
ddd:function(a,b){return b.dayNamesShort[a.getDay()]},dddd:function(a,b){return b.dayNames[a.getDay()]},M:function(a){return a.getMonth()+1},MM:function(a){return Pa(a.getMonth()+1)},MMM:function(a,b){return b.monthNamesShort[a.getMonth()]},MMMM:function(a,b){return b.monthNames[a.getMonth()]},yy:function(a){return(a.getFullYear()+"").substring(2)},yyyy:function(a){return a.getFullYear()},t:function(a){return a.getHours()<12?"a":"p"},tt:function(a){return a.getHours()<12?"am":"pm"},T:function(a){return a.getHours()<
12?"A":"P"},TT:function(a){return a.getHours()<12?"AM":"PM"},u:function(a){return Oa(a,"yyyy-MM-dd'T'HH:mm:ss'Z'")},S:function(a){a=a.getDate();if(a>10&&a<20)return"th";return["st","nd","rd"][a%10-1]||"th"}};Aa.applyAll=$a;Ja.month=mc;Ja.basicWeek=nc;Ja.basicDay=oc;wb({weekMode:"fixed"});Ja.agendaWeek=qc;Ja.agendaDay=rc;wb({allDaySlot:true,allDayText:"all-day",firstHour:6,slotMinutes:30,defaultEventMinutes:120,axisFormat:"h(:mm)tt",timeFormat:{agenda:"h:mm{ - h:mm}"},dragOpacity:{agenda:0.5},minTime:0,
maxTime:24})})(jQuery);
*/
/*
* qTip2 - Pretty powerful tooltips
* http://craigsworks.com/projects/qtip2/
*
* Version: nightly
* Copyright 2009-2010 Craig Michael Thompson - http://craigsworks.com
*
* Dual licensed under MIT or GPLv2 licenses
*   http://en.wikipedia.org/wiki/MIT_License
*   http://en.wikipedia.org/wiki/GNU_General_Public_License
*
* Date: Thu Apr 26 12:17:04.0000000000 2012
*//*jslint browser: true, onevar: true, undef: true, nomen: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true *//*global window: false, jQuery: false, console: false, define: false */(function(a){typeof define==="function"&&define.amd?define(["jquery"],a):a(jQuery)})(function(a){function B(f,h){function y(a){var b=a.precedance==="y",c=n[b?"width":"height"],d=n[b?"height":"width"],e=a.string().indexOf("center")>-1,f=c*(e?.5:1),g=Math.pow,h=Math.round,i,j,k,l=Math.sqrt(g(f,2)+g(d,2)),m=[p/f*l,p/d*l];m[2]=Math.sqrt(g(m[0],2)-g(p,2)),m[3]=Math.sqrt(g(m[1],2)-g(p,2)),i=l+m[2]+m[3]+(e?0:m[0]),j=i/l,k=[h(j*d),h(j*c)];return{height:k[b?0:1],width:k[b?1:0]}}function x(b){var c=k.titlebar&&b.y==="top",d=c?k.titlebar:k.content,e=a.browser.mozilla,f=e?"-moz-":a.browser.webkit?"-webkit-":"",g=b.y+(e?"":"-")+b.x,h=f+(e?"border-radius-"+g:"border-"+g+"-radius");return parseInt(d.css(h),10)||parseInt(l.css(h),10)||0}function w(a,b,c){b=b?b:a[a.precedance];var d=l.hasClass(q),e=k.titlebar&&a.y==="top",f=e?k.titlebar:k.content,g="border-"+b+"-width",h;l.addClass(q),h=parseInt(f.css(g),10),h=(c?h||parseInt(l.css(g),10):h)||0,l.toggleClass(q,d);return h}function v(a,d,g,h){if(k.tip){var l=i.corner.clone(),n=g.adjusted,o=f.options.position.adjust.method.split(" "),p=o[0],q=o[1]||o[0],r={left:c,top:c,x:0,y:0},s,t={},u;i.corner.fixed!==b&&(p==="shift"&&l.precedance==="x"&&n.left&&l.y!=="center"?l.precedance=l.precedance==="x"?"y":"x":p!=="shift"&&n.left&&(l.x=l.x==="center"?n.left>0?"left":"right":l.x==="left"?"right":"left"),q==="shift"&&l.precedance==="y"&&n.top&&l.x!=="center"?l.precedance=l.precedance==="y"?"x":"y":q!=="shift"&&n.top&&(l.y=l.y==="center"?n.top>0?"top":"bottom":l.y==="top"?"bottom":"top"),l.string()!==m.corner.string()&&(m.top!==n.top||m.left!==n.left)&&i.update(l,c)),s=i.position(l,n),s.right!==e&&(s.left=-s.right),s.bottom!==e&&(s.top=-s.bottom),s.user=Math.max(0,j.offset);if(r.left=p==="shift"&&!!n.left)l.x==="center"?t["margin-left"]=r.x=s["margin-left"]-n.left:(u=s.right!==e?[n.left,-s.left]:[-n.left,s.left],(r.x=Math.max(u[0],u[1]))>u[0]&&(g.left-=n.left,r.left=c),t[s.right!==e?"right":"left"]=r.x);if(r.top=q==="shift"&&!!n.top)l.y==="center"?t["margin-top"]=r.y=s["margin-top"]-n.top:(u=s.bottom!==e?[n.top,-s.top]:[-n.top,s.top],(r.y=Math.max(u[0],u[1]))>u[0]&&(g.top-=n.top,r.top=c),t[s.bottom!==e?"bottom":"top"]=r.y);k.tip.css(t).toggle(!(r.x&&r.y||l.x==="center"&&r.y||l.y==="center"&&r.x)),g.left-=s.left.charAt?s.user:p!=="shift"||r.top||!r.left&&!r.top?s.left:0,g.top-=s.top.charAt?s.user:q!=="shift"||r.left||!r.left&&!r.top?s.top:0,m.left=n.left,m.top=n.top,m.corner=l.clone()}}function u(){n.width=j.width,n.height=j.height}function t(){var a=n.width;n.width=n.height,n.height=a}var i=this,j=f.options.style.tip,k=f.elements,l=k.tooltip,m={top:0,left:0},n={width:j.width,height:j.height},o={},p=j.border||0,r=".qtip-tip",s=!!(a("<canvas />")[0]||{}).getContext;i.mimic=i.corner=d,i.border=p,i.offset=j.offset,i.size=n,f.checks.tip={"^position.my|style.tip.(corner|mimic|border)$":function(){i.init()||i.destroy(),f.reposition()},"^style.tip.(height|width)$":function(){n={width:j.width,height:j.height},i.create(),i.update(),f.reposition()},"^content.title.text|style.(classes|widget)$":function(){k.tip&&k.tip.length&&i.update()}},a.extend(i,{init:function(){var b=i.detectCorner()&&(s||a.browser.msie);b&&(i.create(),i.update(),l.unbind(r).bind("tooltipmove"+r,v));return b},detectCorner:function(){var a=j.corner,d=f.options.position,e=d.at,h=d.my.string?d.my.string():d.my;if(a===c||h===c&&e===c)return c;a===b?i.corner=new g.Corner(h):a.string||(i.corner=new g.Corner(a),i.corner.fixed=b),m.corner=new g.Corner(i.corner.string());return i.corner.string()!=="centercenter"},detectColours:function(b){var c,d,e,g=k.tip.css("cssText",""),h=b||i.corner,m=h[h.precedance],p="border-"+m+"-color",r="border"+m.charAt(0)+m.substr(1)+"Color",s=/rgba?\(0, 0, 0(, 0)?\)|transparent|#123456/i,t="background-color",u="transparent",v=" !important",w=a(document.body).css("color"),x=f.elements.content.css("color"),y=k.titlebar&&(h.y==="top"||h.y==="center"&&g.position().top+n.height/2+j.offset<k.titlebar.outerHeight(1)),z=y?k.titlebar:k.content;l.addClass(q),o.fill=d=g.css(t),o.border=e=g[0].style[r]||g.css(p)||l.css(p);if(!d||s.test(d))o.fill=z.css(t)||u,s.test(o.fill)&&(o.fill=l.css(t)||d);if(!e||s.test(e)||e===w)o.border=z.css(p)||u,s.test(o.border)&&(o.border=e);a("*",g).add(g).css("cssText",t+":"+u+v+";border:0"+v+";"),l.removeClass(q)},create:function(){var b=n.width,c=n.height,d;k.tip&&k.tip.remove(),k.tip=a("<div />",{"class":"ui-tooltip-tip"}).css({width:b,height:c}).prependTo(l),s?a("<canvas />").appendTo(k.tip)[0].getContext("2d").save():(d='<vml:shape coordorigin="0,0" style="display:inline-block; position:absolute; behavior:url(#default#VML);"></vml:shape>',k.tip.html(d+d),a("*",k.tip).bind("click mousedown",function(a){a.stopPropagation()}))},update:function(e,f){var h=k.tip,l=h.children(),q=n.width,r=n.height,v="px solid ",x="px dashed transparent",z=j.mimic,B=Math.round,C,D,E,F,G;e||(e=m.corner||i.corner),z===c?z=e:(z=new g.Corner(z),z.precedance=e.precedance,z.x==="inherit"?z.x=e.x:z.y==="inherit"?z.y=e.y:z.x===z.y&&(z[e.precedance]=e[e.precedance])),C=z.precedance,e.precedance==="x"?t():u(),k.tip.css({width:q=n.width,height:r=n.height}),i.detectColours(e),o.border!=="transparent"&&o.border!=="#123456"?(p=w(e,d,b),j.border===0&&p>0&&(o.fill=o.border),i.border=p=j.border!==b?j.border:p):i.border=p=0,E=A(z,q,r),i.size=G=y(e),h.css(G),e.precedance==="y"?F=[B(z.x==="left"?p:z.x==="right"?G.width-q-p:(G.width-q)/2),B(z.y==="top"?G.height-r:0)]:F=[B(z.x==="left"?G.width-q:0),B(z.y==="top"?p:z.y==="bottom"?G.height-r-p:(G.height-r)/2)],s?(l.attr(G),D=l[0].getContext("2d"),D.restore(),D.save(),D.clearRect(0,0,3e3,3e3),D.translate(F[0],F[1]),D.beginPath(),D.moveTo(E[0][0],E[0][1]),D.lineTo(E[1][0],E[1][1]),D.lineTo(E[2][0],E[2][1]),D.closePath(),D.fillStyle=o.fill,D.strokeStyle=o.border,D.lineWidth=p*2,D.lineJoin="miter",D.miterLimit=100,p&&D.stroke(),D.fill()):(E="m"+E[0][0]+","+E[0][1]+" l"+E[1][0]+","+E[1][1]+" "+E[2][0]+","+E[2][1]+" xe",F[2]=p&&/^(r|b)/i.test(e.string())?parseFloat(a.browser.version,10)===8?2:1:0,l.css({antialias:""+(z.string().indexOf("center")>-1),left:F[0]-F[2]*Number(C==="x"),top:F[1]-F[2]*Number(C==="y"),width:q+p,height:r+p}).each(function(b){var c=a(this);c[c.prop?"prop":"attr"]({coordsize:q+p+" "+(r+p),path:E,fillcolor:o.fill,filled:!!b,stroked:!b}).css({display:p||b?"block":"none"}),!b&&c.html()===""&&c.html('<vml:stroke weight="'+p*2+'px" color="'+o.border+'" miterlimit="1000" joinstyle="miter"  style="behavior:url(#default#VML); display:inline-block;" />')})),f!==c&&i.position(e)},position:function(d){var e=k.tip,f={},g=Math.max(0,j.offset),h,l,m;if(j.corner===c||!e)return c;d=d||i.corner,h=d.precedance,l=y(d),m=[d.x,d.y],h==="x"&&m.reverse(),a.each(m,function(a,c){var e,i;c==="center"?(e=h==="y"?"left":"top",f[e]="50%",f["margin-"+e]=-Math.round(l[h==="y"?"width":"height"]/2)+g):(e=w(d,c,b),i=x(d),f[c]=a?p?w(d,c):0:g+(i>e?i:0))}),f[d[h]]-=l[h==="x"?"width":"height"],e.css({top:"",bottom:"",left:"",right:"",margin:""}).css(f);return f},destroy:function(){k.tip&&k.tip.remove(),k.tip=!1,l.unbind(r)}}),i.init()}function A(a,b,c){var d=Math.ceil(b/2),e=Math.ceil(c/2),f={bottomright:[[0,0],[b,c],[b,0]],bottomleft:[[0,0],[b,0],[0,c]],topright:[[0,c],[b,0],[b,c]],topleft:[[0,0],[0,c],[b,c]],topcenter:[[0,c],[d,0],[b,c]],bottomcenter:[[0,0],[b,0],[d,c]],rightcenter:[[0,0],[b,e],[0,c]],leftcenter:[[b,0],[b,c],[0,e]]};f.lefttop=f.bottomright,f.righttop=f.bottomleft,f.leftbottom=f.topright,f.rightbottom=f.topleft;return f[a.string()]}function z(d){var e=this,g=d.elements.tooltip,h=d.options.content.ajax,i=f.defaults.content.ajax,j=".qtip-ajax",k=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,l=b,m=c,n;d.checks.ajax={"^content.ajax":function(a,b,c){b==="ajax"&&(h=c),b==="once"?e.init():h&&h.url?e.load():g.unbind(j)}},a.extend(e,{init:function(){h&&h.url&&g.unbind(j)[h.once?"one":"bind"]("tooltipshow"+j,e.load);return e},load:function(f){function t(a,b,c){!d.destroyed&&a.status!==0&&d.set("content.text",b+": "+c)}function s(b,c,e){var f;d.destroyed||(o&&(b=a("<div/>").append(b.replace(k,"")).find(o)),(f=i.success||h.success)&&a.isFunction(f)?f.call(h.context||d,b,c,e):d.set("content.text",b))}function r(){var e;d.destroyed||(l=c,p&&(m=b,d.show(f.originalEvent)),(e=i.complete||h.complete)&&a.isFunction(e)&&e.apply(h.context||d,arguments))}if(m)m=c;else{var g=h.url.indexOf(" "),j=h.url,o,p=!h.loading&&l;if(p)try{f.preventDefault()}catch(q){}else if(f&&f.isDefaultPrevented())return e;n&&n.abort&&n.abort(),g>-1&&(o=j.substr(g),j=j.substr(0,g)),n=a.ajax(a.extend({error:i.error||t,context:d},h,{url:j,success:s,complete:r}))}},destroy:function(){n&&n.abort&&n.abort(),d.destroyed=b}}),e.init()}function y(e,h){var i,j,k,l,m,n=a(this),o=a(document.body),p=this===document?o:n,q=n.metadata?n.metadata(h.metadata):d,r=h.metadata.type==="html5"&&q?q[h.metadata.name]:d,s=n.data(h.metadata.name||"qtipopts");try{s=typeof s==="string"?(new Function("return "+s))():s}catch(u){v("Unable to parse HTML5 attribute data: "+s)}l=a.extend(b,{},f.defaults,h,typeof s==="object"?w(s):d,w(r||q)),j=l.position,l.id=e;if("boolean"===typeof l.content.text){k=n.attr(l.content.attr);if(l.content.attr!==c&&k)l.content.text=k;else{v("Unable to locate content for tooltip! Aborting render of tooltip on element: ",n);return c}}j.container.length||(j.container=o),j.target===c&&(j.target=p),l.show.target===c&&(l.show.target=p),l.show.solo===b&&(l.show.solo=j.container.closest("body")),l.hide.target===c&&(l.hide.target=p),l.position.viewport===b&&(l.position.viewport=j.container),j.container=j.container.eq(0),j.at=new g.Corner(j.at),j.my=new g.Corner(j.my);if(a.data(this,"qtip"))if(l.overwrite)n.qtip("destroy");else if(l.overwrite===c)return c;l.suppress&&(m=a.attr(this,"title"))&&a(this).removeAttr("title").attr(t,m),i=new x(n,l,e,!!k),a.data(this,"qtip",i),n.bind("remove.qtip-"+e+" removeqtip.qtip-"+e,function(){i.destroy()});return i}function x(r,s,v,x){function Q(){var b=[s.show.target[0],s.hide.target[0],y.rendered&&F.tooltip[0],s.position.container[0],s.position.viewport[0],window,document];y.rendered?a([]).pushStack(a.grep(b,function(a){return typeof a==="object"})).unbind(E):s.show.target.unbind(E+"-create")}function P(){function o(a){y.rendered&&D[0].offsetWidth>0&&y.reposition(a)}function n(a){if(D.hasClass(l))return c;clearTimeout(y.timers.inactive),y.timers.inactive=setTimeout(function(){y.hide(a)},s.hide.inactive)}function k(b){if(D.hasClass(l)||B||C)return c;var f=a(b.relatedTarget||b.target),g=f.closest(m)[0]===D[0],h=f[0]===e.show[0];clearTimeout(y.timers.show),clearTimeout(y.timers.hide);if(d.target==="mouse"&&g||s.hide.fixed&&(/mouse(out|leave|move)/.test(b.type)&&(g||h)))try{b.preventDefault(),b.stopImmediatePropagation()}catch(i){}else s.hide.delay>0?y.timers.hide=setTimeout(function(){y.hide(b)},s.hide.delay):y.hide(b)}function j(a){if(D.hasClass(l))return c;clearTimeout(y.timers.show),clearTimeout(y.timers.hide);var d=function(){y.toggle(b,a)};s.show.delay>0?y.timers.show=setTimeout(d,s.show.delay):d()}var d=s.position,e={show:s.show.target,hide:s.hide.target,viewport:a(d.viewport),document:a(document),body:a(document.body),window:a(window)},g={show:a.trim(""+s.show.event).split(" "),hide:a.trim(""+s.hide.event).split(" ")},i=a.browser.msie&&parseInt(a.browser.version,10)===6;D.bind("mouseenter"+E+" mouseleave"+E,function(a){var b=a.type==="mouseenter";b&&y.focus(a),D.toggleClass(p,b)}),s.hide.fixed&&(e.hide=e.hide.add(D),D.bind("mouseover"+E,function(){D.hasClass(l)||clearTimeout(y.timers.hide)})),/mouse(out|leave)/i.test(s.hide.event)?s.hide.leave==="window"&&e.window.bind("mouseout"+E+" blur"+E,function(a){/select|option/.test(a.target)&&!a.relatedTarget&&y.hide(a)}):/mouse(over|enter)/i.test(s.show.event)&&e.hide.bind("mouseleave"+E,function(a){clearTimeout(y.timers.show)}),(""+s.hide.event).indexOf("unfocus")>-1&&d.container.closest("html").bind("mousedown"+E,function(b){var c=a(b.target),d=y.rendered&&!D.hasClass(l)&&D[0].offsetWidth>0,e=c.parents(m).filter(D[0]).length>0;c[0]!==r[0]&&c[0]!==D[0]&&!e&&!r.has(c[0]).length&&!c.attr("disabled")&&y.hide(b)}),"number"===typeof s.hide.inactive&&(e.show.bind("qtip-"+v+"-inactive",n),a.each(f.inactiveEvents,function(a,b){e.hide.add(F.tooltip).bind(b+E+"-inactive",n)})),a.each(g.hide,function(b,c){var d=a.inArray(c,g.show),f=a(e.hide);d>-1&&f.add(e.show).length===f.length||c==="unfocus"?(e.show.bind(c+E,function(a){D[0].offsetWidth>0?k(a):j(a)}),delete g.show[d]):e.hide.bind(c+E,k)}),a.each(g.show,function(a,b){e.show.bind(b+E,j)}),"number"===typeof s.hide.distance&&e.show.add(D).bind("mousemove"+E,function(a){var b=G.origin||{},c=s.hide.distance,d=Math.abs;(d(a.pageX-b.pageX)>=c||d(a.pageY-b.pageY)>=c)&&y.hide(a)}),d.target==="mouse"&&(e.show.bind("mousemove"+E,function(a){h={pageX:a.pageX,pageY:a.pageY,type:"mousemove"}}),d.adjust.mouse&&(s.hide.event&&(D.bind("mouseleave"+E,function(a){(a.relatedTarget||a.target)!==e.show[0]&&y.hide(a)}),F.target.bind("mouseenter"+E+" mouseleave"+E,function(a){G.onTarget=a.type==="mouseenter"})),e.document.bind("mousemove"+E,function(a){y.rendered&&G.onTarget&&!D.hasClass(l)&&D[0].offsetWidth>0&&y.reposition(a||h)}))),(d.adjust.resize||e.viewport.length)&&(a.event.special.resize?e.viewport:e.window).bind("resize"+E,o),(e.viewport.length||i&&D.css("position")==="fixed")&&e.viewport.bind("scroll"+E,o)}function O(b,d){function g(b){function i(e){e&&(delete h[e.src],clearTimeout(y.timers.img[e.src]),a(e).unbind(E)),a.isEmptyObject(h)&&(y.redraw(),d!==c&&y.reposition(G.event),b())}var g,h={};if((g=f.find("img[src]:not([height]):not([width])")).length===0)return i();g.each(function(b,c){if(h[c.src]===e){var d=0,f=3;(function g(){if(c.height||c.width||d>f)return i(c);d+=1,y.timers.img[c.src]=setTimeout(g,700)})(),a(c).bind("error"+E+" load"+E,function(){i(this)}),h[c.src]=c}})}var f=F.content;if(!y.rendered||!b)return c;a.isFunction(b)&&(b=b.call(r,G.event,y)||""),b.jquery&&b.length>0?f.empty().append(b.css({display:"block"})):f.html(b),y.rendered<0?D.queue("fx",g):(C=0,g(a.noop));return y}function N(b,d){var e=F.title;if(!y.rendered||!b)return c;a.isFunction(b)&&(b=b.call(r,G.event,y));if(b===c||!b&&b!=="")return J(c);b.jquery&&b.length>0?e.empty().append(b.css({display:"block"})):e.html(b),y.redraw(),d!==c&&y.rendered&&D[0].offsetWidth>0&&y.reposition(G.event)}function M(a){var b=F.button,d=F.title;if(!y.rendered)return c;a?(d||L(),K()):b.remove()}function L(){var c=A+"-title";F.titlebar&&J(),F.titlebar=a("<div />",{"class":j+"-titlebar "+(s.style.widget?"ui-widget-header":"")}).append(F.title=a("<div />",{id:c,"class":j+"-title","aria-atomic":b})).insertBefore(F.content).delegate(".ui-tooltip-close","mousedown keydown mouseup keyup mouseout",function(b){a(this).toggleClass("ui-state-active ui-state-focus",b.type.substr(-4)==="down")}).delegate(".ui-tooltip-close","mouseover mouseout",function(b){a(this).toggleClass("ui-state-hover",b.type==="mouseover")}),s.content.title.button?K():y.rendered&&y.redraw()}function K(){var b=s.content.title.button,d=typeof b==="string",e=d?b:"Close tooltip";F.button&&F.button.remove(),b.jquery?F.button=b:F.button=a("<a />",{"class":"ui-state-default ui-tooltip-close "+(s.style.widget?"":j+"-icon"),title:e,"aria-label":e}).prepend(a("<span />",{"class":"ui-icon ui-icon-close",html:"&times;"})),F.button.appendTo(F.titlebar).attr("role","button").click(function(a){D.hasClass(l)||y.hide(a);return c}),y.redraw()}function J(a){F.title&&(F.titlebar.remove(),F.titlebar=F.title=F.button=d,a!==c&&y.reposition())}function I(){var a=s.style.widget;D.toggleClass(k,a).toggleClass(n,s.style.def&&!a),F.content.toggleClass(k+"-content",a),F.titlebar&&F.titlebar.toggleClass(k+"-header",a),F.button&&F.button.toggleClass(j+"-icon",!a)}function H(a){var b=0,c,d=s,e=a.split(".");while(d=d[e[b++]])b<e.length&&(c=d);return[c||s,e.pop()]}var y=this,z=document.body,A=j+"-"+v,B=0,C=0,D=a(),E=".qtip-"+v,F,G;y.id=v,y.destroyed=y.rendered=c,y.elements=F={target:r},y.timers={img:{}},y.options=s,y.checks={},y.plugins={},y.cache=G={event:{},target:a(),disabled:c,attr:x,onTarget:c},y.checks.builtin={"^id$":function(d,e,g){var h=g===b?f.nextid:g,i=j+"-"+h;h!==c&&h.length>0&&!a("#"+i).length&&(D[0].id=i,F.content[0].id=i+"-content",F.title[0].id=i+"-title")},"^content.text$":function(a,b,c){O(c)},"^content.title.text$":function(a,b,c){if(!c)return J();!F.title&&c&&L(),N(c)},"^content.title.button$":function(a,b,c){M(c)},"^position.(my|at)$":function(a,b,c){"string"===typeof c&&(a[b]=new g.Corner(c))},"^position.container$":function(a,b,c){y.rendered&&D.appendTo(c)},"^show.ready$":function(){y.rendered?y.toggle(b):y.render(1)},"^style.classes$":function(a,b,c){D.attr("class",j+" qtip ui-helper-reset "+c)},"^style.widget|content.title":I,"^events.(render|show|move|hide|focus|blur)$":function(b,c,d){D[(a.isFunction(d)?"":"un")+"bind"]("tooltip"+c,d)},"^(show|hide|position).(event|target|fixed|inactive|leave|distance|viewport|adjust)":function(){var a=s.position;D.attr("tracking",a.target==="mouse"&&a.adjust.mouse),Q(),P()}},a.extend(y,{render:function(d){if(y.rendered)return y;var e=s.content.text,f=s.content.title.text,h=s.position,i=a.Event("tooltiprender");a.attr(r[0],"aria-describedby",A),D=F.tooltip=a("<div/>",{id:A,"class":j+" qtip ui-helper-reset "+n+" "+s.style.classes+" "+j+"-pos-"+s.position.my.abbrev(),width:s.style.width||"",height:s.style.height||"",tracking:h.target==="mouse"&&h.adjust.mouse,role:"alert","aria-live":"polite","aria-atomic":c,"aria-describedby":A+"-content","aria-hidden":b}).toggleClass(l,G.disabled).data("qtip",y).appendTo(s.position.container).append(F.content=a("<div />",{"class":j+"-content",id:A+"-content","aria-atomic":b})),y.rendered=-1,B=C=1,f&&(L(),a.isFunction(f)||N(f,c)),a.isFunction(e)||O(e,c),y.rendered=b,I(),a.each(s.events,function(b,c){a.isFunction(c)&&D.bind(b==="toggle"?"tooltipshow tooltiphide":"tooltip"+b,c)}),a.each(g,function(){this.initialize==="render"&&this(y)}),P(),D.queue("fx",function(a){i.originalEvent=G.event,D.trigger(i,[y]),B=C=0,y.redraw(),(s.show.ready||d)&&y.toggle(b,G.event,c),a()});return y},get:function(a){var b,c;switch(a.toLowerCase()){case"dimensions":b={height:D.outerHeight(),width:D.outerWidth()};break;case"offset":b=g.offset(D,s.position.container);break;default:c=H(a.toLowerCase()),b=c[0][c[1]],b=b.precedance?b.string():b}return b},set:function(e,f){function m(a,b){var c,d,e;for(c in k)for(d in k[c])if(e=(new RegExp(d,"i")).exec(a))b.push(e),k[c][d].apply(y,b)}var g=/^position\.(my|at|adjust|target|container)|style|content|show\.ready/i,h=/^content\.(title|attr)|style/i,i=c,j=c,k=y.checks,l;"string"===typeof e?(l=e,e={},e[l]=f):e=a.extend(b,{},e),a.each(e,function(b,c){var d=H(b.toLowerCase()),f;f=d[0][d[1]],d[0][d[1]]="object"===typeof c&&c.nodeType?a(c):c,e[b]=[d[0],d[1],c,f],i=g.test(b)||i,j=h.test(b)||j}),w(s),B=C=1,a.each(e,m),B=C=0,y.rendered&&D[0].offsetWidth>0&&(i&&y.reposition(s.position.target==="mouse"?d:G.event),j&&y.redraw());return y},toggle:function(e,f){function t(){e?(a.browser.msie&&D[0].style.removeAttribute("filter"),D.css("overflow",""),"string"===typeof i.autofocus&&a(i.autofocus,D).focus(),i.target.trigger("qtip-"+v+"-inactive")):D.css({display:"",visibility:"",opacity:"",left:"",top:""}),r=a.Event("tooltip"+(e?"visible":"hidden")),r.originalEvent=f?G.event:d,D.trigger(r,[y])}if(!y.rendered)return e?y.render(1):y;var g=e?"show":"hide",i=s[g],j=s[e?"hide":"show"],k=s.position,l=s.content,n=D[0].offsetWidth>0,o=e||i.target.length===1,p=!f||i.target.length<2||G.target[0]===f.target,q,r;(typeof e).search("boolean|number")&&(e=!n);if(!D.is(":animated")&&n===e&&p)return y;if(f){if(/over|enter/.test(f.type)&&/out|leave/.test(G.event.type)&&s.show.target.add(f.target).length===s.show.target.length&&D.has(f.relatedTarget).length)return y;G.event=a.extend({},f)}r=a.Event("tooltip"+g),r.originalEvent=f?G.event:d,D.trigger(r,[y,90]);if(r.isDefaultPrevented())return y;a.attr(D[0],"aria-hidden",!e),e?(G.origin=a.extend({},h),y.focus(f),a.isFunction(l.text)&&O(l.text,c),a.isFunction(l.title.text)&&N(l.title.text,c),!u&&k.target==="mouse"&&k.adjust.mouse&&(a(document).bind("mousemove.qtip",function(a){h={pageX:a.pageX,pageY:a.pageY,type:"mousemove"}}),u=b),y.reposition(f,arguments[2]),(r.solo=!!i.solo)&&a(m,i.solo).not(D).qtip("hide",r)):(clearTimeout(y.timers.show),delete G.origin,u&&!a(m+'[tracking="true"]:visible',i.solo).not(D).length&&(a(document).unbind("mousemove.qtip"),u=c),y.blur(f)),i.effect===c||o===c?(D[g](),t.call(D)):a.isFunction(i.effect)?(D.stop(1,1),i.effect.call(D,y),D.queue("fx",function(a){t(),a()})):D.fadeTo(90,e?1:0,t),e&&i.target.trigger("qtip-"+v+"-inactive");return y},show:function(a){return y.toggle(b,a)},hide:function(a){return y.toggle(c,a)},focus:function(b){if(!y.rendered)return y;var c=a(m),d=parseInt(D[0].style.zIndex,10),e=f.zindex+c.length,g=a.extend({},b),h,i;D.hasClass(o)||(i=a.Event("tooltipfocus"),i.originalEvent=g,D.trigger(i,[y,e]),i.isDefaultPrevented()||(d!==e&&(c.each(function(){this.style.zIndex>d&&(this.style.zIndex=this.style.zIndex-1)}),c.filter("."+o).qtip("blur",g)),D.addClass(o)[0].style.zIndex=e));return y},blur:function(b){var c=a.extend({},b),d;D.removeClass(o),d=a.Event("tooltipblur"),d.originalEvent=c,D.trigger(d,[y]);return y},reposition:function(b,d){if(!y.rendered||B)return y;B=1;var e=s.position.target,f=s.position,i=f.my,k=f.at,l=f.adjust,m=l.method.split(" "),n=D.outerWidth(),o=D.outerHeight(),p=0,q=0,r=a.Event("tooltipmove"),t=D.css("position")==="fixed",u=f.viewport,v={left:0,top:0},w=f.container,x=c,A=y.plugins.tip,C=D[0].offsetWidth>0,E={horizontal:m[0],vertical:m[1]=m[1]||m[0],enabled:u.jquery&&e[0]!==window&&e[0]!==z&&l.method!=="none",left:function(a){var b=E.horizontal==="shift",c=l.x*(E.horizontal.substr(-6)==="invert"?2:0),d=-w.offset.left+u.offset.left+u.scrollLeft,e=i.x==="left"?n:i.x==="right"?-n:-n/2,f=k.x==="left"?p:k.x==="right"?-p:-p/2,g=A&&A.size?A.size.width||0:0,h=A&&A.corner&&A.corner.precedance==="x"&&!b?g:0,j=d-a+h,m=a+n-u.width-d+h,o=e-(i.precedance==="x"||i.x===i.y?f:0)-(k.x==="center"?p/2:0),q=i.x==="center";b?(h=A&&A.corner&&A.corner.precedance==="y"?g:0,o=(i.x==="left"?1:-1)*e-h,v.left+=j>0?j:m>0?-m:0,v.left=Math.max(-w.offset.left+u.offset.left+(h&&A.corner.x==="center"?A.offset:0),a-o,Math.min(Math.max(-w.offset.left+u.offset.left+u.width,a+o),v.left))):(j>0&&(i.x!=="left"||m>0)?v.left-=o+c:m>0&&(i.x!=="right"||j>0)&&(v.left-=(q?-o:o)+c),v.left<d&&-v.left>m&&(v.left=a));return v.left-a},top:function(a){var b=E.vertical==="shift",c=l.y*(E.vertical.substr(-6)==="invert"?2:0),d=-w.offset.top+u.offset.top+u.scrollTop,e=i.y==="top"?o:i.y==="bottom"?-o:-o/2,f=k.y==="top"?q:k.y==="bottom"?-q:-q/2,g=A&&A.size?A.size.height||0:0,h=A&&A.corner&&A.corner.precedance==="y"&&!b?g:0,j=d-a+h,m=a+o-u.height-d+h,n=e-(i.precedance==="y"||i.x===i.y?f:0)-(k.y==="center"?q/2:0),p=i.y==="center";b?(h=A&&A.corner&&A.corner.precedance==="x"?g:0,n=(i.y==="top"?1:-1)*e-h,v.top+=j>0?j:m>0?-m:0,v.top=Math.max(-w.offset.top+u.offset.top+(h&&A.corner.x==="center"?A.offset:0),a-n,Math.min(Math.max(-w.offset.top+u.offset.top+u.height,a+n),v.top))):(j>0&&(i.y!=="top"||m>0)?v.top-=n+c:m>0&&(i.y!=="bottom"||j>0)&&(v.top-=(p?-n:n)+c),v.top<0&&-v.top>m&&(v.top=a));return v.top-a}},H;if(a.isArray(e)&&e.length===2)k={x:"left",y:"top"},v={left:e[0],top:e[1]};else if(e==="mouse"&&(b&&b.pageX||G.event.pageX))k={x:"left",y:"top"},b=(b&&(b.type==="resize"||b.type==="scroll")?G.event:b&&b.pageX&&b.type==="mousemove"?b:h&&h.pageX&&(l.mouse||!b||!b.pageX)?{pageX:h.pageX,pageY:h.pageY}:!l.mouse&&G.origin&&G.origin.pageX&&s.show.distance?G.origin:b)||b||G.event||h||{},v={top:b.pageY,left:b.pageX};else{e==="event"?b&&b.target&&b.type!=="scroll"&&b.type!=="resize"?e=G.target=a(b.target):e=G.target:e=G.target=a(e.jquery?e:F.target),e=a(e).eq(0);if(e.length===0)return y;e[0]===document||e[0]===window?(p=g.iOS?window.innerWidth:e.width(),q=g.iOS?window.innerHeight:e.height(),e[0]===window&&(v={top:(u||e).scrollTop(),left:(u||e).scrollLeft()})):e.is("area")&&g.imagemap?v=g.imagemap(e,k,E.enabled?m:c):e[0].namespaceURI==="http://www.w3.org/2000/svg"&&g.svg?v=g.svg(e,k):(p=e.outerWidth(),q=e.outerHeight(),v=g.offset(e,w)),v.offset&&(p=v.width,q=v.height,x=v.flipoffset,v=v.offset);if(g.iOS<4.1&&g.iOS>3.1||g.iOS==4.3||!g.iOS&&t)H=a(window),v.left-=H.scrollLeft(),v.top-=H.scrollTop();v.left+=k.x==="right"?p:k.x==="center"?p/2:0,v.top+=k.y==="bottom"?q:k.y==="center"?q/2:0}v.left+=l.x+(i.x==="right"?-n:i.x==="center"?-n/2:0),v.top+=l.y+(i.y==="bottom"?-o:i.y==="center"?-o/2:0),E.enabled?(u={elem:u,height:u[(u[0]===window?"h":"outerH")+"eight"](),width:u[(u[0]===window?"w":"outerW")+"idth"](),scrollLeft:t?0:u.scrollLeft(),scrollTop:t?0:u.scrollTop(),offset:u.offset()||{left:0,top:0}},w={elem:w,scrollLeft:w.scrollLeft(),scrollTop:w.scrollTop(),offset:w.offset()||{left:0,top:0}},v.adjusted={left:E.horizontal!=="none"?E.left(v.left):0,top:E.vertical!=="none"?E.top(v.top):0},v.adjusted.left+v.adjusted.top&&D.attr("class",D[0].className.replace(/ui-tooltip-pos-\w+/i,j+"-pos-"+i.abbrev())),x&&v.adjusted.left&&(v.left+=x.left),x&&v.adjusted.top&&(v.top+=x.top)):v.adjusted={left:0,top:0},r.originalEvent=a.extend({},b),D.trigger(r,[y,v,u.elem||u]);if(r.isDefaultPrevented())return y;delete v.adjusted,d===c||!C||isNaN(v.left)||isNaN(v.top)||e==="mouse"||!a.isFunction(f.effect)?D.css(v):a.isFunction(f.effect)&&(f.effect.call(D,y,a.extend({},v)),D.queue(function(b){a(this).css({opacity:"",height:""}),a.browser.msie&&this.style.removeAttribute("filter"),b()})),B=0;return y},redraw:function(){if(y.rendered<1||C)return y;var a=s.position.container,b,c,d,e;C=1,s.style.height&&D.css("height",s.style.height),s.style.width?D.css("width",s.style.width):(D.css("width","").addClass(q),c=D.width()+1,d=D.css("max-width")||"",e=D.css("min-width")||"",b=(d+e).indexOf("%")>-1?a.width()/100:0,d=(d.indexOf("%")>-1?b:1)*parseInt(d,10)||c,e=(e.indexOf("%")>-1?b:1)*parseInt(e,10)||0,c=d+e?Math.min(Math.max(c,e),d):c,D.css("width",Math.round(c)).removeClass(q)),C=0;return y},disable:function(b){"boolean"!==typeof b&&(b=!D.hasClass(l)&&!G.disabled),y.rendered?(D.toggleClass(l,b),a.attr(D[0],"aria-disabled",b)):G.disabled=!!b;return y},enable:function(){return y.disable(c)},destroy:function(){var c=r[0],d=a.attr(c,t),e=r.data("qtip");y.destroyed=b,y.rendered&&(D.stop(1,0).remove(),a.each(y.plugins,function(){this.destroy&&this.destroy()})),clearTimeout(y.timers.show),clearTimeout(y.timers.hide),Q();if(!e||y===e)a.removeData(c,"qtip"),s.suppress&&d&&(a.attr(c,"title",d),r.removeAttr(t)),r.removeAttr("aria-describedby");r.unbind(".qtip-"+v),delete i[y.id];return r}})}function w(b){var e;if(!b||"object"!==typeof b)return c;if(b.metadata===d||"object"!==typeof b.metadata)b.metadata={type:b.metadata};if("content"in b){if(b.content===d||"object"!==typeof b.content||b.content.jquery)b.content={text:b.content};e=b.content.text||c,!a.isFunction(e)&&(!e&&!e.attr||e.length<1||"object"===typeof e&&!e.jquery)&&(b.content.text=c);if("title"in b.content){if(b.content.title===d||"object"!==typeof b.content.title)b.content.title={text:b.content.title};e=b.content.title.text||c,!a.isFunction(e)&&(!e&&!e.attr||e.length<1||"object"===typeof e&&!e.jquery)&&(b.content.title.text=c)}}if("position"in b)if(b.position===d||"object"!==typeof b.position)b.position={my:b.position,at:b.position};if("show"in b)if(b.show===d||"object"!==typeof b.show)b.show.jquery?b.show={target:b.show}:b.show={event:b.show};if("hide"in b)if(b.hide===d||"object"!==typeof b.hide)b.hide.jquery?b.hide={target:b.hide}:b.hide={event:b.hide};if("style"in b)if(b.style===d||"object"!==typeof b.style)b.style={classes:b.style};a.each(g,function(){this.sanitize&&this.sanitize(b)});return b}function v(){v.history=v.history||[],v.history.push(arguments);if("object"===typeof console){var a=console[console.warn?"warn":"log"],b=Array.prototype.slice.call(arguments),c;typeof arguments[0]==="string"&&(b[0]="qTip2: "+b[0]),c=a.apply?a.apply(console,b):a(b)}}"use strict";var b=!0,c=!1,d=null,e,f,g,h,i={},j="ui-tooltip",k="ui-widget",l="ui-state-disabled",m="div.qtip."+j,n=j+"-default",o=j+"-focus",p=j+"-hover",q=j+"-fluid",r="-31000px",s="_replacedByqTip",t="oldtitle",u;f=a.fn.qtip=function(g,h,i){var j=(""+g).toLowerCase(),k=d,l=a.makeArray(arguments).slice(1),m=l[l.length-1],n=this[0]?a.data(this[0],"qtip"):d;if(!arguments.length&&n||j==="api")return n;if("string"===typeof g){this.each(function(){var d=a.data(this,"qtip");if(!d)return b;m&&m.timeStamp&&(d.cache.event=m);if(j!=="option"&&j!=="options"||!h)d[j]&&d[j].apply(d[j],l);else if(a.isPlainObject(h)||i!==e)d.set(h,i);else{k=d.get(h);return c}});return k!==d?k:this}if("object"===typeof g||!arguments.length){n=w(a.extend(b,{},g));return f.bind.call(this,n,m)}},f.bind=function(d,j){return this.each(function(k){function r(b){function d(){p.render(typeof b==="object"||l.show.ready),m.show.add(m.hide).unbind(o)}if(p.cache.disabled)return c;p.cache.event=a.extend({},b),p.cache.target=b?a(b.target):[e],l.show.delay>0?(clearTimeout(p.timers.show),p.timers.show=setTimeout(d,l.show.delay),n.show!==n.hide&&m.hide.bind(n.hide,function(){clearTimeout(p.timers.show)})):d()}var l,m,n,o,p,q;q=a.isArray(d.id)?d.id[k]:d.id,q=!q||q===c||q.length<1||i[q]?f.nextid++:i[q]=q,o=".qtip-"+q+"-create",p=y.call(this,q,d);if(p===c)return b;l=p.options,a.each(g,function(){this.initialize==="initialize"&&this(p)}),m={show:l.show.target,hide:l.hide.target},n={show:a.trim(""+l.show.event).replace(/ /g,o+" ")+o,hide:a.trim(""+l.hide.event).replace(/ /g,o+" ")+o},/mouse(over|enter)/i.test(n.show)&&!/mouse(out|leave)/i.test(n.hide)&&(n.hide+=" mouseleave"+o),m.show.bind("mousemove"+o,function(a){h={pageX:a.pageX,pageY:a.pageY,type:"mousemove"},p.cache.onTarget=b}),m.show.bind(n.show,r),(l.show.ready||l.prerender)&&r(j)})},g=f.plugins={Corner:function(a){a=(""+a).replace(/([A-Z])/," $1").replace(/middle/gi,"center").toLowerCase(),this.x=(a.match(/left|right/i)||a.match(/center/)||["inherit"])[0].toLowerCase(),this.y=(a.match(/top|bottom|center/i)||["inherit"])[0].toLowerCase();var b=a.charAt(0);this.precedance=b==="t"||b==="b"?"y":"x",this.string=function(){return this.precedance==="y"?this.y+this.x:this.x+this.y},this.abbrev=function(){var a=this.x.substr(0,1),b=this.y.substr(0,1);return a===b?a:a==="c"||a!=="c"&&b!=="c"?b+a:a+b},this.clone=function(){return{x:this.x,y:this.y,precedance:this.precedance,string:this.string,abbrev:this.abbrev,clone:this.clone}}},offset:function(b,c){function j(a,b){d.left+=b*a.scrollLeft(),d.top+=b*a.scrollTop()}var d=b.offset(),e=b.closest("body")[0],f=c,g,h,i;if(f){do f.css("position")!=="static"&&(h=f.position(),d.left-=h.left+(parseInt(f.css("borderLeftWidth"),10)||0)+(parseInt(f.css("marginLeft"),10)||0),d.top-=h.top+(parseInt(f.css("borderTopWidth"),10)||0)+(parseInt(f.css("marginTop"),10)||0),!g&&(i=f.css("overflow"))!=="hidden"&&i!=="visible"&&(g=f));while((f=a(f[0].offsetParent)).length);g&&g[0]!==e&&j(g,1)}return d},iOS:parseFloat((""+(/CPU.*OS ([0-9_]{1,3})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent)||[0,""])[1]).replace("undefined","3_2").replace("_","."))||c,fn:{attr:function(b,c){if(this.length){var d=this[0],e="title",f=a.data(d,"qtip");if(b===e&&f&&"object"===typeof f&&f.options.suppress){if(arguments.length<2)return a.attr(d,t);f&&f.options.content.attr===e&&f.cache.attr&&f.set("content.text",c);return this.attr(t,c)}}return a.fn["attr"+s].apply(this,arguments)},clone:function(b){var c=a([]),d="title",e=a.fn["clone"+s].apply(this,arguments);b||e.filter("["+t+"]").attr("title",function(){return a.attr(this,t)}).removeAttr(t);return e}}},a.each(g.fn,function(c,d){if(!d||a.fn[c+s])return b;var e=a.fn[c+s]=a.fn[c];a.fn[c]=function(){return d.apply(this,arguments)||e.apply(this,arguments)}}),a.ui||(a["cleanData"+s]=a.cleanData,a.cleanData=function(b){for(var c=0,d;(d=b[c])!==e;c++)try{a(d).triggerHandler("removeqtip")}catch(f){}a["cleanData"+s](b)}),f.version="nightly",f.nextid=0,f.inactiveEvents="click dblclick mousedown mouseup mousemove mouseleave mouseenter".split(" "),f.zindex=15e3,f.defaults={prerender:c,id:c,overwrite:b,suppress:b,content:{text:b,attr:"title",title:{text:c,button:c}},position:{my:"top left",at:"bottom right",target:c,container:c,viewport:c,adjust:{x:0,y:0,mouse:b,resize:b,method:"flip flip"},effect:function(b,d,e){a(this).animate(d,{duration:200,queue:c})}},show:{target:c,event:"mouseenter",effect:b,delay:90,solo:c,ready:c,autofocus:c},hide:{target:c,event:"mouseleave",effect:b,delay:0,fixed:c,inactive:c,leave:"window",distance:c},style:{classes:"",widget:c,width:c,height:c,def:b},events:{render:d,move:d,show:d,hide:d,toggle:d,visible:d,hidden:d,focus:d,blur:d}},g.ajax=function(a){var b=a.plugins.ajax;return"object"===typeof b?b:a.plugins.ajax=new z(a)},g.ajax.initialize="render",g.ajax.sanitize=function(a){var b=a.content,c;b&&"ajax"in b&&(c=b.ajax,typeof c!=="object"&&(c=a.content.ajax={url:c}),"boolean"!==typeof c.once&&c.once&&(c.once=!!c.once))},a.extend(b,f.defaults,{content:{ajax:{loading:b,once:b}}}),g.tip=function(a){var b=a.plugins.tip;return"object"===typeof b?b:a.plugins.tip=new B(a)},g.tip.initialize="render",g.tip.sanitize=function(a){var c=a.style,d;c&&"tip"in c&&(d=a.style.tip,typeof d!=="object"&&(a.style.tip={corner:d}),/string|boolean/i.test(typeof d.corner)||(d.corner=b),typeof d.width!=="number"&&delete d.width,typeof d.height!=="number"&&delete d.height,typeof d.border!=="number"&&d.border!==b&&delete d.border,typeof d.offset!=="number"&&delete d.offset)},a.extend(b,f.defaults,{style:{tip:{corner:b,mimic:c,width:6,height:6,border:b,offset:0}}})})
