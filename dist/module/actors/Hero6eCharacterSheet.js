export class Hero6eCharacterSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["hero6e",  "sheet", "actor"],
            template: `systems/hero6e/templates/actors/hero-sheet.html`,
            width: 800 ,
            height: 800,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "info" }]
        });
    }

    getData() {
        const data = super.getData();
        data.dtypes = ["String", "Number", "Boolean"];
        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

    }

}