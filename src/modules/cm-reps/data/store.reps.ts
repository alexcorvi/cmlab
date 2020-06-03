import { dbAction, modals, router } from "@core";
import { Rep, RepSchema } from "@modules";
import * as modules from "@modules";
import { observable } from "mobx";
import { Store } from "pouchx";

export class Reps extends Store<RepSchema, Rep> {
	@observable selectedID: string = router.currentLocation.split("/")[1] || "";
	deleteModal(id: string) {
		modals.newModal({
			text: `Are you sure you want to delete the rep?`,
			onConfirm: () => this.delete(id),
			showCancelButton: true,
			showConfirmButton: true,
			input: false,
			id: Math.random()
		});
	}

	async afterChange() {
		// resync on change
		dbAction("resync", modules.repsNamespace);
	}
}

export let reps: Reps | null = null;
export function setRepsStore(store: Reps) {
	reps = store;
}
