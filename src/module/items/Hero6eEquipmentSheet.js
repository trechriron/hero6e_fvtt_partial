'use strict'

export class Hero6eEquipmentSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: [],
            template: `systems/hero6e/templates/items/${this.item.data.type}-sheet.html`,
            width: 600,
            height: 600,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }



    getData () {
       const data = super.getData();
       return data;
    }
}