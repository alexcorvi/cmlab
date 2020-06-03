import { dbAction, modals, router } from "@core";
import { Dentist, DentistSchema } from "@modules";
import * as modules from "@modules";
import { observable } from "mobx";
import { Store } from "pouchx";

export class Dentists extends Store<DentistSchema, Dentist> {
	@observable selectedID: string = router.currentLocation.split("/")[1] || "";
	deleteModal(id: string) {
		modals.newModal({
			text: `Are you sure you want to delete this dentist?`,
			onConfirm: () => this.delete(id),
			showCancelButton: true,
			showConfirmButton: true,
			input: false,
			id: Math.random()
		});
	}

	async afterChange() {
		// resync on change
		dbAction("resync", modules.dentistsNamespace);
	}
}

export let dentists: Dentists | null = null;
export function setDentistsStore(store: Dentists) {
	dentists = store;
}
