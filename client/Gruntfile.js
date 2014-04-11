'use strict';


/* jshint -W106 */
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jsTarget: '../public/js/',
    ngminDir: './ngmin/',

    jshint: {
      files: [
        '**/*.js',
        'Gruntfile.js',
        '!ngmin/**/*',
        '!node_modules/**/*',
        '!third-party/**/*',
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // remove all previous build artifacts
    clean: {
      options: {
        force: true
      },
      all: [
        '<%= jsTarget %><%= pkg.name %>*.js',
        '<%= ngminDir %>/**/*',
      ],
    },

    ngmin: {
      controllers: {
        expand: true,
        src: ['./controller/**/*.js'],
        dest: '<%= ngminDir %>',
      },
      directives: {
        expand: true,
        src: ['./directive/**/*.js'],
        dest: '<%= ngminDir %>',
      },
      factory: {
        expand: true,
        src: ['./factory/**/*.js'],
        dest: '<%= ngminDir %>',
      },
      service: {
        expand: true,
        src: ['./service/**/*.js'],
        dest: '<%= ngminDir %>',
      },
      main: {
        src: [ '<%= pkg.name %>.js' ],
        dest: '<%= ngminDir %>/<%= pkg.name %>.js',
      },
      init: {
        src: [ 'init.js' ],
        dest: '<%= ngminDir %>/init.js',
      },
    },

    browserify: {
      dev: {
        src: [ '<%= pkg.name %>.js' ],
        dest: '<%= jsTarget %><%= pkg.name %>.dev.js',
        options: {
          bundleOptions: {
            // Embed browserify source map for dev build
            debug: true
          }
        }
      },
      dist: {
        src: [ '<%= ngmin.main.dest %>' ],
        dest: '<%= jsTarget %><%= pkg.name %>.js',
      },
    },

    uglify: {
      dist: {
        files: {
          '<%= jsTarget %><%= pkg.name %>.min.js':
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
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [
    'jshint',
    'clean',
    'ngmin',
    'browserify',
    'uglify',
  ]);
};
/* jshint +W106 */
