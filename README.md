# Tracking Chicago shootings

A [Tarbell](http://tarbell.io) project that publishes to a P2P HTML Story.

ABOUT THE DATA
--------------

MH ... please describe, in broad terms, WHAT the data is and what format/state is grabbed... i.e. victims of shootings compiled by breaking news center. It's very messy and presents XYZ problems.

FETCHING THE DATA
-----------------

The purpose of **shootings_script_Dynamic.py** is to provide a dynamic way of gathering, cleaning, and analyzing shootings data available on newsroomDB. Next, I'll describe how the script works.

The python script crawls NewsroomDB and gets the most up-to-date version of the shootings data that is available on the website. Next, it cleans the Date column so that the formating becomes more python friendly. Next, it calculates the cumulative sum of the number of shootings for each day in each month of ever year. The calcuation will be output in a csv file format and it's called **number_of_shootings_up_to_DATE** (e.g., number_of_shootings_up_to_26/07/2017).
 

How to run the script

Ryan Marx will be implementing a node js code that uses command line to call and access the python script.

I have written the script in a way so that anyone who is running it will have the freedom to choose the path where the CSV file mentioned above needs to be saved to.

The following is an example of the python command:

```
python shootings_script_Dynamic.py PATH_TO_YOUR_DIRECTORY


python shootings_script_Dynamic.py shootings/data (this is just an example of how your path should look like)

```




Assumptions
-----------

* Python 2.7
* Tarbell 1.0.\*
* Node.js
* grunt-cli (See http://gruntjs.com/getting-started#installing-the-cli)

Custom configuration
--------------------

You should define the following keys in either the `values` worksheet of the Tarbell spreadsheet or the `DEFAULT_CONTEXT` setting in your `tarbell_config.py`:

* p2p\_slug
* headline 
* seotitle
* seodescription
* keywords
* byline

Note that these will clobber any values set in P2P each time the project is republished.  

Building front-end assets
-------------------------

This blueprint creates configuration to use [Grunt](http://gruntjs.com/) to build front-end assets.

When you create a new Tarbell project using this blueprint with `tarbell newproject`, you will be prompted about whether you want to use [Sass](http://sass-lang.com/) to generate CSS and whether you want to use  [Browserify](http://browserify.org/) to bundle JavaScript from multiple files.  Based on your input, the blueprint will generate a `package.json` and `Gruntfile.js` with the appropriate configuration.

After creating the project, run:

    npm install

to install the build dependencies for our front-end assets.

When you run:

    grunt

Grunt will compile `sass/styles.scss` into `css/styles.css` and bundle/minify `js/src/app.js` into `js/app.min.js`.

If you want to recompile as you develop, run:

    grunt && grunt watch

This blueprint simply sets up the the build tools to generate `styles.css` and `js/app.min.js`, you'll have to explicitly update your templates to point to these generated files.  The reason for this is to make you think about whether you're actually going to use an external CSS or JavaScript file and avoid a request for an empty file if you don't end up putting anything in your custom stylesheet or JavaScript file.

To add `app.min.js` to your template file:

    
    <script src="js/app.min.js"></script>
    