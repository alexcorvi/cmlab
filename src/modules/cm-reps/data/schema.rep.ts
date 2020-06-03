import { Schema } from "pouchx";

export interface RepSchema extends Schema {
	_id: string;
	name: string;
	phone: string;
	regionsIDs: string[];
	fixedSalary: number;
	commissionPerCase: number;
	bonuses: Array<{ date: number; amount: number }>;
	notes: string;
}
