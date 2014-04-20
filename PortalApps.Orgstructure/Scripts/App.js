var hostWebUrl = Helper.HostWebUrl;
var appWebUrl = Helper.AppWebUrl;
var ctx;
var appContextSite;
var OrgstructureData = null;
var Templates = new TemplatesHelper();

// Инициализация переменных
$(document).ready(function () {
    Templates.addList(['SiteTitleTmpl', 'OrgstructureNodesTmpl', 'OrgstructureNodeTmpl', 'UsersTmpl']);

    Handlebars.registerHelper('call', function (templateName) {
        return new Handlebars.SafeString(Templates[templateName](this));
    });

    Helper.onSharepointReady(execCrossDomainRequest);
});

// Главный метод загрузки данных
function execCrossDomainRequest() {
    try{
        ctx = new SP.ClientContext(appWebUrl);
        appContextSite = new SP.AppContextSite(ctx, hostWebUrl);

        ctx.load(appContextSite.get_web());
        ctx.executeQueryAsync(loadWeb_completed, errorHandler);

        OrgstructureData = new Orgstructure(ctx, appContextSite.get_web(), function () {
            loadDepartments(0, '');
            loadUsers('');
            loadOtherGroups();
        });
    } catch (e) {
        alert(e);
    }
}

//#region Обработчики событий контролов
function findUsers_keyup(text) {
    OrgstructureData.findUsers(text, loadUsers_completed);
}

function departmentTitle_click(id, hierarchy, title) {
    var childContent = document.getElementById('Hierarchy' + id).innerHTML;
    if (Helper.isNullOrEmpty(childContent)) {
        Loader.show('Hierarchy' + id);
        loadDepartments(id, hierarchy, title);
    }
}

function addDepartment_click(parentId, parentHierarchy) {
    var newDepartment = $("#newDepartment" + parentId);
    if (newDepartment.length == 0) {
        newDepartment = $("<li id='newDepartment" + parentId + "'><input class='addDepartmentText' type='text'  /><a href='javascript:;' onclick='addDepartment_ok_click(" + parentId + ", \"" + parentHierarchy + "\"); return false;'>Ok</a></li>");
        $('#AddDepartment' + parentId).
            before(newDepartment);
    }
    newDepartment.children('input').focus();
}

function addDepartment_ok_click(parentId, parentHierarchy) {
    var newDepartmentEl = $("#newDepartment" + parentId);
    var departmentName = newDepartmentEl.children('input').val();

    OrgstructureData.addDepartment(departmentName, '', parentId, parentHierarchy, function (newDepartment) {
        newDepartmentEl.remove();
        var newDepartmentsValues = newDepartment.get_fieldValues();

        $('#AddDepartment' + parentId).
            before(Templates.OrgstructureNodeTmpl(newDepartmentsValues));
    });
}

function removeDepartment_click(id) {
    if (confirm(REMOVE_DEPARTMENT_QUESTION)) {
        removeDepartment(id);
    }
}

function userMoved_mouseUp(divisionNameFrom, divisionNameTo, userId) {
}
//#endregion

//#region Загрузчики данных
//Загрузка веба
function loadWeb_completed() {
    var title = appContextSite.get_web().get_title();
    document.getElementById("SiteTitle").innerHTML = Templates.SiteTitleTmpl(title);
}

// Загрузка департаментов
function loadDepartments(id, hierarchy, title) {
    OrgstructureData.getDepartmentsByParentId(id, function (items) {
        loadDepartments_completed(id, hierarchy, items);
        if (!Helper.isNullOrEmpty(title)) {
            loadUsersByDepartment(id, title);
        }
    });
}

function loadDepartments_completed(parentId, hierarchy, items) {
    var departments = new Array();
    var listItemEnumerator = items.getEnumerator();
    while (listItemEnumerator.moveNext()) {
        departments.push(listItemEnumerator.get_current().get_fieldValues());
    }
    document.getElementById("Hierarchy" + parentId).innerHTML = 
        Templates.OrgstructureNodesTmpl({ ParentId: parentId, Hierarchy: hierarchy, Departments: departments });
}

// Загрузка пользователей департаментов
function loadUsersByDepartment(id, title) {
    OrgstructureData.getUsersByGroupName(title, 0, '', function (items) {
        loadUsersByDepartment_completed(id, title, items);
    });
}

function loadUsersByDepartment_completed(id, departmentName, items) {
    var users = new Array();
    var listItemEnumerator = items.getEnumerator();
    while (listItemEnumerator.moveNext()) {
        users.push(listItemEnumerator.get_current().get_fieldValues());
    }
    $("#Hierarchy" + id).children("ul").append(Templates.UsersTmpl(users));
}

// Загрузка всех пользователей
function loadUsers(departmentName, rowPosition) {
    OrgstructureData.getUsersByGroupName(departmentName, 10, rowPosition, loadUsers_completed);
}

function loadUsers_completed(items) {
    var users = new Array();
    var listItemEnumerator = items.getEnumerator();
    while (listItemEnumerator.moveNext()) {
        users.push(listItemEnumerator.get_current().get_fieldValues());
    }
    document.getElementById("Users").innerHTML =
        Templates.UsersTmpl(users);
}

// Удаление департамента
function removeDepartment(id) {
    OrgstructureData.removeDepartment(id, function () {
        $('#Department' + id).remove();
    });
}

// Обработка ошибок
function errorHandler(data, errorCode, errorMessage) {
    document.getElementById("errorMessage").innerHTML =
        "<li>Could not complete cross-domain call: " + errorMessage + "</li>";
}
//#endregion