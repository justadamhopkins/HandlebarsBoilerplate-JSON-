// Indent using 2 spaces

module.exports = function(grunt) {

    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    // ------------------------------------------------------------------------
    // Directory
    // ------------------------------------------------------------------------

    var dir = {
        src: {},
        build: {},
        dev: {}
    };

    var languages = ['zm'];
    // SOURCE -----------------------------------------------------------------
    dir.src.root = 'src';
    dir.src.shared = '/shared';
    dir.src.locale = '/locale';

    dir.src.templates = dir.src.root + '/templates';
    dir.src.layouts = dir.src.templates + '/layouts';
    dir.src.pages = dir.src.templates + '/pages';
    dir.src.partials = dir.src.templates + '/partials';



    dir.src.assets = dir.src.root + '/assets';
    dir.src.js = dir.src.assets + '/js';
    dir.src.sass = dir.src.assets + '/sass';
    dir.src.images = dir.src.assets + '/images';
    dir.src.fonts = dir.src.assets + '/fonts';
    dir.src.json = dir.src.assets + '/json';

    // Dev --------------------------------------------------------------------
    dir.dev.root = './dev';
    dir.dev.assets = dir.dev.root + '/assets';

    dir.dev.js = dir.dev.assets + '/js';
    dir.dev.css = dir.dev.assets + '/css';
    dir.dev.images = dir.dev.assets + '/images';
    dir.dev.fonts = dir.dev.assets + '/fonts';
    dir.dev.json = dir.dev.assets + '/json';

    // Build ------------------------------------------------------------------
    dir.build.root = './build';
    dir.build.assets = dir.build.root + '/assets';

    dir.build.js = dir.build.assets + '/js';
    dir.build.css = dir.build.assets + '/css';
    dir.build.images = dir.build.assets + '/images';
    dir.build.fonts = dir.build.assets + '/fonts';
    dir.build.json = dir.build.assets + '/json';

    grunt.initConfig({

        settings: {
            // Use commandline option 'lang' to set the language
            // eg: grunt release --language=TEST
            // This will set the appropriate data folder
            language: grunt.option('lang') || grunt.fail.warn([
                '##########################################',
                '',
                'Use commandline option \'lang\' to set the language',
                'eg: grunt release --lang=TEST',
                '',
                '###################################################',
                ''
            ].join('\n'))
        },


        clean: {
            'build': [dir.build.root + '/*'],
            'dev': [dir.dev.root + '/*']
        },

        browserify: {
            dev: {
                src: [dir.src.js + '/application.js'],
                dest: dir.dev.js + '/application.js',
                options: {
                    browserifyOptions: { debug: true },
                    transform: [["babelify", { "presets": ["es2015"] }]],
                }
            },
            build: {
                options: {
                    browserifyOptions: {
                        debug: false,
                        compress: true,
                    },
                    transform: [["babelify", { "presets": ["es2015"] }]],
                },
                src: [dir.src.js + '/application.js'],
                dest: dir.build.js + '/tmp/application.js',
            },
        },

        assemble: {
            options: {
                layout: "default.hbs",
                layoutdir: dir.src.layouts,
                partials: dir.src.partials + "/*.hbs",
                flatten: true,
                data: dir.src.json + '/<%= settings.language %>' + '/*.json'
            },
            build: {

                src: dir.src.pages + '**/*.hbs',
                dest: dir.build.root
            },
            dev: {
                options: {
                    dev: true
                },
                src: dir.src.pages + '**/*.hbs',
                dest: dir.dev.root
            }
        },

        jsonlint: {
            all: {
                src: [dir.src.json + '/<%= settings.language %>' + '/*.json'],
                options: {
                    format: true,
                    indent: 2,
                }
            }
        },

        watch: {
            grunt: {
                files: ['Gruntfile.js'],
                tasks: ['default'],
            },
            assemble: {
                files: [dir.src.templates + '/**/*.hbs'],
                tasks: ['assemble:dev'],
            },
            json: {
                files: [dir.src.json + '/<%= settings.language %>' + '/*.json'],
                tasks: ['jsonlint','assemble:dev'],
            },
            js: {
                files: [dir.src.js + '/**/*.js'],
                tasks: ['browserify'],

            },
            sass: {
                files: [dir.src.sass + '/**/*.scss', dir.src.sass + '/**/**/*/**'],
                tasks: ['sass:dev', 'postcss:dev'],
                options: {
                    spawn: false
                }
            },
            images: {
                files: [dir.src.images + dir.src.shared + '/*.{png,jpg,gif,PNG,JPG,GIF,jpeg,JPEG,svg,SVG}',
                    dir.src.images + '/<%= settings.language %>' + '/*.{png,jpg,gif,PNG,JPG,GIF,jpeg,JPEG,svg,SVG}'
                ],
                tasks: ['copy:images__Dev'],
                options: {
                    event: ['changed', 'added', 'deleted']
                }
            }
        },

        browserSync: {
            'dev': {
                bsFiles: {
                    src: [
                        dir.dev.css + '/*.css',
                        dir.dev.root + '/*.html',
                        dir.dev.js + '/*.js'
                    ]
                },
                options: {
                    watchTask: true,
                    server: dir.dev.root
                }
            },
            'build': {
                bsFiles: {
                    src: [
                        dir.build.css + '/*.css',
                        dir.build.root + '/*.html',
                        dir.build.js + '/*.js'
                    ]
                },
                options: {
                    watchTask: false,
                    server: dir.build.root
                }
            }
        },

        sass: {
            'dev': {
                options: {
                    sourcemap: 'inline',

                },
                files: [{
                    expand: true,
                    cwd: dir.src.sass + dir.src.locale + '/' + '<%= settings.language %>',
                    dest: dir.dev.css,
                    expand: true,
                    src: ['style.scss'],
                    ext: '.css'
                }]

            },
            'build': {
                options: {
                    sourcemap: 'none'
                },
                files: [{
                    expand: true,
                    cwd: dir.src.sass + dir.src.locale + '/' + '<%= settings.language %>',
                    dest: dir.build.css,
                    expand: true,
                    src: ['style.scss'],
                    ext: '.css'
                }]

            }
        },

        postcss: {

            'build': {
                src: dir.build.css + '/*.css',
                options: {
                    map: false,
                    processors: [
                        require('pixrem')(), // add fallbacks for rem units
                        require('autoprefixer')({ browsers: 'last 2 versions' }), // add vendor prefixes
                        require('cssnano')() // minify the result
                    ]
                },
            },
            'dev': {
                src: dir.dev.css + '/*.css',
                options: {
                    map: {
                        inline: false,
                    },
                    processors: [
                        require('pixrem')(), // add fallbacks for rem units
                        require('autoprefixer')({ browsers: 'last 2 versions' }), // add vendor prefixes
                    ]
                },
            }
        },

        copy: {
            images__Dev: { cwd: dir.src.images, dest: dir.dev.images, expand: true, src: 'shared/**' },
            images__locale__Dev: { cwd: dir.src.images, dest: dir.dev.images, expand: true, src: '<%= settings.language %>/**' },
            fonts__Dev: { cwd: dir.src.fonts, dest: dir.dev.fonts, expand: true, src: '**' },

            images__Build: { cwd: dir.src.images + '/shared', dest: dir.build.images, expand: true, src: 'shared/**' },
            images__locale__Build: { cwd: dir.src.images, dest: dir.build.images, expand: true, src: '<%= settings.language %>/**' },
            fonts__Build: { cwd: dir.src.fonts, dest: dir.build.fonts, expand: true, src: '**' }

        },

        uglify: {
            prod: {
                options: {
                    sequences: true,
                    dead_code: true,
                    conditionals: true,
                    booleans: true,
                    unused: true,
                    if_return: true,
                    join_vars: true,
                    drop_console: true,
                    mangle: true
                },
                files: [{
                    expand: true,
                    cwd: dir.build.js + '/tmp/',
                    src: '*.js',
                    dest: dir.build.js
                }]
            }
        },

        notify_hooks: {

            options: {
                enabled: true,
                max_jshint_notifications: 5, // maximum number of notifications from jshint output
                title: "Project Name", // defaults to the name in package.json, or will use project directory's name
                success: false, // whether successful grunt executions should be notified automatically
                duration: 3 // the duration of notification in seconds, for `notify-send only
            }

        },


    });

    grunt.registerTask('default', [
        'clean:dev',
        'copy:images__Dev',
        'copy:images__locale__Dev',
        'copy:fonts__Dev',
        'browserify:dev',
        'jsonlint',
        'assemble:dev',
        'sass:dev',
        'postcss:dev',
        'browserSync:dev',
        'watch',
        'notify_hooks'
    ]);

    grunt.registerTask('build', [
        'clean:build',
        'sass:build',
        'postcss:build',
        'browserify:build',
        'uglify:prod',
        'copy:images__Build',
        'copy:images__locale__Build',
        'copy:fonts__Build',
        'jsonlint',
        'assemble:build',
        'browserSync:build'
    ]);

};
