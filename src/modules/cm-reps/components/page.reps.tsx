import { Report } from "../../reporting";
import * as core from "@core";
import { reps } from "@modules";
import * as modules from "@modules";
import { day, formatDate, num } from "@utils";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { DatePicker, IconButton } from "office-ui-fabric-react";
import * as React from "react";
import {
	getRandomTagType,
	LineChartComponent,
	PieChartComponent,
	SectionComponent,
	TagInputComponent,
	DataTableComponent,
	PanelTabs,
	PanelTop,
	ProfileSquaredComponent,
	TagComponent,
	tagType,
	Row,
	Col,
} from "@common-components";
import {
	MessageBar,
	MessageBarType,
	Panel,
	PanelType,
	PrimaryButton,
	TextField,
	Toggle,
} from "office-ui-fabric-react";

@observer
export class RepsPage extends React.Component {
	@observable report: Report = new Report({
		startingDate: new Date().getTime() - day * 60,
		endingDate: new Date().getTime(),
	});

	dt: null | DataTableComponent = null;

	tabs = [
		{
			key: "details",
			icon: "Telemarketer",
			title: "Representative Details",
		},
		{
			key: "bonuses",
			icon: "Ribbon",
			title: "Bonuses",
		},
		{
			key: "reports",
			icon: "Chart",
			title: "Reports",
		},
		{
			key: "delete",
			icon: "trash",
			title: "Delete",
		},
	];
	@computed get selectedRep() {
		return modules.reps!.docs.find((p) => p._id === core.router.selectedID);
	}

	render() {
		return (
			<div className="pc-pg">
				<DataTableComponent
					ref={(dt) => (this.dt = dt)}
					onDelete={(id) => {
						reps!.deleteModal(id);
					}}
					commands={[
						{
							key: "addNew",
							title: "Add new",
							name: "Add new",
							onClick: () => {
								const newDoc = reps!.new();
								reps!.add(newDoc).then(() => {
									core.router.select({
										id: newDoc._id,
										tab: "details",
									});
								});
							},
							iconProps: {
								iconName: "Add",
							},
						},
					]}
					heads={["Representative", "Phone number", "Regions"]}
					rows={reps!.docs.map((rep) => {
						return {
							id: rep._id,
							searchableString: rep.searchableString,
							actions: this.tabs.map((x) => ({
								key: x.key,
								title: x.title,
								icon: x.icon,
								onClick: () => {
									if (x.key === "delete") {
										modules.reps!.deleteModal(rep._id);
									} else {
										core.router.select({
											id: rep._id,
											tab: x.key,
										});
									}
								},
							})),
							cells: [
								{
									dataValue: rep.name,
									component: (
										<ProfileSquaredComponent
											text={rep.name}
											onRenderSecondaryText={() => (
												<span className="itl">
													{rep.phone}
												</span>
											)}
										/>
									),
									onClick: () => {
										core.router.select({
											id: rep._id,
											tab: "details",
										});
									},
									className: "no-label",
								},
								{
									dataValue: rep.phone,
									component: <span>{rep.phone}</span>,
									className: "hidden-xs",
								},
								{
									dataValue: rep.regions
										.map((x) => x.name)
										.join(" "),
									component: (
										<div>
											{rep.regions.map((x) => (
												<TagComponent
													text={x.name}
													type={getRandomTagType(
														x.name
													)}
													highlighted={
														this.dt
															? this.dt
																	.filterString ===
															  x.name
															: false
													}
													onClick={() => {
														if (this.dt) {
															if (
																this.dt
																	.filterString ===
																x.name
															) {
																this.dt.filterString =
																	"";
															} else {
																this.dt.filterString =
																	x.name;
															}
														}
														this.forceUpdate();
													}}
												/>
											))}
										</div>
									),
									className: "hidden-xs",
								},
							],
						};
					})}
					maxItemsOnLoad={20}
				/>

				{this.selectedRep ? (
					<Panel
						isOpen={!!this.selectedRep}
						type={PanelType.medium}
						closeButtonAriaLabel="Close"
						isLightDismiss={true}
						onDismiss={() => {
							core.router.unSelect();
						}}
						onRenderNavigation={() => (
							<div className="panel-heading">
								<PanelTop
									title={this.selectedRep!.name}
									type={"Representative"}
									onDismiss={() => core.router.unSelect()}
									square
								/>
								<PanelTabs
									currentSelectedKey={core.router.selectedTab}
									onSelect={(key) =>
										core.router.select({ tab: key })
									}
									items={this.tabs}
								/>
							</div>
						)}
					>
						<div className="rep-editor">
							{core.router.selectedTab === "details" ? (
								<div>
									<Row gutter={8}>
										<Col span={12}>
											<TextField
												label={"Representative name"}
												value={this.selectedRep.name}
												onChange={(ev, val) =>
													(this.selectedRep!.name = val!)
												}
											/>
										</Col>
										<Col span={12}>
											<TextField
												label={
													"Representative phone number"
												}
												value={this.selectedRep.phone}
												onChange={(ev, val) =>
													(this.selectedRep!.phone = val!)
												}
											/>
										</Col>
									</Row>

									<TagInputComponent
										label={"Covered Regions"}
										options={modules
											.regions!.docs.sort((a, b) =>
												a.name.localeCompare(b.name)
											)
											.map((s) => {
												return {
													key: s._id,
													text: s.name,
												};
											})}
										value={this.selectedRep!.regions.map(
											(x) => ({
												key: x._id,
												text: x.name,
											})
										)}
										onChange={(newKeys) => {
											this.selectedRep!.regionsIDs = newKeys;
										}}
										suggestionsHeaderText={"Regions"}
										noResultsFoundText={"No regions found"}
									/>

									<Row gutter={8}>
										<Col span={12}>
											<TextField
												label={"Fixed salary"}
												type="number"
												value={this.selectedRep.fixedSalary.toString()}
												onChange={(ev, val) =>
													(this.selectedRep!.fixedSalary = num(
														val!
													))
												}
												suffix={modules.setting!.getSetting(
													"currencySymbol"
												)}
											/>
										</Col>
										<Col span={12}>
											<TextField
												label={"Commission per case"}
												type="number"
												value={this.selectedRep.commissionPerCase.toString()}
												onChange={(ev, val) =>
													(this.selectedRep!.commissionPerCase = num(
														val!
													))
												}
												suffix={"%"}
											/>
										</Col>
									</Row>
									<TextField
										label={"Notes"}
										multiline
										value={this.selectedRep.notes}
										onChange={(ev, val) =>
											(this.selectedRep!.notes = val!)
										}
									/>
								</div>
							) : (
								""
							)}
							{core.router.selectedTab === "bonuses" ? (
								<div>
									<br />
									{this.selectedRep!.bonuses.length === 0 ? (
										<MessageBar
											messageBarType={MessageBarType.info}
										>
											{
												"There are no bonuses registered for this representative"
											}
										</MessageBar>
									) : (
										<table className="ms-table condensed-table">
											<thead>
												<tr>
													<th>Bonus date</th>
													<th>Price</th>
													<th></th>
												</tr>
											</thead>
											<tbody>
												{this.selectedRep!.bonuses.map(
													(bonus, i) => (
														<tr>
															<td
																style={{
																	width:
																		"30%",
																}}
															>
																<DatePicker
																	value={
																		new Date(
																			bonus.date
																		)
																	}
																	onSelectDate={(
																		date
																	) => {
																		if (
																			date
																		) {
																			this.selectedRep!.bonuses[
																				i
																			].date = date.setHours(
																				1,
																				0,
																				0,
																				0
																			);
																		}
																	}}
																	formatDate={(
																		d
																	) =>
																		formatDate(
																			d ||
																				0,
																			modules.setting!.getSetting(
																				"date_format"
																			)
																		)
																	}
																/>
															</td>
															<td>
																<TextField
																	type="number"
																	value={this.selectedRep!.bonuses[
																		i
																	].amount.toString()}
																	onChange={(
																		ev,
																		val
																	) =>
																		(this.selectedRep!.bonuses[
																			i
																		].amount = num(
																			val!
																		))
																	}
																/>
															</td>
															<td
																style={{
																	textAlign:
																		"right",
																}}
															>
																<IconButton
																	iconProps={{
																		iconName:
																			"Trash",
																	}}
																	onClick={() => {
																		this.selectedRep!.bonuses.splice(
																			i,
																			1
																		);
																	}}
																></IconButton>
															</td>
														</tr>
													)
												)}
											</tbody>
										</table>
									)}

									<br />

									<PrimaryButton
										onClick={() => {
											this.selectedRep!.bonuses.push({
												date: new Date().getTime(),
												amount: 0,
											});
										}}
									>
										Add Bonus
									</PrimaryButton>
								</div>
							) : (
								""
							)}

							{core.router.selectedTab === "reports" ? (
								<div>
									<Row gutter={8}>
										<Col span={12}>
											<DatePicker
												label={"Starting date"}
												value={
													new Date(
														this.report.startingDate
													)
												}
												onSelectDate={(date) => {
													if (date) {
														this.report.startingDate = date.setHours(
															0,
															0,
															0,
															0
														);
													}
												}}
												formatDate={(d) =>
													formatDate(
														d || 0,
														modules.setting!.getSetting(
															"date_format"
														)
													)
												}
											/>
										</Col>
										<Col span={12}>
											<DatePicker
												label={"Ending date"}
												value={
													new Date(
														this.report.endingDate
													)
												}
												onSelectDate={(date) => {
													if (date) {
														this.report.endingDate = date.setHours(
															0,
															0,
															0,
															0
														);
													}
												}}
												formatDate={(d) =>
													formatDate(
														d || 0,
														modules.setting!.getSetting(
															"date_format"
														)
													)
												}
											/>
										</Col>
									</Row>
									<hr />
									<SectionComponent title="Cases / Date">
										<LineChartComponent
											{...{
												height: 300,
												data: {
													xLabels: this.report
														.numberOfCasesByDate({
															rep: this
																.selectedRep
																._id,
														})
														.map((x) => x.date),
													lines: [
														{
															label: "Cases",
															data: this.report
																.numberOfCasesByDate(
																	{
																		rep: this
																			.selectedRep
																			._id,
																	}
																)
																.map(
																	(x) =>
																		x.number
																),
														},
													],
												},
											}}
										/>
									</SectionComponent>
									<SectionComponent title="Payments / Date">
										<LineChartComponent
											{...{
												height: 300,
												data: {
													xLabels: this.report
														.amountOfPaymentsByDate(
															{
																rep: this
																	.selectedRep
																	._id,
															}
														)
														.map((x) => x.date),
													lines: [
														{
															label: "Payments",
															data: this.report
																.amountOfPaymentsByDate(
																	{
																		rep: this
																			.selectedRep
																			._id,
																	}
																)
																.map(
																	(x) =>
																		x.amount
																),
														},
													],
												},
											}}
										/>
									</SectionComponent>
									<SectionComponent title="Rep comparison with others">
										<PieChartComponent
											{...{
												height: 300,
												data: Object.keys(
													this.report.numberOfCasesByRep()
												).map((regionKey) => ({
													label: regionKey.split(
														"__"
													)[0],
													value: this.report.numberOfCasesByRep()[
														regionKey
													],
												})),
											}}
										/>
									</SectionComponent>
								</div>
							) : (
								""
							)}

							{core.router.selectedTab === "delete" ? (
								<div>
									<br />
									<MessageBar
										messageBarType={MessageBarType.warning}
									>
										{"Are you sure you want to delete"}
									</MessageBar>
									<br />
									<PrimaryButton
										className="delete"
										iconProps={{
											iconName: "delete",
										}}
										text={"Delete"}
										onClick={() => {
											modules.regions!.delete(
												core.router.selectedID
											);
											core.router.unSelect();
										}}
									/>
								</div>
							) : (
								""
							)}
						</div>
					</Panel>
				) : (
					""
				)}
			</div>
		);
	}
}
