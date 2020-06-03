import { Col, Row } from "@common-components";
import { status } from "@core";
import * as core from "@core";
import { observer } from "mobx-react";
import { IconButton, TooltipHost } from "office-ui-fabric-react";
import * as React from "react";

@observer
export class HeaderView extends React.Component {
	render() {
		return (
			<div
				className="header-component"
				data-login-type={status.loginType}
			>
				<Row>
					<Col span={8}>
						<section className="menu-button">
							<IconButton
								onClick={() => core.menu.show()}
								disabled={false}
								iconProps={{ iconName: "GlobalNavButton" }}
								ariaLabel="Menu"
							/>
						</section>
					</Col>
					<Col span={8}>
						<section className="title">
							{core.router.currentNamespace || "Home"}
						</section>
					</Col>
					<Col span={8}>
						<section className="right-buttons">
							<TooltipHost content={"logout"}>
								<IconButton
									onClick={() => core.status.logout()}
									iconProps={{ iconName: "Lock" }}
								/>
							</TooltipHost>
							{core.status.keepServerOffline ? (
								""
							) : (
								<TooltipHost
									content={
										!core.status.isOnline.server
											? "Server is unavailable/offline"
											: core.status.invalidLogin
											? "Can't login to remote server"
											: "Sync with server"
									}
								>
									<IconButton
										data-test-id="resync-btn"
										disabled={
											core.status.dbActionProgress
												.length > 0 ||
											core.status.invalidLogin ||
											!core.status.isOnline.server
										}
										onClick={async () => {
											// resync on clicking (manual)
											await core.dbAction("resync");
										}}
										iconProps={{
											iconName: !core.status.isOnline
												.server
												? "WifiWarning4"
												: core.status.invalidLogin
												? "Important"
												: "Sync"
										}}
										className={
											"resync " +
											(core.status.invalidLogin ||
											!core.status.isOnline.server
												? "error"
												: core.status.dbActionProgress
														.length > 0
												? "rotate"
												: "clickable-sync")
										}
									/>
								</TooltipHost>
							)}
						</section>
					</Col>
				</Row>
			</div>
		);
	}
}
