namespace NCRLock {
    
    // Get form context for Model-Driven Apps
    function getFormContext(): any {
        if ((window as any).parent && (window as any).parent.Xrm && (window as any).parent.Xrm.Page) {
            return (window as any).parent.Xrm.Page;
        }
        return null;
    }

    export function onLoad(): void {
        console.log("Form loaded - setting up BPF locking");
        const formContext = getFormContext();
        if (formContext) {
            // Apply locking initially
            applyStageBasedLocking(formContext);
            
            // Also apply on save (when stage might change)
            if (formContext.data && formContext.data.entity) {
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
        if (!formContext.data || !formContext.data.process) {
            console.log("No BPF process found");
            return;
        }

        const process = formContext.data.process;
        const activeStage = process.getActiveStage();
        
        if (activeStage) {
            const stageName = activeStage.getName();
            console.log("Current BPF stage:", stageName);
            lockFields(formContext, stageName);
        }
    }

    function lockFields(formContext: any, stageName: string) {
        console.log("Locking fields for stage:", stageName);
        
        // Define fields from earlier stages
        const reportFields = ["nwrg_name", "nwrg_description", "nwrg_reportedby", "nwrg_nctype", "nwrg_assignedmanager"];
        const investigateFields = ["nwrg_priority", "nwrg_status"];

        // Unlock everything first
        [...reportFields, ...investigateFields].forEach(field => {
            const control = formContext.getControl(field);
            if (control && control.setDisabled) {
                control.setDisabled(false);
            }
        });

        // Lock based on current stage
        switch (stageName) {
            case "Investigate":
                reportFields.forEach(field => {
                    const control = formContext.getControl(field);
                    if (control && control.setDisabled) {
                        control.setDisabled(true);
                    }
                });
                break;
            case "Resolve":
            case "Close":
                [...reportFields, ...investigateFields].forEach(field => {
                    const control = formContext.getControl(field);
                    if (control && control.setDisabled) {
                        control.setDisabled(true);
                    }
                });
                break;
        }
        
        console.log("Field locking applied for stage:", stageName);
    }
}