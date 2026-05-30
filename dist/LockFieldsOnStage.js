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
        var _a, _b;
        return (_b = (_a = window.parent) === null || _a === void 0 ? void 0 : _a.Xrm) === null || _b === void 0 ? void 0 : _b.Page;
    }
    function clearGuidanceMessages(formContext) {
        formContext.ui.clearFormNotification("StageHint");
    }
    function showGuidanceMessage(formContext, stageName) {
        clearGuidanceMessages(formContext);
        var message = "";
        switch (stageName) {
            case "Report":
                message = "REPORT STAGE: Fill in Name, NC Type, Description, Reported By, and Assigned Manager.";
                break;
            case "Investigate":
                message = "INVESTIGATE STAGE: Set Priority and Status (required). Additional fields appear based on NC Type.";
                break;
            case "Resolve":
                message = "RESOLVE STAGE: Provide Resolution Notes (required) to document the corrective actions taken.";
                break;
            case "Close":
                message = "CLOSE STAGE: Update Status to 'Closed' and verify all information is complete.";
                break;
        }
        if (message) {
            formContext.ui.setFormNotification(message, "INFO", "StageHint");
        }
    }
    function onLoad() {
        console.log("Form loaded - setting up BPF locking");
        var formContext = getFormContext();
        if (formContext) {
            setupBpfEvents(formContext);
            applyStageBasedLocking(formContext);
        }
    }
    NCRLock.onLoad = onLoad;
    function setupBpfEvents(formContext) {
        var _a;
        if ((_a = formContext.data) === null || _a === void 0 ? void 0 : _a.process) {
            try {
                formContext.data.process.addOnStageChange(onStageChange);
                console.log("BPF stage change event registered");
            }
            catch (error) {
                console.log("BPF events not available, using fallback");
                if (formContext.data.entity) {
                    formContext.data.entity.addOnSave(onSave);
                }
            }
        }
    }
    function onStageChange() {
        console.log("BPF Stage changed detected");
        var formContext = getFormContext();
        if (formContext) {
            setTimeout(function () {
                applyStageBasedLocking(formContext);
            }, 300);
        }
    }
    NCRLock.onStageChange = onStageChange;
    function onSave() {
        console.log("Form saved - checking for stage changes");
        var formContext = getFormContext();
        if (formContext) {
            setTimeout(function () {
                applyStageBasedLocking(formContext);
            }, 200);
        }
    }
    NCRLock.onSave = onSave;
    function applyStageBasedLocking(formContext) {
        var _a;
        if (!((_a = formContext.data) === null || _a === void 0 ? void 0 : _a.process)) {
            console.log("No BPF process found");
            return;
        }
        var process = formContext.data.process;
        var activeStage = process.getActiveStage();
        if (activeStage) {
            var stageName = activeStage.getName();
            console.log("Current BPF stage:", stageName);
            lockFields(formContext, stageName);
            showGuidanceMessage(formContext, stageName);
        }
    }
    function lockFields(formContext, stageName) {
        var reportFields = ["nwrg_name", "nwrg_description", "nwrg_nctype", "nwrg_reportedby", "nwrg_assignedmanager"];
        var investigateFields = ["nwrg_priority", "nwrg_status"];
        var conditionalFields = ["nwrg_safetyseverity", "nwrg_environmentalimpact", "nwrg_qualitystandard"];
        var resolveFields = ["nwrg_resolutionnotes"];
        var allFields = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], reportFields, true), investigateFields, true), conditionalFields, true), resolveFields, true);
        allFields.forEach(function (field) {
            var control = formContext.getControl(field);
            if (control === null || control === void 0 ? void 0 : control.setDisabled) {
                control.setDisabled(false);
            }
        });
        switch (stageName) {
            case "Investigate":
                reportFields.forEach(function (field) {
                    var control = formContext.getControl(field);
                    if (control === null || control === void 0 ? void 0 : control.setDisabled)
                        control.setDisabled(true);
                });
                break;
            case "Resolve":
                __spreadArray(__spreadArray(__spreadArray([], reportFields, true), investigateFields, true), conditionalFields, true).forEach(function (field) {
                    var control = formContext.getControl(field);
                    if (control === null || control === void 0 ? void 0 : control.setDisabled)
                        control.setDisabled(true);
                });
                break;
            case "Close":
                allFields.forEach(function (field) {
                    var control = formContext.getControl(field);
                    if ((control === null || control === void 0 ? void 0 : control.setDisabled) && field !== "nwrg_status") {
                        control.setDisabled(true);
                    }
                });
                break;
        }
        console.log("Field locking applied for stage:", stageName);
    }
})(NCRLock || (NCRLock = {}));
