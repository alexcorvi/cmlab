import * as core from "@core";
import * as modules from "@modules";
import * as React from "react";
export const registerDentists = async () => {
	const dbs = await core.connect<modules.DentistSchema>(
		modules.dentistsNamespace
	);

	modules.setDentistsStore(
		new modules.Dentists({
			model: modules.Dentist,
			DBInstance: dbs.localDatabase,
		})
	);

	await modules.dentists!.updateFromPouch();

	core.router.register({
		namespace: modules.dentistsNamespace,
		regex: /^dentists/,
		component: async () => {
			const DentistsPage = (await import("./components/page.dentists"))
				.DentistsPage;
			return <DentistsPage />;
		},
		condition: () => !!modules.dentists,
	});

	core.menu.items.push({
		icon: "Medical",
		name: modules.dentistsNamespace,
		key: modules.dentistsNamespace,
		onClick: () => {
			core.router.go([modules.dentistsNamespace]);
		},
		order: 3,
		url: "",
		condition: () => !!modules.dentists,
	});
};
