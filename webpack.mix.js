let mix = require('laravel-mix');
require('laravel-mix-eslint');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix
    .js('resources/assets/js/app.js', 'public/js')
    .js('resources/assets/js/components/pizza.js', 'public/js/pizza.js')
    .eslint({
        "env": {
            "es6": true,
            "browser": true
        },
        "extends": "airbnb",
        "rules": {
            "no-console": 0,
        }
    })
   .sass('resources/assets/sass/app.scss', 'public/css');
