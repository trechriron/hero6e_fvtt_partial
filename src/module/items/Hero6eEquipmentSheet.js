export class Hero6eEquipmentSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["hero6e",  "sheet", "item"],
            template: `systems/hero6e/templates/items/equipment-sheet.html`,
            width: 600,
            height: 600,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    getData () {
        const data = super.getData();
        data.dtypes = ["String", "Number", "Boolean"];
        return data;
    }
}