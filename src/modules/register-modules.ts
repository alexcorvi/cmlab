import { registerStats } from "./cm-stats/register-statistics";
import { dbAction } from "@core";
import * as core from "@core";
import * as modules from "@modules";
import * as utils from "@utils";

const register = [
	modules.registerSettings,
	modules.registerRegions,
	modules.registerReps,
	modules.registerDentists,
	modules.registerCases,
	registerStats,
];

export async function registerModules() {
	await Promise.all(
		register.map((singleModule, i) => {
			console.log(i);
			return singleModule();
		})
	);
	core.status.loadingIndicatorText = "Downloading data";
}
