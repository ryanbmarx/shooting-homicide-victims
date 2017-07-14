# Tracking Chicago shootings

A [Tarbell](http://tarbell.io) project that publishes to a P2P HTML Story.

## ABOUT THE PROJECT

This is a refresh of the "band-aid" shootings page which used leaflet and ai2html. This reconception dynamically builds charts and HTML blobs use python script and NodeJS. Simply run `npm run build` to refresh the app with new data and publish it.

## ABOUT THE BUILD PROCESS

These are the things that happen when `npm run build` is called:

1. Fresh data is downloaded and cleaned from NewsroomDB
2. A couple of new data files are created for specific elements that require a different, or more condensed, data structure. This is done using NodeJS.
3. Several HTML subtemplates are built and inserted into the subtemplates folder. 
4. Sass and JS are processed, minified and bundled.

The data fetching, cleaning and processing are all automated using python and node. Several HTML partials (Jinja subtemplates) also are build dynamically with node so that they may use the most current data and/or dates. To do all this stuff, simply run `npm run build`. Each of the aforementioned steps has it's own npm script (in the package.json) and they are wired together in the proper order using the `build` script. 

Test locally then `tarbell publish production`. For now, to safeguard against a NewsroomDB failure, we should commit and push the new `raw-data.csv` file. Technically it's generated content but we need that file for the rest of the machine to operate. 

*NOTE: The data-fetching script is mostly about processing the NewsroomDB data. As such, it can pull the CSV automatically, or can ingest a local copy of the same CSV. See the section on data fetching for details.*


## ABOUT THE DATA

MH ... please describe, in broad terms, WHAT the data is and what format/state is grabbed... i.e. victims of shootings compiled by breaking news center. It's very messy and presents XYZ problems.

### FETCHING THE DATA

This app uses two python scripts, in the `dynamic` folder to grab, clean and process data from NewsroomDB automatically. 

*NOTE: If, for some reason, the script can't reach the NewsroomDB csv directly, you can download it manually and feed it to the fetcher scripts, which will clean it up. Details on this are later in this document.*

### REQUIREMENTS FOR DATA FETCHING

There are a couple of python dependencies for the data-fetching scripts. They should be installed when you run `npm install` on the whole project, but if they aren't, then run `pip install -r dynamic/requirements.txt` which should take care of that.

### HOW THE SCRIPTS WORK

The purpose of **shootings_script_Dynamic.py** is to provide a dynamic way of gathering, cleaning, and analyzing shootings data available on newsroomDB. Next, I'll describe how the script works.

The python script crawls NewsroomDB and gets the most up-to-date version of the shootings data that is available on the website. Next, it cleans the Date column so that the formating becomes more python friendly. Next, it calculates the cumulative sum of the number of shootings for each day in each month of ever year. The calcuation will be output in a csv file format and it's called **number_of_shootings_up_to_DATE** (e.g., number_of_shootings_up_to_26/07/2017).
 

### RUNNING THE DATA SCRIPTS

The scripts can be run on their own, or as part of the `npm run build` command. 

The script is written in a way so that anyone who is running it will have the freedom to choose the path where the CSV file mentioned above needs to be saved to.

The following is an example of the python command:

```
python shootings_script_Dynamic.py path/to/desired/directory/file.csv

```

If the CSV is not accessible programmatically, the NewsroomDB file can be input manually by adding a second argument the script call.

```
python shootings_script_Dynamic.py path/to/desired/output/file.csv path/to/input/newsroomdb-file.csv

```


BOILERPLATE README FOLLOWS:


## Assumptions

* Python 2.7
* Tarbell 1.0.\*
* Node.js
* grunt-cli (See http://gruntjs.com/getting-started#installing-the-cli)

## Custom configuration

You should define the following keys in either the `values` worksheet of the Tarbell spreadsheet or the `DEFAULT_CONTEXT` setting in your `tarbell_config.py`:

* p2p\_slug
* headline 
* seotitle
* seodescription
* keywords
* byline

Note that these will clobber any values set in P2P each time the project is republished.  

## Building front-end assets


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
    