Interactive Tags
================

**Interactive Tags** is a Javascript library designed for use on a single-page
table of contents web page. The functionality provided is as follows:

* Clicking on a defined tag element filters the table of contents to show only
items tagged with that tag, and the selected tag is added as an anchor element to the
current page location.

* Accessing the page URL with a tag value specified in the URL anchor will show
the table of contents with the same filtering.

* Tags can be specified with each item in the table of contents, and also in a separate
tag cloud (which would generally be placed at the top of the page).

* When a tag is selected, a "tag explanation" element is used to show the current
status of the selection (i.e. that a tag has been selected, and therefore the user
is looking at a filtered subset of the items in the table of contents).

An example
----------

A working example of this library in action can be found at http://thinkinghard.com/blog/index.html.

How to use it
-------------

To use, include **interactive-tags.js** with a script tag in the HTML head section, i.e:

<pre>
&lt;script type="text/javascript" src="interactive-tags.js"&gt;&lt;/script&gt;
</pre>

and then call the **INTERACTIVE_TAGS.setup** function, for example in the HTML body tag as follows:

<pre>
&lt;body onload="INTERACTIVE_TAGS.setup('pitch-blurb-and-tags','tag-cloud','tags-explanation')&gt;
</pre>


The three arguments required are:

* The CSS class of the HTML element for each table of contents item.
* The CSS class of the element containing the "tag cloud".
* The CSS class of the element which will show the status of the current tag selection.

Other CSS classes required are hard coded into the library. These are:

* **"tag"** &ndash; the class of each tag element.
* **"tags"** &ndash; the class of the element which contains the tag elements within
each table of contents item (this is not required for the tag cloud element).
* **"active"** &ndash; a CSS class added to elements representing the currently selected tag
* **"hidden"** &ndash; the CSS class added to table of contents items filtered out by the 
current tag selection.

To keep things simple, it is assumed that table of contents items, the tag cloud, tag elements
and "tags" elements do not have any CSS classes defined on them other than the ones specified here.

**Interactive Tags** does not provide styling &ndash; it is up to the user to write appropriate
CSS for the "active" and "hidden" classes (and to style the other elements in whatever manner
is desired).
