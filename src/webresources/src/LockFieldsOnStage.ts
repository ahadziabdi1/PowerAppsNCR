namespace NCRLock {
    
    // Get form context for Model-Driven Apps
    function getFormContext(): any {
        return (window as any).parent?.Xrm?.Page;
    }

    // Clear any existing guidance messages
    function clearGuidanceMessages(formContext: any): void {
        formContext.ui.clearFormNotification("StageHint");
    }

    // Show stage-specific guidance message
    function showGuidanceMessage(formContext: any, stageName: string): void {
        clearGuidanceMessages(formContext);
        
        let message = "";
        let messageType = "INFO";

        switch (stageName) {
            case "Report":
                message = "REPORT STAGE: Fill in Name, NC Type, Description, Reported By, and Assigned Manager.";
                messageType = "INFO";
                break;
            case "Investigate":
                message = "INVESTIGATE STAGE: Set Priority and Status (required). Additional fields appear based on NC Type.";
                messageType = "INFO";
                break;
            case "Resolve":
                message = "RESOLVE STAGE: Provide Resolution Notes (required) to document the corrective actions taken.";
                messageType = "INFO";
                break;
            case "Close":
                message = "CLOSE STAGE: Update Status to 'Closed' and verify all information is complete.";
                messageType = "INFO";
                break;
        }

        if (message) {
            formContext.ui.setFormNotification(message, messageType, "StageHint");
        }
    }

    export function onLoad(): void {
        console.log("Form loaded - setting up BPF locking");
        const formContext = getFormContext();
        if (formContext) {
            // Apply locking initially
            applyStageBasedLocking(formContext);
            
            // Also apply on save (when stage might change)
            if (formContext.data?.entity) {
                formContext.data.entity.addOnSave(onSave);
            }
        }
    }

    export function onSave(): void {
        console.log("Form saved - reapplying BPF locking");
        const formContext = getFormContext();
        if (formContext) {
            // Small delay to ensure BPF stage has updated
            setTimeout(() => {
                applyStageBasedLocking(formContext);
            }, 100);
        }
    }

    function applyStageBasedLocking(formContext: any): void {
        if (!formContext.data?.process) {
            console.log("No BPF process found");
            return;
        }

        const process = formContext.data.process;
        const activeStage = process.getActiveStage();
        
        if (activeStage) {
            const stageName = activeStage.getName();
            console.log("Current BPF stage:", stageName);
            
            // Apply field locking
            lockFields(formContext, stageName);
            
            // Show guidance message
            showGuidanceMessage(formContext, stageName);
        }
    }

    function lockFields(formContext: any, stageName: string) {        
        const reportFields = ["nwrg_name", "nwrg_description", "nwrg_nctype", "nwrg_reportedby", "nwrg_assignedmanager"];
        const investigateFields = ["nwrg_priority", "nwrg_status"];
        const conditionalFields = ["nwrg_safetyseverity", "nwrg_environmentalimpact", "nwrg_qualitystandard"];
        const resolveFields = ["nwrg_resolutionnotes"]; 

        // Unlock everything first
        const allFields = [...reportFields, ...investigateFields, ...conditionalFields, ...resolveFields];
        allFields.forEach(field => {
            const control = formContext.getControl(field);
            if (control?.setDisabled) {
                control.setDisabled(false);
            }
        });

        // Lock based on current stage
        switch (stageName) {
            case "Investigate":
                // Lock Report stage fields
                reportFields.forEach(field => {
                    const control = formContext.getControl(field);
                    if (control?.setDisabled) {
                        control.setDisabled(true);
                    }
                });
                break;
            case "Resolve":
                // Lock Report + Investigate stage fields
                [...reportFields, ...investigateFields, ...conditionalFields].forEach(field => {
                    const control = formContext.getControl(field);
                    if (control?.setDisabled) {
                        control.setDisabled(true);
                    }
                });
                break;
            case "Close":
                // Lock ALL fields except status
                allFields.forEach(field => {
                    const control = formContext.getControl(field);
                    if (control?.setDisabled && field !== "nwrg_status") {
                        control.setDisabled(true);
                    }
                });
                break;
        }
    }
}