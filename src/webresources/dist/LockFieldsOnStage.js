var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var NCRLock;
(function (NCRLock) {
    function getFormContext() {
        if (window.parent && window.parent.Xrm && window.parent.Xrm.Page) {
            return window.parent.Xrm.Page;
        }
        return null;
    }
    function onLoad() {
        console.log("Form loaded - setting up BPF locking");
        var formContext = getFormContext();
        if (formContext) {
            applyStageBasedLocking(formContext);
            if (formContext.data && formContext.data.entity) {
                formContext.data.entity.addOnSave(onSave);
            }
        }
    }
    NCRLock.onLoad = onLoad;
    function onSave() {
        console.log("Form saved - reapplying BPF locking");
        var formContext = getFormContext();
        if (formContext) {
            setTimeout(function () {
                applyStageBasedLocking(formContext);
            }, 100);
        }
    }
    NCRLock.onSave = onSave;
    function applyStageBasedLocking(formContext) {
        if (!formContext.data || !formContext.data.process) {
            console.log("No BPF process found");
            return;
        }
        var process = formContext.data.process;
        var activeStage = process.getActiveStage();
        if (activeStage) {
            var stageName = activeStage.getName();
            console.log("Current BPF stage:", stageName);
            lockFields(formContext, stageName);
        }
    }
    function lockFields(formContext, stageName) {
        console.log("Locking fields for stage:", stageName);
        var reportFields = ["nwrg_name", "nwrg_description", "nwrg_reportedby", "nwrg_nctype", "nwrg_assignedmanager"];
        var investigateFields = ["nwrg_priority", "nwrg_status"];
        __spreadArray(__spreadArray([], reportFields, true), investigateFields, true).forEach(function (field) {
            var control = formContext.getControl(field);
            if (control && control.setDisabled) {
                control.setDisabled(false);
            }
        });
        switch (stageName) {
            case "Investigate":
                reportFields.forEach(function (field) {
                    var control = formContext.getControl(field);
                    if (control && control.setDisabled) {
                        control.setDisabled(true);
                    }
                });
                break;
            case "Resolve":
            case "Close":
                __spreadArray(__spreadArray([], reportFields, true), investigateFields, true).forEach(function (field) {
                    var control = formContext.getControl(field);
                    if (control && control.setDisabled) {
                        control.setDisabled(true);
                    }
                });
                break;
        }
        console.log("Field locking applied for stage:", stageName);
    }
})(NCRLock || (NCRLock = {}));
