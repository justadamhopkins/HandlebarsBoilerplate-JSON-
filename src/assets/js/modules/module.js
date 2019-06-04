module.exports = Module;

function Module() {
    'use strict';

    var method = {};

    method.init = function() {

    	console.log('This boilerplate works');
    	console.log($);

    };

    return method;
}
