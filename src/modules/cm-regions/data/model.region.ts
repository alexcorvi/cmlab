import { RegionSchema } from "@modules";
import { computed, observable } from "mobx";
import { Model, observeModel } from "pouchx";

@observeModel
export class Region extends Model<RegionSchema> implements RegionSchema {
	@observable name: string = "Region name";

	@observable population: number = 1;

	@observable isOpen: boolean = false;

	@observable notes: string = "";

	@computed
	get searchableString() {
		return `
			${this.name} ${this.population} ${this.isOpen ? "open" : "prospected"}
		`.toLowerCase();
	}

	toJSON(): RegionSchema {
		return {
			_id: this._id,
			name: this.name,
			population: this.population,
			isOpen: this.isOpen,
			notes: this.notes,
		};
	}

	fromJSON(json: Partial<RegionSchema>) {
		this.name = json.name ? json.name : this.name;
		this._id = json._id ? json._id : this._id;
		this.population = json.population ? json.population : this.population;
		this.isOpen = json.isOpen ? json.isOpen : this.isOpen;
		this.notes = json.notes ? json.notes : this.notes;
		return this;
	}
}
