import { dbAction, modals, router } from "@core";
import { Region, RegionSchema } from "@modules";
import * as modules from "@modules";
import { observable } from "mobx";
import { Store } from "pouchx";

export class Regions extends Store<RegionSchema, Region> {
	@observable selectedID: string = router.currentLocation.split("/")[1] || "";
	deleteModal(id: string) {
		modals.newModal({
			text: `Are you sure you want to delete the region?`,
			onConfirm: () => this.delete(id),
			showCancelButton: true,
			showConfirmButton: true,
			input: false,
			id: Math.random()
		});
	}

	async afterChange() {
		// resync on change
		dbAction("resync", modules.regionsNamespace);
	}
}

export let regions: Regions | null = null;
export function setRegionsStore(store: Regions) {
	regions = store;
}
