'use strict';

/* jshint -W106 */
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: [
        '**/*.js',
        'Gruntfile.js',
        '!node_modules/**/*',
        '!third-party/**/*',
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // remove all previous browserified builds
    clean: {
      dist: ['../public/js/plowderye.js'],
    },

    browserify: {
      dev: {
        src: [ '<%= pkg.name %>.js' ],
        dest: '../public/js/<%= pkg.name %>.dev.js',
        options: {
          bundleOptions: {
            // Embed browserify source map for dev build
            debug: true
          }
        }
      },
      dist: {
        src: [ '<%= pkg.name %>.js' ],
        dest: '../public/js/<%= pkg.name %>.js',
      },
    },

    // Uglify browser libs
    uglify: {
      dist: {
        files: {
          '../public/js/<%= pkg.name %>.min.js':
            ['<%= browserify.dist.dest %>'],
        }
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['default']
    },
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [
    'jshint',
    'clean',
    'browserify',
    'uglify',
  ]);
};
/* jshint +W106 */
