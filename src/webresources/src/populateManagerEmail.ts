namespace NCR {
  export async function onFormLoad(executionContext: any) {
    const formContext = executionContext.getFormContext();
    // register change handler for lookup
    const attr = formContext.getAttribute("nwrg_assignedmanager");
    if (attr) {
      attr.addOnChange(() => handleLookupChange(formContext));
      // initial populate if existing value
      await handleLookupChange(formContext);
    }
  }

  async function handleLookupChange(formContext: any) {
    const lookupAttr = formContext.getAttribute("nwrg_assignedmanager");
    if (!lookupAttr) return;
    const value = lookupAttr.getValue();
    if (!value || value.length === 0) {
      // clear email if no manager selected
      formContext.getAttribute("nwrg_assignedmanageremail")?.setValue(null);
      return;
    }
    // lookup returns array with single item
    const id = value[0].id; // GUID
    const entityType = value[0].entityType; // should be systemuser
    try {
      // Use Web API to get the user record — request internalemailaddress
      const result = await Xrm.WebApi.retrieveRecord(entityType, id.replace('{','').replace('}',''), "?$select=internalemailaddress,fullname");
      const email = result.internalemailaddress || "";
      formContext.getAttribute("nwrg_assignedmanageremail")?.setValue(email);
    } catch (err) {
      // fail silently but log for debugging
      console.error("Failed to retrieve manager email", err);
    }
  }
}
