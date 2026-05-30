var ConditionalFormLogic;
(function (ConditionalFormLogic) {
    function onLoad(executionContext) {
        var formContext = executionContext.getFormContext();
        setupConditionalLogic(formContext);
    }
    ConditionalFormLogic.onLoad = onLoad;
    function onNCTypeChange(executionContext) {
        var formContext = executionContext.getFormContext();
        toggleFieldsBasedOnType(formContext);
    }
    ConditionalFormLogic.onNCTypeChange = onNCTypeChange;
    function setupConditionalLogic(formContext) {
        var ncType = formContext.getAttribute("nwrg_nctype");
        if (ncType) {
            ncType.addOnChange(onNCTypeChange);
        }
        toggleFieldsBasedOnType(formContext);
    }
    function toggleFieldsBasedOnType(formContext) {
        var ncType = formContext.getAttribute("nwrg_nctype");
        if (!ncType)
            return;
        var ncTypeValue = ncType.getValue();
        var safetyField = formContext.getControl("nwrg_safetyseverity");
        var environmentalField = formContext.getControl("nwrg_environmentalimpact");
        var qualityField = formContext.getControl("nwrg_qualitystandard");
        safetyField === null || safetyField === void 0 ? void 0 : safetyField.setVisible(false);
        environmentalField === null || environmentalField === void 0 ? void 0 : environmentalField.setVisible(false);
        qualityField === null || qualityField === void 0 ? void 0 : qualityField.setVisible(false);
        switch (ncTypeValue) {
            case 799180000:
                safetyField === null || safetyField === void 0 ? void 0 : safetyField.setVisible(true);
                break;
            case 799180001:
                qualityField === null || qualityField === void 0 ? void 0 : qualityField.setVisible(true);
                break;
            case 799180002:
                environmentalField === null || environmentalField === void 0 ? void 0 : environmentalField.setVisible(true);
                break;
            case 799180003:
                break;
        }
    }
})(ConditionalFormLogic || (ConditionalFormLogic = {}));
