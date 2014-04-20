Helper = new (function () {

    // Function to retrieve a query string value.
    // For production purposes you may want to use
    //  a library to handle the query string.
    this.getQueryStringParameter = function(paramToRetrieve) {
        var params =
            document.URL.split("?")[1].split("&");
        var strParams = "";
        for (var i = 0; i < params.length; i = i + 1) {
            var singleParam = params[i].split("=");
            if (singleParam[0] == paramToRetrieve)
                return singleParam[1];
        }
    }

    this.onSharepointReady = function (callback) {
        if (!Helper.isNull(callback)) {
            callback();
        }
    }

    //Get the URI decoded URLs.
    this.HostWebUrl =
        decodeURIComponent(
            this.getQueryStringParameter("SPHostUrl"));

    this.AppWebUrl =
        decodeURIComponent(
            this.getQueryStringParameter("SPAppWebUrl"));


    // resources are in URLs in the form:
    // web_url/_layouts/15/resource
    this.ScriptBase = this.HostWebUrl + "/_layouts/15/";

    this.isNull = function (obj) {
        return typeof (obj) === 'undefined' || obj == null;
    }

    this.isNullOrEmpty = function (obj) {
        return Helper.isNull(obj) || obj == '';
    }
})();

var Loader = new (function() {
    this.hide = function (controlId) {
        document.getElementById(controlId).innerHTML = '';
    },
    this.show = function (controlId) {
        document.getElementById(controlId).innerHTML = 'Тысяча таджиков работают над этим...';
    }
})();

function TemplatesHelper() {
    this.add = function (templateName) {
        var source = $('#' + templateName).html();
        this._templates[listTemplates[tmplName]] = Handlebars.compile(source);
    }

    this.addList = function (templateNames) {
        for (var i = 0; i < templateNames.length; i++) {
            var source = $('#' + templateNames[i]).html();
            this[templateNames[i]] = Handlebars.compile(source);
        }
    }
}