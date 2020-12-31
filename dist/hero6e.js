/**
 * This is your JavaScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your system, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your system
 */

// Import JavaScript modules
import { registerSettings } from './module/settings.js';
import { preloadTemplates } from './module/preloadTemplates.js';
import DataObjectsHero6e    from "../src/module/data/DataObjectsHero6e";
import Hero6eEquipmentSheet from "../src/module/items/Hero6eEquipmentSheet";

/* ------------------------------------ */
/* Initialize system					*/
/* ------------------------------------ */
Hooks.once('init', async function() {
	console.log("hero6e by TreChriron | initializing HERO 6th Edition System...");

	CONFIG.hero6eData = DataObjectsHero6e;
	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("hero6e", Hero6eEquipmentSheet, { makeDefault: true })

	// Assign custom classes and constants here
	
	// Register custom system settings
	registerSettings();
	
	// Preload Handlebars templates
	await preloadTemplates();

	// Register custom sheets (if any)
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
