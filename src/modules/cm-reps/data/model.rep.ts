import { cases, regions, RepSchema } from "@modules";
import { computed, observable } from "mobx";
import { Model, observeModel } from "pouchx";

@observeModel
export class Rep extends Model<RepSchema> implements RepSchema {
	@observable name: string = "Representative name";

	@observable phone: string = "";
	@observable regionsIDs: string[] = [];
	@observable fixedSalary: number = 0;
	@observable commissionPerCase: number = 0;
	@observable bonuses: Array<{ date: number; amount: number }> = [];

	@observable notes = "";

	@computed get regions() {
		return regions!.docs.filter((x) => this.regionsIDs.indexOf(x._id) > -1);
	}

	@computed get bonusesThisMonth() {
		return this.bonuses
			.filter((bonus) => {
				const bonusDate = new Date(bonus.date);
				const currentDate = new Date();
				if (
					bonusDate.getFullYear() === currentDate.getFullYear() &&
					bonusDate.getMonth() === currentDate.getMonth()
				) {
					return true;
				} else {
					return false;
				}
			})
			.reduce((total, current) => {
				total = total + current.amount;
				return total;
			}, 0);
	}

	@computed get totalSales() {
		return cases!.docs.filter(
			(receivedCase) => receivedCase.repID === this._id
		);
	}

	@computed get salesThisMonth() {
		return cases!.docs
			.filter((receivedCase) => receivedCase.repID === this._id)
			.filter((receivedCase) => {
				const caseDate = new Date(receivedCase.dateReceived);
				const currentDate = new Date();
				if (
					caseDate.getFullYear() === currentDate.getFullYear() &&
					caseDate.getMonth() === currentDate.getMonth()
				) {
					return true;
				} else {
					return false;
				}
			});
	}

	@computed get expectedPaymentsFromThisMonth() {
		return this.salesThisMonth.reduce((total, current) => {
			total = total + current.treatmentPrice;
			return total;
		}, 0);
	}

	@computed get totalExpectedPayments() {
		return this.totalSales.reduce((total, current) => {
			total = total + current.treatmentPrice;
			return total;
		}, 0);
	}

	@computed get totalPayments() {
		const payments = this.totalSales.map((sale) => {
			return sale.paidInstallments.reduce((total, current) => {
				total = current.amount + total;
				return total;
			}, 0);
		});
		return payments.reduce((total, current) => {
			total = total + current;
			return total;
		}, 0);
	}

	@computed
	get searchableString() {
		return `
			${this.name} ${this.regions.map((x) => x.name).join(" ")}
		`.toLowerCase();
	}

	toJSON(): RepSchema {
		return {
			_id: this._id,
			name: this.name,
			phone: this.phone,
			regionsIDs: this.regionsIDs,
			fixedSalary: this.fixedSalary,
			commissionPerCase: this.commissionPerCase,
			bonuses: this.bonuses,
			notes: this.notes,
		};
	}

	fromJSON(json: Partial<RepSchema>) {
		this.name = json.name ? json.name : this.name;
		this._id = json._id ? json._id : this._id;
		this.phone = json.phone ? json.phone : this.phone;
		this.regionsIDs = json.regionsIDs ? json.regionsIDs : this.regionsIDs;
		this.fixedSalary = json.fixedSalary
			? json.fixedSalary
			: this.fixedSalary;
		this.commissionPerCase = json.commissionPerCase
			? json.commissionPerCase
			: this.commissionPerCase;
		this.bonuses = json.bonuses ? json.bonuses : this.bonuses;
		this.notes = json.notes ? json.notes : this.notes;
		return this;
	}
}
