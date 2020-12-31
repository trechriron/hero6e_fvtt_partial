'use strict'
/**
 * Author: Trentin C Bergeron (TreChriron)
 * Content License: HERO SystemTM ® is DOJ, Inc.’s trademark for its roleplaying system.
 	HERO System Copyright © 1984, 1989, 2002, 2009 by DOJ, Inc. d/b/a Hero Games. All rights reserved.
 	Fantasy Hero © 2003, 2010 by DOJ, Inc. d/b/a Hero Games. All rights reserved.
 	Star Hero © 2003, 2011 by DOJ, Inc. d/b/a Hero Games. All rights reserved.
 	All DOJ trademarks and copyrights used with permission.
 	For further information about Hero Games and the HERO System, visit www.herogames.com.
 * Software License: HERO 6e system module is licensed from DOJ,Inc. to Trentin C Bergeron for the purpose
 * 	of cresting a system module for the Foundry VTT. This work cannot be reproduced without express permission of DOJ, inc.
 */

// Import JavaScript modules
import Hero6eDataObjects    from "../src/module/data/Hero6eDataObjects";
import { Hero6eItem }  from "../src/module/items/Hero6eItem";
import { Hero6eActor } from "../src/module/actors/Hero6eActor";
import Hero6eEquipmentSheet from "../src/module/items/Hero6eEquipmentSheet";
import Hero6eActorSheet from "../src/module/actors/Hero6eCharacterSheet";



/* ------------------------------------ */
/* Initialize system					*/
/* ------------------------------------ */
Hooks.once('init', async function() {
	console.log("hero6e by TreChriron | initializing HERO 6th Edition System...");

	CONFIG.hero6eData = Hero6eDataObjects;


	// Define custom Entity classes
	CONFIG.Actor.entityClass = Hero6eActor;
	CONFIG.Item.entityClass = Hero6eItem;

	// Assign custom classes and constants here
	
	// Register custom system settings
	registerSettings();
	
	// Preload Handlebars templates
	await preloadTemplates();

	// Register custom sheets (if any)
	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("hero6e", Hero6eEquipmentSheet, { makeDefault: true });
	Actor.unregisterSheet("core", ActorSheet);
	Actor.registerSheet("hero6e", Hero6eActorSheet, { makeDefault: true});
});

/* ------------------------------------ */
/* Setup system							*/
/* ------------------------------------ */
Hooks.once('setup', function() {
	// Do anything after initialization but before
	// ready
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function() {
	// Do anything once the system is ready
});

// Add any additional hooks if necessary
