import { Col, ProfileSquaredComponent, Row } from "@common-components";
import { router } from "@core";
import { cases, dentists, setting } from "@modules";
import { day, formatDate } from "@utils";
import * as utils from "@utils";
import { observer } from "mobx-react";
import * as React from "react";

@observer
export class HomeView extends React.Component {
	render() {
		return (
			<div className="home">
				<div>
					<h2 className="welcome">{"Welcome"}</h2>
					<Row gutter={0}>
						<Col md={8}>
							<h3 className="appointments-table-heading">
								{"Unvisited doctors"}
							</h3>
							<table className="ms-table duty-table">
								<tbody>
									{dentists!.docs
										.filter(
											(doctor) =>
												!(
													doctor.isVisited ||
													doctor.isEnrolled
												)
										)
										.map((doctor) => {
											return (
												<tr key={doctor._id}>
													<th className="day-name">
														{
															(
																doctor.region || {
																	name: "",
																}
															).name
														}
														<br />
														<i
															style={{
																fontSize: 11,
															}}
														>
															{doctor.fullAddress}
														</i>
													</th>
													<td className="names">
														<ProfileSquaredComponent
															text={doctor.name}
															subText={doctor.repsResponsible
																.map(
																	(x) =>
																		x.name
																)
																.join(", ")}
															onClick={() => {
																router.go([
																	"dentists",
																	`id:${doctor._id}`,
																	"tab:details",
																]);
															}}
														/>
													</td>
												</tr>
											);
										})}
								</tbody>
							</table>
						</Col>

						<Col md={8}>
							<h3 className="appointments-table-heading">
								{"Unfinished cases"}
							</h3>
							<table className="ms-table duty-table">
								<tbody>
									{cases!.docs
										.filter(
											(singleCase) =>
												singleCase.accepted &&
												!singleCase.sent
										)
										.map((singleCase) => {
											return (
												<tr key={singleCase._id}>
													<th className="day-name">
														{formatDate(
															singleCase.dateReceived,
															setting!.getSetting(
																"date_format"
															)
														)}
														<br />
														<i
															style={{
																fontSize: 11,
															}}
														>
															{Math.ceil(
																new Date().getTime() /
																	day -
																	singleCase.dateReceived /
																		day
															)}{" "}
															days ago
														</i>
													</th>
													<td className="names">
														<ProfileSquaredComponent
															text={
																singleCase.patientName
															}
															subText={`${
																(
																	singleCase.dentist || {
																		name:
																			"",
																	}
																).name
															} / ${
																(
																	singleCase.region || {
																		name:
																			"",
																	}
																).name
															}`}
															onClick={() => {
																router.go([
																	"cases",
																	`id:${singleCase._id}`,
																	"tab:details",
																]);
															}}
														/>
													</td>
												</tr>
											);
										})}
								</tbody>
							</table>
						</Col>
						<Col md={8}>
							<h3 className="appointments-table-heading">
								{"Unpaid cases"}
							</h3>
							<table className="ms-table duty-table">
								<tbody>
									{cases!.docs
										.filter(
											(singleCase) =>
												singleCase.sent &&
												singleCase.outstandingPayments >
													0
										)
										.map((singleCase) => {
											return (
												<tr key={singleCase._id}>
													<th className="day-name">
														{formatDate(
															singleCase.dateSent,
															setting!.getSetting(
																"date_format"
															)
														)}
														<br />
														<i
															style={{
																fontSize: 11,
															}}
														>
															{setting!.getSetting(
																"currencySymbol"
															)}
															{utils.round(
																singleCase.outstandingPayments
															)}
														</i>
													</th>
													<td className="names">
														<ProfileSquaredComponent
															text={
																singleCase.patientName
															}
															subText={`${
																(
																	singleCase.dentist || {
																		name:
																			"",
																	}
																).name
															} / ${
																(
																	singleCase.region || {
																		name:
																			"",
																	}
																).name
															}`}
															onClick={() => {
																router.go([
																	"cases",
																	`id:${singleCase._id}`,
																	"tab:details",
																]);
															}}
														/>
													</td>
												</tr>
											);
										})}
								</tbody>
							</table>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}
