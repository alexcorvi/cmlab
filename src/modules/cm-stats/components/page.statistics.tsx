import { PaymentsByDate } from "./chart.cm.payments";
import { RegionsCasesPerMillion } from "./chart.cm.region-cases";
import { RegionsPaymentsPerMillion } from "./chart.cm.region-payments";
import * as core from "@core";
import * as modules from "@modules";
import * as utils from "@utils";
import { computed } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";
import * as loadable from "react-loadable";
import {
	firstDayOfTheWeekDayPicker,
	formatDate,
	round,
	dateNames,
} from "@utils";
import {
	DatePicker,
	Dropdown,
	Label,
	Shimmer,
	DateRangeType,
	TextField,
} from "office-ui-fabric-react";
import {
	Col,
	DataTableComponent,
	ProfileComponent,
	ProfileSquaredComponent,
	Row,
	SectionComponent,
	TagComponent,
	tagType,
	TagInputComponent,
} from "@common-components";

@observer
export class StatisticsPage extends React.Component {
	render() {
		return (
			<div className="sc-pg">
				<DataTableComponent
					maxItemsOnLoad={30}
					heads={["Date", "Amount", "Source", "Case"]}
					rows={modules.statistics.selectedPayments.map((p) => ({
						id: p.id,
						searchableString: "",
						actions: [
							{
								key: "view",
								title: "Go to case",
								icon: "zoom",
								onClick: () => {
									core.router.go([
										"cases",
										`id:${p.id.split("__")[1]}`,
										"tab:details",
									]);
								},
							},
						],
						cells: [
							{
								dataValue: p.date,
								component: (
									<i>
										{formatDate(
											p.date,
											modules.setting!.getSetting(
												"date_format"
											)
										)}
									</i>
								),
							},
							{
								dataValue: p.labPart,
								component: (
									<div>
										<i className="sub-text green">
											Total:{" "}
											{modules.setting!.getSetting(
												"currencySymbol"
											)}
											{utils.round(p.amount)}
										</i>
										<i className="sub-text red">
											Rep: {"%" + p.repCommission} ={" "}
											{modules.setting!.getSetting(
												"currencySymbol"
											) + utils.round(p.repPart)}
										</i>
										<i className="sub-text blue">
											Lab:{" "}
											{modules.setting!.getSetting(
												"currencySymbol"
											) + utils.round(p.labPart)}
										</i>
									</div>
								),
							},
							{
								dataValue: p.rep.name,
								component: (
									<div>
										<i className="sub-text gray">
											Region: {p.region.name}
										</i>
										<i className="sub-text yellow">
											Rep: {p.rep.name}
										</i>
										<i className="sub-text brown">
											Dentist: {p.dentist.name}
										</i>
									</div>
								),
							},
							{
								dataValue: p.forCase.caseType,
								component: (
									<div>
										<i className="sub-text orange">
											Patient: {p.forCase.patient}
										</i>
										<i className="sub-text violet">
											Case: {p.forCase.caseType}
										</i>
										<i className="sub-text">
											Units: {p.forCase.units}
										</i>
									</div>
								),
							},
						],
					}))}
					hideSearch
					commands={[
						{
							key: "1",
							onRender: () => {
								return (
									<DatePicker
										calendarProps={{
											dateRangeType: DateRangeType.Month,
											strings: {
												months: dateNames.months(),
												shortMonths: dateNames.monthsShort(),
												days: [
													"Sunday",
													"Monday",
													"Tuesday",
													"Wednesday",
													"Thursday",
													"Friday",
													"Saturday",
												],
												shortDays: [
													"Su",
													"Mo",
													"Tu",
													"We",
													"Th",
													"Fr",
													"Sa",
												],
												goToToday: "Go to today",
											},
											autoNavigateOnSelection: true,
										}}
										formatDate={(date) => {
											return date
												? date
														.toLocaleString()
														.split(",")[0]
														.replace(
															/\/\d+\//g,
															"/"
														)
												: "";
										}}
										value={
											new Date(
												modules.statistics.selectedDate
											)
										}
										onSelectDate={(date) => {
											modules.statistics.selectedDate = new Date(
												new Date(
													date || new Date()
												).setHours(0, 0, 0, 0)
											);
										}}
									></DatePicker>
								);
							},
						},
						{
							key: "2",
							onRender: () => {
								return (
									<Dropdown
										options={[
											{ key: "", text: "All reps" },
										].concat(
											modules.reps!.docs.map((rep) => ({
												key: rep._id,
												text: rep.name,
											}))
										)}
										selectedKey={
											modules.statistics.specificRep
										}
										onChange={(ev, val) => {
											modules.statistics.specificRep = val!.key.toString();
										}}
									></Dropdown>
								);
							},
						},
						{
							key: "3",
							onRender: () => {
								return (
									<Dropdown
										options={[
											{ key: "", text: "All dentists" },
										].concat(
											modules.dentists!.docs.map(
												(el) => ({
													key: el._id,
													text: el.name,
												})
											)
										)}
										selectedKey={
											modules.statistics.specificDentist
										}
										onChange={(ev, val) => {
											modules.statistics.specificDentist = val!.key.toString();
										}}
									></Dropdown>
								);
							},
						},
						{
							key: "4",
							onRender: () => {
								return (
									<Dropdown
										options={[
											{ key: "", text: "All regions" },
										].concat(
											modules.regions!.docs.map((el) => ({
												key: el._id,
												text: el.name,
											}))
										)}
										selectedKey={
											modules.statistics.specificRegion
										}
										onChange={(ev, val) => {
											modules.statistics.specificRegion = val!.key.toString();
										}}
									></Dropdown>
								);
							},
						},
					]}
					farItems={[
						{
							key: "5",
							onRender: () => {
								return (
									<div className="stats-filter">
										<span>Case:</span>
										<TagInputComponent
											options={Array.from(
												new Set(
													modules
														.cases!.docs.sort(
															(a, b) =>
																a.caseType.localeCompare(
																	b.caseType
																)
														)
														.map((x) => x.caseType)
												)
											).map((s) => {
												return {
													key: s,
													text: s,
												};
											})}
											loose
											value={
												modules.statistics.specificTerm
													? [
															{
																key:
																	modules
																		.statistics
																		.specificTerm,
																text:
																	modules
																		.statistics
																		.specificTerm,
															},
													  ]
													: []
											}
											onChange={(newKeys) => {
												modules.statistics.specificTerm =
													newKeys[0] || "";
											}}
											suggestionsHeaderText={"Case type"}
											noResultsFoundText={
												"No case types found"
											}
											maxItems={1}
										/>
									</div>
								);
							},
						},
					]}
				></DataTableComponent>
				<div className="totals">
					<table className="ms-table">
						<thead>
							<tr>
								<th>
									Total Payments:{" "}
									{modules.setting!.getSetting(
										"currencySymbol"
									)}
									{modules.statistics.selectedPayments.reduce(
										(total, current) => {
											total = total + current.amount;
											return total;
										},
										0
									)}
								</th>
								<th>
									Total Rep. Commission:{" "}
									{modules.setting!.getSetting(
										"currencySymbol"
									)}
									{modules.statistics.selectedPayments.reduce(
										(total, current) => {
											total = total + current.repPart;
											return total;
										},
										0
									)}
								</th>
								<th>
									Total Lab. Commission:{" "}
									{modules.setting!.getSetting(
										"currencySymbol"
									)}
									{modules.statistics.selectedPayments.reduce(
										(total, current) => {
											total = total + current.labPart;
											return total;
										},
										0
									)}
								</th>
							</tr>
						</thead>
					</table>
				</div>
				<div className="charts container-fluid">
					<div className="row">
						<div className={"chart-wrapper col-xs-12"}>
							<SectionComponent
								title={"Cases Received This Month"}
							>
								<table className="ms-table">
									<thead>
										<tr>
											<th>Date received</th>
											<th>Financial</th>
											<th>Source</th>
											<th>Case</th>
										</tr>
									</thead>
									<tbody>
										{modules.statistics.acceptedCases.map(
											(sCase) => {
												return (
													<tr key={sCase._id}>
														<td>
															{formatDate(
																sCase.dateSent,
																modules.setting!.getSetting(
																	"date_format"
																)
															)}
														</td>
														<td>
															<div>
																<i className="sub-text green">
																	Price:{" "}
																	{modules.setting!.getSetting(
																		"currencySymbol"
																	)}
																	{utils.round(
																		sCase.treatmentPrice
																	)}
																</i>
																<i className="sub-text red">
																	Paid:{" "}
																	{modules.setting!.getSetting(
																		"currencySymbol"
																	)}
																	{utils.round(
																		sCase.totalPayments
																	)}
																</i>
																<i className="sub-text blue">
																	Outstanding:{" "}
																	{modules.setting!.getSetting(
																		"currencySymbol"
																	)}
																	{utils.round(
																		sCase.outstandingPayments
																	)}
																</i>
															</div>
														</td>
														<td>
															<div>
																<i className="sub-text gray">
																	Region:{" "}
																	{
																		(
																			sCase.region || {
																				name:
																					"",
																			}
																		).name
																	}
																</i>
																<i className="sub-text yellow">
																	Rep:{" "}
																	{
																		(
																			sCase.rep || {
																				name:
																					"",
																			}
																		).name
																	}
																</i>
																<i className="sub-text brown">
																	Dentist:{" "}
																	{
																		(
																			sCase.dentist || {
																				name:
																					"",
																			}
																		).name
																	}
																</i>
															</div>
														</td>
														<td>
															<div>
																<i className="sub-text orange">
																	Patient:{" "}
																	{
																		sCase.patientName
																	}
																</i>
																<i className="sub-text violet">
																	Case:{" "}
																	{
																		sCase.caseType
																	}
																</i>
																<i className="sub-text">
																	Units:{" "}
																	{
																		sCase.unitsNumber
																	}
																</i>
															</div>
														</td>
													</tr>
												);
											}
										)}
									</tbody>
								</table>
								<div className="totals">
									<table className="ms-table">
										<thead>
											<tr>
												<th>
													Total Cases:{" "}
													{
														modules.statistics
															.acceptedCases
															.length
													}
												</th>
												<th>
													Total Prices:{" "}
													{modules.setting!.getSetting(
														"currencySymbol"
													)}
													{modules.statistics.acceptedCases.reduce(
														(total, current) => {
															total =
																total +
																current.treatmentPrice;
															return total;
														},
														0
													)}
												</th>
												<th>
													Total Paid:{" "}
													{modules.setting!.getSetting(
														"currencySymbol"
													)}
													{modules.statistics.acceptedCases.reduce(
														(total, current) => {
															total =
																total +
																current.totalPayments;
															return total;
														},
														0
													)}
												</th>
												<th>
													Total Outstanding:{" "}
													{modules.setting!.getSetting(
														"currencySymbol"
													)}
													{modules.statistics.acceptedCases.reduce(
														(total, current) => {
															total =
																total +
																current.outstandingPayments;
															return total;
														},
														0
													)}
												</th>
											</tr>
										</thead>
									</table>
								</div>
							</SectionComponent>
						</div>

						<div className={"chart-wrapper col-xs-12"}>
							<SectionComponent title={"Salaries Table"}>
								<table className="ms-table">
									<thead>
										<tr>
											<th>Representative</th>
											<th>Fixed salary</th>
											<th>Commissions</th>
											<th>Bonuses</th>
											<th>Total</th>
										</tr>
									</thead>
									<tbody>
										{modules.statistics.repSalaries.map(
											(row) => {
												return (
													<tr key={row.rep._id}>
														<td>{row.rep.name}</td>
														<td>
															{modules.setting!.getSetting(
																"currencySymbol"
															)}
															{utils.round(
																row.rep
																	.fixedSalary
															)}
														</td>
														<td>
															{modules.setting!.getSetting(
																"currencySymbol"
															)}
															{utils.round(
																row.totalCommissions
															)}
														</td>
														<td>
															{modules.setting!.getSetting(
																"currencySymbol"
															)}
															{utils.round(
																row.totalBonuses
															)}
														</td>
														<td>
															{modules.setting!.getSetting(
																"currencySymbol"
															)}
															{utils.round(
																row.totalDeserved
															)}
														</td>
													</tr>
												);
											}
										)}
									</tbody>
								</table>
								<div className="totals">
									<table className="ms-table">
										<thead>
											<tr>
												<th>
													Total reps:{" "}
													{
														modules.statistics
															.repSalaries.length
													}
												</th>
												<th>
													Total fixed salaries:{" "}
													{modules.setting!.getSetting(
														"currencySymbol"
													)}
													{modules.statistics.repSalaries.reduce(
														(total, current) => {
															total =
																total +
																current.fixedSalary;
															return total;
														},
														0
													)}
												</th>
												<th>
													Total Commissions:{" "}
													{modules.setting!.getSetting(
														"currencySymbol"
													)}
													{modules.statistics.repSalaries.reduce(
														(total, current) => {
															total =
																total +
																current.totalCommissions;
															return total;
														},
														0
													)}
												</th>
												<th>
													Total Bonuses:{" "}
													{modules.setting!.getSetting(
														"currencySymbol"
													)}
													{modules.statistics.repSalaries.reduce(
														(total, current) => {
															total =
																total +
																current.totalBonuses;
															return total;
														},
														0
													)}
												</th>
												<th>
													Total Payments:{" "}
													{modules.setting!.getSetting(
														"currencySymbol"
													)}
													{modules.statistics.repSalaries.reduce(
														(total, current) => {
															total =
																total +
																current.totalDeserved;
															return total;
														},
														0
													)}
												</th>
											</tr>
										</thead>
									</table>
								</div>
							</SectionComponent>
						</div>

						<div className={"chart-wrapper col-xs-12"}>
							<SectionComponent title={"Payments By Date"}>
								<PaymentsByDate></PaymentsByDate>
							</SectionComponent>
						</div>
						<div className={"chart-wrapper col-xs-12 col-lg-6"}>
							<SectionComponent
								title={"Regions Cases/Million Population"}
							>
								<RegionsCasesPerMillion></RegionsCasesPerMillion>
							</SectionComponent>
						</div>
						<div className={"chart-wrapper col-xs-12 col-lg-6"}>
							<SectionComponent
								title={"Regions Payments/Million Population"}
							>
								<RegionsPaymentsPerMillion></RegionsPaymentsPerMillion>
							</SectionComponent>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
