module.exports = function(grunt) {

  // Import des packages
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  var jsSrc = [
               'js/main.js',
               'js/canvas.js',
               'js/color.js',
               'js/paving/iso.js'
               ];

  grunt.initConfig({
    sass: {
      dist: {
        options: {
          style: 'expanded',
          sourcemap: 'none'
        },
        files: [{
          "expand": true,
          "cwd": "scss/",
          "src": ["*.scss"],
          "dest": "test/css/",
          "ext": ".css"
        }]
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: jsSrc,
        dest: 'dist/trixel.js'
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/trixel.min.js': jsSrc
        }
      }
    },
    copy: {
      dist: {
        files: [
          {expand: true, cwd: 'dist/', src: 'trixel.js', dest: 'test/js/'},
          {expand: true, cwd: 'test/', src: '**', dest: '../site/'}
        ],
      },
    },
    watch: {
      scripts: {
        files: '**/*.js',
        tasks: ['concat:dist', 'copy:dist', 'uglify:dist']
      },
      styles: {
        files: '**/*.scss',
        tasks: ['sass:dist']
      }
    }
  })

  grunt.registerTask('default', ['dist', 'watch'])
  grunt.registerTask('dist', ['sass:dist', 'concat:dist', 'copy:dist', 'uglify:dist']) 
}
