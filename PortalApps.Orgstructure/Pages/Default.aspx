<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="VB" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="../Scripts/jquery-1.8.2.min.js"></script>
    <script type="text/javascript" src="../Scripts/jquery-ui-1.10.3.custom.min.js"></script>
    <script type="text/javascript" src="../Scripts/handlebars-v1.3.0.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <meta name="WebPartPageExpansion" content="full" />

    <!-- Add your CSS styles to the following file -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />

    <!-- Add your JavaScript to the following file -->
    <script type="text/javascript" src="../Scripts/Messages.js"></script>
    <script type="text/javascript" src="../Scripts/Helper.js"></script>
    <script type="text/javascript" src="../Scripts/Orgstructure.js"></script>
    <script type="text/javascript" src="../Scripts/App.js"></script>
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    Page Title
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
    <script id="SiteTitleTmpl" type="text/x-handlebars-template">
      <h1>{{this}}</h1>
    </script>

    <script id="OrgstructureNodesTmpl" type="text/x-handlebars-template">
        <ul>
            {{#each Departments}}
                {{call 'OrgstructureNodeTmpl' this}}
            {{/each}}
            <li id="AddDepartment{{ParentId}}" class="addDepartment"><a href="javascript:;" onclick="addDepartment_click({{ParentId}}, '{{Hierarchy}}'); return false;">+ Добавить</a></li>
        </ul>
    </script>

    <script id="OrgstructureNodeTmpl" type="text/x-handlebars-template">
        <li id="Department{{ID}}">
            <a href="javascript:;" onclick="departmentTitle_click({{ID}}, '{{Hierarchy}}', '{{Title}}'); return false;">{{Title}}</a>
            &nbsp;<a href="javascript:;" onclick="removeDepartment_click({{ID}}); return false;">Delete</a>
            <div id="Hierarchy{{ID}}"></div>
        </li>
    </script>

    <script id="UsersTmpl" type="text/x-handlebars-template">
        {{#each this}}
            <li>
                <a href='javascript:;' onclick='selectUser({{ID}}); return false;'>{{Title}}</a>
            </li>
        {{/each}}
    </script>

    <div class="orgstructure">
        <div id="SiteTitle"></div>
        <div id="Hierarchy0">
            Тысяча таджиков работают над этим.
        </div>
    </div>
    <div class="users">
        <input id="findUsers" type="text" onkeyup="findUsers_keyup(this.value);" /><a href="javascript:;" onclick="findUsers_keyup($('#findUsers').val());">Найти</a>
        <ul id="Users">

        </ul>
    </div>
    <div style="clear: both">
    </div>
    <div id="errorMessage"></div>
</asp:Content>
