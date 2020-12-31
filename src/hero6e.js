'use strict'

import DataObjectsHero6e    from "./module/data/DataObjectsHero6e";
import Hero6eEquipmentSheet from "./module/items/Hero6eEquipmentSheet.js";

Hooks.once("init", () => {
    console.log("hero6e by TreChriron | initializing HERO 6th Edition System...");

    CONFIG.hero6eData = DataObjectsHero6e;
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("hero6e", Hero6eEquipmentSheet, { makeDefault: true })
});