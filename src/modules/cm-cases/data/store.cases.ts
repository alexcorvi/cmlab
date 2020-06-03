import { dbAction, modals, router } from "@core";
import { Case, CaseSchema } from "@modules";
import * as modules from "@modules";
import { observable } from "mobx";
import { Store } from "pouchx";

export class Cases extends Store<CaseSchema, Case> {
	@observable selectedID: string = router.currentLocation.split("/")[1] || "";
	deleteModal(id: string) {
		modals.newModal({
			text: `Are you sure you want to delete the case?`,
			onConfirm: () => this.delete(id),
			showCancelButton: true,
			showConfirmButton: true,
			input: false,
			id: Math.random()
		});
	}

	async afterChange() {
		// resync on change
		dbAction("resync", modules.casesNamespace);
	}
}

export let cases: Cases | null = null;
export function setCasesStore(store: Cases) {
	cases = store;
}
