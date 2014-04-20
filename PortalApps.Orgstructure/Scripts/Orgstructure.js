function Orgstructure(context, web, callback) {
    this.Context = context;

    this.Web = web;

    this.List = web.get_siteUserInfoList();

    this._tempItems = null;

    //#region Методы доступа к данным
    this.getDepartmentsByParentId = function (id, callback) {
        if (Helper.isNullOrEmpty(id)) {
            id = 0;
        }

        var viewXml = "<View><Query><Where><Eq><FieldRef Name='ParentId' /><Value Type='Text'>" + id + "</Value></Eq></Where></Query><RowLimit></RowLimit></View>";
        
        var query = new SP.CamlQuery();
        query.set_viewXml(viewXml);

        this.loadItems(query, callback);
    }

    this.getDepartmentsWithoutParentId = function (id, callback) {
        if (Helper.isNullOrEmpty(id)) {
            id = 0;
        }

        var viewXml = "<View><Query><Where><And><IsNull><FieldRef Name='ParentId' /></IsNull><IsNull><FieldRef Name='SipAddress' /></IsNull></And></Where></Query><RowLimit></RowLimit></View>";

        var query = new SP.CamlQuery();
        query.set_viewXml(viewXml);

        this.loadItems(query, callback);
    }

    this.getUsersByGroupName = function (groupName, rowLimit, rowPosition, callback) {

        var viewXml = "<View><Query><Where>";
        if (!Helper.isNullOrEmpty(groupName)) {
            viewXml += "<Eq><FieldRef Name='Department' /><Value Type='Text'>" + groupName + "</Value></Eq>";
        } else {
            viewXml += "<IsNotNull><FieldRef Name='SipAddress' /></IsNotNull>";
        }

        viewXml += "</Where></Query><RowLimit>" + (!Helper.isNullOrEmpty(rowLimit) ? rowLimit : "") + "</RowLimit></View>";

        var query = new SP.CamlQuery();
        query.set_viewXml(viewXml);

        if (!Helper.isNullOrEmpty(rowPosition)) {
            query.set_listItemCollectionPosition(rowPosition);
        }

        this.loadItems(query, callback);
    }

    this.findUsers = function (text, callback) {

        var viewXml = "<View><Query><Where>";
        viewXml += "<And><Or><Or><Contains><FieldRef Name='Department' /><Value Type='Text'>" + text +
            "</Value></Contains><Contains><FieldRef Name='Title' /><Value Type='Text'>" + text +
            "</Value></Contains></Or><Or><Contains><FieldRef Name='JobTitle' /><Value Type='Text'>" + text +
            "</Value></Contains><Contains><FieldRef Name='Department' /><Value Type='Text'>" + text +
            "</Value></Contains></Or></Or><IsNotNull><fieldRef Name='SipAddress' /></IsNotNull></And>";

        viewXml += "</Where></Query><RowLimit></RowLimit></View>";

        var query = new SP.CamlQuery();
        query.set_viewXml(viewXml);

        this.loadItems(query, callback);
    }

    this.addDepartment = function (name, description, parentId, parentHierarchy, callback) {
        var departmentInfo = new SP.GroupCreationInformation();
        departmentInfo.set_title(name);
        departmentInfo.set_description(description);

        var department = this.Web.get_siteGroups().add(departmentInfo);
        this.Context.load(department);
        var org = this;
        this.Context.executeQueryAsync(function () {
            var departmentItem = org.List.getItemById(department.get_id());
            departmentItem.set_item('ParentId', Helper.isNullOrEmpty(parentId) ? 0 : parentId);
            if (!Helper.isNull(parentId) && parentId != 0) {
                departmentItem.set_item('Hierarchy', '/' + parentId + (Helper.isNullOrEmpty(parentHierarchy) ? '/' : parentHierarchy));
            }

            departmentItem.update();
            org.Context.load(departmentItem);

            org.Context.executeQueryAsync(function () {
                callback(departmentItem);
            }, this.errorLoad);

        }, this.errorLoad);
    }

    this.removeDepartment = function (id, callback) {
        this.Web.get_siteGroups().removeById(id);
        this.Context.load(this.Web.get_siteGroups());
        this.Context.executeQueryAsync(callback, this.errorLoad);
    }
    //#endregion

    this.loadItems = function (query, callback) {
        if (Helper.isNull(query)) {
            query = SP.CamlQuery.createAllItemsQuery();
        }
        var tmpItems = this.List.getItems(query);
        context.load(tmpItems);
        context.executeQueryAsync(function () {
            callback(tmpItems);
        }, this.errorLoad);
    };

    this.errorLoad = function (data, errorCode, errorMessage) {
    };

    this._initList = function (callback) {
        this.Context.load(this.List);
        var fields = this.Context.loadQuery(this.List.get_fields(), "Include(Title, InternalName)");
        var $this = this;
        this.Context.executeQueryAsync(function () {
            $this._enshureFields($this, fields, callback, this.errorLoad);
        }, this.errorLoad);
    };

    this._enshureFields = function (orgstruct, fields, callback, errorLoad) {
        var countFields = 0;
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (field.get_internalName() == "Hierarchy" ||
                field.get_internalName() == "ParentId") {
                countFields++;
            }
        }

        if (countFields == 2) {
            callback();
            return;
        }

        if (confirm("One or more fields not found in Users list. Create it(s)?")) {
            var fieldHierarchy = orgstruct.List.get_fields().addFieldAsXml('<Field Type="Text" DisplayName="Hierarchy" Name="Hierarchy" />',
                true, SP.AddFieldOptions.addToDefaultContentType);
            fieldHierarchy.set_title("Иерархия");
            fieldHierarchy.update();

            var fieldParentId = orgstruct.List.get_fields().addFieldAsXml('<Field Type="Text" DisplayName="ParentId" Name="ParentId" />',
                true, SP.AddFieldOptions.addToDefaultContentType);
            fieldParentId.set_title("Родитель");
            fieldParentId.update();

            orgstruct.Context.executeQueryAsync(callback, errorLoad);
        }
    };

    this._initList(callback);
}