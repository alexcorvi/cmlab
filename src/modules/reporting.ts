import { Case, cases } from "@modules";
import * as utils from "@utils";
import { computed, observable } from "mobx";

function comparableDate(date: Date) {
	return date.toJSON().split("T")[0];
}

export class Report {
	@observable startingDate: number = new Date().getTime();
	@observable endingDate: number = new Date().getTime();

	private casesByDate({
		rep,
		region,
		doctor,
	}: {
		rep?: string;
		region?: string;
		doctor?: string;
	}) {
		const results: {
			[key: string]: Case[];
		} = {};

		for (let index = 0; index < cases!.docs.length; index++) {
			const singleCase = cases!.docs[index];
			if (
				singleCase.dateReceived <= this.startingDate &&
				singleCase.dateReceived > this.endingDate
			) {
				continue;
			}
			if (doctor && (singleCase.dentist || { _id: "" })._id !== doctor) {
				continue;
			}
			if (rep && singleCase.repID !== rep) {
				continue;
			}
			if (region && (singleCase.region || { _id: "" })._id !== region) {
				continue;
			}
			const key = comparableDate(new Date(singleCase.dateReceived));
			if (!results[key]) {
				results[key] = [singleCase];
			} else {
				results[key].push(singleCase);
			}
		}
		return results;
	}

	private paymentsByDate({
		rep,
		region,
		doctor,
	}: {
		rep?: string;
		region?: string;
		doctor?: string;
	}) {
		const result: {
			[key: string]: number;
		} = {};

		for (let index = 0; index < cases!.docs.length; index++) {
			const singleCase = cases!.docs[index];
			if (doctor && (singleCase.dentist || { _id: "" })._id !== doctor) {
				continue;
			}
			if (rep && singleCase.repID !== rep) {
				continue;
			}
			if (region && (singleCase.region || { _id: "" })._id !== region) {
				continue;
			}
			const installments = singleCase.paidInstallments.filter(
				(installment) =>
					installment.date >= this.startingDate &&
					installment.date <= this.endingDate
			);
			for (let index2 = 0; index2 < installments.length; index2++) {
				const singleInstallment = installments[index2];
				const key = comparableDate(new Date(singleInstallment.date));
				if (!result[key]) {
					result[key] = singleInstallment.amount;
				} else {
					result[key] = result[key] + singleInstallment.amount;
				}
			}
		}
		return result;
	}

	numberOfCasesByDate({
		rep,
		region,
		doctor,
	}: {
		rep?: string;
		region?: string;
		doctor?: string;
	}) {
		const result: {
			date: string;
			number: number;
		}[] = [];
		const casesByDate = this.casesByDate({ rep, region, doctor });
		let workingDate = this.startingDate;
		while (workingDate <= this.endingDate) {
			const dateKey = comparableDate(new Date(workingDate));
			result.push({
				date: dateKey,
				number: (casesByDate[dateKey] || { length: 0 }).length,
			});
			workingDate = workingDate + utils.day;
		}
		return result;
	}
	amountOfPaymentsByDate({
		rep,
		region,
		doctor,
	}: {
		rep?: string;
		region?: string;
		doctor?: string;
	}) {
		const result: {
			date: string;
			amount: number;
		}[] = [];
		const paymentsByDate = this.paymentsByDate({ rep, region, doctor });
		let workingDate = this.startingDate;
		while (workingDate <= this.endingDate) {
			const dateKey = comparableDate(new Date(workingDate));
			result.push({
				date: dateKey,
				amount: paymentsByDate[dateKey] || 0,
			});
			workingDate = workingDate + utils.day;
		}
		return result;
	}

	numberOfCasesByRegion() {
		const result: {
			[key: string]: number;
		} = {};
		const casesByDate = this.casesByDate({});
		Object.keys(casesByDate).forEach((date) => {
			casesByDate[date].forEach((singleCase) => {
				const key = `${(singleCase.region || { name: "" }).name}__${
					(singleCase.region || { _id: "" })._id
				}`;
				if (!result[key]) {
					result[key] = 1;
				} else {
					result[key] = result[key] + 1;
				}
			});
		});

		return result;
	}

	numberOfCasesByDentist() {
		const result: {
			[key: string]: number;
		} = {};
		const casesByDate = this.casesByDate({});
		Object.keys(casesByDate).forEach((date) => {
			casesByDate[date].forEach((singleCase) => {
				const key = `${(singleCase.dentist || { name: "" }).name}__${
					(singleCase.dentist || { _id: "" })._id
				}`;
				if (!result[key]) {
					result[key] = 1;
				} else {
					result[key] = result[key] + 1;
				}
			});
		});

		return result;
	}

	numberOfCasesByRep() {
		const result: {
			[key: string]: number;
		} = {};
		const casesByDate = this.casesByDate({});
		Object.keys(casesByDate).forEach((date) => {
			casesByDate[date].forEach((singleCase) => {
				const key = `${(singleCase.rep || { name: "" }).name}__${
					(singleCase.rep || { _id: "" })._id
				}`;
				if (!result[key]) {
					result[key] = 1;
				} else {
					result[key] = result[key] + 1;
				}
			});
		});

		return result;
	}

	constructor({
		startingDate,
		endingDate,
	}: {
		startingDate: number;
		endingDate: number;
	}) {
		this.startingDate = startingDate;
		this.endingDate = endingDate;
	}
}

const report = new Report({
	startingDate: new Date().getTime() - 200 * utils.day,
	endingDate: new Date().getTime(),
});
