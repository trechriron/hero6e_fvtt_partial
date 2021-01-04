//import DataObjectsHero6e    from "./module/data/Hero6eDataObjects";
import { Hero6eActor }          from "./module/actors/Hero6eActor.js";
import { Hero6eCharacterSheet } from "./module/actors/Hero6eCharacterSheet.js";
import { Hero6eItem }           from "./module/items/Hero6eItem.js";
import { Hero6eEquipmentSheet } from "./module/items/Hero6eEquipmentSheet.js";

Hooks.once("init", () => {
    console.log("hero6e by TreChriron | initializing HERO 6th Edition System...");

    game.hero6e = {
        Hero6eActor,
        Hero6eItem
    }
    // import initiative thing here

    CONFIG.Actor.entityClass = Hero6eActor;
    CONFIG.Item.entityClass = Hero6eItem;

    Items.unregisterSheet("core", ItemSheet);
    Actors.unregisterSheet("core", ActorSheet);
    Items.registerSheet("hero6e", Hero6eEquipmentSheet, { makeDefault: true })
    Actors.registerSheet("hero6e", Hero6eCharacterSheet, { makeDefault: true })
});