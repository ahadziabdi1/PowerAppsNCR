namespace AutoStatusUpdate {
  export function onStatusChange(executionContext: any) {
    const formContext = executionContext.getFormContext();
    const statusAttr = formContext.getAttribute("nwrg_status");

    if (!statusAttr) return;
    const statusVal = statusAttr.getText(); // get selected label

    if (statusVal === "Resolved") {
      // Automatically change to Closed
      formContext.getAttribute("nwrg_status")?.setValue(799180004); // numeric value for Closed
      formContext.data.entity.save(); // save record
    }
  }
}