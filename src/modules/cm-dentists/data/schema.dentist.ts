import { Schema } from "pouchx";

export interface DentistSchema extends Schema {
	_id: string;
	name: string;
	phone: string;
	regionID: string;
	specialty: string;
	fullAddress: string;
	isEnrolled: boolean;
	isVisited: boolean;
	notes: string;
}
