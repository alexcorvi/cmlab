import { status } from "@core";
import * as core from "@core";
import { store } from "@utils";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";
import {
	DefaultButton,
	MessageBar,
	MessageBarType,
	PrimaryButton,
	Spinner,
	SpinnerSize,
	TextField,
} from "office-ui-fabric-react";

@observer
export class LoginView extends React.Component {
	@observable usernameFieldValue = "";
	@observable passwordFieldValue = "";
	@observable serverFieldValue =
		(window as any).couchDBServer ||
		store.get("server_location") ||
		location.origin.replace(/:\d+$/g, ":5984");

	@observable errorMessage: string = "";
	@observable disableInputs: boolean = false;

	@observable initiallyChecked: boolean = false;

	@computed get impossibleToLogin() {
		return (
			!status.isOnline.server &&
			!status.isOnline.client &&
			!store.found("LSL_hash")
		);
	}

	componentDidMount() {
		core.status
			.initialCheck(this.serverFieldValue)
			.finally(() => (this.initiallyChecked = true));
	}

	async login(offline?: boolean) {
		if (
			!(
				this.usernameFieldValue &&
				this.passwordFieldValue &&
				this.serverFieldValue
			)
		) {
			this.errorMessage = "All fields are necessary";
			return;
		}
		this.errorMessage = "";
		const result = offline
			? await core.status.loginWithCredentialsOffline({
					username: this.usernameFieldValue,
					password: this.passwordFieldValue,
					server: this.serverFieldValue.replace(
						/([^\/])\/[^\/].+/,
						"$1"
					),
			  })
			: await core.status.loginWithCredentials({
					username: this.usernameFieldValue,
					password: this.passwordFieldValue,
					server: this.serverFieldValue.replace(
						/([^\/])\/[^\/].+/,
						"$1"
					),
			  });
		if (typeof result !== "boolean") {
			this.errorMessage = result;
		}
	}

	render() {
		return (
			<div className="login-component">
				{this.impossibleToLogin ? (
					<div>
						<MessageBar messageBarType={MessageBarType.error}>
							You're offline and unable to login
							<br />
						</MessageBar>
						<DefaultButton
							text="Reload"
							className="m-t-15 m-b-15 m-r-5"
							onClick={() => {
								location.reload();
							}}
							iconProps={{
								iconName: "Sync",
							}}
						/>
					</div>
				) : (
					<div className="login-forum">
						{this.initiallyChecked ? (
							<div className="login-step">
								<div
									className={
										status.isOnline.server ||
										!store.found("LSL_hash")
											? "hidden"
											: "offline-msg"
									}
								>
									<MessageBar
										messageBarType={MessageBarType.warning}
									>
										{`${`You're offline. Use the latest username/password you've successfully used on this machine to login to this server`}:
								${(this.serverFieldValue || "").replace(/([^\/])\/[^\/].+/, "$1")}.
							`}
									</MessageBar>
								</div>

								<div
									className={
										status.isOnline.server ||
										!store.found("LSL_hash")
											? ""
											: "hidden"
									}
								>
									<TextField
										name="server"
										label={`Server location`}
										value={this.serverFieldValue}
										disabled={this.disableInputs}
										onChange={(ev, v) =>
											(this.serverFieldValue = v!)
										}
										className="input-server"
									/>
								</div>

								<TextField
									name="identification"
									label={`Username`}
									disabled={this.disableInputs}
									value={this.usernameFieldValue}
									onChange={(e, v) =>
										(this.usernameFieldValue = v!)
									}
									onKeyDown={(ev) => {
										if (ev.keyCode === 13) {
											this.login();
										}
									}}
								/>
								<TextField
									name="password"
									type="Password"
									label={`Password`}
									disabled={this.disableInputs}
									value={this.passwordFieldValue}
									onChange={(e, v) =>
										(this.passwordFieldValue = v!)
									}
									onKeyDown={(ev) => {
										if (ev.keyCode === 13) {
											this.login();
										}
									}}
								/>
								<PrimaryButton
									iconProps={{
										iconName: "Permissions",
									}}
									text={"Login"}
									disabled={this.disableInputs}
									className="m-t-15 m-b-15"
									onClick={() => {
										this.login();
									}}
								/>
								{core.status.tryOffline ? (
									<PrimaryButton
										text={"Access offline"}
										disabled={this.disableInputs}
										className="m-t-15 m-b-15 m-l-5 m-r-5"
										onClick={() => {
											this.login(true);
										}}
									/>
								) : (
									""
								)}
							</div>
						) : (
							<div className="spinner-container">
								<Spinner
									size={SpinnerSize.large}
									label={
										core.status.initialLoadingIndicatorText
											? `Please wait: ${core.status.initialLoadingIndicatorText}`
											: "Please wait"
									}
								/>
							</div>
						)}
						{this.errorMessage ? (
							<MessageBar messageBarType={MessageBarType.error}>
								{this.errorMessage}
							</MessageBar>
						) : (
							""
						)}
					</div>
				)}
				<DefaultButton
					text="offline"
					className="no-server-mode m-t-15 m-b-15 m-r-5"
					onClick={() => {
						core.status.startNoServer();
					}}
					iconProps={{
						iconName: "StatusErrorFull",
					}}
				/>
			</div>
		);
	}
}
