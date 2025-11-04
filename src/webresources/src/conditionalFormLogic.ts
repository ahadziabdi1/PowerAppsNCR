namespace ConditionalFormLogic {

  export function onLoad(executionContext: any): void {
    const formContext = executionContext.getFormContext();
    setupConditionalLogic(formContext);
  }

  export function onNCTypeChange(executionContext: any): void {
    const formContext = executionContext.getFormContext();
    toggleFieldsBasedOnType(formContext);
  }

  function setupConditionalLogic(formContext: any): void {
    const ncType = formContext.getAttribute("nwrg_nctype");
    if (ncType) {
      ncType.addOnChange(onNCTypeChange);
    }
    toggleFieldsBasedOnType(formContext); // Run on load
  }

  function toggleFieldsBasedOnType(formContext: any): void {
    const ncType = formContext.getAttribute("nwrg_nctype");
    if (!ncType) return;

    const ncTypeValue = ncType.getValue();

    // Get form controls (cast to any to avoid missing type issues)
    const safetyField: any = formContext.getControl("nwrg_safetyseverity");
    const environmentalField: any = formContext.getControl("nwrg_environmentalimpact");
    const qualityField: any = formContext.getControl("nwrg_qualitystandard");

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
}
