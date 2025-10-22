var AutoStatusUpdate;
(function (AutoStatusUpdate) {
    function onStatusChange(executionContext) {
        var _a;
        var formContext = executionContext.getFormContext();
        var statusAttr = formContext.getAttribute("nwrg_status");
        if (!statusAttr)
            return;
        var statusVal = statusAttr.getText();
        if (statusVal === "Resolved") {
            (_a = formContext.getAttribute("nwrg_status")) === null || _a === void 0 ? void 0 : _a.setValue(799180004);
            formContext.data.entity.save();
        }
    }
    AutoStatusUpdate.onStatusChange = onStatusChange;
})(AutoStatusUpdate || (AutoStatusUpdate = {}));
