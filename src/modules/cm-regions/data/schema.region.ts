import { Schema } from "pouchx";

export interface RegionSchema extends Schema {
	_id: string;
	name: string;
	notes: string;
	population: number;
	isOpen: boolean;
}
