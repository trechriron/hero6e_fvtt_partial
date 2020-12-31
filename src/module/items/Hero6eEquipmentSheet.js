'use strict'

export default class Hero6eEquipmentSheet extends ItemSheet {
    get template() {
      return `systems/hero6e/templates/items/${this.item.data.type}-sheet.html`;
    }

    getData () {
       const data = super.getData();

       data.hero6eData = CONFIG.hero6eData;

       return data;
    }
}