import { Report } from "../../reporting";
import * as core from "@core";
import { dentists, regions, reps, setting } from "@modules";
import * as modules from "@modules";
import { day, formatDate, num } from "@utils";
import * as utils from "@utils";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { DatePicker } from "office-ui-fabric-react";
import * as React from "react";
import {
	DataTableComponent,
	LineChartComponent,
	PanelTabs,
	PanelTop,
	ProfileSquaredComponent,
	TagComponent,
	tagType,
} from "@common-components";
import {
	Col,
	PieChartComponent,
	Row,
	SectionComponent,
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
export class RegionsPage extends React.Component {
	@observable report: Report = new Report({
		startingDate: new Date().getTime() - day * 60,
		endingDate: new Date().getTime(),
	});

	dt: null | DataTableComponent = null;

	tabs = [
		{
			key: "details",
			icon: "Nav2DMapView",
			title: "Region Details",
		},
		{
			key: "salesmen",
			icon: "Telemarketer",
			title: "Sales Representatives",
		},
		{
			key: "doctors",
			icon: "Contact",
			title: "Doctors",
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
	@computed get selectedRegion() {
		return modules.regions!.docs.find(
			(p) => p._id === core.router.selectedID
		);
	}

	render() {
		return (
			<div className="pc-pg">
				<DataTableComponent
					ref={(dt) => (this.dt = dt)}
					onDelete={(id) => {
						regions!.deleteModal(id);
					}}
					commands={[
						{
							key: "addNew",
							title: "Add new",
							name: "Add new",
							onClick: () => {
								const newDoc = regions!.new();
								regions!.add(newDoc).then(() => {
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
					heads={["Region", "Population", "Status"]}
					rows={regions!.docs.map((region) => {
						return {
							id: region._id,
							searchableString: region.searchableString,
							actions: this.tabs.map((x) => ({
								key: x.key,
								title: x.title,
								icon: x.icon,
								onClick: () => {
									if (x.key === "delete") {
										modules.regions!.deleteModal(
											region._id
										);
									} else {
										core.router.select({
											id: region._id,
											tab: x.key,
										});
									}
								},
							})),
							cells: [
								{
									dataValue: region.name,
									component: (
										<ProfileSquaredComponent
											text={region.name}
											onRenderSecondaryText={() => (
												<span className="itl">
													{region.isOpen
														? "open"
														: "prospected"}
												</span>
											)}
										/>
									),
									onClick: () => {
										core.router.select({
											id: region._id,
											tab: "details",
										});
									},
									className: "no-label",
								},
								{
									dataValue: region.population,
									component: (
										<span>{region.population} Million</span>
									),
									className: "hidden-xs",
								},
								{
									dataValue: region.isOpen
										? "Open"
										: "Prospected",
									component: (
										<TagComponent
											text={
												region.isOpen
													? "Open"
													: "Prospected"
											}
											type={
												region.isOpen
													? tagType.success
													: tagType.primary
											}
											highlighted={
												this.dt
													? this.dt.filterString ===
													  (region.isOpen
															? "Open"
															: "Prospected")
													: false
											}
											onClick={() => {
												if (this.dt) {
													if (
														this.dt.filterString ===
														(region.isOpen
															? "Open"
															: "Prospected")
													) {
														this.dt.filterString =
															"";
													} else {
														this.dt.filterString = region.isOpen
															? "Open"
															: "Prospected";
													}
												}
												this.forceUpdate();
											}}
										/>
									),
									className: "hidden-xs",
								},
							],
						};
					})}
					maxItemsOnLoad={20}
				/>

				{this.selectedRegion ? (
					<Panel
						isOpen={!!this.selectedRegion}
						type={PanelType.medium}
						closeButtonAriaLabel="Close"
						isLightDismiss={true}
						onDismiss={() => {
							core.router.unSelect();
						}}
						onRenderNavigation={() => (
							<div className="panel-heading">
								<PanelTop
									title={this.selectedRegion!.name}
									type={"Region"}
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
						<div className="region-editor">
							{core.router.selectedTab === "details" ? (
								<div>
									<Row gutter={8}>
										<Col sm={12}>
											<TextField
												label={"Region name"}
												value={this.selectedRegion.name}
												onChange={(ev, val) =>
													(this.selectedRegion!.name = val!)
												}
											/>
										</Col>
										<Col sm={12}>
											<TextField
												label={"Population"}
												type="number"
												value={this.selectedRegion.population.toString()}
												onChange={(ev, val) =>
													(this.selectedRegion!.population = num(
														val!
													))
												}
												suffix={"Million"}
											/>
										</Col>
									</Row>
									<TextField
										label={"Notes"}
										multiline
										value={this.selectedRegion.notes}
										onChange={(ev, val) =>
											(this.selectedRegion!.notes = val!)
										}
									/>
									<Toggle
										label={"Status"}
										checked={this.selectedRegion!.isOpen}
										onText={"Open"}
										offText={"Prospected"}
										onChange={(e, newVal) => {
											this.selectedRegion!.isOpen = newVal!;
										}}
									/>
								</div>
							) : (
								""
							)}
							{core.router.selectedTab === "salesmen" ? (
								<div>
									<table className="ms-table condensed-table">
										<thead>
											<tr>
												<th>Salesman</th>
												<th>Salary</th>
												<th>Total cases</th>
												<th>Cases this month</th>
											</tr>
										</thead>
										<tbody>
											{reps!.docs
												.filter((rep) =>
													rep.regionsIDs.includes(
														this.selectedRegion!._id
													)
												)
												.map((rep) => {
													return (
														<tr>
															<td>
																<ProfileSquaredComponent
																	text={
																		rep.name
																	}
																	subText={
																		rep.phone
																	}
																	onClick={() => {
																		core.router.go(
																			[
																				"representatives",
																				`id:${rep._id}`,
																				"tab:details",
																			]
																		);
																	}}
																></ProfileSquaredComponent>
															</td>
															<td>
																{setting!.getSetting(
																	"currencySymbol"
																)}
																{utils.round(
																	rep.fixedSalary
																)}
															</td>
															<td>
																{
																	rep
																		.totalSales
																		.length
																}{" "}
																cases
																<div
																	style={{
																		fontSize: 11,
																	}}
																>
																	{setting!.getSetting(
																		"currencySymbol"
																	)}
																	{utils.round(
																		rep.totalPayments
																	)}
																	/
																	{setting!.getSetting(
																		"currencySymbol"
																	)}
																	{utils.round(
																		rep.totalExpectedPayments
																	)}{" "}
																	Payments
																</div>
															</td>
															<td>
																{
																	rep
																		.salesThisMonth
																		.length
																}{" "}
																cases
																<div
																	style={{
																		fontSize: 11,
																	}}
																>
																	{setting!.getSetting(
																		"currencySymbol"
																	)}
																	{utils.round(
																		rep.expectedPaymentsFromThisMonth
																	)}{" "}
																	Expected
																</div>
															</td>
														</tr>
													);
												})}
										</tbody>
									</table>
								</div>
							) : (
								""
							)}
							{core.router.selectedTab === "doctors" ? (
								<div>
									<table className="ms-table condensed-table">
										<thead>
											<tr>
												<th>Salesman</th>
												<th>Status</th>
												<th>Total Cases</th>
												<th>Cases this month</th>
											</tr>
										</thead>
										<tbody>
											{dentists!.docs
												.filter(
													(doctor) =>
														doctor.regionID ===
														this.selectedRegion!._id
												)
												.map((doctor) => {
													return (
														<tr>
															<td>
																<ProfileSquaredComponent
																	text={
																		doctor.name
																	}
																	subText={
																		doctor.phone
																	}
																	onClick={() => {
																		core.router.go(
																			[
																				"dentists",
																				`id:${doctor._id}`,
																				"tab:details",
																			]
																		);
																	}}
																></ProfileSquaredComponent>
															</td>
															<td>
																{doctor.isEnrolled ? (
																	<TagComponent
																		text={
																			"Enrolled"
																		}
																		type={
																			tagType.success
																		}
																	/>
																) : doctor.isVisited ? (
																	<TagComponent
																		text={
																			"Visited"
																		}
																		type={
																			tagType.success
																		}
																	/>
																) : (
																	<TagComponent
																		text={
																			"Not visited"
																		}
																		type={
																			tagType.danger
																		}
																	/>
																)}
															</td>
															<td>
																{
																	doctor
																		.totalSales
																		.length
																}{" "}
																cases
																<div
																	style={{
																		fontSize: 11,
																	}}
																>
																	{setting!.getSetting(
																		"currencySymbol"
																	)}
																	{utils.round(
																		doctor.totalPayments
																	)}
																	/
																	{setting!.getSetting(
																		"currencySymbol"
																	)}
																	{utils.round(
																		doctor.totalExpectedPayments
																	)}{" "}
																	Payments
																</div>
															</td>
															<td>
																{
																	doctor
																		.salesThisMonth
																		.length
																}{" "}
																cases
																<div
																	style={{
																		fontSize: 11,
																	}}
																>
																	{setting!.getSetting(
																		"currencySymbol"
																	)}
																	{utils.round(
																		doctor.expectedPaymentsFromThisMonth
																	)}{" "}
																	Expected
																</div>
															</td>
														</tr>
													);
												})}
										</tbody>
									</table>
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
															region: this
																.selectedRegion
																._id,
														})
														.map((x) => x.date),
													lines: [
														{
															label: "Cases",
															data: this.report
																.numberOfCasesByDate(
																	{
																		region: this
																			.selectedRegion
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
																region: this
																	.selectedRegion
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
																		region: this
																			.selectedRegion
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
									<SectionComponent title="Region comparison with others">
										<PieChartComponent
											{...{
												height: 300,
												data: Object.keys(
													this.report.numberOfCasesByRegion()
												).map((regionKey) => ({
													label: regionKey.split(
														"__"
													)[0],
													value: this.report.numberOfCasesByRegion()[
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
