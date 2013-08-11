Interactive Tags
================

**interactive-tags** is a Javascript library designed for use on a single-page
table of contents web page. The functionality provided is as follows:

* Clicking on a defined tag element filters the table of contents to show only
items tagged with that tag. The selected tag is added as an anchor element to the
current page location.

* Accessing the page URL with a tag value specified in the URL anchor will show
the table of contents with the same filtering.

* Tags can be specfied with each item in the table of contents, and also in a separate
tag cloud (which would generally be placed at the top of the page).

* When a tag is selected, a "tag explanation" element is used to show the current
status of the selection (i.e. that a tag has been selected, and therefore the user
is looking at a filtered subset of the items in the table of contents).

An Example
----------

A working example of this library in action can be found at http://thinkinghard.com/blog/index.html.

How it works
------------

To use, include something like the following in the HTML body tag:

<pre>
&lt;body onload="INTERACTIVE_TAGS.setup('pitch-blurb-and-tags','tag-cloud','tags-explanation')&gt;
</pre>

The three arguments required are:

* The CSS class of the HTML element for each table of contents item.
* The CSS class of the element containing the "tag cloud".
* The CSS class of the element which will show the status of the current tag selection.

Other CSS classes required are hard coded into the library. These are:

* **"tag"** this is the class of each tag element.
* **"tags"** this is the class of the element which contains the tag elements within
each table of contents item (this is not required for the tag cloud element).
* **"active"** is a CSS class is added to elements representing the currently selected tag
* **"hidden"** is the CSS class added to table of contents items filtered out by the 
current tag selection.

To keep things simple, it is assumed that table of contents items, the tag cloud, tag elements
and "tags" elements do not have any other CSS classes defined on them than the ones specified here.

**Interactive Tags** does not provide styling &ndash; it is up to the user to write appropriate
CSS for the "active" and "hidden" classes (and to style the other elements in whatever manner
is desired).
