var INTERACTIVE_TAGS = {};

(function(lib) {

  /** Public function to set up a page for interactive tags.
      Parameters:
      * itemClassName: CSS class name for the DOM elements representing the items that are tagged
      * tagCloudClassName: CSS class name for DOM element of the tag cloud.
      * tagsExplanationId: ID of DOM element where the tags explanation will be displayed.
      
      Assumptions: 
      * All tag elements all have class "tag", and their textContent value is the tag.
      * Within a tagged item, all tags are contained within a DOM element with class "tags".
      * Elements with class name itemClassName, tagCloudClassName, "tags" and "tag" do not have any other class names.
      * The anchor part of the page URL is equal to the selected tag.

      The following CSS classes are used to define hidden items and active (selected) tags:
      * "hidden"
      * "active"
      
      Actual styling is to be done separately in CSS files - this library does not set any CSS properties.
      
   */
  function setup(itemClassName, tagCloudClassName, tagsExplanationId) {
    var pageWithTaggedItems = new PageWithTaggedItems(itemClassName, tagCloudClassName, tagsExplanationId);
    var locationHash = location.hash;
    if (locationHash) {
      if (/^#/.test(locationHash)) {
        locationHash = locationHash.substring(1);
      }
      pageWithTaggedItems.selectTag(locationHash);
    }
  }

  /** Get the "left" and "top" values of the current scrolling position */
  function getScrollOffsets() {
    var doc = document.documentElement, body = document.body;
    var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
    var top = (doc && doc.scrollTop  || body && body.scrollTop  || 0);
    return {left: left, top: top};
  }

  /** Add two offset objects with "left" and "top" properties */
  function addOffsets(offset1, offset2) {
    return {left: offset1.left + offset2.left, top: offset1.top + offset2.top};
  }

  /** Given two offset objects with "left" and "top" properties, subtract the second from the first */
  function subtractOffset(offset1, offset2) {
    return {left: offset1.left - offset2.left, top: offset1.top - offset2.top};
  }

  
  /** Object representing a page containing individual elements ("items") with tags, and also 
   a "tag-cloud" (populated with all the tags)*/
  function PageWithTaggedItems(itemClassName, tagCloudClassName, tagsExplanationId) {
    this.itemClassName = itemClassName;
    this.tagCloudClassName = tagCloudClassName;
    this.tagsExplanationId = tagsExplanationId;
    this.tagWithElementsByTag = {};
    this.tags = [];
    this.setupTagCloud();
    this.setupItems();
    this.setupSelectTagOnClick();
    this.setupExplanation();
    this.currentTagWithElements = null;
  }

  PageWithTaggedItems.prototype = {
    
    /** Set value of this.explanationElement from the specified tagsExplanationId */
    setupExplanation: function() {
      this.explanationElement = document.getElementById(this.tagsExplanationId);
    },
    
    /** Show the explanation for a specified tag, which may or may not be found. 
     Tag == null means no tag (in which case no explanation is shown) */
    showExplanationForTag: function(tag, tagNotFound) {
      if (this.explanationElement != null) {
        this.explanationElement.innerHTML = "";
        if (tag == null) {
          this.explanationElement.className = "hidden";
        }
        else {
          var tagNameElement = document.createElement("span");
          tagNameElement.className = "tag";
          tagNameElement.appendChild(document.createTextNode(tag));
          if (tagNotFound) {
            this.explanationElement.className = "explanation";
            this.explanationElement.appendChild(document.createTextNode("Tag "));
            this.explanationElement.appendChild(tagNameElement);
            this.explanationElement.appendChild(document.createTextNode(" not found "));
            var noteElement = document.createElement("i");
            noteElement.appendChild(document.createTextNode("(showing all entries)"));
            this.explanationElement.appendChild(noteElement);
            this.explanationElement.appendChild(document.createTextNode("."));
          }
          else {
            this.explanationElement.className = "explanation";
            this.explanationElement.appendChild(document.createTextNode("Showing entries tagged with "));
            this.explanationElement.appendChild(tagNameElement);
            this.explanationElement.appendChild(document.createTextNode(" "));
            var clearNoteElement = document.createElement("i");
            clearNoteElement.appendChild(document.createTextNode
                                         ("(click on active tag to deselect it and show all entries)"));
            this.explanationElement.appendChild(clearNoteElement);
            this.explanationElement.appendChild(document.createTextNode("."));
          }
        }
      }
    }, 
    
    /** For each tag element, set up the click handler, which will invoke the method
     "selectTag" back on this object. */
    setupSelectTagOnClick: function() {
      for (var i=0; i<this.tags.length; i++) {
        var tag = this.tags[i];
        this.tagWithElementsByTag[tag].selectTagOnClick(this);
      }
    }, 
    
    /** Method called when the user selects a given tag (or deselects if the specified tag == null)
        If there is a currently selected tag, this must be de-selected first.
        Selection involves:
        * Setting the location.hash value (in the URL in the browser address field)
        * Determine if the tag specified is one of the tags on the page.
        * Setting the value of this.currentTagWithElements
        * Set visibility of items based on selected tag.
        * Set "active" CSS class on all tag elements with the selected tag.
        * Display the appropriate explanation (if any) about the tag selection.
     */
    selectTag: function(tag) {
      var currentTag = this.currentTagWithElements == null ? null : this.currentTagWithElements.tag;
      var tagToSelect = tag;
      if (currentTag == tag) { // i.e. "selecting" the currently selected tag => deselect it
        tagToSelect = null;
      }
      location.hash = tagToSelect == null ? "" : tagToSelect;
      if (this.currentTagWithElements == null) {
        this.setAllItemsVisible(false);
      }
      else {
        this.currentTagWithElements.setSelected(false);
        this.currentTagWithElements = null;
      }
      var tagNotFound = false;
      if (tagToSelect != null) {
        this.currentTagWithElements = this.tagWithElementsByTag[tagToSelect];
        if (this.currentTagWithElements == undefined) {
          this.currentTagWithElements = null;
          tagNotFound = true;
        }
      }
      if (this.currentTagWithElements == null) {
        this.setAllItemsVisible(true);
      }
      else {
        this.currentTagWithElements.setSelected(true);
      }
      this.showExplanationForTag(tagToSelect, tagNotFound);
    }, 

    /** Set all the items visible (because no tag is selected) */
    setAllItemsVisible: function(visibility) {
      for (var i=0; i<this.items.length; i++) {
        this.items[i].setVisible(visibility);
      }
    }, 
    
    /** Initialise this.tagCloud as a ItemWithTags constructed from the tag cloud element. */
    setupTagCloud: function() {
      this.tagCloud = null;
      var tagCloudElements = document.getElementsByClassName(this.tagCloudClassName);
      if (tagCloudElements.length >= 1) {
        var tagCloudElement = tagCloudElements[0];
        this.tagCloud = new ItemWithTags(tagCloudElement);
      }
      this.addToTagWithElements(this.tagCloud, null);
    }, 

    /** Set up the items with the specified item CSS class name */
    setupItems: function() {
      this.items = [];
      var itemElements = document.getElementsByClassName(this.itemClassName);
      for (var i=0; i<itemElements.length; i++) {
        this.setupItem(itemElements[i]);
      }
    },
    
    /** Set up one ItemWithTags object for a given item element.
        Look for class="tag" elements within a class="tags" element.*/
    setupItem: function(itemElement) {
      var item = new ItemWithTags(itemElement, "tags");
      this.items.push(item);
      this.addToTagWithElements(item, item);
    },
    
    /** For each tag in the item, add the tag and the item to 
        the TagWithElements object for that tag. (The item is added
        if it is to be hidden and shown based on the currently selected tag.
        If the item is not be hidden and shown, i.e. it's the tag cloud, 
        then pass null for second parameter.)*/
    addToTagWithElements: function(itemWithTags, itemToHideAndShow) {
      var tagElements = itemWithTags.tagElements;
      for (var i=0; i<tagElements.length; i++) {
        var tagElement = tagElements[i];
        var tag = tagElement.tag;
        this.getTagWithElements(tag).addItemAndTagElement(itemToHideAndShow, tagElement);
      }
    }, 
    
    /** Get the TagWithElements object for the specified tag, creating a new
        one if necessary. */
    getTagWithElements: function(tag) {
      var tagWithElements = this.tagWithElementsByTag[tag];
      if (tagWithElements == undefined) {
        this.tags.push(tag);
        tagWithElements = new TagWithElements(tag);
        this.tagWithElementsByTag[tag] = tagWithElements;
      }
      return tagWithElements;
    }, 
    
  };

  /** Information about a tag including objects representing all the items with that tag
      and all the tag elements for that tag.
  */
  function TagWithElements(tag) {
    this.tag = tag;
    this.itemsWithTags = [];
    this.tagElements = [];
  }

  TagWithElements.prototype = {
    /** Add an item (with tags), if given, and a tag element. */
    addItemAndTagElement: function(itemWithTags, tagElement) {
      if (itemWithTags != null) {
        this.itemsWithTags.push(itemWithTags);
      }
      this.tagElements.push(tagElement);
    }, 
    
    /** This function sets up the click handler for all the tag elements
        to invoke selectTag on the target with the tag as a parameter.
        The handler also scrolls the screen (as much as possible) so that
        the element clicked on is restored to the same position on the screen.
        (However if it is too close to the start or end of the page, this may
        not be possible, as the browser will not scroll past the beginning or end
        of the page, in which case the browser will scroll it has close as it can
        to being in the same position.)
    */
    selectTagOnClick: function(target) {
      var tag = this.tag;
      var selectTagFunction = function() { 
        var screenPosBefore = this.getBoundingClientRect();

        target.selectTag(tag); 

        var screenPosAfter = this.getBoundingClientRect();
        var scrollOffsetAfter = getScrollOffsets();
        var pagePositionAfter = addOffsets(scrollOffsetAfter, screenPosAfter);

        var targetScrollOffset = subtractOffset(pagePositionAfter, screenPosBefore);

        window.scrollTo(targetScrollOffset.left, targetScrollOffset.top);
      }
      for (var i=0; i<this.tagElements.length; i++) {
        this.tagElements[i].element.onclick = selectTagFunction;
      }
    }, 
    
    /** Set the required visibility on the items and active state on all tag elements
        based on whether this tag is or is not selected. */
    setSelected: function(selected) {
      for (var i=0; i<this.itemsWithTags.length; i++) {
        this.itemsWithTags[i].setVisible(selected);
      }
      for (i=0; i<this.tagElements.length; i++) {
        this.tagElements[i].setActive(selected);
      }
    }
  };

  /** Object representing a tag element and the actual tag value. */
  function TagElement(element) {
    this.element = element;
    this.tag = element.textContent;
    this.inactiveElementClass = this.element.className;
    this.activeElementClass = this.inactiveElementClass + " active";
  }

  TagElement.prototype = {
    /** Set the active status of the tag element. */
    setActive: function(active) {
      this.element.className = active ? this.activeElementClass : this.inactiveElementClass;
    }
  };

  /** Object representing an "item" with tags. */
  function ItemWithTags(element, tagsElementClassName) {
    this.element = element;
    this.visibleElementClass = element.className;
    this.hiddenElementClass = this.visibleElementClass + " hidden";
    var tagsElement = element;
    if (tagsElementClassName) {
      var tagsElements = element.getElementsByClassName(tagsElementClassName);
      if (tagsElements.length > 0) {
        tagsElement = tagsElements[0];
      }
    }
    var tagDomElements = tagsElement.getElementsByClassName("tag");
    this.tags = [];
    this.tagElements = [];
    for (var i=0; i<tagDomElements.length; i++) {
      this.tagElements.push(new TagElement(tagDomElements[i]));
    }
    for (var i=0; i<this.tagElements.length; i++) {
      this.tags.push(this.tagElements[i].tag);
    }
  }

  ItemWithTags.prototype = {
    /** Set the visibility of this item (which will be a function of whether it contains
     a selected tag, or if no tag has been selected). */
    setVisible: function(visible) {
      this.element.className = visible ? this.visibleElementClass : this.hiddenElementClass;
    }
  };
  
  // export public functions
  lib.setup = setup;
  
})(INTERACTIVE_TAGS);
