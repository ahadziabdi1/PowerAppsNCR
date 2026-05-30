"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConditionalFormLogic;
(function (ConditionalFormLogic) {
    function onLoad(executionContext) {
        const formContext = executionContext.getFormContext();
        setupConditionalLogic(formContext);
    }
    ConditionalFormLogic.onLoad = onLoad;
    function onNCTypeChange(executionContext) {
        const formContext = executionContext.getFormContext();
        toggleFieldsBasedOnType(formContext);
    }
    ConditionalFormLogic.onNCTypeChange = onNCTypeChange;
    function setupConditionalLogic(formContext) {
        const ncType = formContext.getAttribute("nwrg_nctype");
        if (ncType) {
            ncType.addOnChange(onNCTypeChange);
        }
        toggleFieldsBasedOnType(formContext); // Run on load
    }
    function toggleFieldsBasedOnType(formContext) {
        const ncType = formContext.getAttribute("nwrg_nctype");
        if (!ncType)
            return;
        const ncTypeValue = ncType.getValue();
        // Get form controls (cast to any to avoid missing type issues)
        const safetyField = formContext.getControl("nwrg_safetyseverity");
        const environmentalField = formContext.getControl("nwrg_environmentalimpact");
        const qualityField = formContext.getControl("nwrg_qualitystandard");
        // Hide all first
        safetyField?.setVisible(false);
        environmentalField?.setVisible(false);
        qualityField?.setVisible(false);
        switch (ncTypeValue) {
            case 799180000: // Safety
                safetyField?.setVisible(true);
                break;
            case 799180001: // Quality
                qualityField?.setVisible(true);
                break;
            case 799180002: // Environmental 
                environmentalField?.setVisible(true);
                break;
            case 799180003: // Design
                // nothing to show
                break;
        }
    }
})(ConditionalFormLogic || (ConditionalFormLogic = {}));
//# sourceMappingURL=conditionalFormLogic.js.map