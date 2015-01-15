'use strict';


module.exports = function browserify(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-browserify');

	// Options
	return {
		build: {
			files: {
				'.build/js/app.js': ['public/js/app.js'],
				'.build/js/canvas.js': ['public/js/canvas.js'],
			},
			options: {}
		}
	};
};
