"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NCRLock;
(function (NCRLock) {
    function getFormContext() {
        return window.parent?.Xrm?.Page;
    }
    function clearGuidanceMessages(formContext) {
        formContext.ui.clearFormNotification("StageHint");
    }
    function showGuidanceMessage(formContext, stageName) {
        clearGuidanceMessages(formContext);
        let message = "";
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
        const formContext = getFormContext();
        if (formContext) {
            // Set up BPF stage change event if available
            setupBpfEvents(formContext);
            // Apply initial locking
            applyStageBasedLocking(formContext);
        }
    }
    NCRLock.onLoad = onLoad;
    function setupBpfEvents(formContext) {
        // Try to set up BPF stage change event
        if (formContext.data?.process) {
            try {
                formContext.data.process.addOnStageChange(onStageChange);
                console.log("BPF stage change event registered");
            }
            catch (error) {
                console.log("BPF events not available, using fallback");
                // Fallback to save events
                if (formContext.data.entity) {
                    formContext.data.entity.addOnSave(onSave);
                }
            }
        }
    }
    function onStageChange() {
        console.log("BPF Stage changed detected");
        const formContext = getFormContext();
        if (formContext) {
            // Apply locking immediately on stage change
            setTimeout(() => {
                applyStageBasedLocking(formContext);
            }, 300); // Slightly longer delay for BPF to update
        }
    }
    NCRLock.onStageChange = onStageChange;
    function onSave() {
        console.log("Form saved - checking for stage changes");
        const formContext = getFormContext();
        if (formContext) {
            setTimeout(() => {
                applyStageBasedLocking(formContext);
            }, 200);
        }
    }
    NCRLock.onSave = onSave;
    function applyStageBasedLocking(formContext) {
        if (!formContext.data?.process) {
            console.log("No BPF process found");
            return;
        }
        const process = formContext.data.process;
        const activeStage = process.getActiveStage();
        if (activeStage) {
            const stageName = activeStage.getName();
            console.log("Current BPF stage:", stageName);
            lockFields(formContext, stageName);
            showGuidanceMessage(formContext, stageName);
        }
    }
    function lockFields(formContext, stageName) {
        const reportFields = ["nwrg_name", "nwrg_description", "nwrg_nctype", "nwrg_reportedby", "nwrg_assignedmanager"];
        const investigateFields = ["nwrg_priority", "nwrg_status"];
        const conditionalFields = ["nwrg_safetyseverity", "nwrg_environmentalimpact", "nwrg_qualitystandard"];
        const resolveFields = ["nwrg_resolutionnotes"];
        const allFields = [...reportFields, ...investigateFields, ...conditionalFields, ...resolveFields];
        // Unlock all fields first
        allFields.forEach(field => {
            const control = formContext.getControl(field);
            if (control?.setDisabled) {
                control.setDisabled(false);
            }
        });
        // Apply stage-based locking
        switch (stageName) {
            case "Investigate":
                reportFields.forEach(field => {
                    const control = formContext.getControl(field);
                    if (control?.setDisabled)
                        control.setDisabled(true);
                });
                break;
            case "Resolve":
                [...reportFields, ...investigateFields, ...conditionalFields].forEach(field => {
                    const control = formContext.getControl(field);
                    if (control?.setDisabled)
                        control.setDisabled(true);
                });
                break;
            case "Close":
                allFields.forEach(field => {
                    const control = formContext.getControl(field);
                    if (control?.setDisabled && field !== "nwrg_status") {
                        control.setDisabled(true);
                    }
                });
                break;
        }
        console.log("Field locking applied for stage:", stageName);
    }
})(NCRLock || (NCRLock = {}));
//# sourceMappingURL=LockFieldsOnStage.js.map