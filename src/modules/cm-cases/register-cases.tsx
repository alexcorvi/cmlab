import * as core from "@core";
import * as modules from "@modules";
import * as React from "react";
export const registerCases = async () => {
	const dbs = await core.connect<modules.CaseSchema>(modules.casesNamespace);

	modules.setCasesStore(
		new modules.Cases({
			model: modules.Case,
			DBInstance: dbs.localDatabase,
		})
	);

	await modules.cases!.updateFromPouch();

	core.router.register({
		namespace: modules.casesNamespace,
		regex: /^cases/,
		component: async () => {
			const CasesPage = (await import("./components/page.cases"))
				.CasesPage;
			return <CasesPage />;
		},
		condition: () => !!modules.cases,
	});

	core.menu.items.push({
		icon: "Suitcase",
		name: modules.casesNamespace,
		key: modules.casesNamespace,
		onClick: () => {
			core.router.go([modules.casesNamespace]);
		},
		order: 4,
		url: "",
		condition: () => !!modules.cases,
	});
};
