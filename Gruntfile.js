module.exports = function(grunt) {
  var config = {};

  var VENDOR_LIBRARIES = [
    'leaflet',
    'd3',
    'lodash.filter',
    'lodash.sumby',
    'lodash.orderby',
    'lodash.merge',
    'lodash.union',
    'lodash.groupby',
    'lodash.countby',
    'd3-queue',
    'leaflet-providers'
  ];

  config.browserify = {
    options: {
      browserifyOptions: {
        debug: true
      }
    },
    app: {
      src: ['js/src/app.js'],
      dest: 'js/app.min.js',
      options: {
        plugin: [
          [
            'minifyify', {
              map: 'app.min.js.map',
              output: './js/app.min.js.map'
            }
          ]
        ],
        transform: [
          [
            'babelify', {
              presets: ['es2015']
            }
          ]
        ]
      }
    }
  };

  // Check if there are vendor libraries and build a vendor bundle if needed
  if (VENDOR_LIBRARIES.length) {
    config.browserify.app.options = config.browserify.app.options || {};
    config.browserify.app.options.exclude = VENDOR_LIBRARIES;

    config.browserify.vendor = {
      src: [],
      dest: 'js/vendor.min.js',
      options: {
        plugin: [
          [
            'minifyify', {
              map: 'vendor.min.js.map',
              output: './js/vendor.min.js.map'
            }
          ]
        ],
        require: VENDOR_LIBRARIES
      }
    };
  }

  config.sass = {
    options: {
      outputStyle: 'compressed',
      sourceMap: true,
      includePaths: [ 'sass/', 'node_modules/trib-styles/sass/', 'node_modules/leaflet/dist/' ]
    },
    app: {
      files: {
        'css/styles.css': 'sass/styles.scss',
        'css/homicides.css': 'sass/homicides.scss'
      }
    }
  };

config.postcss = {
    options:{
      map:{
        inline:false,
        annotation:'css'
      },
      processors:[
        require('autoprefixer')({
          browsers: [
            "Android 2.3",
            "Android >= 4",
            "Chrome >= 20",
            "Firefox >= 24",
            "Explorer >= 11",
            "iOS >= 6",
            "Opera >= 12",
            "Safari >= 6"
          ],
          grid:true
        })
      ]
    },
    dist: {
      src: 'css/**/*.css'
    }
  }

  config.watch = {
    sass: {
      files: ['sass/**/*.scss'],
      tasks: ['sass', 'postcss']
    },
    js: {
      files: ['js/src/**/*.js'],
      tasks: ['browserify:app']
    }
  };

  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-postcss');

  var defaultTasks = [];

  defaultTasks.push('sass');
  defaultTasks.push('browserify');
  defaultTasks.push('postcss');

  grunt.registerTask('default', defaultTasks);
};