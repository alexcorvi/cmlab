import * as core from "@core";
import * as modules from "@modules";
import * as React from "react";
export const registerReps = async () => {
	const dbs = await core.connect<modules.RepSchema>(modules.repsNamespace);

	modules.setRepsStore(
		new modules.Reps({
			model: modules.Rep,
			DBInstance: dbs.localDatabase,
		})
	);

	await modules.reps!.updateFromPouch();

	core.router.register({
		namespace: modules.repsNamespace,
		regex: /^representatives/,
		component: async () => {
			const RepsPage = (await import("./components/page.reps")).RepsPage;
			return <RepsPage />;
		},
		condition: () => !!modules.reps,
	});

	core.menu.items.push({
		icon: "Telemarketer",
		name: modules.repsNamespace,
		key: modules.repsNamespace,
		onClick: () => {
			core.router.go([modules.repsNamespace]);
		},
		order: 2,
		url: "",
		condition: () => !!modules.reps,
	});
};
