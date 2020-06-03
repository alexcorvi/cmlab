import * as core from "@core";
import * as modules from "@modules";
import * as React from "react";
export const registerRegions = async () => {
	const dbs = await core.connect<modules.RegionSchema>(
		modules.regionsNamespace
	);

	modules.setRegionsStore(
		new modules.Regions({
			model: modules.Region,
			DBInstance: dbs.localDatabase,
		})
	);

	await modules.regions!.updateFromPouch();

	core.router.register({
		namespace: modules.regionsNamespace,
		regex: /^regions/,
		component: async () => {
			const RegionsPage = (await import("./components/page.regions"))
				.RegionsPage;
			return <RegionsPage />;
		},
		condition: () => !!modules.regions,
	});

	core.menu.items.push({
		icon: "Nav2DMapView",
		name: modules.regionsNamespace,
		key: modules.regionsNamespace,
		onClick: () => {
			core.router.go([modules.regionsNamespace]);
		},
		order: 1,
		url: "",
		condition: () => !!modules.regions,
	});
};
