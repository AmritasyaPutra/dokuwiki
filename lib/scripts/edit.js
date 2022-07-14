/**
 * Functions for text editing (toolbar stuff)
 *
 * @todo most of the stuff in here should be revamped and then moved to toolbar.js
 * @author Andreas Gohr <andi@splitbrain.org>
 */

/**
 * Creates a toolbar button through the DOM
 * Called for each entry of toolbar definition array (built by inc/toolbar.php and extended via js)
 *
 * Style the buttons through the toolbutton class
 *
 * @param {string} icon      image filename, relative to folder lib/images/toolbar/
 * @param {string} label     title of button, show on mouseover
 * @param {string} key       hint in title of button for access key
 * @param {string} id        id of button, and '<id>_ico' of icon
 * @param {string} classname for styling buttons
 *
 * @author Andreas Gohr <andi@splitbrain.org>
 * @author Michal Rezler <m.rezler@centrum.cz>
 */
function createToolButton(icon,label,key,id,classname){
    var $btn = jQuery(document.createElement('button')),
        $ico = jQuery(document.createElement('img'));

    // prepare the basic button stuff
    $btn.addClass('toolbutton');
    if(classname){
        $btn.addClass(classname);
    }

    $btn.attr('title', label).attr('aria-controls', 'wiki__text');
    if(key){
        $btn.attr('title', label + ' ['+key.toUpperCase()+']')
            .attr('accessKey', key);
    }

    // set IDs if given
    if(id){
        $btn.attr('id', id);
        $ico.attr('id', id+'_ico');
    }

    // create the icon and add it to the button
    if(icon.substr(0,1) !== '/'){
        icon = DOKU_BASE + 'lib/images/toolbar/' + icon;
    }
    $ico.attr('src', icon);
    $ico.attr('alt', '');
    $ico.attr('width', 16);
    $ico.attr('height', 16);
    $btn.append($ico);

    // we have to return a DOM object (for compatibility reasons)
    return $btn[0];
}

/**
 * Creates a picker window for inserting text
 *
 * The given list can be an associative array with text,icon pairs
 * or a simple list of text. Style the picker window through the picker
 * class or the picker buttons with the pickerbutton class. Picker
 * windows are appended to the body and created invisible.
 *
 * @param  {string} id    the ID to assign to the picker
 * @param  {Array}  props the properties for the picker
 * @param  {string} edid  the ID of the textarea
 * @return DOMobject    the created picker
 * @author Andreas Gohr <andi@splitbrain.org>
 */
function createPicker(id,props,edid){
    // create the wrapping div
    var $picker = jQuery(document.createElement('div'));

    $picker.addClass('picker a11y');
    if(props['class']){
        $picker.addClass(props['class']);
    }

    $picker.attr('id', id).css('position', 'absolute');

    function $makebutton(title) {
        var $btn = jQuery(document.createElement('button'))
            .addClass('pickerbutton').attr('title', title)
            .attr('aria-controls', edid)
            .on('click', bind(pickerInsert, title, edid))
            .appendTo($picker);
        return $btn;
    }

    jQuery.each(props.list, function (key, item) {
        if (!props.list.hasOwnProperty(key)) {
            return;
        }

        if(isNaN(key)){
            // associative array -> treat as text => image pairs
            if (item.substr(0,1) !== '/') {
                item = DOKU_BASE+'lib/images/'+props.icobase+'/'+item;
            }
            jQuery(document.createElement('img'))
                .attr('src', item)
                .attr('alt', '')
                .css('height', '16')
                .appendTo($makebutton(key));
        }else if (typeof item == 'string'){
            // a list of text -> treat as text picker
            $makebutton(item).text(item);
        }else{
            // a list of lists -> treat it as subtoolbar
            initToolbar($picker,edid,props.list);
            return false; // all buttons handled already
        }

    });
    jQuery('body').append($picker);

    // we have to return a DOM object (for compatibility reasons)
    return $picker[0];
}

/**
 * Called by picker buttons to insert Text and close the picker again
 *
 * @author Andreas Gohr <andi@splitbrain.org>
 */
function pickerInsert(text,edid){
    insertAtCarret(edid,text);
    pickerClose();
}

/**
 * Add button action for signature button
 *
 * @param  {jQuery} $btn   Button element to add the action to
 * @param  {Array}  props  Associative array of button properties
 * @param  {string} edid   ID of the editor textarea
 * @return {string} picker id for aria-controls attribute
 * @author Gabriel Birke <birke@d-scribe.de>
 */
function addBtnActionSignature($btn, props, edid) {
    if(typeof SIG != 'undefined' && SIG != ''){
        $btn.on('click', function (e) {
            insertAtCarret(edid,SIG);
            e.preventDefault();
        });
        return edid;
    }
    return '';
}

/**
 * Determine the current section level while editing
 *
 * @param {string} textboxId   ID of the text field
 *
 * @author Andreas Gohr <gohr@cosmocode.de>
 */
function currentHeadlineLevel(textboxId){
    var field = jQuery('#' + textboxId)[0],
        s = false,
        opts = [field.value.substr(0,DWgetSelection(field).start)];
    if (field.form && field.form.prefix) {
        // we need to look in prefix context
        opts.push(field.form.prefix.value);
    }

    jQuery.each(opts, function (_, opt) {
        // Check whether there is a headline in the given string
        var str = "\n" + opt,
            lasthl = str.lastIndexOf("\n==");
        if (lasthl !== -1) {
            s = str.substr(lasthl+1,6);
            return false;
        }
    });
    if (s === false) {
        return 0;
    }
    return 7 - s.match(/^={2,6}/)[0].length;
}
